"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useInterval } from "@/lib/hooks/useInterval";
import type { Candle } from "@/components/ui/PriceChart";
import type { AssetCore, AssetResponse, Variant } from "@/lib/tokens-xyz-types";
import { lookupToken } from "@/lib/token/lookup";
import {
  CHART_RANGES,
  buildAssetFromPair,
  extractAsset,
  flattenVariantsByKind,
  mergeAssetWithFallback,
  normalizeChartCandles,
  primaryFromAsset,
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
  notIndexed: boolean;
}

export function useTokenDetails(address: string): UseTokenDetailsResult {
  const [pair, setPair] = useState<BirdeyePair | null>(null);
  const [response, setResponse] = useState<AssetResponse | null>(null);
  const [chartCandles, setChartCandles] = useState<Candle[]>([]);
  const [chartRange, setChartRange] = useState("1W");
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [lookup, setLookup] = useState<{
    address: string;
    found: boolean;
  } | null>(null);

  useEffect(() => {
    if (!address) return;
    let cancelled = false;
    (async () => {
      const result = await lookupToken(address);
      if (cancelled) return;
      setLookup({ address, found: result.found });
    })();
    return () => {
      cancelled = true;
    };
  }, [address]);

  const lookupComplete = lookup?.address === address;
  const lookupFound = lookupComplete && lookup.found;

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

  const notIndexed = lookupComplete && !lookupFound && !asset;

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
    notIndexed,
  };
}

async function fetchTokenChartCandles(
  address: string,
  range: ChartRange
): Promise<Candle[]> {
  const now = Math.floor(Date.now() / 1000);
  const from = now - range.lookbackSeconds;

  // 1) Birdeye
  try {
    const res = await fetch(
      `/api/birdeye?type=ohlcv&address=${encodeURIComponent(
        address
      )}&interval=${range.interval}&time_from=${from}&time_to=${now}`,
      { cache: "no-store" }
    );
    const json = res.ok ? await res.json() : null;
    if (json?.success) {
      const candles = normalizeChartCandles(json.data);
      if (candles.length >= 2) return candles;
    }
  } catch {}

  // 2) Tokens.xyz
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

  return [];
}
