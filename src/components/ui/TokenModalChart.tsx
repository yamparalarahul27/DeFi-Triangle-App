"use client";

import { useId } from "react";
import {
  Area,
  AreaChart,
  ReferenceDot,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { Candle } from "./PriceChart";

export function TokenModalChart({
  candles,
  height,
}: {
  candles: Candle[];
  height: number;
}) {
  const gradientId = useId().replace(/:/g, "");

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

  const data = candles
    .map((candle) => ({
      time: candle.unixTime * 1000,
      price: candle.c,
    }))
    .filter(
      (point) => Number.isFinite(point.time) && Number.isFinite(point.price)
    );

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

  const prices = data.map((point) => point.price);
  const first = prices[0];
  const last = prices[prices.length - 1];
  const up = last >= first;
  const color = up ? "#0fa87a" : "#ef4444";

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const minIndex = prices.indexOf(min);
  const maxIndex = prices.indexOf(max);
  const minPoint = data[minIndex];
  const maxPoint = data[maxIndex];
  const lastPoint = data[data.length - 1];

  const span = max - min || 1;
  const yMin = min - span * 0.05;
  const yMax = max + span * 0.05;

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 6, right: 0, bottom: 0, left: 0 }}
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
            hide
          />
          <YAxis type="number" domain={[yMin, yMax]} hide />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
            activeDot={false}
          />
          <ReferenceDot
            x={maxPoint.time}
            y={maxPoint.price}
            r={3}
            fill="#0fa87a"
            stroke="none"
          />
          <ReferenceDot
            x={minPoint.time}
            y={minPoint.price}
            r={3}
            fill="#ef4444"
            stroke="none"
          />
          <ReferenceDot
            x={lastPoint.time}
            y={lastPoint.price}
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
