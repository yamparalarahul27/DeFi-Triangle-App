"use client";

import type { MouseEvent } from "react";
import { TokenIcon } from "./TokenIcon";
import { fmtNum, fmtPctMagnitude, fmtUsd } from "@/lib/format";

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
  const isStrict = Boolean(pair?.isStrict);
  const isVerified = Boolean(pair?.isVerified);

  const priceUp = priceChange24 >= 0;
  const priceColor = priceUp ? "text-buy" : "text-sell";
  const trendIconSrc = priceUp ? "/app/Up.svg" : "/app/Down.svg";

  const handleStar = (e: MouseEvent) => {
    e.stopPropagation();
    onStarToggle?.();
  };

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className="group relative bg-surface-container rounded-[14px] border border-outline/10 p-4 transition-[border-color,box-shadow,transform] duration-150 active:scale-[0.98] hover:border-outline/20 cursor-pointer"
      style={{
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <TokenIcon src={info.imageUrl} symbol={base.symbol} size="md" />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-fg truncate inline-flex items-center gap-1">
              <span className="truncate">{base.symbol ?? "???"}</span>
              {isVerified && (
                <img
                  src="/app/ic_correct.svg"
                  alt={isStrict ? "Verified by Tokens.xyz (strict source tags present)" : "Verified by Tokens.xyz"}
                  className="h-3.5 w-3.5 shrink-0"
                  title={isStrict ? "Verified by Tokens.xyz (strict source tags present)" : "Verified by Tokens.xyz"}
                />
              )}
              {quote.symbol && <span className="text-fg-muted font-normal">/ {quote.symbol}</span>}
            </div>
            <div className="text-xs text-fg-muted truncate">{base.name ?? ""}</div>
          </div>
        </div>
        {onStarToggle && (
          <button
            type="button"
            onClick={handleStar}
            aria-label={starred ? "Remove from watchlist" : "Add to watchlist"}
            aria-pressed={starred}
            className={`text-base leading-none shrink-0 transition-colors ${
              starred ? "text-warning" : "text-fg-muted hover:text-warning"
            }`}
          >
            {starred ? "★" : "☆"}
          </button>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2 mb-3">
        <div className="font-mono text-base text-fg">{fmtUsd(priceUsd)}</div>
        <div className={`flex items-center gap-1 text-xs ${priceColor}`}>
          <img
            src={trendIconSrc}
            alt=""
            aria-hidden="true"
            className="h-3 w-3 shrink-0"
          />
          <span className="font-mono">{fmtPctMagnitude(priceChange24)}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <StatBlock label="Liquidity" value={fmtUsd(liquidity, { compact: true })} />
        <StatBlock label="FDV" value={fmtUsd(fdv, { compact: true })} />
        <StatBlock label="Vol 24h" value={fmtUsd(vol24h, { compact: true })} />
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between text-[10px] text-fg-muted mb-1">
          <span className="uppercase tracking-wider">Buy / Sell · 24h</span>
          <span className="font-mono">
            {fmtNum(buys24, { compact: true })} / {fmtNum(sells24, { compact: true })}
          </span>
        </div>
        <div className="relative h-1.5 rounded-full bg-sell/15 overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-buy" style={{ width: `${buyPct}%` }} />
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono mt-1">
          <span className="text-buy">{buyPct}% buys</span>
          <span className="text-sell">{100 - buyPct}% sells</span>
        </div>
      </div>
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-fg-muted">{label}</div>
      <div className="font-mono text-xs text-fg mt-0.5">{value}</div>
    </div>
  );
}
