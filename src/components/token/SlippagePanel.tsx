"use client";

import type { SlippageResult } from "@/lib/token/slippage";

const TOOLTIP_NOTE =
  "Expected price impact when selling this token into USDC at three trade sizes, sourced live from the public Jupiter Quote API. Lower is better — high % at moderate size signals thin liquidity.";

export function SlippagePanel({
  data,
  symbol,
}: {
  data: SlippageResult | null;
  symbol: string | null;
}) {
  if (!data || data.sizes.length === 0) return null;

  return (
    <section className="bg-surface-container rounded-sm border border-outline-variant p-4 sm:p-6 space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-[10px] uppercase tracking-wider text-fg-muted">
          Slippage at size · Jupiter Quote
        </div>
        <div className="text-[10px] text-fg-muted">
          Sell {symbol ?? "token"} → USDC
        </div>
      </div>

      <div className="text-[11px] text-fg-muted leading-snug">
        {TOOLTIP_NOTE}
      </div>

      <div className="overflow-hidden">
        <div className="grid grid-cols-[5rem_1fr_1fr] gap-2 text-[10px] uppercase tracking-wider text-fg-muted pb-2 border-b border-outline-variant">
          <span>Size</span>
          <span className="text-right">Price impact</span>
          <span className="text-right">Out (USDC)</span>
        </div>
        <ul className="divide-y divide-outline-variant">
          {data.sizes.map((row) => (
            <li
              key={row.sizeUsd}
              className="grid grid-cols-[5rem_1fr_1fr] gap-2 items-baseline py-2 text-xs"
            >
              <span className="font-mono text-fg">
                ${fmtCompactUsd(row.sizeUsd)}
              </span>
              <span
                className={`font-mono text-right ${impactToneClass(
                  row.priceImpactPct
                )}`}
              >
                {row.priceImpactPct == null
                  ? "—"
                  : `${(row.priceImpactPct * 100).toFixed(row.priceImpactPct < 0.01 ? 4 : 2)}%`}
              </span>
              <span className="font-mono text-fg text-right">
                {row.outAmountUsd == null
                  ? "—"
                  : `$${fmtCompactUsd(row.outAmountUsd)}`}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function impactToneClass(impactRatio: number | null): string {
  if (impactRatio == null) return "text-fg-muted";
  const pct = impactRatio * 100;
  if (pct <= 0.5) return "text-buy";
  if (pct <= 2) return "text-warning-strong";
  return "text-sell-strong";
}

function fmtCompactUsd(value: number): string {
  if (!Number.isFinite(value) || value < 0) return "—";
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value >= 10_000 ? 1 : 2)}K`;
  if (value >= 1) return value.toFixed(2);
  return value.toPrecision(3);
}
