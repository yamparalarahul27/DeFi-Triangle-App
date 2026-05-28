#!/usr/bin/env node
/**
 * NFT seed — thin wrapper around /api/nft/admin/seed
 *
 * Usage:
 *   node scripts/nft-seed.mjs                              # defaults to PERKs
 *   node scripts/nft-seed.mjs <collection-mint>            # any collection
 *   NFT_SEED_API_URL=https://prod.example.com/api/nft/admin/seed \
 *     node scripts/nft-seed.mjs <collection-mint>          # against prod
 *
 * Reads SEED_TOKEN from .env.local.
 *
 * Requires the dev server to be running (npm run dev) for the default
 * localhost target, or a deployed API for the prod target.
 */
import { readFileSync } from "node:fs";

const COLLECTION =
  process.argv[2] ?? "5XSXoWkcmynUSiwoi7XByRDiV9eomTgZQywgWrpYzKZ8"; // IslandDAO PERKS
const API_URL =
  process.env.NFT_SEED_API_URL ??
  "http://localhost:3001/api/nft/admin/seed";

function loadEnvVar(key) {
  try {
    const env = readFileSync(".env.local", "utf-8");
    const match = env.match(new RegExp(`^${key}=(.+)$`, "m"));
    if (!match) {
      throw new Error(
        `${key} missing from .env.local — generate one with:\n  openssl rand -base64 32`
      );
    }
    return match[1].trim().replace(/^["']|["']$/g, "");
  } catch (err) {
    if (err.code === "ENOENT") {
      throw new Error(".env.local not found in cwd");
    }
    throw err;
  }
}

async function main() {
  console.log("════════════════════════════════════════════════════════════");
  console.log(`  NFT seed`);
  console.log(`  Collection:  ${COLLECTION}`);
  console.log(`  API:         ${API_URL}`);
  console.log("════════════════════════════════════════════════════════════\n");

  const token = loadEnvVar("SEED_TOKEN");

  const url = new URL(API_URL);
  url.searchParams.set("collection", COLLECTION);

  console.log("Triggering seed (may take ~30-60s for a fresh collection)…\n");
  const t0 = Date.now();

  const res = await fetch(url, {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
  });

  const text = await res.text();
  const dur = Date.now() - t0;

  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = { raw: text };
  }

  console.log(`Response: HTTP ${res.status} in ${(dur / 1000).toFixed(1)}s`);
  console.log(JSON.stringify(body, null, 2));

  if (!res.ok) process.exit(1);
}

main().catch((err) => {
  console.error("\n❌ Seed failed:", err.message);
  process.exit(1);
});
