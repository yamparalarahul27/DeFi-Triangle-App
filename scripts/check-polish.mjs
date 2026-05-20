#!/usr/bin/env node
// Path-C static guard for the make-interfaces-feel-better polish layer.
// Greps key files for the rules we baked in so accidental rollbacks fail CI/local
// before they ship. Pure Node, no deps.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const COMPONENTS = join(ROOT, "src/components");
const EVILCHARTS = join(COMPONENTS, "evilcharts");

const failures = [];
function fail(file, rule) {
  failures.push({ file: relative(ROOT, file), rule });
}

function read(p) {
  return readFileSync(p, "utf8");
}

function expect(file, src, pattern, rule) {
  const found = pattern instanceof RegExp ? pattern.test(src) : src.includes(pattern);
  if (!found) fail(file, `missing: ${rule}`);
}

function refute(file, src, pattern, rule) {
  const found = pattern instanceof RegExp ? pattern.test(src) : src.includes(pattern);
  if (found) fail(file, `forbidden: ${rule}`);
}

// Rule G1: no `transition-all` anywhere under src/components except evilcharts/.
function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (p.startsWith(EVILCHARTS)) continue;
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (/\.(tsx?|css)$/.test(name)) acc.push(p);
  }
  return acc;
}

for (const f of walk(COMPONENTS)) {
  const src = read(f);
  if (/\btransition-all\b/.test(src)) fail(f, "forbidden: transition-all (use targeted properties)");
}

// File-specific rules
const checks = [
  {
    file: "src/components/tabs/TabShell.tsx",
    expect: [
      [/min-h-\[40px\]/, "tab pill min-h-[40px]"],
      [/transition-\[background-color,color,box-shadow,transform\]/, "targeted transition"],
      [/active:scale-\[0\.96\]/, "scale(.96) press"],
      [/0_12px_24px_rgba\(25,84,155,0\.10\)/, "layered shadow"],
    ],
  },
  {
    file: "src/components/layout/TabsRow.tsx",
    expect: [
      [/min-h-\[40px\]/, "tab pill min-h-[40px]"],
      [/transition-\[background-color,color,box-shadow,transform\]/, "targeted transition"],
      [/active:scale-\[0\.96\]/, "scale(.96) press"],
      [/0_12px_24px_rgba\(25,84,155,0\.10\)/, "layered shadow"],
    ],
  },
  {
    file: "src/components/token/VariantsSection.tsx",
    expect: [
      [/min-h-\[40px\]/, "pill min-h-[40px]"],
      [/active:scale-\[0\.96\]/, "scale(.96) press"],
    ],
  },
  {
    file: "src/components/token/PriceChartSection.tsx",
    expect: [
      [/min-h-\[40px\]/, "pill min-h-[40px]"],
      [/active:scale-\[0\.96\]/, "scale(.96) press"],
    ],
  },
  {
    file: "src/components/ui/DexCard.tsx",
    expect: [
      [/rounded-\[14px\]/, "concentric outer radius rounded-[14px]"],
      [/transition-\[border-color,box-shadow,transform\]/, "targeted transition"],
      [/active:scale-\[0\.98\]/, "card scale(.98) press"],
    ],
    refute: [
      [/rounded-\[10px\]/, "old card radius rounded-[10px]"],
    ],
  },
  {
    file: "src/components/home/StableCard.tsx",
    expect: [
      [/rounded-\[14px\]/, "concentric outer radius rounded-[14px]"],
      [/transition-\[border-color,box-shadow,transform\]/, "targeted transition on CARD_BASE"],
      [/active:scale-\[0\.98\]/, "card scale(.98) press"],
    ],
    refute: [
      [/rounded-\[10px\]/, "old card radius rounded-[10px]"],
    ],
  },
  {
    file: "src/components/home/ParkYourMoneyRail.tsx",
    expect: [
      [/\[text-wrap:balance\]/, "h2 text-wrap:balance"],
      [/\[text-wrap:pretty\]/, "p text-wrap:pretty"],
      [/rounded-\[14px\]/, "skeleton matches StableCard radius"],
    ],
    refute: [
      [/rounded-\[10px\]/, "old skeleton radius rounded-[10px]"],
    ],
  },
  {
    file: "src/components/token/AboutSection.tsx",
    expect: [
      [/\[text-wrap:pretty\]/, "description text-wrap:pretty"],
    ],
  },
  {
    file: "src/components/token/MetaStrip.tsx",
    expect: [
      [/before:absolute before:inset-\[-14px\] before:content-\['']/, "info dot 40x40 hit-area extension"],
    ],
  },
];

for (const c of checks) {
  const p = join(ROOT, c.file);
  let src;
  try { src = read(p); } catch { fail(p, `file not found`); continue; }
  for (const [pat, rule] of c.expect ?? []) expect(p, src, pat, rule);
  for (const [pat, rule] of c.refute ?? []) refute(p, src, pat, rule);
}

if (failures.length > 0) {
  console.error("✗ polish-check failed:\n");
  for (const { file, rule } of failures) console.error(`  ${file}: ${rule}`);
  console.error(`\n${failures.length} violation(s).`);
  process.exit(1);
}
console.log("✓ polish-check passed");
