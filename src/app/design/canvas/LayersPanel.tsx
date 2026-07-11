"use client";

import { cn } from "@/lib/utils";
import { CANVAS_ITEMS, type CanvasItemDef } from "./items";

// Group the flat registry into zones: each label opens a group that
// collects the demo/iframe items after it (registry is authored in order).
type Zone = { label: string; items: Extract<CanvasItemDef, { kind: "demo" | "iframe" }>[] };

function buildZones(): Zone[] {
  const zones: Zone[] = [];
  for (const item of CANVAS_ITEMS) {
    if (item.kind === "label") zones.push({ label: item.title, items: [] });
    else zones.at(-1)?.items.push(item);
  }
  return zones;
}

const ZONES = buildZones();

const KIND_GLYPH = { demo: "◇", iframe: "▣" } as const;

export function LayersPanel({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="pointer-events-auto flex max-h-[calc(100dvh-96px)] w-56 flex-col overflow-y-auto rounded-sm border border-outline bg-surface-page/95 py-2">
      <div className="px-3 pb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-subtle">
        Layers
      </div>
      {ZONES.map((zone) => (
        <div key={zone.label} className="mb-1.5">
          <div className="truncate px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-fg-subtle">
            {zone.label}
          </div>
          {zone.items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-1.5 text-left font-mono text-xs",
                selected === item.id
                  ? "bg-brand/10 text-brand"
                  : "text-fg-muted hover:bg-surface-container hover:text-fg",
              )}
              style={{ transition: "background-color var(--motion-fast), color var(--motion-fast)" }}
            >
              <span aria-hidden="true" className="text-[10px] opacity-70">
                {KIND_GLYPH[item.kind]}
              </span>
              <span className="truncate">{item.title}</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
