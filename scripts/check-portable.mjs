#!/usr/bin/env node
// Portability guard for src/design-system — the property that makes the
// system vendorable (and eventually registry-distributable): a component
// folder must work when copied into any Tailwind+React app.
//
// Rule P1: design-system files may import ONLY
//   - react / react-dom
//   - radix-ui
//   - "@/lib/utils" (the shadcn-conventional cn helper)
//   - the design system itself (relative paths)
//   Anything else (app components, hooks, lib, other packages) fails.
//
// Rule P2: every component folder ships <Name>.tsx + <Name>.doc.md +
//   index.ts — "a component without its doc is not done" (CONVENTIONS.md),
//   enforced mechanically.
//
// Pure Node, no deps. Mirrors check-theme.mjs / check-contrast.mjs.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DS = join(ROOT, "src/design-system");

const ALLOWED = [
  /^react(-dom)?(\/|$)/,
  /^radix-ui(\/|$)/,
  /^@\/lib\/utils$/,
  /^\.\.?\//, // relative — inside the design system
];

const failures = [];

const entries = readdirSync(DS, { withFileTypes: true });

// P1 — import whitelist across every .ts/.tsx in the tree
function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.tsx?$/.test(e.name) && !/\.test\.tsx?$/.test(e.name)) {
      const src = readFileSync(p, "utf8");
      for (const m of src.matchAll(/from\s+"([^"]+)"/g)) {
        const spec = m[1];
        if (!ALLOWED.some((rx) => rx.test(spec))) {
          failures.push(
            `${relative(ROOT, p)}: forbidden import "${spec}" — design-system may only use react, radix-ui, @/lib/utils, or itself`,
          );
        }
      }
    }
  }
}
walk(DS);

// P2 — component-folder completeness + doc shape (CONVENTIONS.md sections)
const DOC_SECTIONS = ["## Usage", "## Anatomy", "## Props", "## Tokens", "## States", "## Motion", "## A11y"];
for (const e of entries) {
  if (!e.isDirectory()) continue;
  const name = e.name;
  const dir = join(DS, name);
  for (const required of [`${name}.tsx`, `${name}.doc.md`, "index.ts"]) {
    if (!existsSync(join(dir, required))) {
      failures.push(`src/design-system/${name}/: missing ${required}`);
    }
  }
  const docPath = join(dir, `${name}.doc.md`);
  if (existsSync(docPath)) {
    const doc = readFileSync(docPath, "utf8");
    for (const section of DOC_SECTIONS) {
      if (!doc.includes(section)) {
        failures.push(`src/design-system/${name}/${name}.doc.md: missing "${section}" section`);
      }
    }
  }
}

if (failures.length) {
  console.error("✗ check:portable failed:\n");
  for (const f of failures) console.error("  " + f);
  console.error(`\n${failures.length} failure(s).`);
  process.exit(1);
}

const count = entries.filter((e) => e.isDirectory()).length;
console.log(`✓ check:portable — ${count} components are self-contained (imports: react · radix-ui · @/lib/utils · self) and fully documented`);
