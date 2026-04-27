"use client";

import {
  Area,
  AreaChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Candle } from "@/components/ui/PriceChart";
import { fmtUsd } from "@/lib/format";

const UP_COLOR = "#0fa87a";
const DOWN_COLOR = "#ef4444";

function formatTickTime(ms: number, rangeLabel: string): string {
  const d = new Date(ms);
  if (rangeLabel === "1D") {
    return d.toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  if (rangeLabel === "1W") {
    return d.toLocaleString("en-US", {
      weekday: "short",
      hour: "numeric",
    });
  }
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatTooltipTime(ms: number, rangeLabel: string): string {
  const d = new Date(ms);
  if (rangeLabel === "1D") {
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }
  if (rangeLabel === "1W" || rangeLabel === "1M") {
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatPriceTick(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  return `$${n.toFixed(4)}`;
}

export function RechartsPriceChart({
  candles,
  height,
  rangeLabel,
}: {
  candles: Candle[];
  height: number;
  rangeLabel: string;
}) {
  if (candles.length < 2) {
    return (
      <div
        className="flex items-center justify-center text-xs text-[#6B7280]"
        style={{ height }}
      >
        No chart data
      </div>
    );
  }

  const data = candles.map((c) => ({
    time: c.unixTime * 1000,
    price: c.c,
  }));

  const prices = data.map((d) => d.price);
  const first = prices[0];
  const last = prices[prices.length - 1];
  const up = last >= first;
  const color = up ? UP_COLOR : DOWN_COLOR;

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const minIdx = prices.indexOf(min);
  const maxIdx = prices.indexOf(max);
  const minPt = data[minIdx];
  const maxPt = data[maxIdx];
  const lastPt = data[data.length - 1];

  const range = max - min || 1;
  const yMin = min - range * 0.05;
  const yMax = max + range * 0.05;

  const gradientId = up ? "solPriceFillUp" : "solPriceFillDown";

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 12, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(v: number) => formatTickTime(v, rangeLabel)}
            tick={{ fill: "#6a7282", fontSize: 10 }}
            tickMargin={8}
            axisLine={false}
            tickLine={false}
            minTickGap={48}
          />
          <YAxis
            type="number"
            domain={[yMin, yMax]}
            tickFormatter={formatPriceTick}
            tick={{ fill: "#6a7282", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip
            cursor={{
              stroke: "#11274d",
              strokeOpacity: 0.2,
              strokeWidth: 1,
            }}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #cbd5e1",
              borderRadius: 2,
              fontSize: 12,
              padding: "6px 10px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
            labelStyle={{ color: "#6a7282", fontSize: 10 }}
            itemStyle={{ color: "#11274d", fontFamily: "var(--font-geist-mono)" }}
            labelFormatter={(v) => formatTooltipTime(v as number, rangeLabel)}
            formatter={(value) => [fmtUsd(Number(value)), "Price"]}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
            activeDot={{
              r: 4,
              fill: color,
              stroke: "#ffffff",
              strokeWidth: 2,
            }}
          />
          <ReferenceDot
            x={maxPt.time}
            y={maxPt.price}
            r={3}
            fill={UP_COLOR}
            stroke="none"
          />
          <ReferenceDot
            x={minPt.time}
            y={minPt.price}
            r={3}
            fill={DOWN_COLOR}
            stroke="none"
          />
          <ReferenceDot
            x={lastPt.time}
            y={lastPt.price}
            r={5}
            fill={color}
            stroke="#ffffff"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
