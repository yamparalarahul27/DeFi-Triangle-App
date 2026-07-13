import { cn } from "@/lib/utils";

/**
 * Signed change readout — the sign-discipline primitive (DESIGN.md
 * guideline #5, hard-coded): direction comes from the SIGNED value
 * (▲/▼ + +/−, buy/sell tone), magnitude is always Math.abs. Callers
 * can never render "-−4.2%" or a green loss.
 */
export function PriceChange({
  value,
  suffix = "%",
  precision = 2,
  className,
}: {
  /** Signed change (e.g. -4.2 for −4.2%). */
  value: number;
  /** Unit appended to the magnitude. */
  suffix?: string;
  precision?: number;
  className?: string;
}) {
  const up = value >= 0;
  const magnitude = Math.abs(value).toFixed(precision);
  return (
    <span
      className={cn(
        "data-sm inline-flex items-center gap-1 tabular-nums",
        up ? "text-buy" : "text-sell",
        className,
      )}
    >
      <span aria-hidden="true">{up ? "▲" : "▼"}</span>
      <span>
        {up ? "+" : "−"}
        {magnitude}
        {suffix}
      </span>
    </span>
  );
}
