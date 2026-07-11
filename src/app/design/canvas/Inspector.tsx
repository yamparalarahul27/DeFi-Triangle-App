"use client";

import { useState, type ReactNode } from "react";
import { CANVAS_ITEMS } from "./items";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        });
      }}
      className="rounded-sm border border-outline-variant bg-surface-container px-1.5 py-0.5 font-mono text-[9px] text-fg-muted hover:text-fg"
    >
      {copied ? "copied" : "copy"}
    </button>
  );
}

// ── constrained renderer for the CONVENTIONS.md doc shape ────────────
// Our .doc.md files are uniform (headings, tables, fenced ASCII anatomy,
// lists, inline code/bold), so a tiny purpose-built renderer beats a
// markdown dependency. Unknown constructs fall back to plain paragraphs.

function inline(text: string, key: number): ReactNode {
  // split on `code` and **bold** spans
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean);
  return (
    <span key={key}>
      {parts.map((p, i) => {
        if (p.startsWith("`"))
          return (
            <code key={i} className="rounded-sm bg-surface-container px-1 text-[11px] text-brand">
              {p.slice(1, -1)}
            </code>
          );
        if (p.startsWith("**"))
          return (
            <strong key={i} className="font-semibold text-fg">
              {p.slice(2, -2)}
            </strong>
          );
        return p;
      })}
    </span>
  );
}

function TokenChipRow({ line, k }: { line: string; k: number }) {
  // decorate token mentions with a live swatch (resolves in current theme)
  const tokens = [...line.matchAll(/--([a-z-]+)/g)].map((m) => m[1]);
  const colorish = tokens.filter((t) => !t.startsWith("motion-"));
  return (
    <li key={k} className="flex items-start gap-1.5 text-xs leading-relaxed text-fg-muted">
      {colorish.length > 0 && (
        <span
          aria-hidden="true"
          className="mt-1 h-3 w-3 flex-none rounded-[2px] border border-outline-variant"
          style={{ background: `var(--${colorish[0]})` }}
        />
      )}
      <span className="min-w-0">{inline(line.replace(/^- /, ""), k)}</span>
    </li>
  );
}

function renderDoc(md: string): ReactNode[] {
  const out: ReactNode[] = [];
  const lines = md.split("\n");
  let i = 0;
  let key = 0;
  let inTokens = false;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) buf.push(lines[i++]);
      i++; // closing fence
      const code = buf.join("\n");
      out.push(
        <div key={key++} className="relative">
          <div className="absolute right-1 top-1"><CopyButton text={code} /></div>
          <pre className="overflow-x-auto rounded-sm border border-outline-variant bg-surface-dim p-2 font-mono text-[10px] leading-snug text-fg-muted">
            {code}
          </pre>
        </div>,
      );
      continue;
    }

    if (line.startsWith("| ")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        const cells = lines[i].split("|").slice(1, -1).map((c) => c.trim());
        if (!cells.every((c) => /^-+$/.test(c))) rows.push(cells);
        i++;
      }
      const [head, ...body] = rows;
      out.push(
        <div key={key++} className="overflow-x-auto">
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr>
                {head.map((c, ci) => (
                  <th key={ci} className="border-b border-outline-variant py-1 pr-2 font-mono font-medium text-fg-subtle">
                    {inline(c, ci)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((r, ri) => (
                <tr key={ri}>
                  {r.map((c, ci) => (
                    <td key={ci} className="border-b border-outline-variant/50 py-1 pr-2 align-top text-fg-muted">
                      {inline(c, ci)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    if (line.startsWith("## ")) {
      inTokens = line.slice(3).trim().toLowerCase() === "tokens";
      out.push(
        <h3 key={key++} className="mt-4 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-subtle">
          {line.slice(3)}
        </h3>,
      );
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      out.push(
        <h2 key={key++} className="font-mono text-sm font-bold text-fg">
          {line.slice(2)}
        </h2>,
      );
      i++;
      continue;
    }

    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) items.push(lines[i++]);
      out.push(
        <ul key={key++} className="space-y-1">
          {items.map((it, ii) =>
            inTokens ? (
              <TokenChipRow key={ii} line={it} k={ii} />
            ) : (
              <li key={ii} className="text-xs leading-relaxed text-fg-muted">
                {inline(it.replace(/^- /, "· "), ii)}
              </li>
            ),
          )}
        </ul>,
      );
      continue;
    }

    if (line.trim() !== "" && !line.startsWith("---")) {
      out.push(
        <p key={key++} className="text-xs leading-relaxed text-fg-muted">
          {inline(line, key)}
        </p>,
      );
    }
    i++;
  }
  return out;
}

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
