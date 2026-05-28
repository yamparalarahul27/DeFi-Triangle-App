---
title: NFT Edge — data feasibility spike + V1 build spec
status: scoped (ready to build)
captured: 2026-05-20
updated: 2026-05-21
collection: 5XSXoWkcmynUSiwoi7XByRDiV9eomTgZQywgWrpYzKZ8 (IslandDAO PERKS)
scripts:
  - scripts/nft-edge-data-spike.mjs            # Helius DAS probe
  - scripts/nft-edge-data-spike-magiceden.mjs  # Magic Eden probe
---

# NFT Edge — data spike + V1 build spec

This doc started as a feasibility check ("can we get the data?") and ended as the V1 build spec ("here's how we'll get and cache it"). Run either spike script to reproduce the live probes; everything below is the conclusion.

## Final decision (2026-05-21)

V1 will be **cache-first**, **single-collection** (IslandDAO PERKS), seeded via a Vercel Cron job plus a manual admin endpoint. Data flows: Helius DAS gives us the full asset list (paginated, written into Supabase as the immutable cache), Magic Eden gives us the rich market layer on top (rarity counts, floor prices, listing status, royalty, slug discovery). The browser only ever hits our own `/api/nft/*` routes — never DAS or ME directly.

Tensor was evaluated and parked. Their docs gate API access behind a form submission with no published criteria or timeline. Magic Eden delivered everything Tensor would have given us, with a public no-auth surface and documented rate limits. See "Tensor evaluation" section near the bottom for why we walked away.

## TL;DR

Helius DAS responded sub-second on every call, no 429s, no flakiness. Magic Eden returned rich market data (rarity counts, per-trait floor, listed counts, correct royalty) for our specific collection on a public endpoint. The only data field truly unavailable is the owner's Discord handle, which isn't on-chain and would require IslandDAO's own profile service — dropped from v1 cleanly.

This is a far healthier data path than the Jupiter rate-limited disaster captured in [perf-data-fetching.md](./perf-data-fetching.md).

## Performance numbers

| Call | Params | Duration |
|---|---|---|
| `searchAssets` (collection) | limit 5 | 859ms |
| `getAsset` (single) | by id | 221ms |
| `getAssetsByOwner` | limit 100 | 848ms |
| `searchAssets` (rail page) | limit 100 | 347ms |

Compare to `/api/jupiter` returning 500s in 5s+ from Jupiter free-tier 429s. DAS is in a different league.

## Field-by-field availability for the prototype

<details>
<summary><b>Fully available — green path</b></summary>

| Prototype element | DAS path | Sample value |
|---|---|---|
| NFT name | `content.metadata.name` | `PERK #865` |
| NFT image | `content.links.image` | `https://gateway.irys.xyz/…` |
| Description | `content.metadata.description` | `Your On-Chain Perk…` |
| Asset ID | `id` | `JEAQKuW58vr6qWJuka3TjjhKJnZhXSR5fFdc2UXbAaLM` |
| On-chain Collection | `grouping[?group_key="collection"].group_value` | `5XSXoWkcmy…zKZ8` |
| Owner wallet | `ownership.owner` | `GjjT…UaiE` |
| Royalty % | `royalty.percent` | `0` (varies per asset) |
| Metadata URL | `content.json_uri` | `https://bafybeihtii…` |
| Trait list | `content.metadata.attributes[]` | 4 attributes |
| Interface | `interface` | `MplCoreAsset` |
| Plugin keys | `plugins[*]` | `attributes` |
| `mpl_core_info` | `mpl_core_info` | `{plugins_json_version: 1}` |
| "Other Owned in Collection" | `getAssetsByOwner` + filter | 100 PERKs for sample owner |

</details>

<details>
<summary><b>Not in DAS — requires extra source or drop</b></summary>

| Prototype element | What it needs | Recommendation |
|---|---|---|
| Trait rarity `7%` pill | Tensor API OR pre-compute via Supabase | v1: drop the pill, keep just the count. v1.5: Tensor lookup. |
| Trait count `34 with this` | Same as above | v1: drop. v1.5: pre-compute index. |
| Collection total count | Paginate DAS or external API | v1: drop number from header. Read "PERK Collection" without count. |
| Owner display name `Beeman` | IslandDAO profile service OR drop | v1: show wallet only. |
| Owner SNS / `.sol` domain | Bonfida API | v1.5 add — cheap (~200ms) extra call. |
| Owner Discord handle `beeman#8333` | NOT ON-CHAIN — needs IslandDAO backend | Drop for v1. May not be available at all. |

</details>

## What the data tells us about the prototype

Three reduction options:

> **Outdated since 2026-05-20.** This early-stage option matrix was written when we only had DAS data and were assuming Tensor for rarity. Magic Eden's public API turned out to give us all the "Option Y/Z" enrichment (rarity counts, per-trait floor, listing data, correct royalty, slug discovery) on a public no-auth endpoint. See the "Magic Eden findings" section below — the live V1 plan supersedes everything in this option matrix.

Original options preserved for historical context:

- **Option X (minimum):** drop rarity, trait count, owner display name, collection total. Ships in 1-2 days. Visually ~80% of the prototype.
- **Option Y (richer):** X plus Bonfida (.sol) plus Tensor (rarity). 3-5 days, ~95% fidelity.
- **Option Z (max ambition):** Tensor as primary data source. 1-2 weeks. Now infeasible (see Tensor evaluation).

## Magic Eden findings (2026-05-20 probe)

The IslandDAO PERKS collection turned out to be indexed by Magic Eden under the slug `island_dao_perks`. Public REST API, no auth required, ~400ms-1.5s response times, 180 RPM rate limit per IP (headers expose `x-ratelimit-limit`, `x-ratelimit-remaining`, `x-ratelimit-reset`).

The key endpoints and what they returned for our collection:

- `GET /v2/tokens/{mint}` — single asset detail. Returns name, image, owner, attributes, `sellerFeeBasisPoints: 500` (correctly reporting the 5% royalty that DAS returned as `royalty.percent: 0`), `isCompressed`, `listStatus`, and crucially the `collection` field which gives us the slug to use for downstream calls. This is how you discover the slug from any one asset.
- `GET /v2/collections/{slug}/stats` — collection-wide floor price, listed count, all-time volume. For PERKs: 1.79 SOL floor, 158 listed, ~297 SOL all-time volume.
- `GET /v2/collections/{slug}/attributes` — per-trait rarity counts plus per-trait floor plus per-trait sample image. This is the biggest single win. The "34 with 7%" trait pill the prototype shows is computable directly from this response (count divided by collection total).
- `GET /v2/tokens/{mint}/listings`, `/activities`, `/wallets/{wallet}/tokens` etc. exist for later use (marketplace integration, sale history).

The slug discovery pattern matters: ME accepts almost any slug and returns 200 with `listedCount: 0`. You can't guess the canonical slug; you have to extract it from the `collection` field on a `tokens/{mint}` response and then use that string for everything downstream.

## Final data-source split

| Concern | Source | Cached where |
|---|---|---|
| Asset list for entire collection | Helius DAS (`searchAssets` paginated) | Supabase `nft_assets` table |
| Single asset metadata (name, image, traits) | Helius DAS or ME (both work) | Supabase `nft_assets` table |
| Trait rarity counts | Magic Eden `/collections/{slug}/attributes` | Supabase `nft_trait_rarity` table |
| Royalty percent | Magic Eden `sellerFeeBasisPoints` | Supabase `nft_collections.royalty_bps` |
| Slug for ME calls | Magic Eden, via any `tokens/{mint}` | Supabase `nft_collections.symbol` |
| Owner wallet | Helius DAS (refresh on detail-page access) | Supabase, with `last_owner_check` timestamp |
| Floor price (live) | Magic Eden `/collections/{slug}/stats` | Vercel edge cache, ~5 min TTL |
| Listed count / volume | Magic Eden `/collections/{slug}/stats` | Vercel edge cache, ~5 min TTL |
| Per-asset listing status | Magic Eden `/tokens/{mint}` | Vercel edge cache, ~30s TTL |
| Owner's other NFTs in collection | Helius DAS `getAssetsByOwner` filtered | Edge cache per-wallet, ~1 min |
| Owner .sol domain | Bonfida (v1.5, optional) | Edge cache, ~1 day |
| Owner Discord handle | Not on-chain | Dropped from v1 |

## Supabase schema for the cache

Three tables, mirroring the pattern proposed for fungible token metadata in [perf-data-fetching.md](./perf-data-fetching.md). The `nft_assets` table holds the immutable per-asset data plus the owner field (which is mutable but cheap to refresh on access). The `nft_trait_rarity` table is computed from ME's attributes endpoint and refreshed only when the collection mints more.

```sql
CREATE TABLE nft_collections (
  id                text PRIMARY KEY,        -- on-chain mint
  symbol            text NOT NULL,           -- ME slug
  name              text,
  description       text,
  image             text,
  total_supply      int,
  royalty_bps       int,
  interface         text,
  first_indexed     timestamptz DEFAULT now(),
  last_refreshed    timestamptz DEFAULT now(),
  refresh_ttl_days  int DEFAULT 30
);

CREATE TABLE nft_assets (
  id                text PRIMARY KEY,        -- asset mint
  collection_id     text REFERENCES nft_collections(id),
  name              text NOT NULL,
  number            int,                     -- parsed from name when possible
  image_url         text NOT NULL,
  metadata_url      text,
  description       text,
  attributes        jsonb NOT NULL,
  interface         text,
  is_compressed     boolean DEFAULT false,
  owner             text,
  last_owner_check  timestamptz,
  created_at        timestamptz DEFAULT now(),
  refreshed_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_nft_assets_collection ON nft_assets (collection_id);
CREATE INDEX idx_nft_assets_owner ON nft_assets (owner);
CREATE INDEX idx_nft_assets_number ON nft_assets (collection_id, number);

CREATE TABLE nft_trait_rarity (
  collection_id     text REFERENCES nft_collections(id),
  trait_type        text NOT NULL,
  trait_value       text NOT NULL,
  count             int NOT NULL,
  floor_lamports    bigint,
  trait_image       text,
  computed_at       timestamptz DEFAULT now(),
  PRIMARY KEY (collection_id, trait_type, trait_value)
);
```

Authorization stays the same pattern as `watchlist_items`: server-side access only via `SUPABASE_SERVICE_ROLE_KEY`, no RLS needed because all reads go through our API routes. Writes happen only from the seed script and the cron refresh — never from a user request.

## Storage sanity check

PERKs at roughly 5000 NFTs, average row ~1.5 KB, comes to about 7.5 MB for the whole collection. Supabase free tier holds 500 MB, so we have headroom for ~67 collections of this size before storage becomes a real concern.

## Sync strategy

Three triggers. First, a one-time seed via an admin endpoint (`POST /api/nft/admin/seed?collection=<mint>`) that paginates DAS, writes all assets, then queries ME attributes for rarity. Initial run for PERKs will take ~40 seconds (50 paginated DAS calls plus one ME call) — must run as a background job, never on a user request. Idempotent via upsert. Second, a Vercel Cron job runs daily and re-syncs owners, re-computes trait rarity, detects any new mints. Third, lazy refresh on access: when a user opens an asset detail page, if `last_owner_check` is more than an hour stale, kick off an async refresh of just that owner field. The user sees the cached version immediately and the refresh lands on next visit.

## Tensor evaluation (parked)

The user asked us to evaluate Tensor (docs.tensor.trade/trade/api-and-sdk) on 2026-05-21. The documentation page lists open-source TypeScript SDKs on npm (`@tensor-oss/tensorswap-sdk`, `@tensor-oss/tcomp-sdk`) but these are marketplace SDKs for listing and buying, not data retrieval. API access for data requires submitting an Airtable form with criteria stated as "for traders and market-makers" — an NFT viewer may or may not qualify, the approval timeline is unstated, and even after approval there is no public documentation on rate limits, pricing, endpoint contracts, or response shapes that we could pre-evaluate. We submitted no form and made no commitment. If we ever want Tensor as an upgrade (richer marketplace data, perhaps better rarity scoring), the work would be a separate project gated on receiving access.

Magic Eden delivered everything Tensor would have given us, with a public no-auth surface, documented rate limits, and a working request right now. We're not going back.

## Performance expectations

With the cache in place, an NFT detail page load looks like a single Supabase read (~50-150 ms) plus a piggyback ME stats call for live floor / listing status (~400 ms, served from Vercel edge cache after the first hit per region). Total perceived time should be well under one second for warm reads, around 500 ms on a cold edge. Compared to the current `/api/jupiter` situation (5-28 second cold loads, frequent 500s from 429 throttling) this is a fundamentally different operating regime.

## Data shapes from DAS (full keys on a single getAsset response)

```
top-level keys:
  last_indexed_slot, interface, id, content, authorities,
  compression, grouping, royalty, creators, ownership,
  supply, mutable, burnt, plugins, mpl_core_info,
  external_plugins, is_agent

content.* keys:
  $schema, json_uri, files, metadata, links, category

ownership.* keys:
  frozen, delegated, delegate, ownership_model, owner

plugins.* keys:
  attributes  (Metaplex Core attribute plugin — drives traits)
```

## Image hosting note

Sample image: `https://gateway.irys.xyz/…`

Irys (formerly Bundlr) is an Arweave-backed gateway. Reliable, no auth needed. Two implementations:
- Direct: use the URL as-is in `<img src>` — works
- Proxied: route through `/api/image-proxy` for control + caching — overkill for v1

## Plugin Details accordion (Metaplex Core specific)

The reference image shows an accordion with `Asset` and `Collection` rows. For Metaplex Core:
- **Asset plugins** = `result.plugins` from the item's `getAsset` call
- **Collection plugins** = need a separate `getAsset(<collection_id>)` call

Worth doing both. Adds one call to the page load — acceptable.

## Sample owner findings (interesting)

The first item's owner `GjjT…UaiE` holds **100 PERKs all in this collection** — likely IslandDAO treasury or a top holder. The "Other Owned" panel design works perfectly for them. For a regular holder with 1-3 NFTs, it'd be a much smaller grid — UI should handle both gracefully (already does).

## Open questions resolved

The original spike doc left several questions open. With the ME findings and the cache-first decision, they now have answers.

- Trait rarity priority — solved. ME provides per-trait counts. Pull the data into Supabase once via the seed; recompute on cron.
- Collection description source — pull from the on-chain collection metadata at seed time via DAS `getAsset(collection_id)`. Stored in `nft_collections.description`. No hard-coding.
- Bottom rail at 5000 items — Supabase paginated read by `number` (sequential PERK #1, #2, ...). The rail UI virtualizes; first 50-100 thumbnails render eagerly, rest lazy as the user scrolls. Each thumbnail is just an image URL plus a number; no live data needed.
- Multi-collection support — v1 is single-collection (PERKs). Adding more is a backlog item: an admin UI or a config file lets you append mint addresses and re-run the seed.

## V1 build plan (resume here when picking this up)

Cut a feature branch off main called `feat/nft-edge-v1`. The work breaks down into four small stages, each shippable as its own commit.

**Stage 1 — Supabase migration.** Add the three tables (`nft_collections`, `nft_assets`, `nft_trait_rarity`) via a SQL migration file in the repo. Apply to the Supabase project. Verify shape with a manual insert + select.

**Stage 2 — Seed script and admin endpoint.** Create `scripts/nft-seed.mjs` for one-off local seeding plus `src/app/api/nft/admin/seed/route.ts` for the Vercel-side admin trigger. Both share the same core logic in `src/lib/nft/seed.ts`. Seed should be idempotent (upsert on mint address), handle pagination from DAS, call ME once for rarity, write everything in a transaction-safe batch. Gate the admin endpoint behind a one-shot `SEED_TOKEN` env var so it can't be called by anyone but us.

**Stage 3 — Read API routes.** Build `src/app/api/nft/route.ts` exposing three GET shapes: `?collection=<mint>` returns the paginated asset list from Supabase, `?asset=<mint>` returns the single asset hydrated with live ME stats, `?owner=<wallet>` returns the wallet's holdings filtered to the cached collections. All three read from Supabase, with the live ME piggyback only on the asset detail call. Edge cache headers per the data-source split table above.

**Stage 4 — React surface.** Port the prototype HTML structure into React: `src/components/nft/NftDetail.tsx`, `NftRail.tsx`, `NftEdgeTab.tsx`. Add a `useNftCollection` hook for the rail data and a `useNftAsset` hook for the detail panel. Add `FEATURES.NFT_EDGE` flag (off by default). Wire `NftEdgeTab` into the home page tab structure next to Watchlist. Style with DESIGN.md tokens — the prototype HTML at the repo root is the visual contract.

**Stage 5 — Cron job and verification.** Add `vercel.json` cron config pointing at `/api/nft/admin/refresh` (daily). Verify on the PR preview that the full flow works: home → NFT Edge tab → PERK detail → rail scroll → "Other Owned" hover. Performance-check on `__perf.capture()` before flipping the flag on.

After this, the flag flip ships NFT Edge live the same way Watchlist shipped: own PR to main, manual verification on Vercel preview, then merge.

## Out of scope for V1

Marketplace integration (buy / list / bid via ME write endpoints). Cross-collection rarity comparison. Animated / 3D NFTs (mp4, glb, html mints) — defer until v2. Bulk operations (multi-select, batch transfer). Owner .sol domain resolution via Bonfida — v1.5. Owner Discord handle — permanently out of scope (not on-chain, would need a profile service we don't have).
