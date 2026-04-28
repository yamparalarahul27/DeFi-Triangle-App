"use client";

import { PublicKey } from "@solana/web3.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useInterval } from "@/lib/hooks/useInterval";
import type { Candle } from "@/components/ui/PriceChart";
import type { OnChainData } from "@/components/token/OnChainPanel";
import type { JupiterTokenInfo, MetaStripData } from "@/components/token/MetaStrip";
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
import { fetchOnChainData } from "@/lib/token/onChain";

function isValidSolanaAddress(addr: string): boolean {
  if (!addr) return false;
  try {
    new PublicKey(addr);
    return true;
  } catch {
    return false;
  }
}

function hasRealMarketData(asset: AssetCore | null): boolean {
  if (!asset) return false;
  const s = asset.stats;
  if (!s) return false;
  return (
    (s.price ?? 0) > 0 ||
    (s.liquidity ?? 0) > 0 ||
    (s.marketCap ?? 0) > 0 ||
    (s.volume24hUSD ?? 0) > 0
  );
}

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
  onChain: OnChainData | null;
  meta: MetaStripData | null;
  chartCandles: Candle[];
  chartRange: string;
  setChartRange: (label: string) => void;
  loading: boolean;
  chartLoading: boolean;
  notIndexed: boolean;
  invalidAddress: boolean;
}

export function useTokenDetails(address: string): UseTokenDetailsResult {
  const addressValid = useMemo(() => isValidSolanaAddress(address), [address]);
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
  const [onChain, setOnChain] = useState<{
    address: string;
    data: OnChainData | null;
  } | null>(null);
  const [jupiterInfo, setJupiterInfo] = useState<{
    address: string;
    data: JupiterTokenInfo | null;
  } | null>(null);

  useEffect(() => {
    if (!address || !addressValid) return;
    let cancelled = false;
    (async () => {
      const result = await lookupToken(address);
      if (cancelled) return;
      setLookup({ address, found: result.found });
    })();
    return () => {
      cancelled = true;
    };
  }, [address, addressValid]);

  useEffect(() => {
    if (!address || !addressValid) return;
    let cancelled = false;
    (async () => {
      const data = await fetchOnChainData(address);
      if (cancelled) return;
      setOnChain({ address, data });
    })();
    return () => {
      cancelled = true;
    };
  }, [address, addressValid]);

  useEffect(() => {
    if (!address || !addressValid) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/jupiter?type=tokenInfo&address=${encodeURIComponent(address)}`,
          { cache: "no-store" }
        );
        const json = res.ok ? await res.json() : null;
        if (cancelled) return;
        setJupiterInfo({
          address,
          data: json?.success ? (json.data as JupiterTokenInfo | null) : null,
        });
      } catch {
        if (!cancelled) setJupiterInfo({ address, data: null });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [address, addressValid]);

  const lookupComplete = lookup?.address === address;
  const lookupFound = lookupComplete && lookup.found;

  const fetchTokenData = useCallback(async () => {
    if (!address || !addressValid) return;

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
  }, [address, addressValid]);

  useEffect(() => {
    if (!address) return;
    if (!addressValid) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      await fetchTokenData();
      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [address, addressValid, fetchTokenData]);

  useInterval(fetchTokenData, address && addressValid ? TOKEN_REFRESH_MS : null);

  useEffect(() => {
    if (!address) return;
    if (!addressValid) {
      setChartLoading(false);
      return;
    }

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
  }, [address, addressValid, chartRange]);

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

  const realData = useMemo(() => hasRealMarketData(asset), [asset]);
  const notIndexed =
    addressValid && lookupComplete && !lookupFound && !realData;
  const onChainForAddress =
    addressValid && onChain?.address === address ? onChain.data : null;
  const renderableAsset = addressValid && realData ? asset : null;

  const meta = useMemo<MetaStripData | null>(() => {
    if (!renderableAsset) return null;
    const jupiter =
      jupiterInfo?.address === address ? jupiterInfo.data : null;
    const numberMarkets =
      typeof pair?.numberMarkets === "number" && pair.numberMarkets > 0
        ? pair.numberMarkets
        : null;
    if (!jupiter && numberMarkets == null) return null;
    return { jupiter, numberMarkets };
  }, [renderableAsset, jupiterInfo, address, pair?.numberMarkets]);

  return {
    asset: renderableAsset,
    primary: renderableAsset ? primary : null,
    variantsByKind: renderableAsset ? variantsByKind : {},
    profile: renderableAsset ? response?.includes?.profile?.data : undefined,
    risk: renderableAsset ? response?.includes?.risk?.data : undefined,
    markets: renderableAsset ? response?.includes?.markets?.data?.markets ?? [] : [],
    onChain: onChainForAddress,
    meta,
    chartCandles,
    chartRange,
    setChartRange,
    loading,
    chartLoading,
    notIndexed,
    invalidAddress: !addressValid,
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
