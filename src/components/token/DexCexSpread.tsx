"use client";

import NumberFlow from "@number-flow/react";
import { Tooltip } from "@/components/ui/Tooltip";
import { PCT_2DP } from "@/lib/numberFormats";

const HEALTHY_PCT = 0.5;
const CAUTION_PCT = 2;

const TOOLTIP =
  "Spread between the on-chain DEX price (Birdeye) and the CEX-aggregated reference price (CoinGecko via Tokens.xyz). Tight spread = liquid, easy entry/exit. Wide spread = arbitrage opportunity, illiquidity, or stale data on one side.";

export function DexCexSpread({
  dexPrice,
  cexPrice,
}: {
  dexPrice: number | null;
  cexPrice: number | null;
}) {
  if (
    dexPrice == null ||
    cexPrice == null ||
    !Number.isFinite(dexPrice) ||
    !Number.isFinite(cexPrice) ||
    dexPrice <= 0 ||
    cexPrice <= 0
  ) {
    return null;
  }

  const spread = ((dexPrice - cexPrice) / cexPrice) * 100;
  const abs = Math.abs(spread);
  const sign = spread >= 0 ? "+" : "−";

  const tone: "safe" | "caution" | "risk" =
    abs <= HEALTHY_PCT ? "safe" : abs <= CAUTION_PCT ? "caution" : "risk";

  const text =
    tone === "safe"
      ? "text-[#0fa87a]"
      : tone === "caution"
        ? "text-[#b45309]"
        : "text-[#b91c1c]";

  return (
    <Tooltip content={TOOLTIP} side="bottom" title="DEX vs CEX spread">
      <span
        className={`inline-flex items-center gap-1.5 text-[11px] ${text} cursor-help`}
      >
        <span className="opacity-70">DEX</span>
        <span className="font-mono tabular-nums">
          {sign}
          <NumberFlow value={abs} format={PCT_2DP} suffix="%" />
        </span>
        <span className="opacity-70">vs CEX</span>
      </span>
    </Tooltip>
  );
}
