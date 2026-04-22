import { NextRequest, NextResponse } from "next/server";
import { getSessionWallet, UnauthorizedError } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { PublicKey } from "@solana/web3.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isValidTokenAddress(addr: string): boolean {
  try {
    new PublicKey(addr);
    return true;
  } catch {
    return false;
  }
}

function unauthorizedResponse() {
  return NextResponse.json(
    { success: false, error: "unauthenticated" },
    { status: 401 }
  );
}

function serverError(context: string, err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[watchlist/${context}] ${message}`);
  return NextResponse.json(
    { success: false, error: "server error" },
    { status: 500 }
  );
}

export async function GET(req: NextRequest) {
  let wallet: string;
  try {
    wallet = await getSessionWallet(req);
  } catch (err) {
    if (err instanceof UnauthorizedError) return unauthorizedResponse();
    return serverError("get-auth", err);
  }

  const { data, error } = await supabase
    .from("watchlist")
    .select("id, token_address, symbol, name, image_url, added_at")
    .eq("wallet_address", wallet)
    .order("added_at", { ascending: false });

  if (error) return serverError("get", error);

  return NextResponse.json({ success: true, data: data ?? [] });
}

export async function POST(req: NextRequest) {
  let wallet: string;
  try {
    wallet = await getSessionWallet(req);
  } catch (err) {
    if (err instanceof UnauthorizedError) return unauthorizedResponse();
    return serverError("post-auth", err);
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "invalid request" },
      { status: 400 }
    );
  }

  const tokenAddress =
    typeof body?.token_address === "string" ? body.token_address.trim() : "";
  if (!isValidTokenAddress(tokenAddress)) {
    return NextResponse.json(
      { success: false, error: "invalid token address" },
      { status: 400 }
    );
  }

  const payload = {
    wallet_address: wallet,
    token_address: tokenAddress,
    symbol: typeof body?.symbol === "string" ? body.symbol.slice(0, 32) : null,
    name: typeof body?.name === "string" ? body.name.slice(0, 128) : null,
    image_url:
      typeof body?.image_url === "string" ? body.image_url.slice(0, 512) : null,
  };

  const { data, error } = await supabase
    .from("watchlist")
    .upsert(payload, { onConflict: "wallet_address,token_address" })
    .select("id, token_address, symbol, name, image_url, added_at")
    .single();

  if (error) return serverError("post", error);

  return NextResponse.json({ success: true, data });
}

export async function DELETE(req: NextRequest) {
  let wallet: string;
  try {
    wallet = await getSessionWallet(req);
  } catch (err) {
    if (err instanceof UnauthorizedError) return unauthorizedResponse();
    return serverError("delete-auth", err);
  }

  const tokenAddress =
    req.nextUrl.searchParams.get("token")?.trim() ?? "";
  if (!isValidTokenAddress(tokenAddress)) {
    return NextResponse.json(
      { success: false, error: "invalid token address" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("watchlist")
    .delete()
    .eq("wallet_address", wallet)
    .eq("token_address", tokenAddress);

  if (error) return serverError("delete", error);

  return NextResponse.json({ success: true });
}
