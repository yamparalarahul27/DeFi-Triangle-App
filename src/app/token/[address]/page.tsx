"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { useTokenDetails } from "@/lib/hooks/useTokenDetails";
import { AboutSection } from "@/components/token/AboutSection";
import { EdgeScorePanel } from "@/components/token/EdgeScorePanel";
import { IdentityStrip } from "@/components/token/IdentityStrip";
import { MarketsSection } from "@/components/token/MarketsSection";
import { MetaStrip } from "@/components/token/MetaStrip";
import { OnChainPanel } from "@/components/token/OnChainPanel";
import { PriceChartSection } from "@/components/token/PriceChartSection";
import { StatsGrid } from "@/components/token/StatsGrid";
import { TopHoldersPanel } from "@/components/token/TopHoldersPanel";
import { TradingActivityPanel } from "@/components/token/TradingActivityPanel";
import { VariantsSection } from "@/components/token/VariantsSection";

export default function TokenDetailPage() {
  const params = useParams<{ address: string }>();
  const address = useMemo(() => (params?.address ?? "").trim(), [params?.address]);

  const {
    asset,
    primary,
    variantsByKind,
    profile,
    risk,
    markets,
    onChain,
    meta,
    edgeScore,
    birdeyePrice,
    topHolders,
    tradingActivity,
    chartCandles,
    chartRange,
    setChartRange,
    loading,
    chartLoading,
    notIndexed,
    invalidAddress,
  } = useTokenDetails(address);

  if (loading && !asset && !invalidAddress) {
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
    const message = invalidAddress
      ? "Invalid mint address."
      : notIndexed
        ? "Token not indexed yet — try a different address."
        : "Unable to load token right now.";

    return (
      <>
        <Header hasHero={false} />
        <main className="flex-1 max-w-[1100px] w-full mx-auto px-4 py-8 text-center">
          <div className="py-16 text-sm text-[#6a7282] mb-3">{message}</div>
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
          address={address}
          asset={asset}
          primary={primary}
          profile={profile}
          risk={risk}
          birdeyePrice={birdeyePrice}
          dasPrice={onChain?.dasPrice ?? null}
        />

        <MetaStrip data={meta} />

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

        <OnChainPanel data={onChain} />

        <EdgeScorePanel result={edgeScore} />

        <TopHoldersPanel
          holders={topHolders}
          circulatingSupply={
            typeof profile?.circulatingSupply === "number" &&
            profile.circulatingSupply > 0
              ? profile.circulatingSupply
              : null
          }
          symbol={asset.symbol ?? null}
        />

        <TradingActivityPanel data={tradingActivity} />

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
