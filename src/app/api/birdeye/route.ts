import { NextRequest, NextResponse } from "next/server";
import {
  calcRiskScore,
  riskLabel,
  toRiskInputFromBirdeye,
} from "@/lib/scoring";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BIRDEYE_BASE = "https://public-api.birdeye.so";

function birdeyeHeaders(): HeadersInit {
  const apiKey = process.env.BIRDEYE_API_KEY;
  if (!apiKey) {
    throw new Error("BIRDEYE_API_KEY missing");
  }
  return {
    "X-API-KEY": apiKey,
    "x-chain": "solana",
    accept: "application/json",
  };
}

function errorResponse(context: string, err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[birdeye/${context}] ${message}`);
  return NextResponse.json(
    { success: false, error: "upstream error" },
    { status: 500 }
  );
}

async function handleTrending() {
  let headers: HeadersInit;
  try {
    headers = birdeyeHeaders();
  } catch (err) {
    return errorResponse("trending-config", err);
  }

  try {
    const upstream = await fetch(
      `${BIRDEYE_BASE}/defi/token_trending?limit=20`,
      { headers, cache: "no-store" }
    );
    if (!upstream.ok) {
      return errorResponse("trending", `upstream ${upstream.status}`);
    }
    const json = await upstream.json();
    const tokens: any[] =
      json?.data?.tokens ?? json?.data?.items ?? [];

    const scored = tokens.map((t) => {
      const input = toRiskInputFromBirdeye(t);
      const score = calcRiskScore(input);
      return { ...t, score, label: riskLabel(score) };
    });

    return NextResponse.json({ success: true, data: scored });
  } catch (err) {
    return errorResponse("trending-fetch", err);
  }
}

async function handleOhlcv(address: string) {
  if (!address) {
    return NextResponse.json(
      { success: false, error: "address required" },
      { status: 400 }
    );
  }

  let headers: HeadersInit;
  try {
    headers = birdeyeHeaders();
  } catch (err) {
    return errorResponse("ohlcv-config", err);
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const url = `${BIRDEYE_BASE}/defi/ohlcv?address=${encodeURIComponent(
    address
  )}&type=1H&time_from=${nowSec - 86400}&time_to=${nowSec}`;

  try {
    const upstream = await fetch(url, { headers, cache: "no-store" });
    if (!upstream.ok) {
      return errorResponse("ohlcv", `upstream ${upstream.status}`);
    }
    const json = await upstream.json();
    const items: any[] = json?.data?.items ?? [];
    const candles = items.map((c) => ({
      o: Number(c?.o ?? 0),
      h: Number(c?.h ?? 0),
      l: Number(c?.l ?? 0),
      c: Number(c?.c ?? 0),
      v: Number(c?.v ?? 0),
      unixTime: Number(c?.unixTime ?? 0),
    }));
    return NextResponse.json({ success: true, data: candles });
  } catch (err) {
    return errorResponse("ohlcv-fetch", err);
  }
}

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") ?? "trending";
  const address = req.nextUrl.searchParams.get("address") ?? "";

  if (type === "ohlcv") return handleOhlcv(address);
  if (type === "trending" || type === "") return handleTrending();

  return NextResponse.json(
    { success: false, error: "invalid type" },
    { status: 400 }
  );
}
