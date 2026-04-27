import { NextRequest, NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { enforceRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type JsonRpcParams = unknown[] | Record<string, unknown>;

function heliusUrl(): string {
  const apiKey = process.env.HELIUS_API_KEY;
  if (!apiKey) {
    throw new Error("HELIUS_API_KEY missing");
  }
  return `https://mainnet.helius-rpc.com/?api-key=${apiKey}`;
}

function errorResponse(context: string, err: unknown, status = 500) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[helius/${context}] ${message}`);
  return NextResponse.json(
    { success: false, error: "upstream error" },
    { status }
  );
}

function isValidAddress(addr: string): boolean {
  try {
    new PublicKey(addr);
    return true;
  } catch {
    return false;
  }
}

function badRequest(error: string) {
  return NextResponse.json({ success: false, error }, { status: 400 });
}

async function callHeliusRpc(method: string, params: JsonRpcParams) {
  const url = heliusUrl();
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "defi-triangle",
      method,
      params,
    }),
    cache: "no-store",
  });
}

async function handleRpc(
  context: string,
  method: string,
  params: JsonRpcParams
) {
  try {
    const upstream = await callHeliusRpc(method, params);
    if (!upstream.ok) {
      return errorResponse(context, `upstream ${upstream.status}`);
    }
    const json = await upstream.json();
    if (json?.error) {
      return errorResponse(context, `rpc error code ${json.error.code ?? "?"}`);
    }
    return NextResponse.json({ success: true, data: json?.result ?? null });
  } catch (err) {
    return errorResponse(context, err);
  }
}

async function handleGetAsset(address: string) {
  if (!address) return badRequest("address required");
  if (!isValidAddress(address)) return badRequest("invalid address");
  return handleRpc("getAsset", "getAsset", {
    id: address,
    options: { showFungible: true },
  });
}

async function handleGetAccountInfo(address: string) {
  if (!address) return badRequest("address required");
  if (!isValidAddress(address)) return badRequest("invalid address");
  return handleRpc("getAccountInfo", "getAccountInfo", [
    address,
    { encoding: "jsonParsed" },
  ]);
}

async function handleGetTokenSupply(address: string) {
  if (!address) return badRequest("address required");
  if (!isValidAddress(address)) return badRequest("invalid address");
  return handleRpc("getTokenSupply", "getTokenSupply", [address]);
}

async function handleGetSignaturesForAddress(address: string, limit: number) {
  if (!address) return badRequest("address required");
  if (!isValidAddress(address)) return badRequest("invalid address");
  const cappedLimit = Math.max(1, Math.min(1000, limit));
  return handleRpc("getSignaturesForAddress", "getSignaturesForAddress", [
    address,
    { limit: cappedLimit },
  ]);
}

export async function GET(req: NextRequest) {
  const limited = await enforceRateLimit(req, "public-read");
  if (limited) return limited;

  const searchParams = req.nextUrl.searchParams;
  const type = searchParams.get("type") ?? "";
  const address = searchParams.get("address") ?? "";

  if (type === "getAsset") {
    return handleGetAsset(address);
  }

  if (type === "getAccountInfo") {
    return handleGetAccountInfo(address);
  }

  if (type === "getTokenSupply") {
    return handleGetTokenSupply(address);
  }

  if (type === "getSignaturesForAddress") {
    const limit = Number(searchParams.get("limit") ?? 1);
    return handleGetSignaturesForAddress(
      address,
      Number.isFinite(limit) ? limit : 1
    );
  }

  return NextResponse.json(
    { success: false, error: "invalid type" },
    { status: 400 }
  );
}
