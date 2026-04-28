import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BIRDEYE_BASE = "https://public-api.birdeye.so";
type JsonRecord = Record<string, unknown>;
type PairLike = ReturnType<typeof mapBirdeyeTokenToPair>;
type ListProfile = "all" | "quality" | "bluechip";

interface ListFilters {
  profile: ListProfile;
  minLiquidityUsd: number;
  minVolume24hUsd: number;
  minMarketCapUsd: number;
  minHolders: number;
  minAgeDays: number;
  hasLogo: boolean;
  minPriceChange24h: number | null;
}

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

function errorResponse(context: string, err: unknown, status = 500) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[birdeye/${context}] ${message}`);
  return NextResponse.json(
    { success: false, error: "upstream error" },
    { status }
  );
}

function num(v: unknown, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const parsed = Number(v);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" ? (value as JsonRecord) : {};
}

function toInt(value: string | null, fallback: number): number {
  if (value == null) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.floor(parsed));
}

function toBool(value: string | null, fallback: boolean): boolean {
  if (value == null) return fallback;
  const normalized = value.trim().toLowerCase();
  if (normalized === "1" || normalized === "true" || normalized === "yes") {
    return true;
  }
  if (normalized === "0" || normalized === "false" || normalized === "no") {
    return false;
  }
  return fallback;
}

function toNullableNumber(value: string | null): number | null {
  if (value == null || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseProfile(value: string | null): ListProfile {
  const normalized = (value ?? "").trim().toLowerCase();
  if (normalized === "bluechip") return "bluechip";
  if (normalized === "all") return "all";
  return "quality";
}

function defaultFilters(profile: ListProfile): ListFilters {
  if (profile === "bluechip") {
    return {
      profile,
      minLiquidityUsd: 2_000_000,
      minVolume24hUsd: 1_000_000,
      minMarketCapUsd: 250_000_000,
      minHolders: 10_000,
      minAgeDays: 180,
      hasLogo: true,
      minPriceChange24h: null,
    };
  }

  if (profile === "all") {
    return {
      profile,
      minLiquidityUsd: 0,
      minVolume24hUsd: 0,
      minMarketCapUsd: 0,
      minHolders: 0,
      minAgeDays: 0,
      hasLogo: false,
      minPriceChange24h: null,
    };
  }

  return {
    profile: "quality",
    minLiquidityUsd: 100_000,
    minVolume24hUsd: 50_000,
    minMarketCapUsd: 5_000_000,
    minHolders: 300,
    minAgeDays: 7,
    hasLogo: true,
    minPriceChange24h: null,
  };
}

function parseListFilters(searchParams: URLSearchParams): ListFilters {
  const profile = parseProfile(searchParams.get("profile"));
  const defaults = defaultFilters(profile);

  return {
    profile,
    minLiquidityUsd: toInt(
      searchParams.get("minLiquidity"),
      defaults.minLiquidityUsd
    ),
    minVolume24hUsd: toInt(
      searchParams.get("minVolume24h"),
      defaults.minVolume24hUsd
    ),
    minMarketCapUsd: toInt(
      searchParams.get("minMarketCap"),
      defaults.minMarketCapUsd
    ),
    minHolders: toInt(searchParams.get("minHolders"), defaults.minHolders),
    minAgeDays: toInt(searchParams.get("minAgeDays"), defaults.minAgeDays),
    hasLogo: toBool(searchParams.get("hasLogo"), defaults.hasLogo),
    minPriceChange24h:
      toNullableNumber(searchParams.get("minPriceChange24h")) ??
      defaults.minPriceChange24h,
  };
}

function passesFilters(pair: PairLike, filters: ListFilters): boolean {
  const liquidity = Number(pair?.liquidity?.usd ?? 0);
  if (liquidity < filters.minLiquidityUsd) return false;

  const volume24h = Number(pair?.volume?.h24 ?? 0);
  if (volume24h < filters.minVolume24hUsd) return false;

  const marketCap = Number(pair?.marketCap ?? pair?.fdv ?? 0);
  if (marketCap < filters.minMarketCapUsd) return false;

  const holders = Number(pair?.holder ?? 0);
  if (holders < filters.minHolders) return false;

  if (filters.hasLogo) {
    const logo = pair?.info?.imageUrl;
    if (typeof logo !== "string" || logo.trim().length === 0) return false;
  }

  if (filters.minAgeDays > 0) {
    const createdAtMs = Number(pair?.pairCreatedAt ?? 0);
    if (createdAtMs <= 0) return false;
    const ageDays = (Date.now() - createdAtMs) / (1000 * 60 * 60 * 24);
    if (!Number.isFinite(ageDays) || ageDays < filters.minAgeDays) return false;
  }

  if (filters.minPriceChange24h != null) {
    const pct = Number(pair?.priceChange?.h24 ?? 0);
    if (pct < filters.minPriceChange24h) return false;
  }

  const symbol = pair?.baseToken?.symbol;
  const name = pair?.baseToken?.name;
  if (typeof symbol !== "string" || symbol.trim().length === 0) return false;
  if (typeof name !== "string" || name.trim().length === 0) return false;

  return true;
}

function mapBirdeyeTokenToPair(token: JsonRecord) {
  const address = String(token?.address ?? token?.token_address ?? "");
  const symbol = String(token?.symbol ?? "");
  const name = String(token?.name ?? "");

  const logoURI =
    token?.logoURI ?? token?.logo_uri ?? token?.logoUrl ?? token?.logo_url;

  const priceUsd = num(token?.price ?? token?.priceUsd);
  const priceChange24 = num(
    token?.price24hChangePercent ??
      token?.priceChange24hPercent ??
      token?.price_change_24h_percent
  );

  const volume24h = num(
    token?.volume24hUSD ?? token?.volume24h ?? token?.volume_24h_usd
  );
  const liquidity = num(token?.liquidity ?? token?.liquidityUsd);
  const fdv = num(token?.fdv);
  const marketCap = num(
    token?.marketcap ?? token?.marketCap ?? token?.market_cap
  );

  const buys24 = num(token?.buy24h ?? token?.buy_24h);
  const sells24 = num(token?.sell24h ?? token?.sell_24h);
  const trade24 = num(token?.trade24h ?? token?.trade_24h ?? token?.trade_24h_count);
  const fallbackBuys =
    buys24 > 0 || sells24 > 0 ? buys24 : Math.round(trade24 / 2);
  const fallbackSells =
    buys24 > 0 || sells24 > 0 ? sells24 : Math.max(0, trade24 - fallbackBuys);

  const recentListingUnix = num(token?.recent_listing_time);
  const lastTradeUnix = num(
    token?.last_trade_unix_time ?? token?.lastTradeUnixTime
  );
  const pairCreatedAt =
    recentListingUnix > 0
      ? recentListingUnix * 1000
      : lastTradeUnix > 0
        ? lastTradeUnix * 1000
        : 0;

  const extensions = asRecord(token?.extensions);

  const socials: { type: string; url: string }[] = [];
  const websites: { url: string }[] = [];

  const socialFromToken = asArray<Record<string, string>>(token?.socials);
  for (const s of socialFromToken) {
    if (typeof s?.type === "string" && typeof s?.url === "string") {
      socials.push({ type: s.type, url: s.url });
    }
  }

  const websiteFromToken = asArray<Record<string, string>>(token?.websites);
  for (const w of websiteFromToken) {
    if (typeof w?.url === "string") {
      websites.push({ url: w.url });
    }
  }

  if (typeof extensions?.twitter === "string") {
    socials.push({ type: "twitter", url: extensions.twitter });
  }
  if (typeof extensions?.telegram === "string") {
    socials.push({ type: "telegram", url: extensions.telegram });
  }
  if (typeof extensions?.discord === "string") {
    socials.push({ type: "discord", url: extensions.discord });
  }
  if (typeof extensions?.website === "string") {
    websites.push({ url: extensions.website });
  }

  return {
    pairAddress: address,
    baseToken: {
      address,
      symbol,
      name,
    },
    quoteToken: {
      symbol: "USD",
      name: "US Dollar",
    },
    info: {
      imageUrl: typeof logoURI === "string" ? logoURI : undefined,
      socials,
      websites,
    },
    priceUsd,
    priceChange: {
      m5: num(token?.price_change_5m_percent),
      h1: num(token?.price_change_1h_percent),
      h6: 0,
      h24: priceChange24,
    },
    volume: {
      m5: num(token?.volume_5m_usd),
      h1: num(token?.volume_1h_usd),
      h6: 0,
      h24: volume24h,
    },
    liquidity: {
      usd: liquidity,
    },
    fdv,
    marketCap: marketCap || fdv,
    txns: {
      m5: { buys: 0, sells: 0 },
      h1: { buys: 0, sells: 0 },
      h6: { buys: 0, sells: 0 },
      h24: { buys: fallbackBuys, sells: fallbackSells },
    },
    pairCreatedAt,
    dexId: token?.source ?? "birdeye",
    trendingRank: Number.isFinite(token?.rank) ? Number(token.rank) : null,
    holder: num(token?.holder),
    numberMarkets: num(token?.numberMarkets),
  };
}

async function fetchBirdeye(path: string): Promise<Response> {
  const headers = birdeyeHeaders();
  return fetch(`${BIRDEYE_BASE}${path}`, { headers, cache: "no-store" });
}

async function handleTrending(limit: number) {
  try {
    const cappedLimit = Math.max(1, Math.min(20, limit));
    const upstream = await fetchBirdeye(`/defi/token_trending?limit=${cappedLimit}`);
    if (!upstream.ok) {
      return errorResponse("trending", `upstream ${upstream.status}`, upstream.status);
    }

    const json = await upstream.json();
    const tokenList = asArray<JsonRecord>(json?.data?.tokens);
    const itemList = asArray<JsonRecord>(json?.data?.items);
    const tokens: JsonRecord[] = tokenList.length > 0 ? tokenList : itemList;

    return NextResponse.json({
      success: true,
      data: tokens.map(mapBirdeyeTokenToPair),
      paging: {
        limit: cappedLimit,
        count: tokens.length,
      },
    });
  } catch (err) {
    return errorResponse("trending-fetch", err);
  }
}

async function handleListV3(limit: number, offset: number, filters: ListFilters) {
  try {
    const cappedLimit = Math.max(1, Math.min(100, limit));
    const cappedOffset = Math.max(0, Math.min(9_900, offset));

    const path =
      `/defi/v3/token/list?sort_by=liquidity&sort_type=desc` +
      `&limit=${cappedLimit}&offset=${cappedOffset}`;

    const upstream = await fetchBirdeye(path);
    if (!upstream.ok) {
      return errorResponse("list-v3", `upstream ${upstream.status}`, upstream.status);
    }

    const json = await upstream.json();
    const items = asArray<JsonRecord>(json?.data?.items);
    const hasNext = Boolean(json?.data?.has_next);

    const mapped = items.map(mapBirdeyeTokenToPair);
    const filtered = mapped.filter((pair) => passesFilters(pair, filters));

    return NextResponse.json({
      success: true,
      data: filtered,
      paging: {
        offset: cappedOffset,
        limit: cappedLimit,
        count: filtered.length,
        sourceCount: items.length,
        hasNext,
      },
      filters,
    });
  } catch (err) {
    return errorResponse("list-v3-fetch", err);
  }
}

async function handleSearch(q: string, limit: number) {
  if (!q) {
    return NextResponse.json(
      { success: false, error: "q required" },
      { status: 400 }
    );
  }

  try {
    const cappedLimit = Math.max(1, Math.min(50, limit));
    const upstream = await fetchBirdeye(
      `/defi/v3/search?keyword=${encodeURIComponent(q)}&target=token`
    );

    if (!upstream.ok) {
      return errorResponse("search", `upstream ${upstream.status}`, upstream.status);
    }

    const json = await upstream.json();
    const groups = asArray<JsonRecord>(json?.data?.items);
    const tokenGroup = groups.find((g) => g?.type === "token");
    const raw = asArray<JsonRecord>(tokenGroup?.result);

    const solana = raw.filter(
      (t) => String(t?.network ?? "").toLowerCase() === "solana"
    );

    return NextResponse.json({
      success: true,
      data: solana.slice(0, cappedLimit).map(mapBirdeyeTokenToPair),
    });
  } catch (err) {
    return errorResponse("search-fetch", err);
  }
}

async function handleToken(address: string) {
  if (!address) {
    return NextResponse.json(
      { success: false, error: "address required" },
      { status: 400 }
    );
  }

  try {
    const upstream = await fetchBirdeye(
      `/defi/token_overview?address=${encodeURIComponent(address)}`
    );

    if (!upstream.ok) {
      return errorResponse("token", `upstream ${upstream.status}`, upstream.status);
    }

    const json = await upstream.json();
    const token = (json?.data ?? null) as JsonRecord | null;

    return NextResponse.json({
      success: true,
      data: token ? mapBirdeyeTokenToPair(token) : null,
    });
  } catch (err) {
    return errorResponse("token-fetch", err);
  }
}

async function handleSecurity(address: string) {
  if (!address) {
    return NextResponse.json(
      { success: false, error: "address required" },
      { status: 400 }
    );
  }

  try {
    const upstream = await fetchBirdeye(
      `/defi/token_security?address=${encodeURIComponent(address)}`
    );

    const json = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      return NextResponse.json(
        {
          success: false,
          error:
            json?.message ??
            json?.error ??
            `upstream ${upstream.status}`,
          status: upstream.status,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ success: true, data: json?.data ?? null });
  } catch (err) {
    return errorResponse("security-fetch", err);
  }
}

const ALLOWED_OHLCV_INTERVALS = new Set([
  "1m",
  "5m",
  "15m",
  "30m",
  "1H",
  "2H",
  "4H",
  "6H",
  "8H",
  "12H",
  "1D",
  "3D",
  "1W",
  "1M",
]);

async function handleOhlcv(
  address: string,
  interval: string,
  timeFrom: number,
  timeTo: number
) {
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

  const url = `${BIRDEYE_BASE}/defi/ohlcv?address=${encodeURIComponent(
    address
  )}&type=${interval}&time_from=${timeFrom}&time_to=${timeTo}`;

  try {
    const upstream = await fetch(url, { headers, cache: "no-store" });
    if (!upstream.ok) {
      return errorResponse("ohlcv", `upstream ${upstream.status}`, upstream.status);
    }
    const json = await upstream.json();
    const items = asArray<unknown>(json?.data?.items);
    const candles = items.map((item) => {
      const c = asRecord(item);
      return {
        o: Number(c?.o ?? 0),
        h: Number(c?.h ?? 0),
        l: Number(c?.l ?? 0),
        c: Number(c?.c ?? 0),
        v: Number(c?.v ?? 0),
        unixTime: Number(c?.unixTime ?? 0),
      };
    });
    return NextResponse.json({ success: true, data: candles });
  } catch (err) {
    return errorResponse("ohlcv-fetch", err);
  }
}

export async function GET(req: NextRequest) {
  const limited = await enforceRateLimit(req, "public-read");
  if (limited) return limited;

  const searchParams = req.nextUrl.searchParams;
  const type = searchParams.get("type") ?? "list_v3";

  if (type === "ohlcv") {
    const nowSec = Math.floor(Date.now() / 1000);
    const requestedInterval = searchParams.get("interval") ?? "1H";
    const interval = ALLOWED_OHLCV_INTERVALS.has(requestedInterval)
      ? requestedInterval
      : "1H";
    const timeFrom = Number(searchParams.get("time_from")) || nowSec - 86400;
    const timeTo = Number(searchParams.get("time_to")) || nowSec;
    return handleOhlcv(
      searchParams.get("address") ?? "",
      interval,
      timeFrom,
      timeTo
    );
  }

  if (type === "search") {
    const q = searchParams.get("q")?.trim() ?? "";
    const limit = Number(searchParams.get("limit") ?? 10);
    return handleSearch(q, Number.isFinite(limit) ? limit : 10);
  }

  if (type === "token") {
    return handleToken(searchParams.get("address") ?? "");
  }

  if (type === "security") {
    return handleSecurity(searchParams.get("address") ?? "");
  }

  if (type === "list_v3") {
    const limit = Number(searchParams.get("limit") ?? 100);
    const offset = Number(searchParams.get("offset") ?? 0);
    const filters = parseListFilters(searchParams);
    return handleListV3(
      Number.isFinite(limit) ? limit : 100,
      Number.isFinite(offset) ? offset : 0,
      filters
    );
  }

  if (type === "trending" || type === "") {
    const limit = Number(searchParams.get("limit") ?? 20);
    return handleTrending(Number.isFinite(limit) ? limit : 20);
  }

  return NextResponse.json(
    { success: false, error: "invalid type" },
    { status: 400 }
  );
}
