"use client";

import NumberFlow from "@number-flow/react";
import { useState } from "react";
import { SCORE } from "@/lib/numberFormats";
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
    <section className="bg-surface-container rounded-sm border border-outline-variant p-4 sm:p-6 space-y-4">
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
          <div className="text-[10px] uppercase tracking-wider text-fg-muted">
            Edge Score · DeFi Triangle composite
          </div>
          <div className="text-xs flex items-baseline gap-2">
            <span
              className={`inline-flex items-center font-semibold text-[11px] px-2 py-0.5 rounded-sm border ${gradeChip}`}
            >
              Grade {result.grade}
            </span>
            <span className="font-mono text-fg text-base tabular-nums">
              <NumberFlow value={result.score} format={SCORE} /> / 100
            </span>
            <span className="text-fg-muted">{result.label}</span>
          </div>
        </div>
        <div className="h-1.5 rounded-full bg-surface-page overflow-hidden">
          <div
            className={`h-full ${toneBar} transition-[width] duration-300`}
            style={{
              width: `${Math.max(0, Math.min(100, result.score))}%`,
            }}
          />
        </div>
        <div className="text-[11px] text-fg-muted mt-2 leading-snug">
          {TOOLTIP_NOTE}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="text-xs text-brand hover:text-brand-hover transition-colors"
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
      <div className="text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex-1 min-w-0 text-fg">{entry.name}</span>
          <SourceChip source={entry.source} />
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="flex-1 min-w-0 text-[10px] text-fg-muted">
            No data
          </span>
          <div className="w-20 h-1 rounded-full bg-surface-page shrink-0" />
          <span className="font-mono text-[10px] text-fg-muted text-right tabular-nums shrink-0 w-[60px]">
            —
          </span>
        </div>
      </div>
    );
  }

  const ratio = entry.weight > 0 ? entry.contribution / entry.weight : 0;
  const fillColor =
    ratio >= 0.75
      ? "bg-buy"
      : ratio >= 0.4
        ? "bg-warning"
        : "bg-sell";

  return (
    <div className="text-xs">
      <div className="flex items-center gap-2 min-w-0">
        <span className="flex-1 min-w-0 text-fg">{entry.name}</span>
        <SourceChip source={entry.source} />
      </div>
      <div className="mt-1 flex items-center gap-2">
        <span className="flex-1 min-w-0 font-mono text-[10px] text-fg tabular-nums truncate">
          {entry.value}
        </span>
        <div className="w-20 h-1 rounded-full bg-surface-page overflow-hidden shrink-0">
          <div
            className={`h-full ${fillColor}`}
            style={{ width: `${Math.max(0, Math.min(100, ratio * 100))}%` }}
          />
        </div>
        <span className="font-mono text-[10px] text-fg-muted text-right tabular-nums shrink-0 w-[60px]">
          +<NumberFlow value={entry.contribution} format={SCORE} /> /{" "}
          {entry.weight}
        </span>
      </div>
    </div>
  );
}

function SourceChip({ source }: { source: BreakdownEntry["source"] }) {
  return (
    <span className="text-[9px] uppercase tracking-wider px-1 py-0.5 rounded-sm bg-surface-page text-fg-muted border border-outline-variant shrink-0">
      {source}
    </span>
  );
}
