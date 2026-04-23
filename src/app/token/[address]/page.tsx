"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import type { Candle } from "@/components/ui/PriceChart";
import { useInterval } from "@/lib/hooks/useInterval";
import type { AssetCore, AssetResponse } from "@/lib/tokens-xyz-types";
import {
  CHART_RANGES,
  extractAsset,
  flattenVariantsByKind,
  normalizeChartCandles,
  primaryFromAsset,
  type ChartRange,
} from "@/app/solana/_utils";
import { AboutSection } from "@/app/solana/_components/AboutSection";
import { IdentityStrip } from "@/app/solana/_components/IdentityStrip";
import { MarketsSection } from "@/app/solana/_components/MarketsSection";
import { PriceChartSection } from "@/app/solana/_components/PriceChartSection";
import { RiskPanel } from "@/app/solana/_components/RiskPanel";
import { StatsGrid } from "@/app/solana/_components/StatsGrid";
import { VariantsSection } from "@/app/solana/_components/VariantsSection";

const TOKEN_REFRESH_MS = 15_000;

type BirdeyePair = {
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

export default function TokenDetailPage() {
  const params = useParams<{ address: string }>();
  const address = useMemo(() => (params?.address ?? "").trim(), [params?.address]);

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

  const profile = response?.includes?.profile?.data;
  const risk = response?.includes?.risk?.data;
  const markets = response?.includes?.markets?.data?.markets ?? [];

  if (loading && !asset) {
    return (
      <>
        <Header hasHero={false} />
        <main className="flex-1 max-w-[1100px] w-full mx-auto px-4 py-8">
          <div className="py-16 text-center text-sm text-[#6a7282]">
            Loading token…
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!asset) {
    return (
      <>
        <Header hasHero={false} />
        <main className="flex-1 max-w-[1100px] w-full mx-auto px-4 py-8 text-center">
          <div className="py-16 text-sm text-[#6a7282] mb-3">
            Unable to load token right now.
          </div>
          <Link
            href="/"
            className="text-xs text-[#19549b] hover:text-[#143f78]"
          >
            ← Back to dashboard
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header hasHero={false} />
      <main className="flex-1 max-w-[1100px] w-full mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs text-[#6a7282] hover:text-[#11274d] transition-colors"
        >
          ← Back
        </Link>

        <IdentityStrip
          asset={asset}
          primary={primary}
          profile={profile}
          risk={risk}
        />

        <PriceChartSection
          rangeLabel={chartRange}
          onRangeChange={setChartRange}
          candles={chartCandles}
          loading={chartLoading}
        />

        <StatsGrid
          asset={asset}
          primary={primary}
          profile={profile}
          risk={risk}
        />

        {risk && <RiskPanel risk={risk} />}

        {profile && <AboutSection profile={profile} />}

        <VariantsSection variants={variantsByKind} />

        {markets.length > 0 && <MarketsSection markets={markets} />}

        <TokenLinksSection address={address} />
      </main>
      <Footer />
    </>
  );
}

function TokenLinksSection({ address }: { address: string }) {
  if (!address) return null;

  return (
    <section className="bg-white rounded-sm border border-[#cbd5e1] p-4 sm:p-6">
      <div className="text-[10px] uppercase tracking-wider text-[#6a7282] mb-3">
        Token links
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <a
          href={`https://solscan.io/token/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="h-9 rounded-sm bg-white border border-[#cbd5e1] text-[#11274d] hover:bg-[#f1f5f9] transition-colors inline-flex items-center justify-center"
        >
          Solscan ↗
        </a>
        <a
          href={`https://birdeye.so/token/${address}?chain=solana`}
          target="_blank"
          rel="noopener noreferrer"
          className="h-9 rounded-sm bg-[#19549b] text-white hover:bg-[#143f78] transition-colors inline-flex items-center justify-center"
        >
          Birdeye ↗
        </a>
      </div>
    </section>
  );
}

function buildAssetFromPair(pair: BirdeyePair | null, address: string): AssetCore | null {
  if (!address && !pair) return null;

  const symbol =
    str(pair?.baseToken?.symbol) ||
    shortAddress(address);
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

function mergeAssetWithFallback(
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
  } catch {
    // continue fallback
  }

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
  } catch {
    // continue fallback
  }

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

function num(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function str(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function shortAddress(address: string): string {
  if (!address) return "TOKEN";
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}
