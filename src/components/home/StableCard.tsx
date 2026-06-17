"use client";

import { TokenIcon } from "@/components/ui/TokenIcon";
import { Tooltip } from "@/components/ui/Tooltip";
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
  "shrink-0 bg-surface-container rounded-[14px] border border-outline/10 p-4 transition-[border-color,box-shadow,transform] duration-150";
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
        onClick ? "cursor-pointer hover:border-outline/25 active:scale-[0.98]" : "hover:border-outline/20"
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
            <div className="text-sm font-semibold text-fg truncate">
              {token.symbol}
            </div>
            <div className="text-xs text-fg-muted truncate">
              {cardSubtitle(token.mint, token.name)}
            </div>
          </div>
        </div>
        <PegBadge tone={tone} label={label} />
      </div>

      <div className="flex items-baseline justify-between gap-2 mb-3">
        <div className="font-mono text-base text-fg">
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
  const isFeatured = token.featured === true;
  const href = isFeatured ? token.learnMoreUrl : undefined;

  // Featured tiles render as an external link (homepage / docs) instead of
  // opening the modal. Non-featured pending tiles keep the existing modal
  // click behaviour for consistency with the rest of the rail.
  if (isFeatured && href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${CARD_BASE} block w-[260px] border-2 border-brand bg-gradient-to-br from-surface-container to-surface-container-high cursor-pointer hover:border-brand-hover hover:shadow-md active:scale-[0.98]`}
        style={CARD_SHADOW}
        aria-label={`Learn more about ${token.symbol}`}
      >
        <FeaturedPendingBody token={token} />
      </a>
    );
  }

  return (
    <div
      className={`${CARD_BASE} w-[260px] border-brand/15 bg-gradient-to-br from-surface-container to-surface-page ${
        onClick ? "cursor-pointer hover:border-brand/30 active:scale-[0.98]" : ""
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
      <DimPendingBody token={token} />
    </div>
  );
}

function FeaturedPendingBody({ token }: { token: StablePendingData }) {
  return (
    <>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <TokenIcon
            src={token.iconUrl ?? undefined}
            symbol={token.symbol}
            size="md"
          />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-fg truncate">
              {token.symbol}
            </div>
            <div className="text-xs text-fg-muted truncate">
              {cardSubtitle(token.mint, token.name)}
            </div>
          </div>
        </div>
        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand/10 text-brand shrink-0 whitespace-nowrap">
          ★ Featured
        </span>
      </div>

      <p className="text-xs text-fg leading-snug mb-3">
        {token.tagline}
      </p>
      <p className="text-[11px] text-brand font-medium">Learn more →</p>
    </>
  );
}

function DimPendingBody({ token }: { token: StablePendingData }) {
  return (
    <>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div
            aria-label={token.symbol}
            className="w-6 h-6 rounded-full bg-surface-container text-buy flex items-center justify-center font-semibold text-[10px] shrink-0"
          >
            {token.symbol.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-fg truncate">
              {token.symbol}
            </div>
            <div className="text-xs text-fg-muted truncate">
              {cardSubtitle(token.mint, token.name)}
            </div>
          </div>
        </div>
        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-warning-strong/10 text-warning-strong shrink-0 whitespace-nowrap">
          Coming Soon
        </span>
      </div>

      <p className="text-xs text-fg leading-snug mb-2">
        {token.tagline}
      </p>
      <p className="text-[10px] text-fg-muted uppercase tracking-wider">
        Awaiting Solana liquidity
      </p>
    </>
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
    <Tooltip content={<PegLegend />} title="Peg health" side="bottom">
      <span
        className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 whitespace-nowrap cursor-help ${tone.badgeBg} ${tone.badgeText}`}
      >
        {label}
      </span>
    </Tooltip>
  );
}

/**
 * Legend explaining the magnitude-based color rule. Surfaced in a tooltip
 * over the peg badge so users who pattern-match "red = bad" from regular
 * tokens see the right semantic on stablecoins.
 */
export function PegLegend() {
  const onPegPct = (PEG_THRESHOLDS_BPS.ON_PEG / 100).toFixed(2);
  const driftingPct = (PEG_THRESHOLDS_BPS.DRIFTING / 100).toFixed(2);
  return (
    <div className="space-y-1 text-[11px] leading-snug">
      <div>
        <span className="text-buy">●</span> On peg — within {onPegPct}%
      </div>
      <div>
        <span className="text-warning">●</span> Drifting — within {driftingPct}%
      </div>
      <div>
        <span className="text-sell">●</span> Depegged — beyond {driftingPct}%
      </div>
      <div className="opacity-70 pt-1 border-t border-white/15 mt-1">
        Sign (+/−) shows direction; color shows health.
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-fg-muted">
        {label}
      </div>
      <div className="font-mono text-xs text-fg mt-0.5">{value}</div>
    </div>
  );
}

type PegTone = {
  badgeBg: string;
  badgeText: string;
  deviationText: string;
};

const TONE_ON_PEG: PegTone = {
  badgeBg: "bg-buy/10",
  badgeText: "text-buy",
  deviationText: "text-buy",
};
const TONE_DRIFTING: PegTone = {
  badgeBg: "bg-warning-strong/10",
  badgeText: "text-warning-strong",
  deviationText: "text-warning-strong",
};
const TONE_DEPEGGED: PegTone = {
  badgeBg: "bg-sell/10",
  badgeText: "text-sell",
  deviationText: "text-sell",
};

function pegState(deviationBps: number): { tone: PegTone; label: string } {
  // deviationBps is signed (sign = direction); peg health is about magnitude.
  const magnitude = Math.abs(deviationBps);
  if (magnitude <= PEG_THRESHOLDS_BPS.ON_PEG) {
    return { tone: TONE_ON_PEG, label: "On peg" };
  }
  if (magnitude <= PEG_THRESHOLDS_BPS.DRIFTING) {
    return { tone: TONE_DRIFTING, label: "Drifting" };
  }
  return { tone: TONE_DEPEGGED, label: "Depegged" };
}

function formatStablePrice(price: number): string {
  if (!Number.isFinite(price) || price <= 0) return "—";
  return `$${price.toFixed(4)}`;
}
