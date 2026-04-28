"use client";

import { Tooltip } from "@/components/ui/Tooltip";
import type { DivergenceResult } from "@/lib/token/priceDivergence";

export function PriceDivergenceChip({
  result,
}: {
  result: DivergenceResult | null;
}) {
  if (!result) return null;

  const dot =
    result.tone === "safe"
      ? "bg-[#0fa87a]"
      : result.tone === "caution"
        ? "bg-[#f59e0b]"
        : "bg-[#ef4444]";
  const text =
    result.tone === "safe"
      ? "text-[#0fa87a]"
      : result.tone === "caution"
        ? "text-[#b45309]"
        : "text-[#b91c1c]";

  return (
    <Tooltip content={<TooltipBody result={result} />} side="bottom">
      <span
        className={`inline-flex items-center gap-1.5 text-[11px] ${text} cursor-help`}
      >
        <span className={`inline-block w-1.5 h-1.5 rounded-full ${dot}`} />
        <span>{result.label}</span>
      </span>
    </Tooltip>
  );
}

function TooltipBody({ result }: { result: DivergenceResult }) {
  return (
    <div className="space-y-1.5">
      <div className="text-[10px] uppercase tracking-wider opacity-70 mb-1">
        Price sources
      </div>
      {result.sources.map((s) => (
        <div key={s.name} className="flex items-center justify-between gap-4">
          <span className="opacity-90">{s.name}</span>
          <span className="font-mono">{formatPrice(s.price)}</span>
        </div>
      ))}
      <div className="border-t border-white/15 mt-1 pt-1 flex items-center justify-between">
        <span className="opacity-70">Spread</span>
        <span className="font-mono">{result.spreadPct.toFixed(2)}%</span>
      </div>
    </div>
  );
}

function formatPrice(value: number): string {
  if (value >= 1) return `$${value.toFixed(2)}`;
  if (value >= 0.01) return `$${value.toFixed(4)}`;
  return `$${value.toPrecision(3)}`;
}
