"use client";

import { useEffect, useRef } from "react";
import type { NftAssetSummary } from "@/lib/hooks/useNftEdge";

interface Props {
  assets: NftAssetSummary[];
  selectedIndex: number;
  onSelect: (i: number) => void;
  sessionWallet: string | null;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  totalSupply: number | null;
}

export function NftRail({
  assets,
  selectedIndex,
  onSelect,
  sessionWallet,
  hasMore,
  loadingMore,
  onLoadMore,
  totalSupply,
}: Props) {
  const railRef = useRef<HTMLDivElement | null>(null);

  // When selectedIndex changes, scroll the matching thumbnail into center
  useEffect(() => {
    const el = railRef.current?.querySelector<HTMLElement>(
      `[data-rail-index="${selectedIndex}"]`
    );
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [selectedIndex]);

  return (
    <div className="relative mt-6">
      {/* edge fades */}
      <div className="pointer-events-none absolute left-0 top-3 bottom-3 w-8 bg-gradient-to-r from-[#f1f5f9] to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-3 bottom-3 w-8 bg-gradient-to-l from-[#f1f5f9] to-transparent z-10" />

      <div
        ref={railRef}
        className="flex gap-3 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {assets.map((nft, i) => {
          const isSelected = i === selectedIndex;
          const isOwned =
            sessionWallet != null && nft.owner === sessionWallet;
          return (
            <button
              key={nft.id}
              data-rail-index={i}
              type="button"
              onClick={() => onSelect(i)}
              aria-label={nft.name}
              aria-pressed={isSelected}
              className={`group relative shrink-0 w-[72px] h-[72px] rounded-[8px] overflow-hidden cursor-pointer transition-[transform,box-shadow] duration-150 active:scale-[0.96] hover:-translate-y-[2px] border border-[#11274d]/10 ${
                isSelected
                  ? "ring-2 ring-[#19549b] ring-offset-2 ring-offset-[#f1f5f9]"
                  : ""
              }`}
              style={{ scrollSnapAlign: "center" }}
            >
              <img
                src={nft.image_url}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {isOwned && (
                <div className="absolute top-1 left-1 text-[8px] font-medium uppercase tracking-[0.08em] text-white bg-black/60 backdrop-blur-sm px-1 py-0.5 rounded-[2px]">
                  Owned
                </div>
              )}
            </button>
          );
        })}

        {hasMore && (
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="shrink-0 w-[72px] h-[72px] rounded-[8px] border-2 border-dashed border-[#cbd5e1] bg-white text-[11px] text-[#6a7282] hover:text-[#11274d] hover:border-[#19549b] transition-colors duration-150 disabled:opacity-60"
            style={{ scrollSnapAlign: "center" }}
          >
            {loadingMore ? "…" : "Load more"}
          </button>
        )}
      </div>

      {totalSupply != null && (
        <div className="text-center text-[11px] text-[#6a7282] mt-1 font-mono">
          {assets.length} of {totalSupply}
        </div>
      )}
    </div>
  );
}
