import { NextRequest, NextResponse } from "next/server";
import {
  calcRiskScore,
  riskLabel,
  toRiskInputFromDexScreener,
} from "@/lib/scoring";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEX_BASE = "https://api.dexscreener.com";

type ScoredPair = Record<string, any> & { score: number; label: string };

function isSolanaPair(p: any): boolean {
  return (p?.chainId ?? "").toLowerCase() === "solana";
}

function scorePair(p: any): ScoredPair {
  const input = toRiskInputFromDexScreener(p);
  const score = calcRiskScore(input);
  return { ...p, score, label: riskLabel(score) };
}

function errorResponse(context: string, err: unknown, status = 500) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[dexscreener/${context}] ${message}`);
  return NextResponse.json(
    { success: false, error: "upstream error" },
    { status }
  );
}

async function fetchDex<T = any>(path: string): Promise<T> {
  const res = await fetch(`${DEX_BASE}${path}`, {
    cache: "no-store",
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(`dexscreener ${res.status} on ${path}`);
  return (await res.json()) as T;
}

async function hydrateByAddress(address: string): Promise<any | null> {
  try {
    const json = await fetchDex<any>(
      `/tokens/v1/solana/${encodeURIComponent(address)}`
    );
    const pair = Array.isArray(json) ? json[0] : json?.pairs?.[0];
    return pair ?? null;
  } catch {
    return null;
  }
}

function rotatingPool(
  pool: string[],
  intervalMs: number,
  parallel: number
): string[] {
  const bucket = Math.floor(Date.now() / intervalMs) % pool.length;
  return Array.from(
    { length: Math.min(parallel, pool.length) },
    (_, i) => pool[(bucket + i) % pool.length]
  );
}

function dedupByBase(pairs: any[]): any[] {
  const seen = new Map<string, any>();
  for (const p of pairs) {
    const key = p?.baseToken?.address;
    if (!key) continue;
    const existing = seen.get(key);
    if (
      !existing ||
      Number(p?.liquidity?.usd ?? 0) > Number(existing?.liquidity?.usd ?? 0)
    ) {
      seen.set(key, p);
    }
  }
  return Array.from(seen.values());
}

function dedupByPairAddress(pairs: any[]): any[] {
  const seen = new Map<string, any>();
  for (const p of pairs) {
    const key = p?.pairAddress;
    if (!key) continue;
    if (!seen.has(key)) seen.set(key, p);
  }
  return Array.from(seen.values());
}

function txnsTotal(p: any, period: "m5" | "h1" | "h6" | "h24"): number {
  const t = p?.txns?.[period];
  return Number(t?.buys ?? 0) + Number(t?.sells ?? 0);
}

function priceChange(p: any, period: "m5" | "h1" | "h6" | "h24"): number {
  return Number(p?.priceChange?.[period] ?? 0);
}

function volume(p: any, period: "m5" | "h1" | "h6" | "h24"): number {
  return Number(p?.volume?.[period] ?? 0);
}

function applyFilterSort(
  pairs: any[],
  filter: "all" | "gainers" | "losers"
): any[] {
  const arr = [...pairs];
  if (filter === "gainers") {
    arr.sort((a, b) => priceChange(b, "h24") - priceChange(a, "h24"));
  } else if (filter === "losers") {
    arr.sort((a, b) => priceChange(a, "h24") - priceChange(b, "h24"));
  } else {
    arr.sort((a, b) => txnsTotal(b, "h1") - txnsTotal(a, "h1"));
  }
  return arr;
}

async function handleSearch(
  q: string,
  limit: number
): Promise<NextResponse> {
  if (!q) {
    return NextResponse.json(
      { success: false, error: "q required" },
      { status: 400 }
    );
  }
  try {
    const json = await fetchDex<any>(
      `/latest/dex/search?q=${encodeURIComponent(q)}`
    );
    const pairs: any[] = Array.isArray(json?.pairs) ? json.pairs : [];
    const filtered = pairs.filter(isSolanaPair).slice(0, limit);
    return NextResponse.json({
      success: true,
      data: filtered.map(scorePair),
    });
  } catch (err) {
    return errorResponse("search", err);
  }
}

async function handleBatch(addresses: string[]): Promise<NextResponse> {
  const unique = Array.from(new Set(addresses.filter(Boolean))).slice(0, 30);
  if (unique.length === 0) {
    return NextResponse.json({ success: true, data: {} });
  }
  try {
    const results = await Promise.all(unique.map(hydrateByAddress));
    const out: Record<string, ScoredPair> = {};
    unique.forEach((addr, i) => {
      const pair = results[i];
      if (pair) out[addr] = scorePair(pair);
    });
    return NextResponse.json({ success: true, data: out });
  } catch (err) {
    return errorResponse("batch", err);
  }
}

async function handleToken(address: string): Promise<NextResponse> {
  if (!address) {
    return NextResponse.json(
      { success: false, error: "address required" },
      { status: 400 }
    );
  }
  try {
    const pair = await hydrateByAddress(address);
    return NextResponse.json({
      success: true,
      data: pair ? scorePair(pair) : null,
    });
  } catch (err) {
    return errorResponse("token", err);
  }
}

async function handleLive(): Promise<NextResponse> {
  try {
    const json = await fetchDex<any>("/token-profiles/latest/v1");
    const items: any[] = Array.isArray(json) ? json : [];
    const solana = items
      .filter((p) => (p?.chainId ?? "").toLowerCase() === "solana")
      .slice(0, 40);
    const addresses = solana
      .map((p) => p?.tokenAddress)
      .filter((a): a is string => typeof a === "string");
    const hydrated = await Promise.all(addresses.map(hydrateByAddress));
    const scored = hydrated.filter(Boolean).map((p) => scorePair(p));
    return NextResponse.json({ success: true, data: scored });
  } catch (err) {
    return errorResponse("live", err);
  }
}

async function handleSmart(): Promise<NextResponse> {
  try {
    const json = await fetchDex<any>("/token-boosts/top/v1");
    const items: any[] = Array.isArray(json) ? json : [];
    const solana = items
      .filter((p) => (p?.chainId ?? "").toLowerCase() === "solana")
      .slice(0, 30);
    const addresses = solana
      .map((p) => p?.tokenAddress)
      .filter((a): a is string => typeof a === "string");
    const hydrated = (await Promise.all(addresses.map(hydrateByAddress))).filter(
      Boolean
    );
    hydrated.sort((a, b) => txnsTotal(b, "h24") - txnsTotal(a, "h24"));
    return NextResponse.json({
      success: true,
      data: hydrated.map((p) => scorePair(p)),
    });
  } catch (err) {
    return errorResponse("smart", err);
  }
}

const WHALE_POOL = [
  "SOL", "USDC", "BONK", "JUP", "RAY", "WIF", "POPCAT", "MEME", "PYTH", "RENDER",
];

async function handleWhale(
  filter: "all" | "gainers" | "losers"
): Promise<NextResponse> {
  try {
    const queries = rotatingPool(WHALE_POOL, 20_000, 2);
    const batches = await Promise.all(
      queries.map((q) =>
        fetchDex<any>(`/latest/dex/search?q=${encodeURIComponent(q)}`).catch(
          () => ({ pairs: [] })
        )
      )
    );
    const all = batches.flatMap((b) =>
      (Array.isArray(b?.pairs) ? b.pairs : []).filter(isSolanaPair)
    );
    const deduped = dedupByPairAddress(all);
    const sorted = applyFilterSort(deduped, filter).slice(0, 40);

    const totalVolume = sorted.reduce((s, p) => s + volume(p, "h24"), 0);
    const totalTxns = sorted.reduce((s, p) => s + txnsTotal(p, "h24"), 0);

    return NextResponse.json({
      success: true,
      data: sorted.map(scorePair),
      totalVolume,
      totalTxns,
    });
  } catch (err) {
    return errorResponse("whale", err);
  }
}

async function handleMeme(
  filter: "all" | "new" | "hot"
): Promise<NextResponse> {
  try {
    const json = await fetchDex<any>(`/latest/dex/search?q=meme`);
    const pairs: any[] = Array.isArray(json?.pairs) ? json.pairs : [];
    let filtered = pairs
      .filter(isSolanaPair)
      .filter((p) => Number(p?.fdv ?? 0) < 10_000_000);

    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    if (filter === "new") {
      filtered = filtered
        .filter((p) => Number(p?.pairCreatedAt ?? 0) >= dayAgo)
        .sort(
          (a, b) => Number(b?.pairCreatedAt ?? 0) - Number(a?.pairCreatedAt ?? 0)
        );
    } else if (filter === "hot") {
      filtered = filtered.sort(
        (a, b) => txnsTotal(b, "h1") - txnsTotal(a, "h1")
      );
    } else {
      filtered = filtered.sort(
        (a, b) => priceChange(b, "h24") - priceChange(a, "h24")
      );
    }

    const total = filtered.length;
    const data = filtered.slice(0, 60).map(scorePair);
    return NextResponse.json({ success: true, data, total });
  } catch (err) {
    return errorResponse("meme", err);
  }
}

const DEFI_POOL = ["SOL", "JUP", "RAY", "ORCA", "MSOL", "JITO", "PYTH", "WIF"];

async function handleDefi(
  filter: "all" | "gainers" | "losers"
): Promise<NextResponse> {
  try {
    const queries = rotatingPool(DEFI_POOL, 30_000, 4);
    const batches = await Promise.all(
      queries.map((q) =>
        fetchDex<any>(`/latest/dex/search?q=${encodeURIComponent(q)}`).catch(
          () => ({ pairs: [] })
        )
      )
    );
    const all = batches.flatMap((b) =>
      (Array.isArray(b?.pairs) ? b.pairs : []).filter(isSolanaPair)
    );
    const deduped = dedupByPairAddress(all).filter(
      (p) => Number(p?.liquidity?.usd ?? 0) > 10_000
    );
    const sorted = applyFilterSort(deduped, filter).slice(0, 40);
    return NextResponse.json({
      success: true,
      data: sorted.map(scorePair),
    });
  } catch (err) {
    return errorResponse("defi", err);
  }
}

const TRENDING_DEX_POOL = [
  "SOL", "pump", "BONK", "WIF", "JUP", "MEME", "RAY",
];

const PERIOD_MS: Record<"m5" | "h1" | "h6" | "h24", number> = {
  m5: 5 * 60 * 1000,
  h1: 60 * 60 * 1000,
  h6: 6 * 60 * 60 * 1000,
  h24: 24 * 60 * 60 * 1000,
};

async function handleTrendingDex(
  mode: "gainers" | "volume" | "txns" | "newest",
  period: "m5" | "h1" | "h6" | "h24"
): Promise<NextResponse> {
  try {
    const queries = rotatingPool(TRENDING_DEX_POOL, 20_000, 2);
    const batches = await Promise.all(
      queries.map((q) =>
        fetchDex<any>(`/latest/dex/search?q=${encodeURIComponent(q)}`).catch(
          () => ({ pairs: [] })
        )
      )
    );
    const all = batches.flatMap((b) =>
      (Array.isArray(b?.pairs) ? b.pairs : []).filter(isSolanaPair)
    );
    let pairs = dedupByPairAddress(all).filter(
      (p) => Number(p?.liquidity?.usd ?? 0) > 1000
    );

    if (mode === "gainers") {
      pairs.sort((a, b) => priceChange(b, period) - priceChange(a, period));
    } else if (mode === "volume") {
      pairs.sort((a, b) => volume(b, period) - volume(a, period));
    } else if (mode === "txns") {
      pairs.sort((a, b) => txnsTotal(b, period) - txnsTotal(a, period));
    } else {
      const cutoff = Date.now() - PERIOD_MS[period];
      pairs = pairs
        .filter((p) => Number(p?.pairCreatedAt ?? 0) >= cutoff)
        .sort(
          (a, b) =>
            Number(b?.pairCreatedAt ?? 0) - Number(a?.pairCreatedAt ?? 0)
        );
    }

    return NextResponse.json({
      success: true,
      data: pairs.slice(0, 50).map(scorePair),
    });
  } catch (err) {
    return errorResponse("trending_dex", err);
  }
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const type = sp.get("type") ?? "";

  try {
    switch (type) {
      case "search": {
        const q = sp.get("q") ?? "";
        const limit = Math.min(
          10,
          Math.max(1, parseInt(sp.get("limit") ?? "10", 10) || 10)
        );
        return await handleSearch(q, limit);
      }
      case "batch": {
        const addresses = (sp.get("addresses") ?? "")
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean);
        return await handleBatch(addresses);
      }
      case "token": {
        return await handleToken(sp.get("address") ?? "");
      }
      case "live":
        return await handleLive();
      case "smart":
        return await handleSmart();
      case "whale": {
        const filter = (sp.get("filter") ?? "all") as
          | "all"
          | "gainers"
          | "losers";
        return await handleWhale(filter);
      }
      case "meme": {
        const filter = (sp.get("filter") ?? "all") as "all" | "new" | "hot";
        return await handleMeme(filter);
      }
      case "defi": {
        const filter = (sp.get("filter") ?? "all") as
          | "all"
          | "gainers"
          | "losers";
        return await handleDefi(filter);
      }
      case "trending_dex": {
        const mode = (sp.get("mode") ?? "gainers") as
          | "gainers"
          | "volume"
          | "txns"
          | "newest";
        const period = (sp.get("period") ?? "h24") as
          | "m5"
          | "h1"
          | "h6"
          | "h24";
        return await handleTrendingDex(mode, period);
      }
      default:
        return NextResponse.json(
          { success: false, error: "invalid type" },
          { status: 400 }
        );
    }
  } catch (err) {
    return errorResponse(`dispatch-${type}`, err);
  }
}
