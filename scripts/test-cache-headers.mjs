#!/usr/bin/env node
/**
 * Asserts the Cache-Control header on each API route matches the policy
 * declared in src/lib/cacheControl.ts. Run against a local dev server.
 *
 *   npm run dev
 *   node scripts/test-cache-headers.mjs
 *
 * Exits non-zero if any assertion fails. Intended as a one-shot check, not
 * a continuous test runner.
 */

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
// Use a known-good Solana mint (Wrapped SOL) so success paths are exercised.
const SOL = "So11111111111111111111111111111111111111112";

// Mirror of CACHE constants in src/lib/cacheControl.ts (do not import — keep
// this script standalone & runnable with plain node).
const CACHE = {
  STATIC_LONG: "public, s-maxage=3600, stale-while-revalidate=86400",
  STATIC_MED: "public, s-maxage=300, stale-while-revalidate=1800",
  SEMI_STATIC: "public, s-maxage=60, stale-while-revalidate=300",
  VOLATILE: "public, s-maxage=15, stale-while-revalidate=60",
  NO_CACHE: "no-store",
};

const cases = [
  // Helius
  {
    label: "helius getAsset",
    url: `/api/helius?type=getAsset&address=${SOL}`,
    expected: CACHE.STATIC_LONG,
  },
  {
    label: "helius getAccountInfo",
    url: `/api/helius?type=getAccountInfo&address=${SOL}`,
    expected: CACHE.STATIC_MED,
  },
  {
    label: "helius getTokenSupply",
    url: `/api/helius?type=getTokenSupply&address=${SOL}`,
    expected: CACHE.SEMI_STATIC,
  },
  {
    label: "helius getSignaturesForAddress",
    url: `/api/helius?type=getSignaturesForAddress&address=${SOL}&limit=1`,
    expected: CACHE.STATIC_LONG,
  },
  {
    label: "helius invalid type",
    url: `/api/helius?type=bogus`,
    expected: CACHE.NO_CACHE,
  },
  // Jupiter
  {
    label: "jupiter tokenInfo",
    url: `/api/jupiter?type=tokenInfo&address=${SOL}`,
    expected: CACHE.STATIC_MED,
  },
  {
    label: "jupiter search",
    url: `/api/jupiter?type=search&q=${SOL}`,
    expected: CACHE.SEMI_STATIC,
  },
  {
    label: "jupiter home",
    url: `/api/jupiter?type=home`,
    expected: CACHE.VOLATILE,
  },
  {
    label: "jupiter quote (missing params -> 400 no-cache)",
    url: `/api/jupiter?type=quote`,
    expected: CACHE.NO_CACHE,
  },
  // Birdeye
  {
    label: "birdeye token",
    url: `/api/birdeye?type=token&address=${SOL}`,
    expected: CACHE.VOLATILE,
  },
  {
    label: "birdeye holders",
    url: `/api/birdeye?type=holders&address=${SOL}&limit=10`,
    expected: CACHE.STATIC_MED,
  },
  {
    label: "birdeye ohlcv",
    url: `/api/birdeye?type=ohlcv&address=${SOL}&interval=1H`,
    expected: CACHE.SEMI_STATIC,
  },
  {
    // Birdeye token_security requires a paid plan — local free-tier key returns
    // 401 + no-store. Either the success policy OR no-store is acceptable here;
    // the route's behavior is correct in both cases.
    label: "birdeye security",
    url: `/api/birdeye?type=security&address=${SOL}`,
    expected: CACHE.STATIC_MED,
    acceptAlso: CACHE.NO_CACHE,
  },
  {
    label: "birdeye trending",
    url: `/api/birdeye?type=trending&limit=20`,
    expected: CACHE.VOLATILE,
  },
  {
    label: "birdeye list_v3",
    url: `/api/birdeye?type=list_v3&limit=20`,
    expected: CACHE.VOLATILE,
  },
  {
    label: "birdeye search",
    url: `/api/birdeye?type=search&q=sol`,
    expected: CACHE.SEMI_STATIC,
  },
  {
    label: "birdeye invalid type",
    url: `/api/birdeye?type=bogus`,
    expected: CACHE.NO_CACHE,
  },
  // Tokens.xyz
  {
    label: "tokens-xyz asset",
    url: `/api/tokens-xyz?type=asset&assetId=${SOL}`,
    expected: CACHE.SEMI_STATIC,
  },
  {
    label: "tokens-xyz price-chart",
    url: `/api/tokens-xyz?type=price-chart&assetId=${SOL}&interval=1H`,
    expected: CACHE.SEMI_STATIC,
  },
];

let pass = 0;
let fail = 0;

for (const c of cases) {
  const url = `${BASE}${c.url}`;
  let actual;
  try {
    const res = await fetch(url);
    actual = res.headers.get("cache-control");
  } catch (err) {
    console.error(`✗ ${c.label} — network error: ${err.message}`);
    fail++;
    continue;
  }

  if (actual === c.expected || actual === c.acceptAlso) {
    const note =
      actual === c.acceptAlso ? " (matched acceptAlso — upstream failed)" : "";
    console.log(`✓ ${c.label}${note}`);
    pass++;
  } else {
    console.error(
      `✗ ${c.label}\n    expected: ${c.expected}\n    got:      ${actual}`
    );
    fail++;
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
