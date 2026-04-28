"use client";

import { useMemo, useState } from "react";
import type { MultiWindowData, WindowMetrics } from "@/lib/token/tradingActivity";

const DEFAULT_WINDOW = "24h";

export function TradingActivityPanel({
  data,
}: {
  data: MultiWindowData | null;
}) {
  const initialKey = useMemo(() => {
    if (!data) return null;
    const fromDefault = data.windows.find((w) => w.key === DEFAULT_WINDOW);
    return (fromDefault ?? data.windows[data.windows.length - 1])?.key ?? null;
  }, [data]);

  const [activeKey, setActiveKey] = useState<string | null>(initialKey);
  const effectiveKey = activeKey ?? initialKey;

  if (!data || !effectiveKey) return null;
  const active =
    data.windows.find((w) => w.key === effectiveKey) ?? data.windows[0];

  return (
    <section className="bg-white rounded-sm border border-[#cbd5e1] p-4 sm:p-6 space-y-4">
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-[10px] uppercase tracking-wider text-[#6a7282]">
          Trading activity · Birdeye + Jupiter
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {data.windows.map((w) => {
          const isActive = w.key === effectiveKey;
          return (
            <button
              key={w.key}
              type="button"
              onClick={() => setActiveKey(w.key)}
              className={`text-[11px] font-mono px-2 py-1 rounded-sm border transition-colors ${
                isActive
                  ? "bg-[#19549b] text-white border-[#19549b]"
                  : "bg-white text-[#11274d] border-[#cbd5e1] hover:bg-[#f1f5f9]"
              }`}
            >
              {w.label}
            </button>
          );
        })}
      </div>

      <Cells metrics={active} />
    </section>
  );
}

function Cells({ metrics }: { metrics: WindowMetrics }) {
  const cells: Array<{ key: string; node: React.ReactNode }> = [];

  if (metrics.volumeUsd != null) {
    cells.push({
      key: "volume",
      node: (
        <Stat
          label="Volume"
          value={fmtUsd(metrics.volumeUsd)}
          hint="Birdeye"
        />
      ),
    });
  }

  if (metrics.pctChange != null) {
    const up = metrics.pctChange >= 0;
    cells.push({
      key: "pct",
      node: (
        <Stat
          label="Price change"
          value={`${up ? "+" : ""}${metrics.pctChange.toFixed(2)}%`}
          tone={up ? "safe" : "risk"}
          hint="Birdeye"
        />
      ),
    });
  }

  if (metrics.buys != null || metrics.sells != null) {
    cells.push({
      key: "buys",
      node: (
        <Stat
          label="Buys / Sells"
          value={
            <span className="font-mono">
              {fmtCount(metrics.buys)}
              <span className="text-[#6a7282] mx-1">/</span>
              {fmtCount(metrics.sells)}
            </span>
          }
          hint={metrics.buys != null && metrics.sells != null ? "Birdeye" : "Jupiter"}
        />
      ),
    });
  }

  if (metrics.uniqueWallets != null) {
    cells.push({
      key: "unique",
      node: (
        <Stat
          label="Unique wallets"
          value={fmtCount(metrics.uniqueWallets)}
          hint="Birdeye"
        />
      ),
    });
  }

  if (metrics.numNetBuyers != null) {
    cells.push({
      key: "netbuyers",
      node: (
        <Stat
          label="Net buyers"
          value={fmtCount(metrics.numNetBuyers)}
          hint="Jupiter"
        />
      ),
    });
  }

  if (metrics.numOrganicBuyers != null) {
    cells.push({
      key: "organic",
      node: (
        <Stat
          label="Organic buyers"
          value={fmtCount(metrics.numOrganicBuyers)}
          hint="Jupiter"
        />
      ),
    });
  }

  if (metrics.organicVolumeUsd != null) {
    cells.push({
      key: "organicVol",
      node: (
        <Stat
          label="Organic volume"
          value={fmtUsd(metrics.organicVolumeUsd)}
          hint="Jupiter"
        />
      ),
    });
  }

  if (cells.length === 0) {
    return (
      <div className="text-xs text-[#6a7282]">No data for this window.</div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-3">
      {cells.map((c) => (
        <div key={c.key}>{c.node}</div>
      ))}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  tone?: "safe" | "risk";
  hint?: string;
}) {
  const valueClass =
    tone === "safe"
      ? "text-[#0fa87a]"
      : tone === "risk"
        ? "text-[#ef4444]"
        : "text-[#11274d]";

  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-wider text-[#6a7282]">
        {label}
        {hint ? (
          <span className="ml-1 text-[#cbd5e1] normal-case">· {hint}</span>
        ) : null}
      </div>
      <div className={`font-mono text-sm ${valueClass}`}>{value}</div>
    </div>
  );
}

function fmtUsd(value: number): string {
  if (!Number.isFinite(value) || value < 0) return "—";
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

function fmtCount(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return "—";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}
