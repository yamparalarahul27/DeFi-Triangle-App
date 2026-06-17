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
];
for (const tok of REQUIRED) {
  if (!globals.includes(tok)) fail(GLOBALS, `missing token ${tok} in @theme`);
}

if (failures.length === 0) {
  console.log("✓ theme-check passed");
  process.exit(0);
}
console.error("✗ theme-check failed:\n");
for (const { file, msg } of failures) console.error(`  ${file}: ${msg}`);
console.error(`\n${failures.length} violation(s).`);
process.exit(1);
