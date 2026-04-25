"use client";

import { useCallback, useEffect, useState } from "react";
import { useUnifiedWalletContext } from "@jup-ag/wallet-adapter";
import { Footer } from "@/components/layout/Footer";
import { GreetingRow } from "@/components/layout/GreetingRow";
import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/layout/HeroSection";
import { HeroSearchButton } from "@/components/search/HeroSearchButton";
import { HomeSectionsView } from "@/components/home/HomeSectionsView";
import { TokenModal } from "@/components/ui/TokenModal";
import { WatchlistTab } from "@/components/tabs/WatchlistTab";
import {
  CreateWatchlistModal,
  type CreateWatchlistDraft,
} from "@/components/watchlist/CreateWatchlistModal";
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
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const openWatchlist = useCallback(() => {
    setTab("watchlist");
  }, []);

  const openTokenEdge = useCallback(() => {
    setTab("home");
  }, []);

  const openCreateModal = useCallback(() => setCreateModalOpen(true), []);
  const closeCreateModal = useCallback(() => setCreateModalOpen(false), []);
  const handleCreateWatchlist = useCallback(
    (draft: CreateWatchlistDraft) => {
      // TODO: persist via watchlist meta API (name + color) once available.
      void draft;
      setCreateModalOpen(false);
    },
    []
  );

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
  const onWatchlistTab = watchlistEnabled && effectiveTab === "watchlist";

  // ⇧+N opens the create modal — active only on the watchlist tab.
  useEffect(() => {
    if (!onWatchlistTab) return;
    const onKey = (e: KeyboardEvent) => {
      if (createModalOpen) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) {
        return;
      }
      if (e.shiftKey && (e.key === "N" || e.key === "n")) {
        e.preventDefault();
        setCreateModalOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onWatchlistTab, createModalOpen]);

  return (
    <>
      <Header
        showTokenEdgeButton
        tokenEdgeActive={effectiveTab === "home"}
        onOpenTokenEdge={openTokenEdge}
        showWatchlistButton={watchlistEnabled}
        watchlistActive={watchlistEnabled && tab === "watchlist"}
        onOpenWatchlist={watchlistEnabled ? openWatchlist : undefined}
        showSearchButton
        hasHero={!onWatchlistTab}
      />
      {!onWatchlistTab && <HeroSection searchSlot={HERO_SEARCH_SLOT} />}

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4">
        {onWatchlistTab && <GreetingRow wallet={wallet} />}
        <section>
          {onWatchlistTab ? (
            <WatchlistTab
              authed={authed}
              wallet={wallet}
              items={watchlist.items}
              loaded={sessionLoaded && watchlist.loaded}
              onSelectPair={setSelectedPair}
              onRemove={watchlist.remove}
              onOpenCreateModal={openCreateModal}
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

      {createModalOpen && (
        <CreateWatchlistModal
          onCancel={closeCreateModal}
          onCreate={handleCreateWatchlist}
        />
      )}
    </>
  );
}
