"use client";

import { useState } from "react";
import { CANVAS_ITEMS } from "./items";
import { CopyButton, renderDoc } from "../docRenderer";

// ── panel ─────────────────────────────────────────────────────────────

export function Inspector({
  selected,
  docs,
  sources,
  onClose,
}: {
  selected: string;
  docs: Record<string, string>;
  sources: Record<string, string>;
  onClose: () => void;
}) {
  const item = CANVAS_ITEMS.find((x) => x.id === selected);
  const doc = docs[selected];
  const source = sources[selected];
  const [tab, setTab] = useState<"doc" | "code">("doc");

  return (
    <div className="pointer-events-auto flex max-h-[calc(100dvh-96px)] w-80 flex-col rounded-sm border border-outline bg-surface-page/95">
      <div className="flex flex-none items-center justify-between border-b border-outline-variant px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-subtle">
            Inspect
          </span>
          {doc && source && (
            <div className="flex gap-0.5 rounded-sm border border-outline-variant bg-surface-container p-0.5">
              {(["doc", "code"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  aria-pressed={tab === t}
                  className={
                    tab === t
                      ? "rounded-sm bg-brand px-2 py-0.5 font-mono text-[9px] text-on-brand"
                      : "rounded-sm px-2 py-0.5 font-mono text-[9px] text-fg-muted"
                  }
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close inspector"
          className="inline-flex h-6 w-6 items-center justify-center rounded-sm text-fg-muted hover:bg-surface-container-high hover:text-fg"
        >
          ×
        </button>
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {doc && source && tab === "code" ? (
          <>
            <div className="flex items-center justify-between">
              <code className="font-mono text-[10px] text-fg-subtle">
                src/design-system/{selected}/{selected}.tsx
              </code>
              <CopyButton text={source} />
            </div>
            <pre className="overflow-x-auto rounded-sm border border-outline-variant bg-surface-dim p-2 font-mono text-[10px] leading-snug text-fg-muted">
              {source}
            </pre>
            <p className="text-[10px] leading-relaxed text-fg-subtle">
              Self-contained: copy this folder into any Tailwind+React app
              (needs the cids tokens in globals.css + the `cn` helper).
            </p>
          </>
        ) : doc ? (
          renderDoc(doc)
        ) : item?.kind === "iframe" ? (
          <>
            <h2 className="font-mono text-sm font-bold text-fg">{item.title}</h2>
            <p className="text-xs leading-relaxed text-fg-muted">
              Embedded page frame (<code className="text-brand">{item.src}</code>),{" "}
              {item.w}×{item.h}. Rendered same-origin; static in the canvas.
            </p>
          </>
        ) : (
          <>
            <h2 className="font-mono text-sm font-bold text-fg">{item?.title ?? selected}</h2>
            <p className="text-xs leading-relaxed text-fg-muted">
              Foundation swatch — values live in <code className="text-brand">globals.css</code>{" "}
              and are documented in DESIGN.md. Component docs appear here when a
              component is selected.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
