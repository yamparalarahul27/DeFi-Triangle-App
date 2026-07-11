import { cn } from "@/lib/utils";
import { TokenIcon } from "../TokenIcon";

export function TokenChip({
  symbol,
  iconSrc,
  price,
  change24h,
  className,
}: {
  symbol: string;
  iconSrc?: string;
  /** Preformatted price string, e.g. "$0.8123" — formatting is the caller's concern. */
  price: string;
  /** Signed 24h change, percent. Sign drives direction; magnitude drives the number. */
  change24h: number;
  className?: string;
}) {
  // Guideline #5 — sign vs magnitude are two computations:
  //   direction (icon + prefix + color) reads the SIGNED value;
  //   the number reads the MAGNITUDE via Math.abs.
  const up = change24h >= 0;
  const arrow = up ? "▲" : "▼";
  const prefix = up ? "+" : "−"; // U+2212 minus, per DESIGN.md
  const magnitude = Math.abs(change24h).toFixed(2);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded border border-outline-variant bg-surface px-2.5 py-1.5",
        className,
      )}
    >
      <TokenIcon src={iconSrc} symbol={symbol} size="sm" />
      <span className="font-mono text-[13px] font-medium text-fg">{symbol}</span>
      <span className="data-sm text-fg">{price}</span>
      <span className={cn("data-sm", up ? "text-buy" : "text-sell")}>
        {arrow} {prefix}
        {magnitude}%
      </span>
    </span>
  );
}
