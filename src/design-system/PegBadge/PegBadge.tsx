import { cn } from "@/lib/utils";

/**
 * Stablecoin peg health from the SIGNED deviation in bps. Health tone
 * comes from the magnitude (Math.abs — guideline #5), the readout keeps
 * the sign so above/below peg stays visible. Thresholds: <25bps on peg ·
 * 25–200 drifting · ≥200 depegged (≈ the old 0.98 break).
 */
export function PegBadge({
  deviationBps,
  className,
}: {
  /** Signed peg deviation in basis points (+ above, − below). */
  deviationBps: number;
  className?: string;
}) {
  const magnitude = Math.abs(deviationBps);
  const state =
    magnitude < 25 ? "on peg" : magnitude < 200 ? "drifting" : "depegged";
  const tone =
    state === "on peg"
      ? "bg-buy-surface text-buy"
      : state === "drifting"
        ? "bg-warning-surface text-warning"
        : "bg-sell-surface text-sell";
  const sign = deviationBps >= 0 ? "+" : "−";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-chip px-1.5 py-0.5 text-[11px] font-medium",
        tone,
        className,
      )}
    >
      {state}
      <span className="data-sm tabular-nums opacity-80">
        {sign}
        {magnitude}bps
      </span>
    </span>
  );
}
