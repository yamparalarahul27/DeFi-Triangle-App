"use client";

import { EvilLineChart } from "@/components/evilcharts/charts/line-chart";
import { type ChartConfig } from "@/components/evilcharts/ui/chart";
import type { Candle } from "./PriceChart";

const CHART_CONFIG = {
  price: {
    label: "Price",
    colors: {
      light: ["#19549b"],
      dark: ["#3B7DDD"],
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
        className="flex items-center justify-center text-xs text-[#6B7280]"
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
        className="h-full w-full"
      />
    </div>
  );
}
