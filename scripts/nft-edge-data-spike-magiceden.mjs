#!/usr/bin/env node
/**
 * NFT Edge data spike — Magic Eden feasibility check
 *
 * Counterpart to scripts/nft-edge-data-spike.mjs (which probes Helius DAS).
 * Probes Magic Eden's public Solana API against the IslandDAO PERKS
 * collection to confirm the market-data layer (rarity, floor, listings,
 * royalty) is reachable without auth and within rate limits.
 *
 * Run:  node scripts/nft-edge-data-spike-magiceden.mjs
 * No env vars needed — ME's read endpoints are public.
 */

const COLLECTION_MINT = "5XSXoWkcmynUSiwoi7XByRDiV9eomTgZQywgWrpYzKZ8";
const SAMPLE_ASSET_ID = "JEAQKuW58vr6qWJuka3TjjhKJnZhXSR5fFdc2UXbAaLM"; // from DAS spike
const ME_BASE = "https://api-mainnet.magiceden.dev/v2";

async function fetchMe(path) {
  const url = `${ME_BASE}${path}`;
  const t0 = Date.now();
  const res = await fetch(url);
  const dur = Date.now() - t0;
  const rateLimit = {
    limit: res.headers.get("x-ratelimit-limit"),
    remaining: res.headers.get("x-ratelimit-remaining"),
    reset: res.headers.get("x-ratelimit-reset"),
  };
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* leave as text */
  }
  return { status: res.status, dur, rateLimit, json, text };
}

function logRateLimit(rl) {
  if (rl.limit) {
    console.log(
      `    rate-limit:        ${rl.remaining}/${rl.limit} remaining (reset @ ${rl.reset})`
    );
  }
}

async function main() {
  console.log("════════════════════════════════════════════════════════════");
  console.log("  NFT Edge data spike — Magic Eden");
  console.log("  Collection mint:", COLLECTION_MINT);
  console.log("════════════════════════════════════════════════════════════\n");

  /* ──────────────────────────────────────────────────────────
     1. Slug discovery via /tokens/{mint}
     ────────────────────────────────────────────────────────── */
  console.log("─── 1. /tokens/{mint} — discover collection slug ───");
  const single = await fetchMe(`/tokens/${SAMPLE_ASSET_ID}`);
  console.log(`  duration:          ${single.dur}ms  status: ${single.status}`);
  logRateLimit(single.rateLimit);

  if (single.status !== 200 || !single.json) {
    console.log("  ❌ failed — cannot continue without the slug");
    process.exit(1);
  }

  const slug = single.json.collection;
  console.log(`  collection slug:   ${slug}`);
  console.log(`  collectionName:    ${single.json.collectionName}`);
  console.log(`  name:              ${single.json.name}`);
  console.log(`  royalty (bps):     ${single.json.sellerFeeBasisPoints}`);
  console.log(`  isCompressed:      ${single.json.isCompressed}`);
  console.log(`  listStatus:        ${single.json.listStatus}`);
  console.log(`  attributes:        ${(single.json.attributes ?? []).length} traits`);
  console.log(`  image:             ${(single.json.image ?? "").slice(0, 60)}…`);

  if (single.json.updateAuthority !== COLLECTION_MINT) {
    console.log(
      `  ⚠️  updateAuthority (${single.json.updateAuthority.slice(0, 8)}…) ` +
        `does NOT match collection mint (${COLLECTION_MINT.slice(0, 8)}…) — investigate`
    );
  }

  /* ──────────────────────────────────────────────────────────
     2. Collection stats — floor, listed, volume
     ────────────────────────────────────────────────────────── */
  console.log("\n─── 2. /collections/{slug}/stats ───");
  const stats = await fetchMe(`/collections/${slug}/stats`);
  console.log(`  duration:          ${stats.dur}ms  status: ${stats.status}`);
  logRateLimit(stats.rateLimit);

  if (stats.status === 200 && stats.json) {
    console.log(`  floorPrice:        ${stats.json.floorPrice} lamports (${(stats.json.floorPrice / 1e9).toFixed(2)} SOL)`);
    console.log(`  listedCount:       ${stats.json.listedCount}`);
    console.log(`  volumeAll:         ${stats.json.volumeAll} lamports (${(stats.json.volumeAll / 1e9).toFixed(0)} SOL)`);
  } else {
    console.log(`  ❌ ${stats.text.slice(0, 200)}`);
  }

  /* ──────────────────────────────────────────────────────────
     3. Trait rarity — THE big win
     ────────────────────────────────────────────────────────── */
  console.log("\n─── 3. /collections/{slug}/attributes — trait rarity ───");
  const attrs = await fetchMe(`/collections/${slug}/attributes`);
  console.log(`  duration:          ${attrs.dur}ms  status: ${attrs.status}`);
  logRateLimit(attrs.rateLimit);

  if (attrs.status === 200 && attrs.json) {
    const list = attrs.json?.results?.availableAttributes ?? [];
    console.log(`  trait combos:      ${list.length}`);
    if (list.length > 0) {
      console.log("\n  ─── sample (first 5) ───");
      list.slice(0, 5).forEach((a) => {
        const t = a.attribute;
        const floor = a.floor ? `${(a.floor / 1e9).toFixed(2)} SOL` : "n/a";
        console.log(
          `    • ${(t?.trait_type ?? "?").padEnd(15)} ${(t?.value ?? "?").padEnd(15)} ` +
            `count=${String(a.count).padStart(4)}  floor=${floor}`
        );
      });
    }
  } else {
    console.log(`  ❌ ${attrs.text.slice(0, 200)}`);
  }

  /* ──────────────────────────────────────────────────────────
     4. Owner's NFTs (for the "Other Owned" panel)
     ────────────────────────────────────────────────────────── */
  const owner = single.json.owner;
  if (owner) {
    console.log(`\n─── 4. /wallets/${owner.slice(0, 4)}…${owner.slice(-4)}/tokens ───`);
    const wallet = await fetchMe(`/wallets/${owner}/tokens?limit=10`);
    console.log(`  duration:          ${wallet.dur}ms  status: ${wallet.status}`);
    logRateLimit(wallet.rateLimit);
    if (wallet.status === 200 && Array.isArray(wallet.json)) {
      console.log(`  returned this page: ${wallet.json.length}`);
      const inCollection = wallet.json.filter((t) => t.collection === slug);
      console.log(`  of which in ${slug}: ${inCollection.length}`);
    } else {
      console.log(`  ⚠️  unexpected response shape or status`);
    }
  }

  console.log("\n════════════════════════════════════════════════════════════");
  console.log("  ✓ ME spike complete");
  console.log("════════════════════════════════════════════════════════════");
}

main().catch((err) => {
  console.error("\n❌ Spike failed:", err.message);
  process.exit(1);
});
