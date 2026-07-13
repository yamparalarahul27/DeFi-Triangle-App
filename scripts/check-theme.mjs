#!/usr/bin/env node
// Static guard for the dark token layer (Fey/market-dark theme).
// Asserts colors flow through semantic tokens in globals.css instead of
// hardcoded Tailwind hex classes — so the 600+ hex debt we removed can't
// silently creep back. Pure Node, no deps. Mirrors check-polish.mjs.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SRC = join(ROOT, "src");
const EVILCHARTS = join(SRC, "components/evilcharts"); // vendored, exempt

const failures = [];
const fail = (file, msg) => failures.push({ file: relative(ROOT, file), msg });

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (p.startsWith(EVILCHARTS)) continue;
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (/\.tsx?$/.test(name)) acc.push(p);
  }
  return acc;
}

// Rule T1: no hardcoded hex in Tailwind utility classes (bg-[#..], text-[#..], …).
// Inline `style={{ ... }}` gradients on standalone branded pages (404 / global-error /
// OG image) are allowed — they aren't theme surfaces and use the style attribute, not
// utility classes. This regex only matches the `prefix-[#hex]` class form.
const HEX_CLASS =
  /\b(?:bg|text|border|ring|ring-offset|from|via|to|fill|stroke|divide|placeholder|caret|accent|outline|decoration|shadow)-\[#[0-9a-fA-F]{3,8}\]/;

for (const f of walk(SRC)) {
  const src = readFileSync(f, "utf8");
  const lines = src.split("\n");
  lines.forEach((line, i) => {
    const m = line.match(HEX_CLASS);
    if (m) fail(f, `hardcoded hex class "${m[0]}" at line ${i + 1} — use a semantic token`);
  });
  // Rule T2: filled brand surfaces must use dark on-brand text, not white.
  if (/bg-brand\s+text-white|text-white\s+bg-brand/.test(src)) {
    fail(f, "filled brand button uses text-white — use text-on-brand (mint needs dark text)");
  }
}

// Rule T3: the core token layer must exist in globals.css @theme.
const GLOBALS = join(SRC, "app/globals.css");
const globals = readFileSync(GLOBALS, "utf8");
const REQUIRED = [
  "--color-surface-page",
  "--color-surface-container",
  "--color-fg",
  "--color-fg-muted",
  "--color-fg-subtle",
  "--color-brand",
  "--color-on-brand",
  "--color-buy",
  "--color-sell",
  "--color-warning",
  // Phase-1 foundations (cids-roadmap §5): every category tokenized.
  "--color-error-surface",
  "--color-success-surface",
  "--space-1",
  "--space-8",
  "--z-raised",
  "--z-modal",
  "--shadow-card",
  "--shadow-raised",
  "--shadow-overlay",
  "--glow-brand",
  "--duration-fast",
  "--ease-settle",
  "--ease-spring",
  "--text-data-lg",
  "--text-data-md",
  "--text-data-sm",
  "--font-pixel",
  "--row-h",
  "--cell-px",
];
for (const tok of REQUIRED) {
  if (!globals.includes(tok)) fail(GLOBALS, `missing token ${tok} in @theme`);
}

// Rule T4 (Phase-1 gate): inside the design system and the design app,
// elevation and stacking must flow through tokens — no Tailwind default
// shadow utilities, no numeric z-index utilities, no literal box-shadow
// values. Use shadow-card/raised/overlay/glow-brand* and z-[var(--z-*)].
const TOKENED_DIRS = [join(SRC, "design-system"), join(SRC, "app/design")];
const RAW_SHADOW = /\bshadow-(sm|md|lg|xl|2xl)\b/;
const RAW_Z = /\bz-(10|20|30|40|50)\b/;
const RAW_BOXSHADOW = /boxShadow:\s*["'`][^"'`]*rgba?\(/;
for (const dir of TOKENED_DIRS) {
  for (const f of walk(dir)) {
    if (/\.test\.tsx?$/.test(f)) continue;
    const src = readFileSync(f, "utf8");
    let m;
    if ((m = src.match(RAW_SHADOW)))
      fail(f, `raw Tailwind shadow "${m[0]}" — use shadow-card/raised/overlay (elevation tokens)`);
    if ((m = src.match(RAW_Z)))
      fail(f, `raw z-index "${m[0]}" — use z-[var(--z-*)] (stacking tokens)`);
    if ((m = src.match(RAW_BOXSHADOW)))
      fail(f, `literal boxShadow value — use an elevation/glow token`);
  }
}

if (failures.length === 0) {
  console.log("✓ theme-check passed");
  process.exit(0);
}
console.error("✗ theme-check failed:\n");
for (const { file, msg } of failures) console.error(`  ${file}: ${msg}`);
console.error(`\n${failures.length} violation(s).`);
process.exit(1);
