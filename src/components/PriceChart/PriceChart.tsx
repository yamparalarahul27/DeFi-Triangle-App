"use client";

// PriceChart — the interactive price chart (component-gaps Batch 3, the
// CDS-signature surface). Unlike the rest of CIDS, this is NOT a
// portable design-system primitive: it composes the vendored EvilLineChart
// (recharts under the hood), so it lives outside src/design-system/ and
// is exempt from check:portable.
//
// Built on EvilCharts by legions-developer — vendored under
// src/components/evilcharts/ (https://github.com/legions-developer/evilcharts).
// The line, crosshair cursor, and hover tooltip are EvilLineChart's; the
// price/change header and range switcher (CIDS Lane) are composed on top.
// Line colour flows through our semantic tokens (var(--buy)/var(--sell)),
// so the chart is theme-aware across dark/mono/light/violet.

import { useMemo } from "react";
import { EvilLineChart } from "@/components/evilcharts/charts/line-chart";
import { Lane, PriceChange } from "@/design-system";

export type PricePoint = { label: string; price: number };

const SERIES = "price" as const;

export function PriceChart({
  data,
  symbol,
  range,
  ranges,
  onRangeChange,
  tone = "auto",
  valueFormat = (v) => `$${v.toLocaleString("en-US")}`,
  height = 240,
  "aria-label": ariaLabel,
}: {
  /** Active series, oldest → newest. */
  data: PricePoint[];
  /** Header label, e.g. "SOL / USDC". */
  symbol: string;
  /** Active range key (e.g. "1D"). */
  range: string;
  /** Range switcher options (e.g. ["1D","1W","1M","1Y"]). */
  ranges: string[];
  onRangeChange: (range: string) => void;
  /** Line colour. "auto" = buy when last ≥ first, else sell. */
  tone?: "buy" | "sell" | "auto";
  /** Formats the latest value + y-axis ticks + tooltip. */
  valueFormat?: (value: number) => string;
  height?: number;
  "aria-label"?: string;
}) {
  const first = data[0]?.price ?? 0;
  const last = data[data.length - 1]?.price ?? 0;
  const changePct = first === 0 ? 0 : ((last - first) / first) * 100;

  const resolved = tone === "auto" ? (last >= first ? "buy" : "sell") : tone;
  const strokeVar = `var(--${resolved})`;

  // Feed our semantic token to EvilCharts' color system (--color-<key>-0).
  // Same var under both theme keys → our [data-theme] blocks re-resolve it.
  const chartConfig = useMemo(
    () => ({
      [SERIES]: { label: symbol, colors: { light: [strokeVar], dark: [strokeVar] } },
    }),
    [symbol, strokeVar],
  );

  return (
    <section
      aria-label={ariaLabel ?? `${symbol} price chart`}
      className="rounded-card border border-outline-variant bg-surface-container p-4"
    >
      <header className="mb-3 flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs text-fg-muted">{symbol}</p>
          <p className="data-lg text-fg">{valueFormat(last)}</p>
        </div>
        <PriceChange value={+changePct.toFixed(2)} />
      </header>

      {/* Fixed-height box; override ChartContainer's aspect-video so the
          height prop is honoured (ResponsiveContainer fills this box). */}
      <div style={{ height }}>
        <EvilLineChart
          data={data}
          chartConfig={chartConfig}
          xDataKey="label"
          yDataKey={SERIES}
          curveType="monotone"
          hideLegend
          className="h-full w-full !aspect-auto"
          yAxisProps={{ tickFormatter: (v: number) => valueFormat(v) }}
        />
      </div>

      <div className="mt-3">
        <Lane
          options={ranges.map((r) => ({ value: r, label: r }))}
          value={range}
          onChange={onRangeChange}
        />
      </div>
    </section>
  );
}
