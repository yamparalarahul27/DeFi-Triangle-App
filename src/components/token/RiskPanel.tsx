"use client";

import type { RiskComponent, RiskData } from "@/lib/tokens-xyz-types";

export function RiskPanel({ risk }: { risk: RiskData }) {
  const ms = risk.marketScore;
  const tone = ms.tone;
  const toneBar =
    tone === "safe"
      ? "bg-buy"
      : tone === "caution"
        ? "bg-warning"
        : "bg-sell";

  const components: [string, RiskComponent | undefined][] = [
    ["Liquidity health", ms.components.liquidityHealth],
    ["Holder distribution", ms.components.holderDistribution],
    ["Trading activity", ms.components.tradingActivity],
    ["Holder count", ms.components.holderCount],
  ];

  return (
    <section className="bg-surface-container rounded-sm border border-outline-variant p-4 sm:p-6 space-y-4">
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
          <div className="text-[10px] uppercase tracking-wider text-fg-muted">
            Risk score · Tokens.xyz
          </div>
          <div className="text-xs">
            <span className="font-mono text-fg text-base">
              {ms.score} / 100
            </span>{" "}
            <span className="text-fg-muted">
              Grade {ms.grade} · {ms.label}
            </span>
          </div>
        </div>
        <div className="h-1.5 rounded-full bg-surface-page overflow-hidden">
          <div
            className={`h-full ${toneBar} transition-[width] duration-300`}
            style={{
              width: `${Math.max(0, Math.min(100, ms.score))}%`,
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {components.map(([label, c]) => (
          <ComponentBar key={label} label={label} component={c} />
        ))}
      </div>

      {ms.borderlineSignals?.length > 0 && (
        <div className="space-y-1">
          {ms.borderlineSignals.map((s, i) => (
            <div
              key={i}
              className="text-[11px] text-warning-strong bg-warning-surface border border-warning rounded-sm px-2 py-1"
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ComponentBar({
  label,
  component,
}: {
  label: string;
  component?: RiskComponent;
}) {
  if (!component || !component.hasData) {
    return (
      <div className="flex items-center gap-3 text-xs">
        <span className="text-fg w-44 shrink-0">{label}</span>
        <div className="flex-1 h-1.5 rounded-full bg-surface-page" />
        <span className="font-mono text-fg-muted w-10 text-right">—</span>
      </div>
    );
  }
  const color =
    component.status === "safe"
      ? "bg-buy"
      : component.status === "caution"
        ? "bg-warning"
        : "bg-sell";

  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="text-fg w-44 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-surface-page overflow-hidden">
        <div
          className={`h-full ${color} transition-[width] duration-300`}
          style={{
            width: `${Math.max(0, Math.min(100, component.score))}%`,
          }}
        />
      </div>
      <span className="font-mono text-fg w-10 text-right">
        {component.score}
      </span>
    </div>
  );
}
