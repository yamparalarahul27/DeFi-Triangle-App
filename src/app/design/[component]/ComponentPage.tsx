"use client";

// Client body for /design/<component> — the per-component read surface
// (roadmap §6 "The component page"). Renders the SAME .doc.md + .tsx
// the canvas Inspector uses (passed from the server page, read from
// disk) — pages cannot drift from source. The hero is the live canvas
// demo, so what you read is what runs.

import Link from "next/link";
import { useState } from "react";
import { DEMOS } from "../canvas/demos";
import { CopyButton, renderDoc } from "../docRenderer";
import { ThemeToggle } from "../ThemeToggle";

export function ComponentPage({
  name,
  doc,
  source,
  status,
  version,
  prev,
  next,
}: {
  name: string;
  doc: string;
  source: string;
  status: string;
  version: string;
  prev: string;
  next: string;
}) {
  const Demo = DEMOS[name];
  const [showCode, setShowCode] = useState(false);
  // Drop the doc's own H1/headers — the page chrome renders them.
  const body = doc
    .split("\n")
    .filter(
      (l, i) =>
        !(i < 6 && (l.startsWith("# ") || l.startsWith("Status:") || l.startsWith("Version:"))),
    )
    .join("\n");

  return (
    <div className="mx-auto min-h-dvh w-full max-w-2xl bg-surface-page px-5 py-8 text-fg">
      {/* header */}
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Link
            href="/design"
            className="font-mono text-[11px] text-fg-muted underline-offset-2 hover:underline"
          >
            ‹ components
          </Link>
          <h1 className="mt-1 font-mono text-xl font-bold">{name}</h1>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={
                status === "stable"
                  ? "rounded-chip bg-buy-surface px-1.5 py-0.5 text-[10px] font-medium text-buy"
                  : "rounded-chip bg-warning-surface px-1.5 py-0.5 text-[10px] font-medium text-warning"
              }
            >
              {status}
            </span>
            <span className="font-mono text-[11px] tabular-nums text-fg-subtle">
              v{version}
            </span>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* hero — the live demo */}
      {Demo && (
        <section className="mb-6 rounded-card border border-outline-variant bg-surface-container p-5">
          <Demo />
        </section>
      )}

      {/* the doc, rendered from disk */}
      <article className="space-y-2">{renderDoc(body)}</article>

      {/* code */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowCode((v) => !v)}
            aria-expanded={showCode}
            className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-subtle hover:text-fg"
          >
            {showCode ? "▾" : "▸"} source — {name}.tsx
          </button>
          <CopyButton text={source} />
        </div>
        {showCode && (
          <pre className="mt-2 overflow-x-auto rounded-sm border border-outline-variant bg-surface-dim p-3 font-mono text-[10px] leading-snug text-fg-muted">
            {source}
          </pre>
        )}
        <p className="mt-2 text-[10px] leading-relaxed text-fg-subtle">
          Self-contained: copy the folder into any Tailwind+React app, or{" "}
          <code className="text-brand">npx shadcn add @cids/…</code> — see the
          quickstart. Docs and page render the same file on disk.
        </p>
      </section>

      {/* footer nav */}
      <footer className="mt-10 flex items-center justify-between border-t border-outline-variant pt-4 font-mono text-[11px]">
        <Link href={`/design/${prev}`} className="text-fg-muted underline-offset-2 hover:underline">
          ‹ {prev}
        </Link>
        <Link href="/design/canvas" className="text-fg-muted underline-offset-2 hover:underline">
          open in canvas
        </Link>
        <Link href={`/design/${next}`} className="text-fg-muted underline-offset-2 hover:underline">
          {next} ›
        </Link>
      </footer>
    </div>
  );
}
