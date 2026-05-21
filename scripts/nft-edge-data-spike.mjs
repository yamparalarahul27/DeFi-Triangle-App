#!/usr/bin/env node
/**
 * NFT Edge data spike — Helius DAS feasibility check
 *
 * Probes the IslandDAO PERKS collection to confirm we can get the data
 * the prototype assumes. Writes a brief findings line per UI element.
 *
 * Run:  node scripts/nft-edge-data-spike.mjs
 * Reads HELIUS_API_KEY from .env.local
 */
import { readFileSync } from "node:fs";

const COLLECTION = "5XSXoWkcmynUSiwoi7XByRDiV9eomTgZQywgWrpYzKZ8";

function loadApiKey() {
  const env = readFileSync(".env.local", "utf-8");
  const match = env.match(/^HELIUS_API_KEY=(.+)$/m);
  if (!match) throw new Error("HELIUS_API_KEY missing from .env.local");
  return match[1].trim().replace(/^["']|["']$/g, "");
}

async function rpc(method, params) {
  const key = loadApiKey();
  const res = await fetch(`https://mainnet.helius-rpc.com/?api-key=${key}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: "spike", method, params }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON response: ${text.slice(0, 200)}`);
  }
}

function check(label, fn) {
  try {
    const got = fn();
    if (got !== undefined && got !== null && got !== "") {
      console.log(`    ✅  ${label.padEnd(28)}  ${String(got).slice(0, 60)}`);
      return true;
    }
    console.log(`    ❌  ${label.padEnd(28)}  (empty/missing)`);
    return false;
  } catch (err) {
    console.log(`    ❌  ${label.padEnd(28)}  (threw: ${err.message})`);
    return false;
  }
}

async function main() {
  console.log("════════════════════════════════════════════════════════════");
  console.log("  NFT Edge data spike — Helius DAS");
  console.log("  Collection:", COLLECTION);
  console.log("════════════════════════════════════════════════════════════\n");

  /* ──────────────────────────────────────────────────────────
     1. searchAssets — page 1 of the collection
     ────────────────────────────────────────────────────────── */
  console.log("─── 1. searchAssets by collection (limit 5) ───");
  const t1 = Date.now();
  const search = await rpc("searchAssets", {
    grouping: ["collection", COLLECTION],
    page: 1,
    limit: 5,
  });
  const t1Dur = Date.now() - t1;
  console.log(`  duration:           ${t1Dur}ms`);

  if (search.error) {
    console.log(`  ❌ ERROR: ${JSON.stringify(search.error)}`);
    process.exit(1);
  }

  const total = search.result?.total ?? "?";
  const items = search.result?.items ?? [];
  console.log(`  total in collection: ${total}`);
  console.log(`  returned this page:  ${items.length}`);

  if (items.length === 0) {
    console.log("  ❌ no items returned — cannot continue spike");
    process.exit(1);
  }

  const first = items[0];
  console.log("\n  ─── prototype data fields available on a single item ───\n");
  check("name",             () => first.content?.metadata?.name);
  check("image URL",        () => first.content?.links?.image);
  check("description",      () => first.content?.metadata?.description?.slice(0, 50) + "…");
  check("symbol / # id",    () => first.content?.metadata?.name);
  check("traits (count)",   () => `${(first.content?.metadata?.attributes ?? []).length} attributes`);
  check("owner wallet",     () => first.ownership?.owner);
  check("royalty %",        () => `${first.royalty?.percent}` + (first.royalty?.basis_points ? ` (${first.royalty.basis_points} bps)` : ""));
  check("asset id",         () => first.id);
  check("collection id",    () => {
    const g = first.grouping?.find((x) => x.group_key === "collection");
    return g?.group_value;
  });
  check("metadata URL",     () => first.content?.json_uri);
  check("interface type",   () => first.interface);  // V1_NFT / MplCoreAsset / etc.
  check("plugins present",  () => {
    if (first.plugins && Object.keys(first.plugins).length > 0) {
      return `keys: ${Object.keys(first.plugins).join(", ")}`;
    }
    return null;
  });
  check("mpl_core_info",    () => first.mpl_core_info ? JSON.stringify(first.mpl_core_info).slice(0, 50) + "…" : null);

  if ((first.content?.metadata?.attributes ?? []).length > 0) {
    console.log("\n  ─── sample traits on first item ───");
    first.content.metadata.attributes.slice(0, 6).forEach((t) => {
      console.log(`    • ${(t.trait_type ?? "?").padEnd(20)}  ${t.value}`);
    });
  }

  /* ──────────────────────────────────────────────────────────
     2. getAsset — full shape for one item
     ────────────────────────────────────────────────────────── */
  console.log("\n─── 2. getAsset (full shape) for first item ───");
  const t2 = Date.now();
  const single = await rpc("getAsset", { id: first.id });
  console.log(`  duration:           ${Date.now() - t2}ms`);
  const r = single.result || {};
  console.log(`  top-level keys:     ${Object.keys(r).join(", ")}`);
  if (r.content) console.log(`  content.* keys:     ${Object.keys(r.content).join(", ")}`);
  if (r.ownership) console.log(`  ownership.* keys:   ${Object.keys(r.ownership).join(", ")}`);
  if (r.plugins) console.log(`  plugins.* keys:     ${Object.keys(r.plugins).join(", ")}`);

  /* ──────────────────────────────────────────────────────────
     3. getAssetsByOwner — does this answer "Other Owned in Collection"?
     ────────────────────────────────────────────────────────── */
  const owner = first.ownership?.owner;
  if (!owner) {
    console.log("\n  ⚠️ no owner on first item — skipping owner check");
  } else {
    console.log(`\n─── 3. getAssetsByOwner for ${owner.slice(0, 4)}…${owner.slice(-4)} ───`);
    const t3 = Date.now();
    const owned = await rpc("getAssetsByOwner", {
      ownerAddress: owner,
      page: 1,
      limit: 100,
    });
    console.log(`  duration:           ${Date.now() - t3}ms`);
    const ownedTotal = owned.result?.total ?? "?";
    const ownedItems = owned.result?.items ?? [];
    console.log(`  owner total assets: ${ownedTotal}`);
    console.log(`  returned this page: ${ownedItems.length}`);

    const inThisCollection = ownedItems.filter((it) =>
      it.grouping?.some(
        (g) => g.group_key === "collection" && g.group_value === COLLECTION
      )
    );
    console.log(`  of which in PERKS:  ${inThisCollection.length}`);
    if (inThisCollection.length > 1) {
      console.log("\n  ─── sample additional PERKS this owner has ───");
      inThisCollection.slice(1, 5).forEach((it) => {
        console.log(`    • ${(it.content?.metadata?.name ?? "?").padEnd(20)}  ${it.id.slice(0, 8)}…`);
      });
    }
  }

  /* ──────────────────────────────────────────────────────────
     4. Try a bigger searchAssets page — can we cheaply load the
        whole collection for the bottom rail?
     ────────────────────────────────────────────────────────── */
  console.log("\n─── 4. searchAssets (page 1, limit 100) — for the rail ───");
  const t4 = Date.now();
  const big = await rpc("searchAssets", {
    grouping: ["collection", COLLECTION],
    page: 1,
    limit: 100,
  });
  console.log(`  duration:           ${Date.now() - t4}ms`);
  console.log(`  returned this page: ${(big.result?.items ?? []).length}`);
  const bigTotal = big.result?.total ?? 0;
  if (bigTotal > 100) {
    console.log(`  total collection:   ${bigTotal} → would need ${Math.ceil(bigTotal / 100)} paginated calls`);
  }

  console.log("\n════════════════════════════════════════════════════════════");
  console.log("  ✓ Spike complete");
  console.log("════════════════════════════════════════════════════════════");
}

main().catch((err) => {
  console.error("\n❌ Spike failed:", err.message);
  process.exit(1);
});
