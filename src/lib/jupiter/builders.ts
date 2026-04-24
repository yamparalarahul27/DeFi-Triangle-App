import { buildJupiterPair, mapBirdeyeToPairPatch, mergePairs } from "./adapters";
import {
  pickSectionTokens,
  qualityScore,
  searchRelevanceScore,
  passesBaseFilter,
} from "./scoring";
import type { HomeSection, JsonRecord, TokenPair } from "./types";
import {
  fetchBirdeyeList,
  fetchBirdeyeOverview,
  fetchJupiterCategory,
  fetchJupiterSearch,
  fetchTokensXyzAsset,
} from "./upstream";
import { clamp, mapWithConcurrency, str } from "./utils";

export async function buildHomePayload(limit: number) {
  const perSectionCandidates = clamp(Math.max(limit, 40), 40, 100);

  const [trendingRows, organicRows, tradedRows] = await Promise.all([
    fetchJupiterCategory("/toptrending/24h", perSectionCandidates),
    fetchJupiterCategory("/toporganicscore/24h", perSectionCandidates),
    fetchJupiterCategory("/toptraded/24h", perSectionCandidates),
  ]);

  const map = new Map<string, TokenPair>();

  const ingest = (rows: JsonRecord[], section: HomeSection) => {
    for (let i = 0; i < rows.length; i += 1) {
      const pair = buildJupiterPair(rows[i], section, i + 1);
      if (!pair) continue;
      const key = pair.baseToken.address;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, pair);
      } else {
        map.set(key, mergePairs(existing, pair));
      }
    }
  };

  ingest(trendingRows, "attraction");
  ingest(organicRows, "longTerm");
  ingest(tradedRows, "highRisk");

  const candidates = Array.from(map.values()).sort(
    (a, b) => qualityScore(b) - qualityScore(a)
  );
  const enrichAddresses = candidates
    .slice(0, Math.max(limit, 60))
    .map((pair) => pair.baseToken.address);

  let birdeyeHits = 0;
  const birdeyeList = await fetchBirdeyeList(100, 0);
  const birdeyeAddresses = new Set<string>();

  for (const item of birdeyeList) {
    const itemAddress = str(item.address || item.token_address);
    if (!itemAddress || !map.has(itemAddress)) continue;
    birdeyeAddresses.add(itemAddress);
    const existing = map.get(itemAddress);
    if (!existing) continue;
    const patch = mapBirdeyeToPairPatch(item);
    map.set(itemAddress, mergePairs(existing, patch));
    birdeyeHits += 1;
  }

  const birdeyeFallbackAddresses = enrichAddresses
    .filter((address) => !birdeyeAddresses.has(address))
    .slice(0, 24);

  await mapWithConcurrency(birdeyeFallbackAddresses, 8, async (address) => {
    const patch = await fetchBirdeyeOverview(address);
    if (!patch) return;
    const existing = map.get(address);
    if (!existing) return;
    birdeyeHits += 1;
    map.set(address, mergePairs(existing, patch));
  });

  const xyzTargets = candidates
    .slice(0, Math.max(24, Math.floor(limit / 2)))
    .map((pair) => pair.baseToken.address);

  let tokensXyzHits = 0;
  await mapWithConcurrency(xyzTargets, 4, async (address) => {
    const patch = await fetchTokensXyzAsset(address);
    if (!patch) return;
    const existing = map.get(address);
    if (!existing) return;
    tokensXyzHits += 1;
    map.set(address, mergePairs(existing, patch));
  });

  const all = Array.from(map.values());
  const filtered = all.filter(passesBaseFilter);
  const ranked = (filtered.length >= Math.min(limit, 40) ? filtered : all)
    .sort((a, b) => qualityScore(b) - qualityScore(a))
    .slice(0, limit);

  const used = new Set<string>();
  const sections = {
    attraction: pickSectionTokens(ranked, "attraction", 6, used),
    longTerm: pickSectionTokens(ranked, "longTerm", 6, used),
    highRisk: pickSectionTokens(ranked, "highRisk", 6, used),
  };

  return {
    data: ranked,
    sections,
    meta: {
      jupiter: {
        attraction: trendingRows.length,
        longTerm: organicRows.length,
        highRisk: tradedRows.length,
      },
      birdeyeHits,
      tokensXyzHits,
      totalCandidates: all.length,
      totalReturned: ranked.length,
    },
  };
}

export async function buildSearchPayload(query: string, limit: number) {
  const safeLimit = clamp(limit, 1, 50);
  const rows = await fetchJupiterSearch(query, Math.max(safeLimit * 2, 20));

  const map = new Map<string, TokenPair>();
  for (let i = 0; i < rows.length; i += 1) {
    const mapped = buildJupiterPair(rows[i], "attraction", i + 1);
    if (!mapped) continue;
    mapped.homeSectionHints = [];
    const key = mapped.baseToken.address;
    const existing = map.get(key);
    map.set(key, existing ? mergePairs(existing, mapped) : mapped);
  }

  const candidates = Array.from(map.values());
  const addresses = candidates.map((pair) => pair.baseToken.address);

  let birdeyeHits = 0;
  await mapWithConcurrency(
    addresses.slice(0, Math.min(20, addresses.length)),
    6,
    async (address) => {
      const patch = await fetchBirdeyeOverview(address);
      if (!patch) return;
      const existing = map.get(address);
      if (!existing) return;
      birdeyeHits += 1;
      map.set(address, mergePairs(existing, patch));
    }
  );

  let tokensXyzHits = 0;
  await mapWithConcurrency(
    addresses.slice(0, Math.min(20, addresses.length)),
    4,
    async (address) => {
      const patch = await fetchTokensXyzAsset(address);
      if (!patch) return;
      const existing = map.get(address);
      if (!existing) return;
      tokensXyzHits += 1;
      map.set(address, mergePairs(existing, patch));
    }
  );

  const withRelevance = Array.from(map.values())
    .map((pair) => ({
      pair,
      relevance: searchRelevanceScore(pair, query),
      verifiedRank:
        (pair.isVerified ? 4 : 0) +
        (pair.tokensXyzVerified ? 2 : 0) +
        (pair.jupiterVerified ? 1 : 0),
      quality: qualityScore(pair),
    }))
    .filter((item) => item.relevance > 0);

  const fallback = Array.from(map.values()).map((pair) => ({
    pair,
    relevance: 0,
    verifiedRank:
      (pair.isVerified ? 4 : 0) +
      (pair.tokensXyzVerified ? 2 : 0) +
      (pair.jupiterVerified ? 1 : 0),
    quality: qualityScore(pair),
  }));

  const source = withRelevance.length > 0 ? withRelevance : fallback;

  const ranked = source
    .filter(
      (item) =>
        !!str(item.pair.baseToken?.symbol) && !!str(item.pair.baseToken?.name)
    )
    .sort(
      (a, b) =>
        b.relevance - a.relevance ||
        b.verifiedRank - a.verifiedRank ||
        b.quality - a.quality
    )
    .map((item) => item.pair)
    .slice(0, safeLimit);

  return {
    data: ranked,
    meta: {
      query,
      totalCandidates: candidates.length,
      totalReturned: ranked.length,
      birdeyeHits,
      tokensXyzHits,
    },
  };
}
