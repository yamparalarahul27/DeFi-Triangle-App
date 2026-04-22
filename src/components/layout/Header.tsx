"use client";

import Link from "next/link";
import { ConnectWalletButton } from "@/components/wallet/ConnectWalletButton";
import { StatusDot } from "@/components/ui/StatusDot";

export interface HeaderProps {
  paused?: boolean;
  onTogglePause?: () => void;
  showPauseToggle?: boolean;
}

export function Header({
  paused = false,
  onTogglePause,
  showPauseToggle = true,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-[#f1f5f9]/95 backdrop-blur-lg border-b border-[#cbd5e1]">
      <div className="max-w-[1400px] mx-auto h-12 px-4 lg:px-6 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-sm bg-[#11274d] flex items-center justify-center text-white text-[9px] font-bold shrink-0">
            TE
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-[#11274d] leading-tight">
              Token Edge
            </div>
            <div className="text-[9px] uppercase tracking-wider text-[#6a7282] leading-tight hidden sm:block">
              · Powered by Birdeye
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {showPauseToggle && onTogglePause && (
            <button
              type="button"
              onClick={onTogglePause}
              aria-pressed={!paused}
              aria-label={paused ? "Resume live updates" : "Pause live updates"}
              className="h-7 px-2 rounded-sm bg-white border border-[#cbd5e1] text-[#11274d] text-xs hover:bg-[#e2e8f0] transition-colors inline-flex items-center gap-1.5"
            >
              <StatusDot
                variant={paused ? "warning" : "live"}
                pulse={!paused}
              />
              <span>{paused ? "Paused" : "Live"}</span>
            </button>
          )}
          <ConnectWalletButton />
        </div>
      </div>
    </header>
  );
}
