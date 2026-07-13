import { cn } from "@/lib/utils";

/**
 * Inline trend line — pure SVG, no chart library. Tone follows the
 * series direction by default (first vs last, sign discipline), or set
 * it explicitly. Decorative unless a label is given.
 */
export function Sparkline({
  data,
  tone,
  label,
  width = 84,
  height = 28,
  className,
}: {
  /** The series, oldest → newest. Needs ≥ 2 points to draw. */
  data: number[];
  /** Default: buy when last ≥ first, sell otherwise. */
  tone?: "buy" | "sell" | "neutral";
  /** Accessible name; omitted = decorative (aria-hidden). */
  label?: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = 2 + (1 - (v - min) / span) * (height - 4);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const resolved =
    tone ?? (data[data.length - 1] >= data[0] ? "buy" : "sell");
  const STROKE = {
    buy: "var(--buy)",
    sell: "var(--sell)",
    neutral: "var(--fg-muted)",
  }[resolved];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={cn("shrink-0", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <polyline
        points={pts}
        fill="none"
        stroke={STROKE}
        strokeWidth="1.25"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
