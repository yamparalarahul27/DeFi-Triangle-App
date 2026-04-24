"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DexCard } from "@/components/ui/DexCard";
import { SpiralLoader } from "@/components/agent-elements/spiral-loader";
import { TabEmpty } from "@/components/tabs/TabShell";
import { useHomeJupiterPairs } from "@/lib/hooks/useHomeJupiterPairs";
import { buildHomeSections } from "@/lib/home/sections";
import type { TokenPair } from "@/lib/home/types";

export function HomeSectionsView({
  paused,
  onSelectPair,
  starredSet,
  onStarToggle,
}: {
  paused: boolean;
  onSelectPair: (pair: TokenPair) => void;
  starredSet: Set<string>;
  onStarToggle?: (pair: TokenPair) => void;
}) {
  const { data, sections: serverSections, loading } = useHomeJupiterPairs(
    120_000,
    paused
  );

  const universe = useMemo(
    () =>
      (Array.isArray(data) ? data : []).filter(
        (pair: unknown): pair is TokenPair =>
          !!pair && typeof pair === "object" && !!(pair as TokenPair).baseToken
      ),
    [data]
  );

  const sections = useMemo(
    () => serverSections ?? buildHomeSections(universe),
    [serverSections, universe]
  );
  const totalVisible =
    sections.attraction.length + sections.longTerm.length + sections.highRisk.length;

  if (loading && universe.length === 0) {
    return (
      <div className="py-16 flex items-center justify-center gap-2 text-sm text-[#6a7282]">
        <SpiralLoader size={18} />
        <span>Loading token rails…</span>
      </div>
    );
  }

  if (totalVisible === 0) {
    return <TabEmpty text="No tokens available right now." />;
  }

  return (
    <div className="space-y-5">
      <TokenRail
        title="Tokens Gaining Attraction"
        subtitle="Strong momentum with minimum liquidity and activity checks"
        tokens={sections.attraction}
        onSelectPair={onSelectPair}
        starredSet={starredSet}
        onStarToggle={onStarToggle}
      />

      <TokenRail
        title="Tokens for Long-Term Wealth"
        subtitle="Higher depth, holder base, and older market footprint"
        tokens={sections.longTerm}
        onSelectPair={onSelectPair}
        starredSet={starredSet}
        onStarToggle={onStarToggle}
      />

      <TokenRail
        title="High Risk, High Reward"
        subtitle="Higher upside setups with more volatility and lower maturity"
        tokens={sections.highRisk}
        onSelectPair={onSelectPair}
        starredSet={starredSet}
        onStarToggle={onStarToggle}
      />
    </div>
  );
}

function TokenRail({
  title,
  subtitle,
  tokens,
  onSelectPair,
  starredSet,
  onStarToggle,
}: {
  title: string;
  subtitle: string;
  tokens: TokenPair[];
  onSelectPair: (pair: TokenPair) => void;
  starredSet: Set<string>;
  onStarToggle?: (pair: TokenPair) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const node = scrollerRef.current;
    if (!node) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const left = node.scrollLeft > 2;
    const right = node.scrollLeft + node.clientWidth < node.scrollWidth - 2;
    setCanScrollLeft(left);
    setCanScrollRight(right);
  }, []);

  const scrollByCards = useCallback((direction: "left" | "right") => {
    const node = scrollerRef.current;
    if (!node) return;
    const amount = Math.max(280, Math.floor(node.clientWidth * 0.75));
    node.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    updateScrollState();
    node.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      node.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [tokens.length, updateScrollState]);

  return (
    <section className="space-y-2">
      <div className="flex items-end justify-between gap-2">
        <div>
          <h2 className="text-sm sm:text-base font-semibold text-[#11274d]">{title}</h2>
          <p className="text-xs text-[#6a7282] mt-0.5">{subtitle}</p>
        </div>
        <div className="hidden sm:flex items-center gap-1">
          <button
            type="button"
            disabled={!canScrollLeft}
            onClick={() => scrollByCards("left")}
            className="h-8 w-8 rounded-full border border-[#cbd5e1] bg-white text-[#11274d] inline-flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f1f5f9]"
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={!canScrollRight}
            onClick={() => scrollByCards("right")}
            className="h-8 w-8 rounded-full border border-[#cbd5e1] bg-white text-[#11274d] inline-flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f1f5f9]"
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {tokens.length === 0 ? (
        <div className="py-6 text-xs text-[#6a7282]">No tokens in this section right now.</div>
      ) : (
        <div className="relative">
          <div ref={scrollerRef} className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 pb-1 px-[6px]">
              {tokens.map((pair, i) => (
                <div key={pair?.pairAddress ?? `${pair?.baseToken?.address ?? "na"}-${i}`} className="w-[300px] shrink-0">
                  <DexCard
                    pair={pair}
                    onClick={() => onSelectPair(pair)}
                    starred={starredSet.has(pair?.baseToken?.address ?? "")}
                    onStarToggle={
                      onStarToggle ? () => onStarToggle(pair) : undefined
                    }
                  />
                </div>
              ))}
            </div>
          </div>
          {(canScrollLeft || canScrollRight) && (
            <>
              {canScrollLeft && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#f1f5f9] via-[#f1f5f9]/85 to-transparent backdrop-blur-[1px]"
                />
              )}
              {canScrollRight && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#f1f5f9] via-[#f1f5f9]/85 to-transparent backdrop-blur-[1px]"
                />
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
