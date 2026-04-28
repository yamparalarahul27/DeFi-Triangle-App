"use client";

import { useState } from "react";
import type { BreakdownEntry, EdgeScoreResult } from "@/lib/token/edgeScore";

const TOOLTIP_NOTE =
  "Edge Score is a DeFi Triangle composite that fuses on-chain truth (Helius), Jupiter's audit, and Tokens.xyz's risk inputs. Every contributing signal is shown below with its raw value and source.";

export function EdgeScorePanel({ result }: { result: EdgeScoreResult | null }) {
  const [expanded, setExpanded] = useState(false);
  if (!result) return null;
  if (!result.hasEnoughSignals && result.signalCount === 0) return null;

  const tone = result.tone;
  const toneBar =
    tone === "safe"
      ? "bg-[#0fa87a]"
      : tone === "caution"
        ? "bg-[#f59e0b]"
        : "bg-[#ef4444]";
  const gradeChip =
    tone === "safe"
      ? "bg-[#ecfdf5] text-[#0fa87a] border-[#a7f3d0]"
      : tone === "caution"
        ? "bg-[#fffbeb] text-[#b45309] border-[#fde68a]"
        : "bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]";

  return (
    <section className="bg-white rounded-sm border border-[#cbd5e1] p-4 sm:p-6 space-y-4">
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
          <div className="text-[10px] uppercase tracking-wider text-[#6a7282]">
            Edge Score · DeFi Triangle composite
          </div>
          <div className="text-xs flex items-baseline gap-2">
            <span
              className={`inline-flex items-center font-semibold text-[11px] px-2 py-0.5 rounded-sm border ${gradeChip}`}
            >
              Grade {result.grade}
            </span>
            <span className="font-mono text-[#11274d] text-base">
              {result.score} / 100
            </span>
            <span className="text-[#6a7282]">{result.label}</span>
          </div>
        </div>
        <div className="h-1.5 rounded-full bg-[#f1f5f9] overflow-hidden">
          <div
            className={`h-full ${toneBar} transition-[width] duration-300`}
            style={{
              width: `${Math.max(0, Math.min(100, result.score))}%`,
            }}
          />
        </div>
        <div className="text-[11px] text-[#6a7282] mt-2 leading-snug">
          {TOOLTIP_NOTE}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="text-xs text-[#19549b] hover:text-[#143f78] transition-colors"
      >
        {expanded ? "Hide" : "Show"} breakdown ({result.signalCount} signals)
      </button>

      {expanded && (
        <div className="space-y-2 pt-2">
          {result.breakdown.map((entry) => (
            <BreakdownRow key={entry.name} entry={entry} />
          ))}
        </div>
      )}
    </section>
  );
}

function BreakdownRow({ entry }: { entry: BreakdownEntry }) {
  if (!entry.hasData) {
    return (
      <div className="grid grid-cols-[1fr_auto_auto_60px] items-center gap-2 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[#11274d] truncate">{entry.name}</span>
          <SourceChip source={entry.source} />
        </div>
        <span className="text-[10px] text-[#6a7282]">No data</span>
        <div className="flex-1 h-1 rounded-full bg-[#f1f5f9]" />
        <span className="font-mono text-[10px] text-[#6a7282] text-right">
          —
        </span>
      </div>
    );
  }

  const ratio = entry.weight > 0 ? entry.contribution / entry.weight : 0;
  const fillColor =
    ratio >= 0.75
      ? "bg-[#0fa87a]"
      : ratio >= 0.4
        ? "bg-[#f59e0b]"
        : "bg-[#ef4444]";

  return (
    <div className="grid grid-cols-[1fr_auto_auto_60px] items-center gap-2 text-xs">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[#11274d] truncate">{entry.name}</span>
        <SourceChip source={entry.source} />
      </div>
      <span className="font-mono text-[10px] text-[#11274d] text-right tabular-nums">
        {entry.value}
      </span>
      <div className="w-20 h-1 rounded-full bg-[#f1f5f9] overflow-hidden">
        <div
          className={`h-full ${fillColor}`}
          style={{ width: `${Math.max(0, Math.min(100, ratio * 100))}%` }}
        />
      </div>
      <span className="font-mono text-[10px] text-[#6a7282] text-right tabular-nums">
        +{entry.contribution.toFixed(0)} / {entry.weight}
      </span>
    </div>
  );
}

function SourceChip({ source }: { source: BreakdownEntry["source"] }) {
  return (
    <span className="text-[9px] uppercase tracking-wider px-1 py-0.5 rounded-sm bg-[#f1f5f9] text-[#6a7282] border border-[#cbd5e1] shrink-0">
      {source}
    </span>
  );
}
