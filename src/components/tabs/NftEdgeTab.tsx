"use client";

import { useEffect } from "react";
import { NftDetail } from "@/components/nft/NftDetail";
import { NftRail } from "@/components/nft/NftRail";
import { useNftEdge } from "@/lib/hooks/useNftEdge";

const ISLANDDAO_PERKS = "5XSXoWkcmynUSiwoi7XByRDiV9eomTgZQywgWrpYzKZ8";

interface Props {
  sessionWallet: string | null;
}

export function NftEdgeTab({ sessionWallet }: Props) {
  const {
    collection,
    assets,
    selectedIndex,
    selectIndex,
    detail,
    detailLoading,
    otherOwned,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    error,
  } = useNftEdge(ISLANDDAO_PERKS, sessionWallet);

  // Keyboard arrows to navigate
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return;
      if (e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft") {
        selectIndex(Math.max(0, selectedIndex - 1));
      } else if (e.key === "ArrowRight") {
        const next = selectedIndex + 1;
        if (next < assets.length) selectIndex(next);
        else if (hasMore && !loadingMore) loadMore();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedIndex, assets.length, hasMore, loadingMore, loadMore, selectIndex]);

  if (loading) {
    return (
      <div className="rounded-[14px] border border-[#11274d]/10 bg-white p-12 text-center text-sm text-[#6a7282]">
        Loading collection…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[14px] border border-[#fde68a] bg-[#FFFBEB] p-6 text-sm text-[#B45309]">
        Couldn&apos;t load the NFT collection. Reason: {error}
      </div>
    );
  }

  if (!collection || assets.length === 0) {
    return (
      <div className="rounded-[14px] border border-[#11274d]/10 bg-white p-12 text-center text-sm text-[#6a7282]">
        No NFTs found for this collection.
      </div>
    );
  }

  const canPrev = selectedIndex > 0;
  const canNext = selectedIndex < assets.length - 1 || hasMore;

  return (
    <div className="space-y-3">
      <div className="relative">
        {/* prev / next arrows positioned on edges of the detail card */}
        <button
          type="button"
          onClick={() => canPrev && selectIndex(selectedIndex - 1)}
          disabled={!canPrev}
          aria-label="Previous NFT"
          className="hidden md:inline-flex absolute left-[-20px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white border border-[#11274d]/10 text-[#11274d] hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-[box-shadow,transform] duration-150 active:scale-[0.96]"
          style={{
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => {
            if (selectedIndex < assets.length - 1) {
              selectIndex(selectedIndex + 1);
            } else if (hasMore && !loadingMore) {
              loadMore();
            }
          }}
          disabled={!canNext}
          aria-label="Next NFT"
          className="hidden md:inline-flex absolute right-[-20px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white border border-[#11274d]/10 text-[#11274d] hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-[box-shadow,transform] duration-150 active:scale-[0.96]"
          style={{
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          ›
        </button>

        <NftDetail
          detail={detail}
          detailLoading={detailLoading}
          otherOwned={otherOwned}
        />
      </div>

      <NftRail
        assets={assets}
        selectedIndex={selectedIndex}
        onSelect={selectIndex}
        sessionWallet={sessionWallet}
        hasMore={hasMore}
        loadingMore={loadingMore}
        onLoadMore={loadMore}
        totalSupply={collection.total_supply}
      />
    </div>
  );
}
