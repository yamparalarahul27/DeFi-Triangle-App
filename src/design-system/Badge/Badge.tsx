import { cn } from "@/lib/utils";

export type BadgeTone =
  | "neutral"
  | "brand"
  | "buy"
  | "sell"
  | "warning"
  | "info";

// Tinted-surface + tone-text pairs from the semantic token table. Never
// used for price direction alone — pair with the signed value (sign
// discipline lives with the data, not the badge).
const TONE: Record<BadgeTone, string> = {
  neutral: "bg-surface-container-high text-fg-muted",
  brand: "bg-brand-subtle/20 text-brand",
  buy: "bg-buy-surface text-buy",
  sell: "bg-sell-surface text-sell",
  warning: "bg-warning-surface text-warning",
  info: "bg-info-surface text-info",
};

export function Badge({
  tone = "neutral",
  className,
  ...rest
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-chip px-1.5 py-0.5 text-[11px] font-medium",
        TONE[tone],
        className,
      )}
      {...rest}
    />
  );
}
