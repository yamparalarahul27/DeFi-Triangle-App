import { mapBirdeyeToPairPatch, mapTokensXyzToPairPatch } from "./adapters";
import {
  BIRDEYE_BASE,
  JUPITER_BASE,
  TOKENS_XYZ_BASE,
  type JsonRecord,
  type TokenPair,
} from "./types";
import {
  arr,
  birdeyeHeaders,
  clamp,
  jupiterHeaders,
  rec,
  tokensXyzHeaders,
} from "./utils";

export async function fetchJupiterCategory(
  path: string,
  limit: number
): Promise<JsonRecord[]> {
  const url = `${JUPITER_BASE}${path}?limit=${Math.max(1, Math.min(100, limit))}`;
  const upstream = await fetch(url, {
    headers: jupiterHeaders(),
    cache: "no-store",
  });
  if (!upstream.ok) {
    throw new Error(`jupiter ${path} ${upstream.status}`);
  }
  const json = await upstream.json();
  return arr<JsonRecord>(json);
}

export async function fetchJupiterSearch(
  query: string,
  limit: number
): Promise<JsonRecord[]> {
  const safeQuery = query.trim();
  if (!safeQuery) return [];
  const safeLimit = clamp(limit, 1, 50);
  const url =
    `${JUPITER_BASE}/search?query=${encodeURIComponent(safeQuery)}` +
    `&limit=${safeLimit}`;

  const upstream = await fetch(url, {
    headers: jupiterHeaders(),
    cache: "no-store",
  });
  if (!upstream.ok) {
    throw new Error(`jupiter search ${upstream.status}`);
  }
  const json = await upstream.json();
  return arr<JsonRecord>(json);
}

export async function fetchBirdeyeOverview(
  address: string
): Promise<Partial<TokenPair> | null> {
  const url = `${BIRDEYE_BASE}/defi/token_overview?address=${encodeURIComponent(address)}`;
  try {
    const upstream = await fetch(url, {
      headers: birdeyeHeaders(),
      cache: "no-store",
    });
    if (!upstream.ok) return null;
    const json = await upstream.json();
    const data = rec(json.data);
    if (Object.keys(data).length === 0) return null;
    return mapBirdeyeToPairPatch(data);
  } catch {
    return null;
  }
}

export async function fetchBirdeyeList(
  limit: number,
  offset: number
): Promise<JsonRecord[]> {
  const safeLimit = clamp(limit, 1, 100);
  const safeOffset = clamp(offset, 0, 9_900);
  const url =
    `${BIRDEYE_BASE}/defi/v3/token/list?sort_by=liquidity&sort_type=desc` +
    `&limit=${safeLimit}&offset=${safeOffset}`;

  const upstream = await fetch(url, {
    headers: birdeyeHeaders(),
    cache: "no-store",
  });
  if (!upstream.ok) return [];
  const json = await upstream.json();
  return arr<JsonRecord>(rec(json.data).items);
}

export async function fetchTokensXyzAsset(
  address: string
): Promise<Partial<TokenPair> | null> {
  const url = `${TOKENS_XYZ_BASE}/assets/${encodeURIComponent(
    address
  )}?include=profile,risk`;
  try {
    const upstream = await fetch(url, {
      headers: tokensXyzHeaders(),
      cache: "no-store",
    });
    if (!upstream.ok) return null;
    const json = (await upstream.json()) as JsonRecord;
    const asset = rec(json.asset);
    if (Object.keys(asset).length === 0) return null;
    return mapTokensXyzToPairPatch(json);
  } catch {
    return null;
  }
}
