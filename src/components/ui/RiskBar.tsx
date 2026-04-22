import type { RiskLabel } from "@/lib/scoring";

const FILL: Record<RiskLabel, string> = {
  safe: "bg-[#0fa87a]",
  caution: "bg-[#f59e0b]",
  danger: "bg-[#ef4444]",
};

const BADGE: Record<RiskLabel, string> = {
  safe: "text-[#0fa87a] bg-[#e5f7f2] border-[#0fa87a]/30",
  caution: "text-[#b45309] bg-[#fffbeb] border-[#f59e0b]/40",
  danger: "text-[#b91c1c] bg-[#fef2f2] border-[#ef4444]/40",
};

export function RiskBar({
  score,
  label,
  showBadge = true,
  showScoreText = true,
}: {
  score: number;
  label: RiskLabel;
  showBadge?: boolean;
  showScoreText?: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, score));
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-[#f1f5f9] overflow-hidden">
        <div
          className={`h-full ${FILL[label]} transition-[width] duration-300`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showScoreText && (
        <span className="font-mono text-xs text-[#11274d] tabular-nums">
          {clamped}/100
        </span>
      )}
      {showBadge && (
        <span
          className={`text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-sm border ${BADGE[label]}`}
        >
          {label}
        </span>
      )}
    </div>
  );
}
