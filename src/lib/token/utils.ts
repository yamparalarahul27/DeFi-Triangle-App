import type { Candle } from "@/components/ui/PriceChart";
import type {
  AssetCore,
  AssetResponse,
  Variant,
  VariantKind,
} from "@/lib/tokens-xyz-types";

export interface ChartRange {
  label: string;
  interval: string;
  lookbackSeconds: number;
}

export type BirdeyePair = {
  baseToken?: { address?: string; symbol?: string; name?: string };
  info?: { imageUrl?: string };
  priceUsd?: number | string;
  priceChange?: { h24?: number | string; h1?: number | string };
  liquidity?: { usd?: number | string };
  volume?: { h24?: number | string };
  marketCap?: number | string;
  fdv?: number | string;
  dexId?: string;
};

export const CHART_RANGES: ChartRange[] = [
  { label: "1D", interval: "1H", lookbackSeconds: 24 * 3600 },
  { label: "1W", interval: "1H", lookbackSeconds: 7 * 24 * 3600 },
  { label: "1M", interval: "4H", lookbackSeconds: 30 * 24 * 3600 },
  { label: "3M", interval: "1D", lookbackSeconds: 90 * 24 * 3600 },
  { label: "1Y", interval: "1D", lookbackSeconds: 365 * 24 * 3600 },
];

export const KIND_LABELS: Partial<Record<VariantKind, string>> = {
  native: "Native",
  wrapped: "Wrapped",
  bridged: "Bridged",
  etf: "ETF",
  yield: "Yield / LSTs",
  leveraged: "Leveraged",
  stablecoin: "Stable",
  lst: "LST",
  basket: "Basket",
  tokenized_equity: "Tokenized equity",
};

export type VariantsByKind = Partial<Record<VariantKind, Variant[]>>;

export function extractAsset(upstreamData: unknown): AssetResponse | null {
  if (!upstreamData || typeof upstreamData !== "object") return null;
  const root = upstreamData as Record<string, unknown>;

  const asset = (root.asset ?? null) as AssetResponse["asset"] | null;
  const includes = (root.includes ?? undefined) as
    | AssetResponse["includes"]
    | undefined;

  if (!asset || typeof asset !== "object" || !asset.assetId) {
    if (typeof window !== "undefined") {
      console.error(
        "[solana] unexpected response shape. top-level keys:",
        Object.keys(root)
      );
    }
    return null;
  }
  return { asset, includes };
}

export function primaryFromAsset(asset: AssetResponse["asset"]): Variant | null {
  const groups = asset.variantGroups ?? {};
  const spot = groups.spot;
  if (Array.isArray(spot) && spot.length > 0) return spot[0];
  const yieldList = groups.yield;
  if (Array.isArray(yieldList) && yieldList.length > 0) return yieldList[0];
  for (const list of Object.values(groups)) {
    if (Array.isArray(list) && list.length > 0) return list[0];
  }
  return null;
}

export function flattenVariantsByKind(
  asset: AssetResponse["asset"]
): VariantsByKind {
  const out: VariantsByKind = {};
  const groups = asset.variantGroups ?? {};
  for (const list of Object.values(groups)) {
    if (!Array.isArray(list)) continue;
    for (const v of list) {
      if (!v || !v.kind) continue;
      if (!out[v.kind]) out[v.kind] = [];
      out[v.kind]!.push(v);
    }
  }
  return out;
}

export function normalizeChartCandles(raw: unknown): Candle[] {
  let arr: unknown[] = [];
  if (Array.isArray(raw)) {
    arr = raw;
  } else if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.candles)) arr = obj.candles as unknown[];
    else if (Array.isArray(obj.data)) arr = obj.data as unknown[];
    else if (Array.isArray(obj.points)) arr = obj.points as unknown[];
    else if (Array.isArray(obj.ohlcv)) arr = obj.ohlcv as unknown[];
    else {
      const nested = obj.data as Record<string, unknown> | undefined;
      if (nested && Array.isArray(nested.candles))
        arr = nested.candles as unknown[];
      else if (nested && Array.isArray(nested.points))
        arr = nested.points as unknown[];
      else if (nested && Array.isArray(nested.data))
        arr = nested.data as unknown[];
    }
  }

  const candles = arr
    .map((item) => {
      const o = (item ?? {}) as Record<string, unknown>;
      const rawTime = Number(
        o.time ?? o.unixTime ?? o.timestamp ?? o.t ?? 0
      );
      const unixTime =
        rawTime > 1_000_000_000_000 ? Math.floor(rawTime / 1000) : rawTime;
      const close = Number(o.close ?? o.c ?? o.value ?? o.price ?? 0);
      return {
        o: Number(o.open ?? o.o ?? close),
        h: Number(o.high ?? o.h ?? close),
        l: Number(o.low ?? o.l ?? close),
        c: close,
        v: Number(o.volume ?? o.v ?? 0),
        unixTime,
      } as Candle;
    })
    .filter(
      (c) =>
        Number.isFinite(c.c) && Number.isFinite(c.unixTime) && c.unixTime > 0
    );

  if (candles.length === 0 && typeof window !== "undefined") {
    const preview =
      raw && typeof raw === "object" ? Object.keys(raw) : typeof raw;
    console.error(
      "[solana] chart normalize found 0 candles. top keys:",
      preview,
      "first raw item:",
      arr[0] ?? null
    );
  }

  return candles;
}

export function buildAssetFromPair(
  pair: BirdeyePair | null,
  address: string
): AssetCore | null {
  if (!address && !pair) return null;

  const symbol = str(pair?.baseToken?.symbol) || shortAddress(address);
  const name = str(pair?.baseToken?.name) || symbol;
  const price = num(pair?.priceUsd);
  const liquidity = num(pair?.liquidity?.usd);
  const volume24 = num(pair?.volume?.h24);
  const marketCap = num(pair?.marketCap || pair?.fdv);
  const change24 = num(pair?.priceChange?.h24);
  const change1h = num(pair?.priceChange?.h1);

  return {
    assetId: address ? `solana-${address}` : `solana-${symbol.toLowerCase()}`,
    name,
    symbol,
    imageUrl: str(pair?.info?.imageUrl) || undefined,
    stats: {
      price,
      liquidity,
      volume24hUSD: volume24,
      marketCap,
      priceChange24hPercent: change24,
      priceChange1hPercent: change1h,
    },
    canonicalMarket: {
      source: str(pair?.dexId) || "birdeye",
      price,
      marketCap,
      volume24hUSD: volume24,
      priceChange24hPercent: change24,
    },
    variantGroups: {},
  };
}

export function mergeAssetWithFallback(
  primary: AssetCore | null,
  fallback: AssetCore | null,
  address: string
): AssetCore | null {
  if (!primary && !fallback) return null;

  const p = (primary ?? {}) as Record<string, unknown>;
  const f = (fallback ?? {}) as Record<string, unknown>;
  const pStats = asRecord(p.stats);
  const fStats = asRecord(f.stats);
  const pCanonical = asRecord(p.canonicalMarket);
  const fCanonical = asRecord(f.canonicalMarket);

  const assetId =
    bestString(p.assetId) ||
    bestString(f.assetId) ||
    (address ? `solana-${address}` : "solana-unknown");

  const symbol = bestString(p.symbol) || bestString(f.symbol) || shortAddress(address);
  const name = bestString(p.name) || bestString(f.name) || symbol;
  const imageUrl = bestString(p.imageUrl) || bestString(f.imageUrl) || undefined;

  const stats = {
    price: pickPositiveNumber(pStats.price, fStats.price),
    liquidity: pickPositiveNumber(pStats.liquidity, fStats.liquidity),
    volume24hUSD: pickPositiveNumber(pStats.volume24hUSD, fStats.volume24hUSD),
    marketCap: pickPositiveNumber(pStats.marketCap, fStats.marketCap),
    priceChange24hPercent: pickAnyFiniteNumber(
      pStats.priceChange24hPercent,
      fStats.priceChange24hPercent
    ),
    priceChange1hPercent: pickAnyFiniteNumber(
      pStats.priceChange1hPercent,
      fStats.priceChange1hPercent
    ),
  };

  const canonicalSource =
    bestString(pCanonical.source) ||
    bestString(fCanonical.source) ||
    "composite";

  const merged: AssetCore = {
    assetId,
    name,
    symbol,
    category: bestString(p.category) || bestString(f.category) || undefined,
    aliases: pickStringArray(p.aliases) ?? pickStringArray(f.aliases),
    symbols: pickStringArray(p.symbols) ?? pickStringArray(f.symbols),
    imageUrl,
    stats,
    canonicalMarket: {
      source: canonicalSource,
      coinId: bestString(pCanonical.coinId) || bestString(fCanonical.coinId) || undefined,
      price: pickPositiveNumber(pCanonical.price, fCanonical.price, stats.price),
      marketCap: pickPositiveNumber(
        pCanonical.marketCap,
        fCanonical.marketCap,
        stats.marketCap
      ),
      volume24hUSD: pickPositiveNumber(
        pCanonical.volume24hUSD,
        fCanonical.volume24hUSD,
        stats.volume24hUSD
      ),
      priceChange24hPercent: pickAnyFiniteNumber(
        pCanonical.priceChange24hPercent,
        fCanonical.priceChange24hPercent,
        stats.priceChange24hPercent
      ),
      lastFetchedAt: pickPositiveNumber(
        pCanonical.lastFetchedAt,
        fCanonical.lastFetchedAt,
        undefined
      ),
      providerLastUpdatedAt: pickPositiveNumber(
        pCanonical.providerLastUpdatedAt,
        fCanonical.providerLastUpdatedAt,
        undefined
      ),
    },
    variantGroups: hasUsableVariantGroups(p.variantGroups)
      ? ((p.variantGroups as AssetCore["variantGroups"]) ?? {})
      : ((f.variantGroups as AssetCore["variantGroups"]) ?? {}),
  };

  return merged;
}

export function num(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export function str(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

export function shortAddress(address: string): string {
  if (!address) return "TOKEN";
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function bestString(value: unknown): string {
  if (typeof value !== "string") return "";
  const out = value.trim();
  return out.length > 0 ? out : "";
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function pickPositiveNumber(
  primary: unknown,
  fallback: unknown,
  finalFallback = 0 as number | undefined
): number {
  const p = toFiniteNumber(primary);
  if (p !== null && p > 0) return p;
  const f = toFiniteNumber(fallback);
  if (f !== null && f > 0) return f;
  if (p !== null) return p;
  if (f !== null) return f;
  return finalFallback ?? 0;
}

function pickAnyFiniteNumber(
  primary: unknown,
  fallback: unknown,
  finalFallback = 0
): number {
  const p = toFiniteNumber(primary);
  if (p !== null) return p;
  const f = toFiniteNumber(fallback);
  if (f !== null) return f;
  return finalFallback;
}

function pickStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const out = value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
  return out.length > 0 ? out : undefined;
}

function hasUsableVariantGroups(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  for (const variants of Object.values(value as Record<string, unknown>)) {
    if (!Array.isArray(variants) || variants.length === 0) continue;
    const hasUsable = variants.some((variant) => {
      if (!variant || typeof variant !== "object" || Array.isArray(variant)) {
        return false;
      }
      const item = variant as Record<string, unknown>;
      return (
        bestString(item.symbol).length > 0 ||
        bestString(item.name).length > 0 ||
        (!!item.market && typeof item.market === "object")
      );
    });
    if (hasUsable) return true;
  }
  return false;
}
