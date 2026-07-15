import { cn } from "@/lib/utils";

export type AmountSize = "sm" | "md" | "lg";

const SIZE: Record<AmountSize, string> = {
  sm: "data-sm",
  md: "data-md",
  lg: "data-lg",
};

// Magnitude-aware defaults: ≥1 gets 2dp + thousands separators; <1 gets
// 4 significant digits (dust like 0.00002314 stays readable). Explicit
// `decimals` overrides. Locale pinned to en-US — server and client must
// format identically (hydration).
function format(abs: number, decimals?: number): string {
  if (decimals !== undefined) {
    return abs.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }
  if (abs >= 1) {
    return abs.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return abs.toLocaleString("en-US", { maximumSignificantDigits: 4 });
}

/**
 * Read-only formatted token amount — AmountInput's display sibling.
 * Renders in the financial type ramp (Geist Pixel Square via data-*).
 * Sign discipline (guideline #5): direction from the signed value
 * (− prefix), magnitude formatted from Math.abs. For signed *changes*
 * with color, use PriceChange — Amount is a fact, not a movement.
 */
export function Amount({
  value,
  symbol,
  size = "md",
  decimals,
  className,
}: {
  value: number;
  /** Token symbol rendered after the number (e.g. "SOL"). */
  symbol?: string;
  /** data-sm · data-md · data-lg type ramp. */
  size?: AmountSize;
  /** Fixed fraction digits — overrides the magnitude-aware default. */
  decimals?: number;
  className?: string;
}) {
  const negative = value < 0;
  const formatted = format(Math.abs(value), decimals);
  return (
    <span
      title={`${value}${symbol ? ` ${symbol}` : ""}`}
      className={cn(SIZE[size], "text-fg", className)}
    >
      {negative && "−"}
      {formatted}
      {symbol && <span className="ml-1 text-fg-muted">{symbol}</span>}
    </span>
  );
}
