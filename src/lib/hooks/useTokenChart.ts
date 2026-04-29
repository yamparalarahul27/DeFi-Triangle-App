"use client";

import { useEffect, useState } from "react";
import type { Candle } from "@/components/ui/PriceChart";

type ChartSource =
  | "Birdeye"
  | "Tokens.xyz"
  | "Jupiter (derived)"
  | "Birdeye + Tokens.xyz + Jupiter";
type ChartFetchResult = { candles: Candle[]; source: ChartSource };
type CachedEntry = { result: ChartFetchResult; cachedAt: number };

const CACHE_TTL_MS = 30_000;
const ohlcvCache = new Map<string, CachedEntry>();

function readCached(address: string): ChartFetchResult | null {
  const entry = ohlcvCache.get(address);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > CACHE_TTL_MS) {
    ohlcvCache.delete(address);
    return null;
  }
  return entry.result;
}

export function useTokenChart(address: string): {
  candles: Candle[] | null;
  loading: boolean;
} {
  const [candles, setCandles] = useState<Candle[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) {
      setCandles([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const cached = readCached(address);
    if (cached) {
      setCandles(cached.candles);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    (async () => {
      try {
        const result = await fetchChartWithFallback(address);
        if (!cancelled) {
          ohlcvCache.set(address, { result, cachedAt: Date.now() });
          setCandles(result.candles);
        }
      } catch {
        if (!cancelled) setCandles([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [address]);

  return { candles, loading };
}

async function fetchChartWithFallback(
  address: string
): Promise<ChartFetchResult> {
  const birdeye = await fetchBirdeyeCandles(address);
  if (birdeye.length >= 2) {
    return { candles: birdeye, source: "Birdeye" };
  }

  const tokensXyz = await fetchTokensXyzCandles(address);
  if (tokensXyz.length >= 2) {
    return { candles: tokensXyz, source: "Tokens.xyz" };
  }

  const jupiter = await fetchJupiterDerivedCandles(address);
  if (jupiter.length >= 2) {
    return { candles: jupiter, source: "Jupiter (derived)" };
  }

  if (birdeye.length > 0) {
    return { candles: birdeye, source: "Birdeye + Tokens.xyz + Jupiter" };
  }
  if (tokensXyz.length > 0) {
    return { candles: tokensXyz, source: "Birdeye + Tokens.xyz + Jupiter" };
  }
  return { candles: jupiter, source: "Birdeye + Tokens.xyz + Jupiter" };
}

async function fetchBirdeyeCandles(address: string): Promise<Candle[]> {
  try {
    const res = await fetch(
      `/api/birdeye?type=ohlcv&address=${encodeURIComponent(address)}`,
      { cache: "no-store" }
    );
    const json = res.ok ? await res.json() : null;
    const raw: unknown[] =
      json?.success && Array.isArray(json.data) ? json.data : [];
    return normalizeCandles(raw);
  } catch {
    return [];
  }
}

async function fetchTokensXyzCandles(address: string): Promise<Candle[]> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const from = now - 86_400;
    const res = await fetch(
      `/api/tokens-xyz?type=price-chart&assetId=${encodeURIComponent(
        address
      )}&interval=1H&from=${from}&to=${now}`,
      { cache: "no-store" }
    );
    const json = res.ok ? await res.json() : null;
    const raw = json?.success ? json.data : null;
    return normalizeCandles(raw);
  } catch {
    return [];
  }
}

async function fetchJupiterDerivedCandles(
  address: string
): Promise<Candle[]> {
  try {
    const res = await fetch(
      `/api/jupiter?type=search&q=${encodeURIComponent(address)}&limit=3`,
      { cache: "no-store" }
    );
    const json = res.ok ? await res.json() : null;
    const rows = Array.isArray(json?.data) ? (json.data as unknown[]) : [];
    if (rows.length === 0) return [];

    const exact =
      rows.find((item) => {
        if (!item || typeof item !== "object" || Array.isArray(item))
          return false;
        const rec = item as Record<string, unknown>;
        const base = rec.baseToken as Record<string, unknown> | undefined;
        return (
          String(base?.address ?? "").toLowerCase() === address.toLowerCase()
        );
      }) ?? rows[0];

    if (!exact || typeof exact !== "object" || Array.isArray(exact)) return [];
    const rec = exact as Record<string, unknown>;
    const priceUsd = toNumber(rec.priceUsd);
    const priceChange = toNumber(
      (rec.priceChange as Record<string, unknown> | undefined)?.h24
    );
    const volume24 = toNumber(
      (rec.volume as Record<string, unknown> | undefined)?.h24
    );
    if (!Number.isFinite(priceUsd) || priceUsd <= 0) return [];

    const denominator = 1 + priceChange / 100;
    const prevPrice =
      Number.isFinite(denominator) && denominator > 0
        ? priceUsd / denominator
        : priceUsd;

    const now = Math.floor(Date.now() / 1000);
    const start = now - 86_400;
    const high = Math.max(prevPrice, priceUsd);
    const low = Math.min(prevPrice, priceUsd);

    return [
      {
        o: prevPrice,
        h: high,
        l: low,
        c: prevPrice,
        v: Math.max(0, volume24 / 2),
        unixTime: start,
      },
      {
        o: prevPrice,
        h: high,
        l: low,
        c: priceUsd,
        v: Math.max(0, volume24),
        unixTime: now,
      },
    ];
  } catch {
    return [];
  }
}

function normalizeCandles(raw: unknown): Candle[] {
  let rows: unknown[] = [];
  if (Array.isArray(raw)) {
    rows = raw;
  } else if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.candles)) rows = obj.candles as unknown[];
    else if (Array.isArray(obj.data)) rows = obj.data as unknown[];
    else if (Array.isArray(obj.points)) rows = obj.points as unknown[];
    else if (Array.isArray(obj.ohlcv)) rows = obj.ohlcv as unknown[];
    else {
      const nested = obj.data as Record<string, unknown> | undefined;
      if (nested && Array.isArray(nested.candles))
        rows = nested.candles as unknown[];
      else if (nested && Array.isArray(nested.points))
        rows = nested.points as unknown[];
      else if (nested && Array.isArray(nested.data))
        rows = nested.data as unknown[];
      else if (nested && Array.isArray(nested.ohlcv))
        rows = nested.ohlcv as unknown[];
    }
  }

  return rows
    .map((item) => {
      const r =
        item && typeof item === "object" && !Array.isArray(item)
          ? (item as Record<string, unknown>)
          : {};
      const rawTime = toNumber(
        r.unixTime ??
          r.time ??
          r.timestamp ??
          r.t ??
          r.startTime ??
          r.start_time
      );
      const unixTime =
        rawTime > 1_000_000_000_000 ? Math.floor(rawTime / 1000) : rawTime;

      const close = toNumber(r.c ?? r.close ?? r.value ?? r.price);
      const open = toNumber(r.o ?? r.open, close);
      const high = toNumber(r.h ?? r.high, close);
      const low = toNumber(r.l ?? r.low, close);
      const volume = toNumber(r.v ?? r.volume, 0);

      return {
        o: open,
        h: high,
        l: low,
        c: close,
        v: volume,
        unixTime,
      } satisfies Candle;
    })
    .filter(
      (candle) =>
        Number.isFinite(candle.unixTime) &&
        candle.unixTime > 0 &&
        Number.isFinite(candle.c) &&
        candle.c > 0
    )
    .sort((a, b) => a.unixTime - b.unixTime);
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}
