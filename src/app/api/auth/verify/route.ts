import { NextRequest, NextResponse } from "next/server";
import {
  buildSignInMessage,
  isValidSolanaAddress,
  NONCE_TTL_MS,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
  signSessionJwt,
  verifySolanaSignature,
} from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rateLimit";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limited = await enforceRateLimit(req, "auth-flow");
  if (limited) return limited;

  let wallet = "";
  let signature = "";
  let nonce = "";

  try {
    const body = await req.json();
    wallet = typeof body?.wallet === "string" ? body.wallet.trim() : "";
    signature = typeof body?.signature === "string" ? body.signature.trim() : "";
    nonce = typeof body?.nonce === "string" ? body.nonce.trim() : "";
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  if (!isValidSolanaAddress(wallet) || !signature || !nonce) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  const { data: row, error: fetchErr } = await supabase
    .from("auth_nonces")
    .select("nonce, expires_at")
    .eq("wallet_address", wallet)
    .maybeSingle();

  if (fetchErr) {
    console.error("[auth/verify] nonce fetch failed:", fetchErr.message);
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  if (!row || row.nonce !== nonce) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const expiresAtMs = new Date(row.expires_at).getTime();
  if (!Number.isFinite(expiresAtMs) || expiresAtMs < Date.now()) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const issuedAtIso = new Date(expiresAtMs - NONCE_TTL_MS).toISOString();
  const message = buildSignInMessage(wallet, nonce, issuedAtIso);

  if (!verifySolanaSignature(message, signature, wallet)) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const { error: delErr } = await supabase
    .from("auth_nonces")
    .delete()
    .eq("wallet_address", wallet);

  if (delErr) {
    console.error("[auth/verify] nonce delete failed:", delErr.message);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }

  const jwt = await signSessionJwt(wallet);
  const res = NextResponse.json({ wallet });
  res.cookies.set(SESSION_COOKIE_NAME, jwt, sessionCookieOptions());
  return res;
}
