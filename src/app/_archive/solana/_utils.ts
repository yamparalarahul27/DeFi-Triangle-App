import type { Candle } from "@/components/ui/PriceChart";
import type {
  AssetResponse,
  Variant,
  VariantKind,
} from "@/lib/tokens-xyz-types";

export interface ChartRange {
  label: string;
  interval: string;
  lookbackSeconds: number;
}

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
