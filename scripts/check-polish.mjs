#!/usr/bin/env node
// Path-C static guard for the make-interfaces-feel-better polish layer.
// Greps key files for the rules we baked in so accidental rollbacks fail CI/local
// before they ship. Pure Node, no deps.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const COMPONENTS = join(ROOT, "src/components");
const DESIGN_SYSTEM = join(ROOT, "src/design-system");
const DESIGN_APP = join(ROOT, "src/app/design");
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

for (const root of [COMPONENTS, DESIGN_SYSTEM, DESIGN_APP]) {
  for (const f of walk(root)) {
    const src = read(f);
    if (/\btransition-all\b/.test(src)) fail(f, "forbidden: transition-all (use targeted properties)");
  }
}

// File-specific rules — current design-system invariants (the previous
// list guarded app components deleted in the clean-shell pass).
const checks = [
  {
    file: "src/design-system/ReactionBar/ReactionBar.tsx",
    expect: [
      [/h-11/, "reaction pill 44px hit area (h-11)"],
      [/active:scale-\[0\.96\]/, "press scale(.96)"],
      [/animate-pop/, "spring-pop on tap"],
    ],
  },
  {
    file: "src/design-system/FollowButton/FollowButton.tsx",
    expect: [
      [/var\(--motion-settle\)/, "fill->outline morph on --motion-settle"],
      [/active:scale-\[0\.96\]/, "press scale(.96)"],
    ],
  },
  {
    file: "src/design-system/Lane/Lane.tsx",
    expect: [
      [/var\(--motion-fast\)/, "segment transition on --motion-fast"],
      [/var\(--glow-brand\)/, "glow via the --glow-brand token (brand-derived in globals)"],
    ],
  },
  {
    file: "src/design-system/Sheet/Sheet.tsx",
    expect: [
      [/var\(--motion-settle\)/, "drag spring-back on --motion-settle"],
      [/env\(safe-area-inset-bottom\)/, "footer safe-area padding"],
    ],
  },
  {
    file: "src/design-system/Button/Button.tsx",
    expect: [
      [/active:scale-\[0\.96\]/, "press scale(.96)"],
      [/transition-\[background-color,color,box-shadow,transform\]/, "targeted transition (never transition-all)"],
    ],
  },
  {
    file: "src/design-system/IconButton/IconButton.tsx",
    expect: [
      [/active:scale-\[0\.96\]/, "press scale(.96)"],
      [/"aria-label": string/, "aria-label required in the props type"],
    ],
  },
  {
    file: "src/design-system/Tabs/Tabs.tsx",
    expect: [
      [/var\(--motion-fast\)/, "segment transition on --motion-fast"],
      [/var\(--glow-brand\)/, "active glow via the --glow-brand token"],
    ],
  },
  {
    file: "src/design-system/TokenChip/TokenChip.tsx",
    expect: [
      [/Math\.abs\(change24h\)/, "magnitude via Math.abs (sign discipline)"],
      [/change24h >= 0/, "direction from the signed value"],
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

// Rule G2 (coverage): every component folder under src/design-system must
// either carry specific polish assertions above, or be listed here as a
// conscious "no interaction polish to pin" decision. A new component that
// is in neither place fails — polish coverage can't be skipped silently.
const NO_SPECIFIC_RULES = new Set([
  "Avatar", // static disc — no interaction states
  "AvatarGroup", // static composition of Avatar
  "TokenIcon", // static image w/ initials fallback
  "SocialProofChip", // static text chip
  "PostCard", // composes covered parts (ReactionBar, TokenChip)
  "CommentThread", // draft — assertions land with its stable promotion
  "Onboarding", // draft — assertions land with its stable promotion
  "Skeleton", // static shimmer; reduced-motion via the global reset
  "Tooltip", // behavior is Radix Tooltip/Dialog; motion via data-[state] presets
  "Badge", // static label — no interaction states
  "Input", // border transition only; focus ring is the global :focus-visible
  "Dialog", // behavior + motion via Radix data-[state] presets
  "Menu", // behavior via Radix DropdownMenu; instant highlight by design
  "Switch", // track/thumb 150ms targeted; behavior via Radix
  "Checkbox", // fill/border 150ms targeted; behavior via Radix
  "Select", // Radix Select; panel fade via presets
  "Toast", // Radix Toast presets; viewport only
  "Divider", // static rule
  "EmptyState", // static composition; action carries interaction
]);
const covered = new Set(
  checks.map((c) => c.file.split("/")[2]) // src/design-system/<Name>/…
);
for (const name of readdirSync(DESIGN_SYSTEM)) {
  const p = join(DESIGN_SYSTEM, name);
  if (!statSync(p).isDirectory()) continue;
  if (!covered.has(name) && !NO_SPECIFIC_RULES.has(name)) {
    fail(
      p,
      "uncovered: add polish assertions to scripts/check-polish.mjs (or list it in NO_SPECIFIC_RULES with a reason)"
    );
  }
}

if (failures.length > 0) {
  console.error("✗ polish-check failed:\n");
  for (const { file, rule } of failures) console.error(`  ${file}: ${rule}`);
  console.error(`\n${failures.length} violation(s).`);
  process.exit(1);
}
console.log("✓ polish-check passed");
