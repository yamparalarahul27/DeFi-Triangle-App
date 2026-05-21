"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Command as CommandIcon,
  Pause,
  Play,
  Search as SearchIcon,
} from "lucide-react";
import { ConnectWalletButton } from "@/components/wallet/ConnectWalletButton";
import { useSearchModal } from "@/components/search/SearchModalProvider";
import { FEATURES } from "@/lib/featureFlags";

export interface HeaderProps {
  showWatchlistButton?: boolean;
  watchlistActive?: boolean;
  onOpenWatchlist?: () => void;
  showNftEdgeButton?: boolean;
  nftEdgeActive?: boolean;
  onOpenNftEdge?: () => void;
  showSearchButton?: boolean;
  showPauseToggle?: boolean;
  paused?: boolean;
  onTogglePause?: () => void;
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
  showNftEdgeButton = false,
  nftEdgeActive = false,
  onOpenNftEdge,
  showSearchButton = true,
  showPauseToggle = false,
  paused = false,
  onTogglePause,
  hasHero = true,
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(!hasHero);
  const { open: openSearch } = useSearchModal();

  const watchlistEnabled = FEATURES.WATCHLIST && showWatchlistButton;
  const nftEdgeEnabled = FEATURES.NFT_EDGE && showNftEdgeButton;
  const walletEnabled = FEATURES.WALLET_CONNECT;

  const hasRightContent =
    showSearchButton ||
    (showPauseToggle && !!onTogglePause) ||
    (watchlistEnabled && !!onOpenWatchlist) ||
    (nftEdgeEnabled && !!onOpenNftEdge) ||
    walletEnabled;

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

  const nftEdgeBtnClass = nftEdgeActive
    ? "bg-[#19549b] text-white border border-[#19549b]"
    : actionBtnClass;

  return (
    <header
      className={`sticky top-0 z-20 transition-colors duration-300 ease-in-out ${shellClass}`}
    >
      <div
        className={`max-w-[1400px] mx-auto h-12 px-4 lg:px-6 items-center gap-3 ${
          hasRightContent
            ? "flex justify-between"
            : "grid grid-cols-[1fr_auto_1fr]"
        }`}
      >
        {!hasRightContent && <div aria-hidden="true" />}
        <Link
          href="/"
          className={`${
            hasRightContent ? "" : "justify-self-center"
          } inline-flex items-center gap-2 text-sm font-semibold tracking-tight transition-colors duration-300 ${wordmarkClass}`}
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
        <div
          className={`${
            hasRightContent ? "" : "justify-self-end"
          } flex items-center gap-2`}
        >
          {showSearchButton && (
            <button
              type="button"
              onClick={openSearch}
              aria-label="Open search"
              title="Search (Cmd+K)"
              className={`h-7 px-2 rounded-sm text-xs transition-colors duration-300 inline-flex items-center gap-1.5 ${actionBtnClass}`}
            >
              <SearchIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Search</span>
              <kbd
                className={`hidden sm:inline-flex items-center gap-0.5 px-1 h-4 ml-0.5 text-[9px] rounded-sm border leading-none ${
                  scrolled
                    ? "border-[#cbd5e1] bg-[#f1f5f9] text-[#6a7282]"
                    : "border-white/20 bg-white/10 text-white/80"
                }`}
              >
                <CommandIcon className="w-2 h-2" aria-hidden />
                <span>K</span>
              </kbd>
            </button>
          )}
          {showPauseToggle && onTogglePause && (
            <button
              type="button"
              onClick={onTogglePause}
              aria-label={paused ? "Resume live updates" : "Pause live updates"}
              title={paused ? "Resume" : "Pause"}
              className={`h-7 w-7 rounded-sm transition-colors duration-300 inline-flex items-center justify-center ${actionBtnClass}`}
            >
              {paused ? (
                <Play className="w-3.5 h-3.5" />
              ) : (
                <Pause className="w-3.5 h-3.5" />
              )}
            </button>
          )}
          {watchlistEnabled && onOpenWatchlist && (
            <button
              type="button"
              onClick={onOpenWatchlist}
              className={`h-7 px-2 rounded-sm text-xs transition-colors duration-300 inline-flex items-center ${watchlistBtnClass}`}
            >
              Watchlist
            </button>
          )}
          {nftEdgeEnabled && onOpenNftEdge && (
            <button
              type="button"
              onClick={onOpenNftEdge}
              className={`h-7 px-2 rounded-sm text-xs transition-colors duration-300 inline-flex items-center ${nftEdgeBtnClass}`}
            >
              NFT Edge
            </button>
          )}
          {walletEnabled && <ConnectWalletButton />}
        </div>
      </div>
    </header>
  );
}
