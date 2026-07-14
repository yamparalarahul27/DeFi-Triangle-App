#!/usr/bin/env node
// Registry freshness guard (Phase 7): regenerates public/r/ and fails
// if the committed output differs from the design-system source — the
// registry cannot drift from the code it distributes. Mirrors the
// other check-*.mjs guards (pure Node + git).

import { execSync } from "node:child_process";

execSync("node scripts/build-registry.mjs", { stdio: "inherit" });
try {
  execSync("git diff --quiet -- public/r", { stdio: "inherit" });
  execSync("git ls-files --others --exclude-standard --error-unmatch public/r > /dev/null 2>&1 && exit 1 || exit 0", {
    shell: "/bin/bash",
    stdio: "inherit",
  });
  console.log("✓ check:registry — public/r is in sync with src/design-system");
} catch {
  console.error(
    "✗ check:registry — registry drifted from source. Run `npm run build:registry` and commit public/r.",
  );
  process.exit(1);
}
