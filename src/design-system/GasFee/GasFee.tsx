import { cn } from "@/lib/utils";

export type FeeLevel = "low" | "normal" | "elevated" | "high";

// Word + tint together (mono-safe, same rule as Alert/PegBadge). Fee
// severity is congestion pricing, not danger — warning tones only at
// the top of the scale.
const LEVEL: Record<FeeLevel, { word: string; text: string }> = {
  low: { word: "low", text: "text-success" },
  normal: { word: "normal", text: "text-fg-muted" },
  elevated: { word: "elevated", text: "text-warning" },
  high: { word: "high", text: "text-error" },
};

/**
 * Network-fee row — the gas/fee communication component no generic
 * system ships. Label left; amount (financial ramp) + optional
 * congestion level right. Put it directly above the confirm button —
 * fees users discover after signing are the #1 web3 trust killer.
 */
export function GasFee({
  amount,
  usd,
  level,
  label = "Network fee",
  className,
}: {
  /** Fee in native units, preformatted (e.g. "0.000005 SOL"). */
  amount: string;
  /** Fiat approximation (e.g. "≈ $0.0009"). */
  usd?: string;
  /** Congestion level — omit when the chain has flat fees. */
  level?: FeeLevel;
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline justify-between gap-3 text-xs", className)}>
      <span className="text-fg-muted">{label}</span>
      <span className="flex items-baseline gap-2 text-right">
        <span className="data-sm text-fg">{amount}</span>
        {usd && <span className="text-fg-subtle">{usd}</span>}
        {level && (
          <span className={cn("font-medium uppercase tracking-wider text-[10px]", LEVEL[level].text)}>
            {LEVEL[level].word}
          </span>
        )}
      </span>
    </div>
  );
}
