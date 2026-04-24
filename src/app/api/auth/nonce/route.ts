import { NextRequest, NextResponse } from "next/server";
import {
  buildSignInMessage,
  generateNonce,
  isValidSolanaAddress,
  NONCE_TTL_MS,
} from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rateLimit";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limited = await enforceRateLimit(req, "auth-flow");
  if (limited) return limited;


  let wallet = "";
  try {
    const body = await req.json();
    wallet = typeof body?.wallet === "string" ? body.wallet.trim() : "";
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  if (!isValidSolanaAddress(wallet)) {
    return NextResponse.json({ error: "invalid wallet" }, { status: 400 });
  }

  const nonce = generateNonce();
  const now = Date.now();
  const issuedAt = new Date(now).toISOString();
  const expiresAt = new Date(now + NONCE_TTL_MS).toISOString();
  const message = buildSignInMessage(wallet, nonce, issuedAt);

  const { error } = await supabase
    .from("auth_nonces")
    .upsert(
      { wallet_address: wallet, nonce, expires_at: expiresAt },
      { onConflict: "wallet_address" }
    );

  if (error) {
    console.error("[auth/nonce] upsert failed:", error.message);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }

  return NextResponse.json({ nonce, message });
}
