"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import type { Candle } from "@/components/ui/PriceChart";
import { useInterval } from "@/lib/hooks/useInterval";
import type { AssetResponse } from "@/lib/tokens-xyz-types";
import {
  CHART_RANGES,
  extractAsset,
  flattenVariantsByKind,
  normalizeChartCandles,
  primaryFromAsset,
} from "./_utils";
import { AboutSection } from "./_components/AboutSection";
import { IdentityStrip } from "./_components/IdentityStrip";
import { MarketsSection } from "./_components/MarketsSection";
import { PriceChartSection } from "./_components/PriceChartSection";
import { RiskPanel } from "./_components/RiskPanel";
import { StatsGrid } from "./_components/StatsGrid";
import { VariantsSection } from "./_components/VariantsSection";

const ASSET_REFRESH_MS = 15_000;

export default function SolanaPage() {
  const [response, setResponse] = useState<AssetResponse | null>(null);
  const [chartCandles, setChartCandles] = useState<Candle[]>([]);
  const [chartRange, setChartRange] = useState("1W");
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [paused, setPaused] = useState(false);

  const fetchAsset = useCallback(async () => {
    try {
      const res = await fetch("/api/tokens-xyz?type=asset&assetId=solana", {
        cache: "no-store",
      });
      const json = res.ok ? await res.json() : null;
      if (json?.success && json.data) {
        const parsed = extractAsset(json.data);
        if (parsed) setResponse(parsed);
      }
    } catch {
      // keep last-good
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await fetchAsset();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchAsset]);

  useInterval(fetchAsset, paused ? null : ASSET_REFRESH_MS);

  useEffect(() => {
    const range =
      CHART_RANGES.find((r) => r.label === chartRange) ?? CHART_RANGES[1];
    const now = Math.floor(Date.now() / 1000);
    const from = now - range.lookbackSeconds;
    const url = `/api/tokens-xyz?type=price-chart&assetId=solana&interval=${range.interval}&from=${from}&to=${now}`;

    let cancelled = false;
    (async () => {
      setChartLoading(true);
      try {
        const res = await fetch(url, { cache: "no-store" });
        const json = res.ok ? await res.json() : null;
        if (!cancelled) {
          setChartCandles(normalizeChartCandles(json?.data));
        }
      } finally {
        if (!cancelled) setChartLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chartRange]);

  const asset = response?.asset ?? null;
  const primary = useMemo(
    () => (asset ? primaryFromAsset(asset) : null),
    [asset]
  );
  const variantsByKind = useMemo(
    () => (asset ? flattenVariantsByKind(asset) : {}),
    [asset]
  );

  if (loading && !asset) {
    return (
      <>
        <Header showPauseToggle={false} hasHero={false} />
        <main className="flex-1 max-w-[1100px] w-full mx-auto px-4 py-8">
          <div className="py-16 text-center text-sm text-[#6a7282]">
            Loading Solana…
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!asset) {
    return (
      <>
        <Header showPauseToggle={false} hasHero={false} />
        <main className="flex-1 max-w-[1100px] w-full mx-auto px-4 py-8 text-center">
          <div className="py-16 text-sm text-[#6a7282] mb-3">
            Unable to load Solana right now.
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

  const profile = response?.includes?.profile?.data;
  const risk = response?.includes?.risk?.data;
  const markets = response?.includes?.markets?.data?.markets ?? [];

  return (
    <>
      <Header
        showPauseToggle
        paused={paused}
        onTogglePause={() => setPaused((v) => !v)}
        hasHero={false}
      />
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
      </main>
      <Footer />
    </>
  );
}
