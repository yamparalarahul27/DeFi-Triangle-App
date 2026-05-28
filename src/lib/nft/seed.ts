import { supabase } from "@/lib/supabase";

const HELIUS_RPC = () => {
  const key = process.env.HELIUS_API_KEY;
  if (!key) throw new Error("HELIUS_API_KEY missing from env");
  return `https://mainnet.helius-rpc.com/?api-key=${key}`;
};

const ME_BASE = "https://api-mainnet.magiceden.dev/v2";

interface DasAsset {
  id: string;
  interface?: string;
  content?: {
    metadata?: {
      name?: string;
      description?: string;
      attributes?: Array<{ trait_type?: string; value?: unknown }>;
    };
    links?: { image?: string };
    json_uri?: string;
  };
  ownership?: { owner?: string };
  compression?: { compressed?: boolean };
}

async function dasRpc<T>(method: string, params: unknown): Promise<T> {
  const res = await fetch(HELIUS_RPC(), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: "nft-seed", method, params }),
  });
  if (!res.ok) throw new Error(`Helius HTTP ${res.status}`);
  const json = (await res.json()) as { result?: T; error?: unknown };
  if (json.error) throw new Error(`Helius RPC error: ${JSON.stringify(json.error)}`);
  return json.result as T;
}

async function meFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${ME_BASE}${path}`);
  if (res.status === 429) {
    throw new Error("Magic Eden rate-limited (429). Retry after ~1 min.");
  }
  if (!res.ok) {
    throw new Error(`Magic Eden HTTP ${res.status} on ${path}`);
  }
  return (await res.json()) as T;
}

function parseNumberFromName(name: string): number | null {
  const match = name.match(/#(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

export interface SeedResult {
  collection_id: string;
  collection_slug: string;
  collection_name: string;
  assets_seeded: number;
  traits_seeded: number;
  duration_ms: number;
}

export async function seedCollection(collectionMint: string): Promise<SeedResult> {
  const startedAt = Date.now();

  // Step 1: One DAS call to get a sample asset from the collection.
  const firstPage = await dasRpc<{ items: DasAsset[] }>("searchAssets", {
    grouping: ["collection", collectionMint],
    page: 1,
    limit: 1,
  });
  if (!firstPage.items?.length) {
    throw new Error(`Collection ${collectionMint} returned 0 assets from DAS`);
  }
  const sampleAsset = firstPage.items[0];

  // Step 2: Ask Magic Eden for the slug + collection-level metadata.
  const meAsset = await meFetch<{
    collection: string;
    collectionName: string;
    sellerFeeBasisPoints: number;
    image: string;
    updateAuthority: string;
  }>(`/tokens/${sampleAsset.id}`);

  if (meAsset.updateAuthority !== collectionMint) {
    throw new Error(
      `ME updateAuthority mismatch — expected ${collectionMint}, got ${meAsset.updateAuthority}`
    );
  }
  const slug = meAsset.collection;

  // Step 3: Upsert the collection row.
  const { error: collErr } = await supabase.from("nft_collections").upsert(
    {
      id: collectionMint,
      symbol: slug,
      name: meAsset.collectionName,
      image: meAsset.image,
      royalty_bps: meAsset.sellerFeeBasisPoints,
      interface: sampleAsset.interface ?? null,
      last_refreshed: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  if (collErr) throw new Error(`nft_collections upsert: ${collErr.message}`);

  // Step 4: Paginate DAS and upsert assets in batches of 100.
  let page = 1;
  const limit = 100;
  let assetsSeeded = 0;
  const now = new Date().toISOString();

  while (true) {
    const res = await dasRpc<{ items: DasAsset[] }>("searchAssets", {
      grouping: ["collection", collectionMint],
      page,
      limit,
    });
    const items = res.items ?? [];
    if (items.length === 0) break;

    const rows = items.map((a) => {
      const name = a.content?.metadata?.name ?? "Untitled";
      return {
        id: a.id,
        collection_id: collectionMint,
        name,
        number: parseNumberFromName(name),
        image_url: a.content?.links?.image ?? "",
        metadata_url: a.content?.json_uri ?? null,
        description: a.content?.metadata?.description ?? null,
        attributes: a.content?.metadata?.attributes ?? [],
        interface: a.interface ?? null,
        is_compressed: a.compression?.compressed ?? false,
        owner: a.ownership?.owner ?? null,
        last_owner_check: now,
        refreshed_at: now,
      };
    });

    const { error: assetsErr } = await supabase
      .from("nft_assets")
      .upsert(rows, { onConflict: "id" });
    if (assetsErr) throw new Error(`nft_assets upsert page ${page}: ${assetsErr.message}`);

    assetsSeeded += rows.length;
    if (items.length < limit) break;
    page += 1;
  }

  // Step 5: Record the total now that we know it.
  await supabase
    .from("nft_collections")
    .update({ total_supply: assetsSeeded })
    .eq("id", collectionMint);

  // Step 6: ME trait rarity, one call.
  const meAttrs = await meFetch<{
    results?: {
      availableAttributes?: Array<{
        attribute?: { trait_type?: string; value?: string };
        count?: number;
        floor?: number;
        image?: string;
      }>;
    };
  }>(`/collections/${slug}/attributes`);

  const traitRows = (meAttrs.results?.availableAttributes ?? [])
    .filter((a) => a.attribute?.trait_type && a.attribute?.value != null)
    .map((a) => ({
      collection_id: collectionMint,
      trait_type: a.attribute!.trait_type!,
      trait_value: String(a.attribute!.value),
      count: a.count ?? 0,
      floor_lamports: a.floor ?? null,
      trait_image: a.image ?? null,
      computed_at: now,
    }));

  if (traitRows.length > 0) {
    const { error: traitsErr } = await supabase
      .from("nft_trait_rarity")
      .upsert(traitRows, { onConflict: "collection_id,trait_type,trait_value" });
    if (traitsErr) throw new Error(`nft_trait_rarity upsert: ${traitsErr.message}`);
  }

  return {
    collection_id: collectionMint,
    collection_slug: slug,
    collection_name: meAsset.collectionName,
    assets_seeded: assetsSeeded,
    traits_seeded: traitRows.length,
    duration_ms: Date.now() - startedAt,
  };
}
