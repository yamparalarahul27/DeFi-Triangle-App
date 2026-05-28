import { NextRequest } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { supabase } from "@/lib/supabase";
import { enforceRateLimit } from "@/lib/rateLimit";
import { CACHE, cachedJson } from "@/lib/cacheControl";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ME_BASE = "https://api-mainnet.magiceden.dev/v2";

function isValidAddress(addr: string): boolean {
  try {
    new PublicKey(addr);
    return true;
  } catch {
    return false;
  }
}

function badRequest(error: string) {
  return cachedJson({ success: false, error }, CACHE.NO_CACHE, { status: 400 });
}
function notFound(error: string) {
  return cachedJson({ success: false, error }, CACHE.NO_CACHE, { status: 404 });
}
function serverError(context: string, err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[nft/${context}] ${message}`);
  return cachedJson(
    { success: false, error: "server error" },
    CACHE.NO_CACHE,
    { status: 500 }
  );
}

interface MeStats {
  floorPrice?: number;
  listedCount?: number;
  volumeAll?: number;
}
interface MeAsset {
  listStatus?: string;
  price?: number;
}

async function fetchMeStats(slug: string): Promise<MeStats | null> {
  try {
    const res = await fetch(`${ME_BASE}/collections/${slug}/stats`, {
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return null;
    return (await res.json()) as MeStats;
  } catch {
    return null;
  }
}
async function fetchMeAsset(mint: string): Promise<MeAsset | null> {
  try {
    const res = await fetch(`${ME_BASE}/tokens/${mint}`, {
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return null;
    return (await res.json()) as MeAsset;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const limited = await enforceRateLimit(req, "public-read");
  if (limited) return limited;

  const sp = new URL(req.url).searchParams;
  const asset = sp.get("asset");
  const owner = sp.get("owner");
  const collection = sp.get("collection");

  if (asset) {
    if (!isValidAddress(asset)) return badRequest("invalid asset mint");
    return getAsset(asset);
  }
  if (owner && collection) {
    if (!isValidAddress(owner)) return badRequest("invalid owner wallet");
    if (!isValidAddress(collection)) return badRequest("invalid collection mint");
    return getOwnerInCollection(owner, collection);
  }
  if (collection) {
    if (!isValidAddress(collection)) return badRequest("invalid collection mint");
    const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10) || 1);
    const limit = Math.min(
      200,
      Math.max(1, parseInt(sp.get("limit") ?? "100", 10) || 100)
    );
    return getCollectionAssets(collection, page, limit);
  }

  return badRequest("provide one of: ?asset, ?collection, ?owner+collection");
}

async function getCollectionAssets(
  collection: string,
  page: number,
  limit: number
) {
  try {
    const { data: collRow, error: collErr } = await supabase
      .from("nft_collections")
      .select(
        "id, symbol, name, image, description, total_supply, royalty_bps"
      )
      .eq("id", collection)
      .single();

    if (collErr || !collRow) return notFound("collection not seeded");

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data: assets, error: assetsErr } = await supabase
      .from("nft_assets")
      .select("id, name, number, image_url, owner")
      .eq("collection_id", collection)
      .order("number", { ascending: true, nullsFirst: false })
      .range(from, to);
    if (assetsErr) throw assetsErr;

    return cachedJson(
      {
        success: true,
        data: {
          collection: collRow,
          assets: assets ?? [],
          page,
          limit,
        },
      },
      CACHE.STATIC_MED
    );
  } catch (err) {
    return serverError("collection-list", err);
  }
}

async function getAsset(assetMint: string) {
  try {
    const { data: asset, error } = await supabase
      .from("nft_assets")
      .select(
        "id, collection_id, name, number, image_url, metadata_url, description, attributes, interface, is_compressed, owner"
      )
      .eq("id", assetMint)
      .single();

    if (error || !asset) return notFound("asset not in cache");

    const { data: collection } = await supabase
      .from("nft_collections")
      .select("id, symbol, name, image, royalty_bps, total_supply")
      .eq("id", asset.collection_id)
      .single();

    const traits =
      (asset.attributes as Array<{ trait_type?: string; value?: unknown }> | null) ??
      [];

    const traitTypes = traits
      .map((t) => t.trait_type)
      .filter((x): x is string => typeof x === "string");

    const rarityIndex: Record<
      string,
      { count: number; floor_lamports: number | null; trait_image: string | null }
    > = {};

    if (traitTypes.length > 0) {
      const { data: rarityRows } = await supabase
        .from("nft_trait_rarity")
        .select("trait_type, trait_value, count, floor_lamports, trait_image")
        .eq("collection_id", asset.collection_id)
        .in("trait_type", traitTypes);

      (rarityRows ?? []).forEach((r) => {
        rarityIndex[`${r.trait_type}::${r.trait_value}`] = {
          count: r.count,
          floor_lamports: r.floor_lamports,
          trait_image: r.trait_image,
        };
      });
    }

    const [meStats, meAsset] = await Promise.all([
      collection?.symbol ? fetchMeStats(collection.symbol) : Promise.resolve(null),
      fetchMeAsset(assetMint),
    ]);

    return cachedJson(
      {
        success: true,
        data: {
          asset,
          collection,
          rarity: rarityIndex,
          live: {
            floorPrice: meStats?.floorPrice ?? null,
            listedCount: meStats?.listedCount ?? null,
            listStatus: meAsset?.listStatus ?? null,
            listPrice: meAsset?.price ?? null,
          },
        },
      },
      CACHE.VOLATILE
    );
  } catch (err) {
    return serverError("asset-detail", err);
  }
}

async function getOwnerInCollection(owner: string, collection: string) {
  try {
    // count: "exact" returns the true total (no row cap), the limit caps the
    // sample we actually return. The hover panel only shows ~10-20 thumbs, but
    // the count drives the "(N)" badge so it must be accurate.
    const { data, error, count } = await supabase
      .from("nft_assets")
      .select("id, name, number, image_url", { count: "exact" })
      .eq("collection_id", collection)
      .eq("owner", owner)
      .order("number", { ascending: true, nullsFirst: false })
      .limit(50);
    if (error) throw error;

    return cachedJson(
      {
        success: true,
        data: { assets: data ?? [], count: count ?? 0 },
      },
      CACHE.SEMI_STATIC
    );
  } catch (err) {
    return serverError("owner-in-collection", err);
  }
}
