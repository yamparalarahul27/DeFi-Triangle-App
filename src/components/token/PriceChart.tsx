"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Candle } from "@/lib/token/types";

const RANGES = ["1D", "1W", "1M", "3M", "1Y"] as const;

/**
 * Token price chart — closes rendered as a mint area+line.
 * Range tabs drive the parent's useTokenDetails chart range.
 */
export function PriceChart({
  candles,
  range,
  onRange,
  loading,
}: {
  candles: Candle[];
  range: string;
  onRange: (label: string) => void;
  loading?: boolean;
}) {
  const path = useMemo(() => {
    const closes = candles.map((c) => c.c).filter((n) => Number.isFinite(n));
    if (closes.length < 2) return null;
    const W = 360;
    const H = 96;
    const min = Math.min(...closes);
    const max = Math.max(...closes);
    const span = max - min || 1;
    const x = (i: number) => (i / (closes.length - 1)) * W;
    const y = (v: number) => 4 + (1 - (v - min) / span) * (H - 8);
    const pts = closes.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`);
    return { line: pts.join(" "), area: `M0,${H} L${pts.join(" L")} L${W},${H} Z` };
  }, [candles]);

  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container p-3">
      <div className="h-24 w-full">
        {path ? (
          <svg viewBox="0 0 360 96" preserveAspectRatio="none" className="h-24 w-full" aria-hidden="true">
            <defs>
              <linearGradient id="tdfill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#5ad8c4" stopOpacity="0.22" />
                <stop offset="1" stopColor="#5ad8c4" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={path.area} fill="url(#tdfill)" />
            <polyline
              points={path.line}
              fill="none"
              stroke="#5ad8c4"
              strokeWidth="1.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <div className="grid h-full place-items-center text-xs text-fg-subtle">
            {loading ? "Loading chart…" : "No chart data"}
          </div>
        )}
      </div>

      <div className="mt-2 flex gap-1.5">
        {RANGES.map((r) => {
          const on = r === range;
          return (
            <button
              key={r}
              type="button"
              onClick={() => onRange(r)}
              className={cn(
                "h-[26px] rounded-sm px-2.5 text-[11px] font-medium transition-colors active:scale-[0.96]",
                on
                  ? "bg-brand text-on-brand"
                  : "text-fg-muted hover:text-fg",
              )}
            >
              {r}
            </button>
          );
        })}
      </div>
    </div>
  );
}
