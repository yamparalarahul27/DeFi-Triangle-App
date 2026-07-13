"use client";

import { useEffect, useState } from "react";

// ── Theme Studio (step 2) — live token editing on the canvas. ────────────
// Reown-style master knobs: a few controls that retune the entire kit by
// writing raw tokens as inline overrides on <html> (inline custom
// properties win over any [data-theme] block, so this layers on top of
// the active theme). Export emits a recipe-compatible [data-theme] block
// (DESIGN.md → "Adding a theme").

const RADIUS_BASE = { control: 2, chip: 4, card: 8, sheet: 12 } as const;
const SPACE_BASE = [8, 16, 24, 32, 40, 48, 56, 64]; // --space-1..8
const TYPE_BASE = {
  "text-data-lg-size": 1.125,
  "text-data-lg-size-desktop": 1.875,
  "text-data-md-size": 0.875,
  "text-data-sm-size": 0.75,
} as const;

// WCAG relative luminance — decides whether on-brand text is dark or light.
const lum = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const ch = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * ch((n >> 16) & 255) + 0.7152 * ch((n >> 8) & 255) + 0.0722 * ch(n & 255)
  );
};
// Mix a hex toward white by t (0..1) — derives hover/bright/subtle from the accent.
const towardWhite = (hex: string, t: number) => {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * t);
  return (
    "#" +
    [(n >> 16) & 255, (n >> 8) & 255, n & 255]
      .map((c) => mix(c).toString(16).padStart(2, "0"))
      .join("")
  );
};

type Overrides = Record<string, string>;

function computeOverrides(accent: string | null, radius: number, space: number, type: number): Overrides {
  const o: Overrides = {};
  if (accent) {
    o["--brand"] = accent;
    o["--brand-hover"] = towardWhite(accent, 0.15);
    o["--brand-bright"] = towardWhite(accent, 0.35);
    o["--brand-subtle"] = towardWhite(accent, 0.6);
    o["--on-brand"] = lum(accent) > 0.35 ? "#0b0d10" : "#f8fbfa";
    o["--id-tide"] = accent; // the reserved "you" hue follows brand
  }
  if (radius !== 100) {
    for (const [k, v] of Object.entries(RADIUS_BASE))
      o[`--radius-${k}`] = `${Math.round(v * (radius / 100))}px`;
  }
  if (space !== 100) {
    SPACE_BASE.forEach((v, i) => {
      o[`--space-${i + 1}`] = `${Math.round(v * (space / 100))}px`;
    });
  }
  if (type !== 100) {
    for (const [k, v] of Object.entries(TYPE_BASE))
      o[`--${k}`] = `${((v * type) / 100).toFixed(4)}rem`;
  }
  return o;
}

function Knob({
  label,
  value,
  onChange,
  min = 50,
  max = 200,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between text-[11px] text-fg-muted">
        {label}
        <span className="font-mono tabular-nums text-fg-subtle">{value}%</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-[var(--brand)]"
      />
    </label>
  );
}

export function ThemeStudio({ onClose }: { onClose: () => void }) {
  const [accent, setAccent] = useState<string | null>(null);
  const [radius, setRadius] = useState(100);
  const [space, setSpace] = useState(100);
  const [type, setType] = useState(100);
  const [copied, setCopied] = useState(false);

  const overrides = computeOverrides(accent, radius, space, type);

  // Apply as inline custom properties on <html>; clear what's no longer set.
  useEffect(() => {
    const el = document.documentElement;
    const applied = new Set<string>();
    for (const [k, v] of Object.entries(overrides)) {
      el.style.setProperty(k, v);
      applied.add(k);
    }
    return () => {
      for (const k of applied) el.style.removeProperty(k);
    };
    // overrides is derived state; stringify keeps the effect honest.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(overrides)]);

  const reset = () => {
    setAccent(null);
    setRadius(100);
    setSpace(100);
    setType(100);
  };

  const exportBlock = () => {
    const lines = Object.entries(overrides)
      .map(([k, v]) => `  ${k}: ${v};`)
      .join("\n");
    const css = `/* Authored in the CIDS Theme Studio. To adopt: paste into\n   globals.css, rename, run npm run check:contrast, and add the\n   name to THEMES in ThemeToggle.tsx (DESIGN.md → Adding a theme). */\n[data-theme="custom"] {\n${lines}\n}\n`;
    navigator.clipboard.writeText(css).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const dirty = Object.keys(overrides).length > 0;

  return (
    <div className="pointer-events-auto w-64 rounded-sm border border-outline bg-surface-page/95 p-3 shadow-raised">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-xs font-semibold text-fg">
          theme studio
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close theme studio"
          className="inline-flex h-6 w-6 items-center justify-center rounded-control text-fg-muted hover:bg-surface-container-high hover:text-fg"
        >
          ×
        </button>
      </div>

      <div className="space-y-3">
        <label className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-fg-muted">Accent</span>
          <span className="flex items-center gap-2">
            {accent && (
              <code className="font-mono text-[10px] text-fg-subtle">{accent}</code>
            )}
            <input
              type="color"
              aria-label="Accent color"
              value={accent ?? "#5ad8c4"}
              onChange={(e) => setAccent(e.target.value)}
              className="h-7 w-9 cursor-pointer rounded-control border border-outline-variant bg-transparent"
            />
          </span>
        </label>
        <Knob label="Radius" value={radius} onChange={setRadius} min={0} />
        <Knob label="Spacing scale" value={space} onChange={setSpace} min={75} max={150} />
        <Knob label="Data type scale" value={type} onChange={setType} min={75} max={150} />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={exportBlock}
          disabled={!dirty}
          className="flex-1 rounded-control bg-brand px-2 py-1.5 font-mono text-[11px] font-semibold text-on-brand disabled:opacity-40"
        >
          {copied ? "copied ✓" : "export css"}
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={!dirty}
          className="rounded-control border border-outline-variant px-2 py-1.5 font-mono text-[11px] text-fg-muted hover:text-fg disabled:opacity-40"
        >
          reset
        </button>
      </div>

      <p className="mt-3 text-[10px] leading-relaxed text-fg-subtle">
        Live components restyle instantly (tokens). HTML mock frames are
        separate documents and won&apos;t follow.
      </p>
    </div>
  );
}
