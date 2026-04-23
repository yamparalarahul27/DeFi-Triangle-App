"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ConnectWalletButton } from "@/components/wallet/ConnectWalletButton";

export interface HeaderProps {
  showWatchlistButton?: boolean;
  watchlistActive?: boolean;
  onOpenWatchlist?: () => void;
  /**
   * When true, header starts in "over-hero" style (transparent + blur + white text)
   * and transitions to "scrolled" style (white + shadow + dark text) once the user
   * scrolls past the hero. When false, header is always in "scrolled" style.
   */
  hasHero?: boolean;
}

const HEADER_HEIGHT = 48;

export function Header({
  showWatchlistButton = false,
  watchlistActive = false,
  onOpenWatchlist,
  hasHero = true,
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(!hasHero);

  useEffect(() => {
    if (!hasHero) {
      setScrolled(true);
      return;
    }

    let frame = 0;

    const getThreshold = () => {
      const hero = document.querySelector(
        "[data-hero]"
      ) as HTMLElement | null;
      const h = hero?.offsetHeight ?? 200;
      return Math.max(80, h - HEADER_HEIGHT);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        setScrolled(window.scrollY > getThreshold());
        frame = 0;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [hasHero]);

  const shellClass = scrolled
    ? "bg-white/95 backdrop-blur-lg border-b border-[#cbd5e1] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]"
    : "bg-transparent backdrop-blur-lg border-b border-white/10";

  const wordmarkClass = scrolled
    ? "text-[#11274d] hover:text-[#0a1a36]"
    : "text-white hover:text-white/80";

  const actionBtnClass = scrolled
    ? "bg-white border border-[#cbd5e1] text-[#11274d] hover:bg-[#e2e8f0]"
    : "bg-white/10 border border-white/15 text-white hover:bg-white/20";

  const watchlistBtnClass = watchlistActive
    ? "bg-[#19549b] text-white border border-[#19549b]"
    : actionBtnClass;

  return (
    <header
      className={`sticky top-0 z-20 transition-colors duration-300 ease-in-out ${shellClass}`}
    >
      <div className="max-w-[1400px] mx-auto h-12 px-4 lg:px-6 flex items-center justify-between gap-3">
        <Link
          href="/"
          className={`inline-flex items-center gap-2 text-sm font-semibold tracking-tight transition-colors duration-300 ${wordmarkClass}`}
        >
          <span aria-hidden="true" className="inline-flex">
            <img
              src={scrolled ? "/brand/defi_logo_dark.svg" : "/brand/defi_logo_white.svg"}
              alt=""
              className="h-5 w-auto shrink-0"
              width={20}
              height={20}
            />
          </span>
          DeFi Triangle
        </Link>

        <div className="flex items-center gap-2">
          {showWatchlistButton && onOpenWatchlist && (
            <button
              type="button"
              onClick={onOpenWatchlist}
              className={`h-7 px-2 rounded-sm text-xs transition-colors duration-300 inline-flex items-center ${watchlistBtnClass}`}
            >
              Watchlist
            </button>
          )}
          <ConnectWalletButton />
        </div>
      </div>
    </header>
  );
}
