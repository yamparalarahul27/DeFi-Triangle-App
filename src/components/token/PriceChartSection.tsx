"use client";

import { useMemo } from "react";
import { EvilLineChart } from "@/components/evilcharts/charts/line-chart";
import { type ChartConfig } from "@/components/evilcharts/ui/chart";
import type { Candle } from "@/components/ui/PriceChart";
import { fmtUsd } from "@/lib/format";
import { CHART_RANGES } from "@/lib/token/utils";

const CHART_CONFIG = {
  price: {
    label: "Price",
    colors: {
      light: ["#5ad8c4"],
      dark: ["#5ad8c4"],
    },
  },
} satisfies ChartConfig;

function formatTickTime(ms: number, rangeLabel: string): string {
  const d = new Date(ms);
  if (rangeLabel === "1D") {
    return d.toLocaleString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  if (rangeLabel === "1W") {
    return d.toLocaleString("en-US", { weekday: "short", hour: "numeric" });
  }
  return d.toLocaleString("en-US", { month: "short", day: "numeric" });
}

export function PriceChartSection({
  rangeLabel,
  onRangeChange,
  candles,
  loading,
}: {
  rangeLabel: string;
  onRangeChange: (v: string) => void;
  candles: Candle[];
  loading: boolean;
}) {
  const isInitialLoad = loading && candles.length === 0;

  const data = useMemo(
    () =>
      candles
        .filter((c) => Number.isFinite(c.c) && c.c > 0)
        .map((c) => ({
          time: c.unixTime * 1000,
          price: c.c,
        })),
    [candles]
  );

  return (
    <section className="bg-surface-container rounded-sm border border-outline-variant p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="text-[10px] uppercase tracking-wider text-fg-muted">
          Price chart
        </div>
        <div className="flex items-center gap-1">
          {CHART_RANGES.map((r) => {
            const active = r.label === rangeLabel;
            return (
              <button
                key={r.label}
                type="button"
                onClick={() => onRangeChange(r.label)}
                className={`min-h-[40px] px-3 rounded-sm text-xs transition-[background-color,color,box-shadow,transform] duration-150 active:scale-[0.96] ${
                  active
                    ? "bg-brand text-on-brand shadow-[0_1px_2px_rgba(4,17,15,0.40),0_4px_8px_rgba(90,216,196,0.20),0_12px_24px_rgba(90,216,196,0.12)]"
                    : "bg-surface-container text-fg/60 border border-outline-variant hover:text-fg"
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="h-[240px] w-full">
        <EvilLineChart
          isLoading={isInitialLoad}
          data={isInitialLoad ? [] : data}
          xDataKey="time"
          yDataKey="price"
          chartConfig={CHART_CONFIG}
          curveType="monotone"
          strokeVariant="solid"
          activeDotVariant="default"
          hideLegend
          backgroundVariant="upward-triangles"
          xAxisProps={{
            tickFormatter: (value) => formatTickTime(Number(value), rangeLabel),
          }}
          yAxisProps={{
            domain: ["auto", "auto"],
            tickFormatter: (value) => fmtUsd(Number(value)),
          }}
          tooltipFormatter={(value) => fmtUsd(Number(value))}
          className="h-full w-full"
        />
      </div>
    </section>
  );
}
