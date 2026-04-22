"use client";

import type { MouseEvent } from "react";
import { TokenIcon } from "./TokenIcon";
import { RiskBar } from "./RiskBar";
import { fmtAge, fmtNum, fmtPct, fmtUsd } from "@/lib/format";
import type { RiskLabel } from "@/lib/scoring";

const SOCIAL_LABELS: Record<string, string> = {
  twitter: "X",
  x: "X",
  telegram: "TG",
  discord: "DC",
};

export interface DexCardProps {
  pair: any;
  onClick?: () => void;
  starred?: boolean;
  onStarToggle?: () => void;
}

export function DexCard({
  pair,
  onClick,
  starred = false,
  onStarToggle,
}: DexCardProps) {
  const base = pair?.baseToken ?? {};
  const quote = pair?.quoteToken ?? {};
  const info = pair?.info ?? {};

  const priceUsd = Number(pair?.priceUsd ?? 0);
  const priceChange24 = Number(pair?.priceChange?.h24 ?? 0);
  const liquidity = Number(pair?.liquidity?.usd ?? 0);
  const fdv = Number(pair?.fdv ?? 0);
  const vol24h = Number(pair?.volume?.h24 ?? 0);
  const buys24 = Number(pair?.txns?.h24?.buys ?? 0);
  const sells24 = Number(pair?.txns?.h24?.sells ?? 0);
  const total24 = buys24 + sells24;
  const buyPct = total24 > 0 ? Math.round((buys24 / total24) * 100) : 50;

  const score: number | null =
    typeof pair?.score === "number" ? pair.score : null;
  const label: RiskLabel | undefined = pair?.label;

  const socials: { type: string; url: string }[] = Array.isArray(info.socials)
    ? info.socials
    : [];
  const websites: { url: string }[] = Array.isArray(info.websites)
    ? info.websites
    : [];

  const priceUp = priceChange24 >= 0;
  const priceColor = priceUp ? "text-[#0fa87a]" : "text-[#ef4444]";
  const arrow = priceUp ? "▲" : "▼";

  const baseAddr: string = base.address ?? "";

  const copyAddress = async (e: MouseEvent) => {
    e.stopPropagation();
    if (!baseAddr) return;
    try {
      await navigator.clipboard.writeText(baseAddr);
    } catch {
      // ignore
    }
  };

  const shareLink = async (e: MouseEvent) => {
    e.stopPropagation();
    if (!baseAddr) return;
    const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
    const url = `${base}/token/${baseAddr}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // ignore
    }
  };

  const handleStar = (e: MouseEvent) => {
    e.stopPropagation();
    onStarToggle?.();
  };

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className="group relative bg-white rounded-sm border border-[#11274d]/10 p-4 transition-all duration-150 hover:border-[#11274d]/20 cursor-pointer"
      style={{
        boxShadow:
          "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <TokenIcon src={info.imageUrl} symbol={base.symbol} size="md" />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[#11274d] truncate">
              {base.symbol ?? "???"}
              {quote.symbol && (
                <span className="text-[#6a7282] font-normal">
                  {" / "}
                  {quote.symbol}
                </span>
              )}
            </div>
            <div className="text-xs text-[#6a7282] truncate">
              {base.name ?? ""}
            </div>
          </div>
        </div>
        {onStarToggle && (
          <button
            type="button"
            onClick={handleStar}
            aria-label={starred ? "Remove from watchlist" : "Add to watchlist"}
            aria-pressed={starred}
            className={`text-base leading-none shrink-0 transition-colors ${
              starred
                ? "text-[#f59e0b]"
                : "text-[#6a7282] hover:text-[#f59e0b]"
            }`}
          >
            {starred ? "★" : "☆"}
          </button>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2 mb-3">
        <div className="font-mono text-base text-[#11274d]">
          {fmtUsd(priceUsd)}
        </div>
        <div className={`flex items-center gap-1 text-xs ${priceColor}`}>
          <span>{arrow}</span>
          <span className="font-mono">{fmtPct(Math.abs(priceChange24))}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <StatBlock
          label="Liquidity"
          value={fmtUsd(liquidity, { compact: true })}
        />
        <StatBlock label="FDV" value={fmtUsd(fdv, { compact: true })} />
        <StatBlock
          label="Vol 24h"
          value={fmtUsd(vol24h, { compact: true })}
        />
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between text-[10px] text-[#6a7282] mb-1">
          <span className="uppercase tracking-wider">Buy / Sell · 24h</span>
          <span className="font-mono">
            {fmtNum(buys24, { compact: true })} / {fmtNum(sells24, { compact: true })}
          </span>
        </div>
        <div className="relative h-1.5 rounded-full bg-[#ef4444]/15 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-[#0fa87a]"
            style={{ width: `${buyPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono mt-1">
          <span className="text-[#0fa87a]">{buyPct}% buys</span>
          <span className="text-[#ef4444]">{100 - buyPct}% sells</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 text-[11px] text-[#6a7282]">
        <span className="whitespace-nowrap">
          Created {fmtAge(Number(pair?.pairCreatedAt ?? 0))} ago
        </span>
        <div className="flex items-center gap-1 flex-wrap justify-end">
          {socials.slice(0, 3).map((s, i) => (
            <a
              key={`s-${i}`}
              href={s.url}
              onClick={(e) => e.stopPropagation()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-1.5 py-0.5 rounded-sm bg-[#f1f5f9] text-[9px] font-semibold uppercase tracking-wider text-[#6a7282] hover:text-[#11274d] transition-colors"
            >
              {SOCIAL_LABELS[(s.type ?? "").toLowerCase()] ?? "Link"}
            </a>
          ))}
          {websites.slice(0, 1).map((w, i) => (
            <a
              key={`w-${i}`}
              href={w.url}
              onClick={(e) => e.stopPropagation()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-1.5 py-0.5 rounded-sm bg-[#f1f5f9] text-[9px] font-semibold uppercase tracking-wider text-[#6a7282] hover:text-[#11274d] transition-colors"
            >
              Web
            </a>
          ))}
          <button
            type="button"
            onClick={copyAddress}
            aria-label="Copy contract address"
            className="px-1.5 py-0.5 rounded-sm bg-[#f1f5f9] text-[9px] font-semibold uppercase tracking-wider text-[#6a7282] hover:text-[#11274d] transition-colors"
          >
            Copy
          </button>
          <button
            type="button"
            onClick={shareLink}
            aria-label="Copy share link"
            className="px-1.5 py-0.5 rounded-sm bg-[#f1f5f9] text-[9px] font-semibold uppercase tracking-wider text-[#6a7282] hover:text-[#11274d] transition-colors"
          >
            Share
          </button>
        </div>
      </div>

      {score != null && label && (
        <div className="mt-3 pt-3 border-t border-[#11274d]/5">
          <RiskBar score={score} label={label} />
        </div>
      )}
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-[#6a7282]">
        {label}
      </div>
      <div className="font-mono text-xs text-[#11274d] mt-0.5">{value}</div>
    </div>
  );
}
