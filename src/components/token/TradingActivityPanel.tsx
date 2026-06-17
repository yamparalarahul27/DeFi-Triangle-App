"use client";

import { useMemo, useState } from "react";
import {
  computeHumanActivityScore,
  type HumanActivityResult,
} from "@/lib/token/humanActivityScore";
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

  const humanActivity = computeHumanActivityScore({
    uniqueWallets: active.uniqueWallets,
    jupiterNumBuys: active.jupiterNumBuys,
    numOrganicBuyers: active.numOrganicBuyers,
  });

  return (
    <section className="bg-surface-container rounded-sm border border-outline-variant p-4 sm:p-6 space-y-4">
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-[10px] uppercase tracking-wider text-fg-muted">
          Trading activity · Birdeye + Jupiter
        </div>
      </div>

      {humanActivity && (
        <HumanActivityHeader result={humanActivity} window={active.label} />
      )}

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
                  ? "bg-brand text-on-brand border-brand"
                  : "bg-surface-container text-fg border-outline-variant hover:bg-surface-page"
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

function HumanActivityHeader({
  result,
  window,
}: {
  result: HumanActivityResult;
  window: string;
}) {
  const tone = result.tone;
  const fillBar =
    tone === "safe"
      ? "bg-buy"
      : tone === "caution"
        ? "bg-warning"
        : "bg-sell";
  const gradeChip =
    tone === "safe"
      ? "bg-buy-surface text-buy border-buy"
      : tone === "caution"
        ? "bg-warning-surface text-warning-strong border-warning"
        : "bg-sell-surface text-sell-strong border-sell";

  return (
    <div className="rounded-sm border border-outline-variant bg-surface p-3 space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="text-[10px] uppercase tracking-wider text-fg-muted">
          Real-human activity · {window}
        </div>
        <div className="flex items-baseline gap-2 text-xs">
          <span
            className={`inline-flex items-center font-semibold text-[11px] px-2 py-0.5 rounded-sm border ${gradeChip}`}
          >
            Grade {result.grade}
          </span>
          <span className="font-mono text-fg text-base">
            {result.score} / 100
          </span>
          <span className="text-fg-muted">{result.label}</span>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
        <div
          className={`h-full ${fillBar} transition-[width] duration-300`}
          style={{
            width: `${Math.max(0, Math.min(100, result.score))}%`,
          }}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
        {result.hasUnique && (
          <SubBar
            label="Unique wallets"
            value={fmtCount(result.uniqueWallets)}
            ratio={result.uniqueNorm}
          />
        )}
        {result.hasOrganic && (
          <SubBar
            label="Organic %"
            value={`${(result.organicPct! * 100).toFixed(2)}%`}
            ratio={result.organicNorm}
          />
        )}
      </div>
    </div>
  );
}

function SubBar({
  label,
  value,
  ratio,
}: {
  label: string;
  value: string;
  ratio: number;
}) {
  const pct = Math.max(0, Math.min(100, ratio * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-fg-muted">{label}</span>
        <span className="font-mono text-fg">{value}</span>
      </div>
      <div className="h-1 rounded-full bg-surface-container-high overflow-hidden">
        <div
          className="h-full bg-brand transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
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
              <span className="text-fg-muted mx-1">/</span>
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
      <div className="text-xs text-fg-muted">No data for this window.</div>
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
      ? "text-buy"
      : tone === "risk"
        ? "text-sell"
        : "text-fg";

  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-wider text-fg-muted">
        {label}
        {hint ? (
          <span className="ml-1 text-fg-subtle normal-case">· {hint}</span>
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
