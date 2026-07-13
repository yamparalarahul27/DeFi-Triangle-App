import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Machine artifacts / local tooling (gitignored, not product code):
    ".agents/**",
    ".claude/**",
  ]),
  {
    // Dormant app engine (see CLAUDE.md "Dormant engine"): working but
    // unused since the CIDS pivot. Pre-existing violations are frozen
    // here so CI gates the LIVE system at zero errors; both rules stay
    // fully active for src/design-system and src/app/design. Remove
    // this block if/when the engine wakes (cids-roadmap Phase 0 note).
    files: [
      "src/lib/hooks/**",
      "src/components/providers/**",
      "src/app/api/**",
    ],
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
]);

export default eslintConfig;
