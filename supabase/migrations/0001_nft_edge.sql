-- ============================================================
-- NFT Edge v1 — schema migration
-- ============================================================
--
-- Three tables that cache NFT collection data fetched from Helius DAS
-- and Magic Eden, so that user-facing requests read from Supabase
-- instead of hammering external APIs.
--
-- Mirrors the existing auth_nonces / watchlist_items pattern: all
-- access happens server-side via SUPABASE_SERVICE_ROLE_KEY. No RLS
-- needed; authorization lives in route handlers.
--
-- To apply:
--   1. Open Supabase dashboard → SQL editor
--   2. Paste this entire file
--   3. Run
--   4. Verify with: SELECT * FROM nft_collections LIMIT 1;
--
-- To roll back (destructive — drops all NFT cache data):
--   DROP TABLE IF EXISTS nft_trait_rarity;
--   DROP TABLE IF EXISTS nft_assets;
--   DROP TABLE IF EXISTS nft_collections;
--
-- Idempotent: re-running this file is safe.
-- ============================================================


-- ------------------------------------------------------------
-- nft_collections
--   One row per supported NFT collection.
--   Seeded by scripts/nft-seed.mjs (and /api/nft/admin/seed).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nft_collections (
  id                text PRIMARY KEY,                -- on-chain collection mint
  symbol            text NOT NULL,                   -- Magic Eden slug, e.g. "island_dao_perks"
  name              text,                            -- "IslandDAO PERKS"
  description       text,
  image             text,                            -- collection avatar URL
  total_supply      integer,
  royalty_bps       integer,                         -- e.g. 500 = 5% (from ME sellerFeeBasisPoints)
  interface         text,                            -- "MplCoreAsset" | "V1_NFT" | etc.
  first_indexed     timestamptz NOT NULL DEFAULT now(),
  last_refreshed    timestamptz NOT NULL DEFAULT now(),
  refresh_ttl_days  integer NOT NULL DEFAULT 30
);


-- ------------------------------------------------------------
-- nft_assets
--   One row per NFT in a supported collection.
--   Immutable fields (name, image, attributes) cached indefinitely.
--   owner refreshes on access if last_owner_check is stale.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nft_assets (
  id                text PRIMARY KEY,                -- asset mint address
  collection_id     text NOT NULL REFERENCES nft_collections(id) ON DELETE CASCADE,
  name              text NOT NULL,                   -- "PERK #865"
  number            integer,                         -- 865 (parsed from name when present)
  image_url         text NOT NULL,
  metadata_url      text,
  description       text,
  attributes        jsonb NOT NULL DEFAULT '[]',     -- [{trait_type, value}, ...]
  interface         text,
  is_compressed     boolean NOT NULL DEFAULT false,
  owner             text,
  last_owner_check  timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  refreshed_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nft_assets_collection
  ON nft_assets (collection_id);

CREATE INDEX IF NOT EXISTS idx_nft_assets_owner
  ON nft_assets (owner)
  WHERE owner IS NOT NULL;

-- Sequential rail pagination — "PERK #1, #2, #3, ..."
CREATE INDEX IF NOT EXISTS idx_nft_assets_collection_number
  ON nft_assets (collection_id, number)
  WHERE number IS NOT NULL;


-- ------------------------------------------------------------
-- nft_trait_rarity
--   Per-trait count + floor, computed from Magic Eden's
--   /v2/collections/{slug}/attributes endpoint.
--   Recomputed on cron when the collection mints more.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nft_trait_rarity (
  collection_id     text NOT NULL REFERENCES nft_collections(id) ON DELETE CASCADE,
  trait_type        text NOT NULL,                   -- "Background", "Colour", ...
  trait_value       text NOT NULL,                   -- "Jungle", "Orange", ...
  count             integer NOT NULL,                -- how many NFTs in the collection have this trait value
  floor_lamports    bigint,                          -- floor price for NFTs with this trait, from ME
  trait_image       text,                            -- sample image URL from ME
  computed_at       timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (collection_id, trait_type, trait_value)
);


-- ------------------------------------------------------------
-- Smoke test — should return 0 rows on a fresh apply
-- ------------------------------------------------------------
-- SELECT COUNT(*) FROM nft_collections;
-- SELECT COUNT(*) FROM nft_assets;
-- SELECT COUNT(*) FROM nft_trait_rarity;
