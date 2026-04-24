"use client";

import { useCallback, useState } from "react";
import { useUnifiedWalletContext } from "@jup-ag/wallet-adapter";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/layout/HeroSection";
import { HeroSearchButton } from "@/components/search/HeroSearchButton";
import { HomeSectionsView } from "@/components/home/HomeSectionsView";
import { TokenModal } from "@/components/ui/TokenModal";
import { WatchlistTab } from "@/components/tabs/WatchlistTab";
import { useSession } from "@/components/providers/SessionContext";
import { useWatchlist } from "@/lib/hooks/useWatchlist";
import { FEATURES } from "@/lib/featureFlags";
import { EMPTY_STARRED, type HomeTab, type TokenPair } from "@/lib/home/types";

const HERO_SEARCH_SLOT = <HeroSearchButton />;

export default function Dashboard() {
  const { wallet, loaded: sessionLoaded } = useSession();
  const { setShowModal } = useUnifiedWalletContext();
  const authed = !!wallet;
  const watchlist = useWatchlist(authed);

  const [tab, setTab] = useState<HomeTab>("home");
  const [selectedPair, setSelectedPair] = useState<TokenPair | null>(null);

  const openWatchlist = useCallback(() => {
    setTab((prev) => (prev === "watchlist" ? "home" : "watchlist"));
  }, []);

  const handleStarToggle = useCallback(
    async (pair: TokenPair) => {
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

  const watchlistEnabled = FEATURES.WATCHLIST;
  const effectiveTab = watchlistEnabled ? tab : "home";

  return (
    <>
      <Header
        showWatchlistButton={watchlistEnabled}
        watchlistActive={watchlistEnabled && tab === "watchlist"}
        onOpenWatchlist={watchlistEnabled ? openWatchlist : undefined}
        showSearchButton={false}
      />
      <HeroSection searchSlot={HERO_SEARCH_SLOT} />

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4">
        <section>
          {watchlistEnabled && effectiveTab === "watchlist" ? (
            <WatchlistTab
              authed={authed}
              wallet={wallet}
              items={watchlist.items}
              loaded={sessionLoaded && watchlist.loaded}
              onSelectPair={setSelectedPair}
              onRemove={watchlist.remove}
            />
          ) : (
            <HomeSectionsView
              paused={false}
              onSelectPair={setSelectedPair}
              starredSet={watchlistEnabled ? watchlist.starredSet : EMPTY_STARRED}
              onStarToggle={watchlistEnabled ? handleStarToggle : undefined}
            />
          )}
        </section>
      </main>

      <Footer />

      {selectedPair && (
        <TokenModal
          pair={selectedPair}
          onClose={() => setSelectedPair(null)}
        />
      )}
    </>
  );
}
