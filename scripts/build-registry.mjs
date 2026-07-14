#!/usr/bin/env node
// Builds the shadcn-compatible registry (cids-roadmap Phase 7) from
// src/design-system into public/r/*.json — the copy-in distribution
// model check:portable was built for. Adopters configure the @cids
// namespace and `npx shadcn add @cids/button`; cross-component imports
// become registryDependencies; folder-relative imports keep working
// because every item targets components/cids/<Name>/ side by side.
//
// Deterministic by construction: run `npm run build:registry` after any
// design-system change. check:registry fails CI if the output drifts
// from source (regenerate-and-diff).

import { mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DS = join(ROOT, "src/design-system");
const OUT = join(ROOT, "public/r");

const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

// ── shared items ─────────────────────────────────────────────────────
const identitySrc = readFileSync(join(DS, "identity.ts"), "utf8");
const tokensSrc = readFileSync(join(ROOT, "src/app/globals.css"), "utf8");

const items = [];

items.push({
  name: "identity",
  type: "registry:ui",
  title: "identity",
  description:
    "CIDS identity-hue helpers — deterministic per-wallet hue (hash % 8) + avatar gradient. Dependency of Avatar/AvatarGroup.",
  files: [
    {
      path: "cids/identity.ts",
      type: "registry:ui",
      target: "components/cids/identity.ts",
      content: identitySrc,
    },
  ],
});

items.push({
  name: "tokens",
  type: "registry:item",
  title: "tokens",
  description:
    "The CIDS token layer: surfaces/fg/brand/semantic/identity hues, spacing, z, elevation, motion, financial type ramp, 4 themes (dark/mono/light/violet) + the compact density axis. Import from your root layout AFTER tailwindcss.",
  files: [
    {
      path: "cids/cids-tokens.css",
      type: "registry:file",
      target: "app/cids-tokens.css",
      content:
        "/* CIDS tokens — generated from src/app/globals.css.\n" +
        "   Import in your root layout: `import \"./cids-tokens.css\";`\n" +
        "   (replaces the default globals; includes @import \"tailwindcss\") */\n" +
        tokensSrc,
    },
  ],
});

// ── component items ──────────────────────────────────────────────────
const folders = readdirSync(DS).filter((n) => {
  const p = join(DS, n);
  return statSync(p).isDirectory();
});

for (const name of folders) {
  const dir = join(DS, name);
  const files = readdirSync(dir).filter(
    (f) => !/\.test\.tsx?$/.test(f) && /\.(tsx?|md)$/.test(f) && f !== "index.ts",
  );
  const srcFiles = files.filter((f) => /\.tsx?$/.test(f));
  const doc = files.find((f) => f.endsWith(".doc.md"));

  const registryDependencies = new Set(["@cids/tokens"]);
  const dependencies = new Set();
  const outFiles = [];

  for (const f of srcFiles) {
    const content = readFileSync(join(dir, f), "utf8");
    if (/from "radix-ui"/.test(content)) dependencies.add("radix-ui");
    for (const m of content.matchAll(/from "\.\.\/([A-Za-z]+)"/g)) {
      registryDependencies.add(`@cids/${kebab(m[1])}`);
    }
    outFiles.push({
      path: `cids/${name}/${f}`,
      type: "registry:ui",
      target: `components/cids/${name}/${f}`,
      content,
    });
  }
  if (doc) {
    outFiles.push({
      path: `cids/${name}/${doc}`,
      type: "registry:file",
      target: `components/cids/${name}/${doc}`,
      content: readFileSync(join(dir, doc), "utf8"),
    });
  }

  const status =
    doc && /^Status: stable$/m.test(readFileSync(join(dir, doc), "utf8"))
      ? "stable"
      : "draft";

  items.push({
    name: kebab(name),
    type: "registry:ui",
    title: name,
    description: `CIDS ${name} (${status}) — docs ship with the code (${name}.doc.md).`,
    dependencies: [...dependencies],
    registryDependencies: [...registryDependencies],
    files: outFiles,
  });
}

// ── write ─────────────────────────────────────────────────────────────
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const SCHEMA = "https://ui.shadcn.com/schema/registry-item.json";
for (const item of items) {
  writeFileSync(
    join(OUT, `${item.name}.json`),
    JSON.stringify({ $schema: SCHEMA, ...item }, null, 2) + "\n",
  );
}
writeFileSync(
  join(OUT, "registry.json"),
  JSON.stringify(
    {
      $schema: "https://ui.shadcn.com/schema/registry.json",
      name: "cids",
      homepage: "https://github.com/yamparalarahul27/DeFi-Triangle-App",
      items: items.map(({ name, type, title, description }) => ({ name, type, title, description })),
    },
    null,
    2,
  ) + "\n",
);

console.log(`✓ build:registry — ${items.length} items → public/r/ (${folders.length} components + tokens + identity)`);
