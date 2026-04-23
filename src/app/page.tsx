"use client";

import { useCallback, useMemo, useState } from "react";
import { useUnifiedWalletContext } from "@jup-ag/wallet-adapter";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/layout/HeroSection";
import { TabsRow, type TabKey } from "@/components/layout/TabsRow";
import { SearchBox } from "@/components/search/SearchBox";
import { DexCard } from "@/components/ui/DexCard";
import { TokenModal } from "@/components/ui/TokenModal";
import { TabGrid, TabEmpty } from "@/components/tabs/TabShell";
import { LiveTab } from "@/components/tabs/LiveTab";
import { MemeTab } from "@/components/tabs/MemeTab";
import { DefiTab } from "@/components/tabs/DefiTab";
import { SmartTab } from "@/components/tabs/SmartTab";
import { WhaleTab } from "@/components/tabs/WhaleTab";
import { TrendingTab } from "@/components/tabs/TrendingTab";
import { WatchlistTab } from "@/components/tabs/WatchlistTab";
import { useSession } from "@/components/providers/SessionContext";
import { useWatchlist } from "@/lib/hooks/useWatchlist";
import type { RiskFormula } from "@/lib/scoring";

export default function Dashboard() {
  const { wallet, loaded: sessionLoaded } = useSession();
  const { setShowModal } = useUnifiedWalletContext();
  const authed = !!wallet;
  const watchlist = useWatchlist(authed);

  const [tab, setTab] = useState<TabKey>("trending");
  const [paused, setPaused] = useState(false);
  const [riskFormula, setRiskFormula] = useState<RiskFormula>("advanced");
  const [selectedPair, setSelectedPair] = useState<any | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleStarToggle = useCallback(
    async (pair: any) => {
      const addr = pair?.baseToken?.address;
      if (!addr) return;
      if (!authed) {
        setShowModal(true);
        return;
      }
      if (watchlist.starredSet.has(addr)) {
        await watchlist.remove(addr);
      } else {
        await watchlist.add({
          token_address: addr,
          symbol: pair?.baseToken?.symbol,
          name: pair?.baseToken?.name,
          image_url: pair?.info?.imageUrl,
        });
      }
    },
    [authed, setShowModal, watchlist]
  );

  const tabProps = useMemo(
    () => ({
      paused,
      riskFormula,
      onSelectPair: setSelectedPair,
      starredSet: watchlist.starredSet,
      onStarToggle: handleStarToggle,
    }),
    [paused, riskFormula, watchlist.starredSet, handleStarToggle]
  );

  const showingSearch = searchQuery.trim().length > 0;

  return (
    <>
      <Header
        paused={paused}
        onTogglePause={() => setPaused((v) => !v)}
        showPauseToggle
      />
      <HeroSection
        searchSlot={
          <SearchBox
            query={searchQuery}
            setQuery={setSearchQuery}
            onSelect={setSelectedPair}
            onResultsChange={setSearchResults}
            riskFormula={riskFormula}
          />
        }
      />

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4">
        {!showingSearch && <TabsRow active={tab} onChange={setTab} />}
        <RiskFormulaToggle
          value={riskFormula}
          onChange={setRiskFormula}
        />

        <section>
          {showingSearch ? (
            <SearchResultsView
              results={searchResults}
              onSelectPair={setSelectedPair}
              starredSet={watchlist.starredSet}
              onStarToggle={handleStarToggle}
            />
          ) : tab === "trending" ? (
            <TrendingTab {...tabProps} />
          ) : tab === "live" ? (
            <LiveTab {...tabProps} />
          ) : tab === "whale" ? (
            <WhaleTab {...tabProps} />
          ) : tab === "meme" ? (
            <MemeTab {...tabProps} />
          ) : tab === "smart" ? (
            <SmartTab {...tabProps} />
          ) : tab === "defi" ? (
            <DefiTab {...tabProps} />
          ) : (
            <WatchlistTab
              paused={paused}
              riskFormula={riskFormula}
              authed={authed}
              wallet={wallet}
              items={watchlist.items}
              loaded={sessionLoaded && watchlist.loaded}
              onSelectPair={setSelectedPair}
              onRemove={watchlist.remove}
            />
          )}
        </section>
      </main>

      <Footer />

      {selectedPair && (
        <TokenModal
          pair={selectedPair}
          riskFormula={riskFormula}
          onClose={() => setSelectedPair(null)}
        />
      )}
    </>
  );
}

function RiskFormulaToggle({
  value,
  onChange,
}: {
  value: RiskFormula;
  onChange: (value: RiskFormula) => void;
}) {
  const options: { key: RiskFormula; label: string }[] = [
    { key: "basic", label: "Basic" },
    { key: "advanced", label: "Advanced" },
  ];

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <span className="text-[11px] uppercase tracking-wider text-[#6a7282]">
        Risk Formula
      </span>
      <div className="inline-flex rounded-sm border border-[#cbd5e1] bg-white p-0.5">
        {options.map((option) => {
          const active = option.key === value;
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => onChange(option.key)}
              aria-pressed={active}
              className={`min-h-[34px] px-3 rounded-[2px] text-xs transition-all duration-150 ${
                active
                  ? "bg-[#19549b] text-white shadow-[0_2px_8px_rgba(25,84,155,0.25)]"
                  : "text-[#11274d]/65 hover:text-[#11274d]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SearchResultsView({
  results,
  onSelectPair,
  starredSet,
  onStarToggle,
}: {
  results: any[];
  onSelectPair: (pair: any) => void;
  starredSet: Set<string>;
  onStarToggle: (pair: any) => void;
}) {
  if (results.length === 0) {
    return <TabEmpty text="No results found." />;
  }
  return (
    <TabGrid>
      {results.map((pair, i) => (
        <DexCard
          key={pair?.pairAddress ?? i}
          pair={pair}
          onClick={() => onSelectPair(pair)}
          starred={starredSet.has(pair?.baseToken?.address)}
          onStarToggle={() => onStarToggle(pair)}
        />
      ))}
    </TabGrid>
  );
}
