"use client";

import { TokenIcon } from "@/components/ui/TokenIcon";
import { fmtUsd } from "@/lib/format";
import {
  PEG_THRESHOLDS_BPS,
  STABLECOINS,
  type StableLiveData,
  type StablePendingData,
} from "@/lib/home/stablecoins";
import { STABLECOIN_ISSUERS } from "@/lib/home/stablecoinIssuers";

/**
 * Card subtitle prefers the issuer short name (e.g. "Circle" for USDC) over
 * the official product name (e.g. "USD Coin"). This keeps the rail consistent
 * — every tile tells you who's behind it at a glance instead of mixing
 * branded names with descriptive ones. The full product name is still shown
 * in the modal.
 */
function cardSubtitle(mint: string, fallback: string): string {
  const entry = STABLECOINS.find((s) => s.mint === mint);
  if (!entry?.issuerKey) return fallback;
  const issuer = STABLECOIN_ISSUERS[entry.issuerKey];
  return issuer?.shortName ?? issuer?.name ?? fallback;
}

const CARD_BASE =
  "shrink-0 bg-white rounded-[10px] border border-[#11274d]/10 p-4 transition-all duration-150";
const CARD_SHADOW = {
  boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
};

export function StableCardLive({
  token,
  onClick,
}: {
  token: StableLiveData;
  onClick?: () => void;
}) {
  const { tone, label } = pegState(token.pegDeviationBps);
  const deviationPct = token.pegDeviationBps / 100;

  return (
    <div
      className={`${CARD_BASE} w-[260px] ${
        onClick ? "cursor-pointer hover:border-[#11274d]/25" : "hover:border-[#11274d]/20"
      }`}
      style={CARD_SHADOW}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      aria-label={onClick ? `${token.symbol} details` : undefined}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <TokenIcon
            src={token.iconUrl ?? undefined}
            symbol={token.symbol}
            size="md"
          />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[#11274d] truncate">
              {token.symbol}
            </div>
            <div className="text-xs text-[#6a7282] truncate">
              {cardSubtitle(token.mint, token.name)}
            </div>
          </div>
        </div>
        <PegBadge tone={tone} label={label} />
      </div>

      <div className="flex items-baseline justify-between gap-2 mb-3">
        <div className="font-mono text-base text-[#11274d]">
          {formatStablePrice(token.priceUsd)}
        </div>
        <div className={`text-xs font-mono ${tone.deviationText}`}>
          {token.priceUsd > 0
            ? `${deviationPct >= 0 ? "+" : ""}${deviationPct.toFixed(2)}%`
            : "—"}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Stat label="Liquidity" value={fmtUsd(token.liquidityUsd, { compact: true })} />
        <Stat label="Vol 24h" value={fmtUsd(token.volume24hUsd, { compact: true })} />
      </div>
    </div>
  );
}

export function StableCardPending({
  token,
  onClick,
}: {
  token: StablePendingData;
  onClick?: () => void;
}) {
  return (
    <div
      className={`${CARD_BASE} w-[260px] border-[#19549b]/15 bg-gradient-to-br from-white to-[#f1f5f9] ${
        onClick ? "cursor-pointer hover:border-[#19549b]/30" : ""
      }`}
      style={CARD_SHADOW}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      aria-label={onClick ? `${token.symbol} details` : undefined}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div
            aria-label={token.symbol}
            className="w-6 h-6 rounded-full bg-[#0d2137] text-[#7ee5c6] flex items-center justify-center font-semibold text-[10px] shrink-0"
          >
            {token.symbol.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[#11274d] truncate">
              {token.symbol}
            </div>
            <div className="text-xs text-[#6a7282] truncate">
              {cardSubtitle(token.mint, token.name)}
            </div>
          </div>
        </div>
        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#d97706]/10 text-[#d97706] shrink-0 whitespace-nowrap">
          Coming Soon
        </span>
      </div>

      <p className="text-xs text-[#11274d] leading-snug mb-2">
        {token.tagline}
      </p>
      <p className="text-[10px] text-[#6a7282] uppercase tracking-wider">
        Awaiting Solana liquidity
      </p>
    </div>
  );
}

function PegBadge({
  tone,
  label,
}: {
  tone: PegTone;
  label: string;
}) {
  return (
    <span
      className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 whitespace-nowrap ${tone.badgeBg} ${tone.badgeText}`}
    >
      {label}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-[#6a7282]">
        {label}
      </div>
      <div className="font-mono text-xs text-[#11274d] mt-0.5">{value}</div>
    </div>
  );
}

type PegTone = {
  badgeBg: string;
  badgeText: string;
  deviationText: string;
};

const TONE_ON_PEG: PegTone = {
  badgeBg: "bg-[#0fa87a]/10",
  badgeText: "text-[#0fa87a]",
  deviationText: "text-[#0fa87a]",
};
const TONE_DRIFTING: PegTone = {
  badgeBg: "bg-[#d97706]/10",
  badgeText: "text-[#d97706]",
  deviationText: "text-[#d97706]",
};
const TONE_DEPEGGED: PegTone = {
  badgeBg: "bg-[#ef4444]/10",
  badgeText: "text-[#ef4444]",
  deviationText: "text-[#ef4444]",
};

function pegState(deviationBps: number): { tone: PegTone; label: string } {
  if (deviationBps <= PEG_THRESHOLDS_BPS.ON_PEG) {
    return { tone: TONE_ON_PEG, label: "On peg" };
  }
  if (deviationBps <= PEG_THRESHOLDS_BPS.DRIFTING) {
    return { tone: TONE_DRIFTING, label: "Drifting" };
  }
  return { tone: TONE_DEPEGGED, label: "Depegged" };
}

function formatStablePrice(price: number): string {
  if (!Number.isFinite(price) || price <= 0) return "—";
  return `$${price.toFixed(4)}`;
}
