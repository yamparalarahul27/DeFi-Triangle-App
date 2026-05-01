"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { StableCardLive, StableCardPending } from "@/components/home/StableCard";
import { StableTokenModal } from "@/components/home/StableTokenModal";
import { useStablecoins } from "@/lib/hooks/useStablecoins";

const REFRESH_MS = 60_000;
const SKELETON_CARDS = 5;

export function ParkYourMoneyRail({ paused }: { paused: boolean }) {
  const { data, loading } = useStablecoins(REFRESH_MS, paused);
  const [selectedMint, setSelectedMint] = useState<string | null>(null);

  const totalTiles = data.pending.length + data.live.length;

  const selected = useMemo(() => {
    if (!selectedMint) return null;
    const live = data.live.find((t) => t.mint === selectedMint);
    if (live) return { kind: "live" as const, token: live };
    const pending = data.pending.find((t) => t.mint === selectedMint);
    if (pending) return { kind: "pending" as const, token: pending };
    return null;
  }, [selectedMint, data.live, data.pending]);

  const closeModal = useCallback(() => setSelectedMint(null), []);

  if (loading && totalTiles === 0) {
    return <RailSkeleton />;
  }

  if (totalTiles === 0) {
    // Upstream blip — keep the section out of the DOM rather than render an
    // empty header. The other rails already give the page enough content.
    return null;
  }

  return (
    <>
      <RailShell>
        <Scroller>
          {data.pending.map((tile) => (
            <StableCardPending
              key={tile.mint}
              token={tile}
              onClick={() => setSelectedMint(tile.mint)}
            />
          ))}
          {data.live.map((tile) => (
            <StableCardLive
              key={tile.mint}
              token={tile}
              onClick={() => setSelectedMint(tile.mint)}
            />
          ))}
        </Scroller>
      </RailShell>
      {selected && <StableTokenModal selected={selected} onClose={closeModal} />}
    </>
  );
}

function RailShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <div>
        <h2 className="text-sm sm:text-base font-semibold text-[#11274d]">
          Park Your Money
        </h2>
        <p className="text-xs text-[#6a7282] mt-0.5">
          Stablecoins on Solana — color reflects peg health, not price direction
        </p>
      </div>
      {children}
    </section>
  );
}

function Scroller({ children }: { children: React.ReactNode }) {
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
    setCanScrollLeft(node.scrollLeft > 2);
    setCanScrollRight(
      node.scrollLeft + node.clientWidth < node.scrollWidth - 2
    );
  }, []);

  const scrollByCards = useCallback((direction: "left" | "right") => {
    const node = scrollerRef.current;
    if (!node) return;
    const amount = Math.max(260, Math.floor(node.clientWidth * 0.75));
    node.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;
    updateScrollState();
    node.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      node.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  return (
    <div className="relative">
      <div className="hidden sm:flex items-center gap-1 absolute -top-9 right-0">
        <button
          type="button"
          disabled={!canScrollLeft}
          onClick={() => scrollByCards("left")}
          className="h-8 w-8 rounded-full border border-[#cbd5e1] bg-white text-[#11274d] inline-flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f1f5f9]"
          aria-label="Scroll Park Your Money left"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={!canScrollRight}
          onClick={() => scrollByCards("right")}
          className="h-8 w-8 rounded-full border border-[#cbd5e1] bg-white text-[#11274d] inline-flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f1f5f9]"
          aria-label="Scroll Park Your Money right"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div ref={scrollerRef} className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 pb-1 px-[6px]">{children}</div>
      </div>

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
    </div>
  );
}

function RailSkeleton() {
  return (
    <RailShell>
      <div
        aria-busy="true"
        aria-label="Loading stablecoins"
        className="overflow-x-auto scrollbar-hide"
      >
        <div className="flex gap-3 pb-1 px-[6px]">
          {Array.from({ length: SKELETON_CARDS }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </RailShell>
  );
}

function CardSkeleton() {
  return (
    <div className="w-[260px] shrink-0 bg-white rounded-[10px] border border-[#11274d]/10 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded-full" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-2.5 w-24" />
        </div>
        <Skeleton className="h-4 w-14 rounded" />
      </div>
      <div className="flex items-baseline justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-12" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-2 w-12" />
            <Skeleton className="h-3 w-14" />
          </div>
        ))}
      </div>
    </div>
  );
}
