"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useInterval } from "@/lib/hooks/useInterval";
import type { Candle } from "@/components/ui/PriceChart";
import type { AssetCore, AssetResponse, Variant } from "@/lib/tokens-xyz-types";
import {
  CHART_RANGES,
  buildAssetFromPair,
  extractAsset,
  flattenVariantsByKind,
  mergeAssetWithFallback,
  normalizeChartCandles,
  num,
  primaryFromAsset,
  str,
  type BirdeyePair,
  type ChartRange,
  type VariantsByKind,
} from "@/lib/token/utils";

const TOKEN_REFRESH_MS = 15_000;

type Includes = NonNullable<AssetResponse["includes"]>;
type ProfileData = NonNullable<NonNullable<Includes["profile"]>["data"]>;
type RiskData = NonNullable<NonNullable<Includes["risk"]>["data"]>;
type Markets = NonNullable<NonNullable<Includes["markets"]>["data"]>["markets"];

export interface UseTokenDetailsResult {
  asset: AssetCore | null;
  primary: Variant | null;
  variantsByKind: VariantsByKind;
  profile: ProfileData | undefined;
  risk: RiskData | undefined;
  markets: Markets;
  chartCandles: Candle[];
  chartRange: string;
  setChartRange: (label: string) => void;
  loading: boolean;
  chartLoading: boolean;
}

export function useTokenDetails(address: string): UseTokenDetailsResult {
  const [pair, setPair] = useState<BirdeyePair | null>(null);
  const [response, setResponse] = useState<AssetResponse | null>(null);
  const [chartCandles, setChartCandles] = useState<Candle[]>([]);
  const [chartRange, setChartRange] = useState("1W");
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);

  const fetchTokenData = useCallback(async () => {
    if (!address) return;

    try {
      const [birdeyeRes, tokensXyzRes] = await Promise.all([
        fetch(`/api/birdeye?type=token&address=${encodeURIComponent(address)}`, {
          cache: "no-store",
        }),
        fetch(`/api/tokens-xyz?type=asset&assetId=${encodeURIComponent(address)}`, {
          cache: "no-store",
        }),
      ]);

      const birdeyeJson = birdeyeRes.ok ? await birdeyeRes.json() : null;
      const tokensXyzJson = tokensXyzRes.ok ? await tokensXyzRes.json() : null;

      setPair(birdeyeJson?.success ? (birdeyeJson.data as BirdeyePair) : null);
      setResponse(
        tokensXyzJson?.success && tokensXyzJson?.data
          ? extractAsset(tokensXyzJson.data)
          : null
      );
    } catch {
      // keep previous state on transient failures
    }
  }, [address]);

  useEffect(() => {
    if (!address) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      await fetchTokenData();
      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [address, fetchTokenData]);

  useInterval(fetchTokenData, address ? TOKEN_REFRESH_MS : null);

  useEffect(() => {
    if (!address) return;

    const range = CHART_RANGES.find((r) => r.label === chartRange) ?? CHART_RANGES[1];

    let cancelled = false;
    (async () => {
      setChartLoading(true);
      try {
        const candles = await fetchTokenChartCandles(address, range);
        if (!cancelled) {
          setChartCandles(candles);
        }
      } finally {
        if (!cancelled) setChartLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [address, chartRange]);

  const fallbackAsset = useMemo(
    () => buildAssetFromPair(pair, address),
    [pair, address]
  );

  const asset = useMemo(
    () => mergeAssetWithFallback(response?.asset ?? null, fallbackAsset, address),
    [response?.asset, fallbackAsset, address]
  );

  const primary = useMemo(() => (asset ? primaryFromAsset(asset) : null), [asset]);
  const variantsByKind = useMemo(
    () => (asset ? flattenVariantsByKind(asset) : {}),
    [asset]
  );

  return {
    asset,
    primary,
    variantsByKind,
    profile: response?.includes?.profile?.data,
    risk: response?.includes?.risk?.data,
    markets: response?.includes?.markets?.data?.markets ?? [],
    chartCandles,
    chartRange,
    setChartRange,
    loading,
    chartLoading,
  };
}

async function fetchTokenChartCandles(
  address: string,
  range: ChartRange
): Promise<Candle[]> {
  const now = Math.floor(Date.now() / 1000);
  const from = now - range.lookbackSeconds;

  // 1) Tokens.xyz
  try {
    const res = await fetch(
      `/api/tokens-xyz?type=price-chart&assetId=${encodeURIComponent(
        address
      )}&interval=${range.interval}&from=${from}&to=${now}`,
      { cache: "no-store" }
    );
    const json = res.ok ? await res.json() : null;
    if (json?.success) {
      const candles = normalizeChartCandles(json.data);
      if (candles.length >= 2) return candles;
    }
  } catch {}

  // 2) Birdeye
  try {
    const res = await fetch(
      `/api/birdeye?type=ohlcv&address=${encodeURIComponent(address)}`,
      { cache: "no-store" }
    );
    const json = res.ok ? await res.json() : null;
    if (json?.success) {
      const candles = normalizeChartCandles(json.data);
      if (candles.length >= 2) return candles;
    }
  } catch {}

  // 3) Jupiter (derived)
  return fetchJupiterDerivedCandles(address, from, now);
}

async function fetchJupiterDerivedCandles(
  address: string,
  from: number,
  now: number
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
        if (!item || typeof item !== "object" || Array.isArray(item)) return false;
        const record = item as Record<string, unknown>;
        const base = record.baseToken as Record<string, unknown> | undefined;
        return str(base?.address).toLowerCase() === address.toLowerCase();
      }) ?? rows[0];

    if (!exact || typeof exact !== "object" || Array.isArray(exact)) return [];

    const record = exact as Record<string, unknown>;
    const priceUsd = num(record.priceUsd);
    const priceChange24 = num(
      (record.priceChange as Record<string, unknown> | undefined)?.h24
    );
    const volume24 = num((record.volume as Record<string, unknown> | undefined)?.h24);

    if (!Number.isFinite(priceUsd) || priceUsd <= 0) return [];

    const denominator = 1 + priceChange24 / 100;
    const prevPrice = denominator > 0 ? priceUsd / denominator : priceUsd;
    const high = Math.max(prevPrice, priceUsd);
    const low = Math.min(prevPrice, priceUsd);

    return [
      {
        o: prevPrice,
        h: high,
        l: low,
        c: prevPrice,
        v: Math.max(0, volume24 / 2),
        unixTime: from,
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
