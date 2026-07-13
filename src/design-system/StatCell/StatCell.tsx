import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * Label-over-value stat block for stat strips and dashboards.
 * Density-responsive: padding rides the spacing tokens, the value rides
 * the financial type ramp — compact mode tightens both automatically.
 */
export function StatCell({
  label,
  value,
  change,
  className,
}: {
  label: string;
  /** Pre-formatted figure ("$1.09B") or a RollingNumber. */
  value: ReactNode;
  /** Optional delta — pass a <PriceChange /> to keep sign discipline. */
  change?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("min-w-0", className)}
      style={{ padding: "var(--space-1) var(--cell-px)" }}
    >
      <div className="truncate text-[10px] uppercase tracking-wider text-fg-muted">
        {label}
      </div>
      <div className="data-md mt-0.5 flex items-baseline gap-2 text-fg">
        {value}
        {change}
      </div>
    </div>
  );
}
