import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE = "https://api.tokens.xyz/v1";

function buildHeaders(): HeadersInit {
  const apiKey = process.env.TOKENS_XYZ_API_KEY;
  if (!apiKey) throw new Error("TOKENS_XYZ_API_KEY missing");
  return {
    "x-api-key": apiKey,
    accept: "application/json",
  };
}

function errorResponse(context: string, err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[tokens-xyz/${context}] ${message}`);
  return NextResponse.json(
    { success: false, error: "upstream error" },
    { status: 500 }
  );
}

async function handleAsset(assetId: string) {
  if (!assetId) {
    return NextResponse.json(
      { success: false, error: "assetId required" },
      { status: 400 }
    );
  }
  let headers: HeadersInit;
  try {
    headers = buildHeaders();
  } catch (err) {
    return errorResponse("asset-config", err);
  }
  try {
    const url = `${BASE}/assets/${encodeURIComponent(
      assetId
    )}?include=profile,risk,markets`;
    const upstream = await fetch(url, { headers, cache: "no-store" });
    if (!upstream.ok) {
      return errorResponse("asset", `upstream ${upstream.status}`);
    }
    const json = await upstream.json();
    return NextResponse.json({ success: true, data: json });
  } catch (err) {
    return errorResponse("asset-fetch", err);
  }
}

async function handlePriceChart(
  assetId: string,
  interval: string,
  from: string,
  to: string
) {
  if (!assetId) {
    return NextResponse.json(
      { success: false, error: "assetId required" },
      { status: 400 }
    );
  }
  let headers: HeadersInit;
  try {
    headers = buildHeaders();
  } catch (err) {
    return errorResponse("chart-config", err);
  }
  try {
    const params = new URLSearchParams();
    if (interval) params.set("interval", interval);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const qs = params.toString();
    const url = `${BASE}/assets/${encodeURIComponent(assetId)}/price-chart${
      qs ? `?${qs}` : ""
    }`;
    const upstream = await fetch(url, { headers, cache: "no-store" });
    if (!upstream.ok) {
      return errorResponse("chart", `upstream ${upstream.status}`);
    }
    const json = await upstream.json();
    return NextResponse.json({ success: true, data: json });
  } catch (err) {
    return errorResponse("chart-fetch", err);
  }
}

export async function GET(req: NextRequest) {
  const limited = await enforceRateLimit(req, "public-read");
  if (limited) return limited;

  const sp = req.nextUrl.searchParams;
  const type = sp.get("type") ?? "asset";
  const assetId = sp.get("assetId") ?? "";

  if (type === "price-chart") {
    return handlePriceChart(
      assetId,
      sp.get("interval") ?? "1H",
      sp.get("from") ?? "",
      sp.get("to") ?? ""
    );
  }
  if (type === "asset" || type === "") {
    return handleAsset(assetId);
  }

  return NextResponse.json(
    { success: false, error: "invalid type" },
    { status: 400 }
  );
}
