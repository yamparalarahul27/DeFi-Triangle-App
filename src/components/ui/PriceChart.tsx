"use client";

import { fmtUsd } from "@/lib/format";

export type Candle = {
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  unixTime: number;
};

export function PriceChart({
  candles,
  height = 120,
  showTooltip = false,
  showAxes = false,
}: {
  candles: Candle[];
  height?: number;
  showTooltip?: boolean;
  showAxes?: boolean;
}) {
  const closes = candles.map((c) => c.c).filter((n) => Number.isFinite(n));
  if (closes.length < 2) {
    return (
      <div
        className="flex items-center justify-center text-xs text-[#6B7280]"
        style={{ height }}
      >
        No chart data
      </div>
    );
  }

  const w = 1000;
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;
  const step = w / (closes.length - 1);

  const coords = closes.map((c, i) => ({
    x: i * step,
    y: height - ((c - min) / range) * height,
  }));

  const linePath = coords.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPath = `M0,${height} L${coords
    .map((p) => `${p.x},${p.y}`)
    .join(" L")} L${w},${height} Z`;

  const first = closes[0];
  const last = closes[closes.length - 1];
  const up = last >= first;
  const color = up ? "#0fa87a" : "#ef4444";
  const fillId = `chartFill-${up ? "up" : "down"}-${Math.random().toString(36).slice(2, 8)}`;

  const minIdx = closes.indexOf(min);
  const maxIdx = closes.indexOf(max);
  const maxPt = coords[maxIdx];
  const minPt = coords[minIdx];
  const lastPt = coords[coords.length - 1];

  return (
    <div className="relative w-full" style={{ height }}>
      <svg
        viewBox={`0 0 ${w} ${height}`}
        preserveAspectRatio="none"
        className="w-full h-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={fillId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${fillId})`} />
        <polyline
          points={linePath}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx={maxPt.x} cy={maxPt.y} r={4} fill="#0fa87a" />
        <circle cx={minPt.x} cy={minPt.y} r={4} fill="#ef4444" />
        <circle
          cx={lastPt.x}
          cy={lastPt.y}
          r={5}
          fill={color}
          stroke="#ffffff"
          strokeWidth={2}
        />
      </svg>
      {(showAxes || showTooltip) && (
        <div className="pointer-events-none absolute top-1 right-1 text-[10px] font-mono text-[#6B7280]">
          <div className="text-right">
            <span className="text-[#0fa87a]">High </span>
            <span className="text-[#11274d]">{fmtUsd(max)}</span>
          </div>
          <div className="text-right">
            <span className="text-[#ef4444]">Low </span>
            <span className="text-[#11274d]">{fmtUsd(min)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
