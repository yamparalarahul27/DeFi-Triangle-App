"use client";

import { EvilLineChart } from "@/components/evilcharts/charts/line-chart";
import { type ChartConfig } from "@/components/evilcharts/ui/chart";
import { fmtUsd } from "@/lib/format";
import type { Candle } from "./PriceChart";

const CHART_CONFIG = {
  price: {
    label: "Price",
    colors: {
      light: ["#5ad8c4"],
      dark: ["#5ad8c4"],
    },
  },
} satisfies ChartConfig;

export function TokenModalChart({
  candles,
  height,
}: {
  candles: Candle[];
  height: number;
}) {
  const data = candles
    .filter((c) => Number.isFinite(c.c) && c.c > 0)
    .map((c) => ({
      time: c.unixTime * 1000,
      price: c.c,
    }));

  if (data.length < 2) {
    return (
      <div
        className="flex items-center justify-center text-xs text-fg-subtle"
        style={{ height }}
      >
        No chart data
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height }}>
      <EvilLineChart
        data={data}
        xDataKey="time"
        yDataKey="price"
        chartConfig={CHART_CONFIG}
        curveType="monotone"
        strokeVariant="solid"
        activeDotVariant="default"
        glowingLines={["price"]}
        hideLegend
        hideCartesianGrid
        xAxisProps={{ hide: true }}
        yAxisProps={{ hide: true, domain: ["auto", "auto"] }}
        tooltipFormatter={(value) => fmtUsd(Number(value))}
        className="h-full w-full"
      />
    </div>
  );
}
