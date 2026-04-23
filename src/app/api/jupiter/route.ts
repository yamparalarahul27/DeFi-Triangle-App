import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const JUPITER_BASE = "https://api.jup.ag/tokens/v2";
const BIRDEYE_BASE = "https://public-api.birdeye.so";
const TOKENS_XYZ_BASE = "https://api.tokens.xyz/v1";

type JsonRecord = Record<string, unknown>;
type HomeSection = "attraction" | "longTerm" | "highRisk";

type TokenPair = {
  pairAddress: string;
  baseToken: { address: string; symbol: string; name: string };
  quoteToken: { symbol: string; name: string };
  info: {
    imageUrl?: string;
    socials?: { type: string; url: string }[];
    websites?: { url: string }[];
  };
  priceUsd: number;
  priceChange: { h24: number };
  volume: { h24: number };
  liquidity: { usd: number };
  marketCap: number;
  fdv: number;
  holder: number;
  pairCreatedAt: number;
  txns: { h24: { buys: number; sells: number } };
  dexId: string;
  isVerified?: boolean;
  isStrict?: boolean;
  jupiterVerified?: boolean;
  tokensXyzVerified?: boolean;
  homeSectionHints?: HomeSection[];
  jupiter?: {
    organicScore: number;
    topHoldersPercentage: number;
    mintAuthorityDisabled: boolean | null;
    freezeAuthorityDisabled: boolean | null;
    sectionRank: Partial<Record<HomeSection, number>>;
  };
  tokenXyz?: {
    riskLabel?: string;
    riskGrade?: string;
  };
};

function num(v: unknown, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const parsed = Number(v);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function str(v: unknown): string {
  if (typeof v === "string") {
    const normalized = v.trim();
    return normalized;
  }
  if (typeof v === "number" && Number.isFinite(v)) {
    return String(v);
  }
  return "";
}

function asBool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") {
    const normalized = v.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  }
  return false;
}

function rec(v: unknown): JsonRecord {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as JsonRecord) : {};
}

function arr<T = unknown>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function toTimestampMs(value: unknown): number {
  const numeric = num(value, -1);
  if (numeric > 0) {
    return numeric > 1e11 ? numeric : numeric * 1000;
  }
  const parsed = Date.parse(str(value));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function pickUrl(raw: unknown): string {
  const candidate = str(raw);
  if (!candidate) return "";
  if (candidate.startsWith("http://") || candidate.startsWith("https://")) {
    return candidate;
  }
  return "";
}

function jupiterHeaders(): HeadersInit {
  const apiKey = process.env.JUPITER_API_KEY;
  if (!apiKey) {
    throw new Error("JUPITER_API_KEY missing");
  }
  return {
    Authorization: `Bearer ${apiKey}`,
    accept: "application/json",
  };
}

function birdeyeHeaders(): HeadersInit {
  const apiKey = process.env.BIRDEYE_API_KEY;
  if (!apiKey) {
    throw new Error("BIRDEYE_API_KEY missing");
  }
  return {
    "X-API-KEY": apiKey,
    "x-chain": "solana",
    accept: "application/json",
  };
}

function tokensXyzHeaders(): HeadersInit {
  const apiKey = process.env.TOKENS_XYZ_API_KEY;
  if (!apiKey) {
    throw new Error("TOKENS_XYZ_API_KEY missing");
  }
  return {
    "x-api-key": apiKey,
    accept: "application/json",
  };
}

function buildJupiterPair(row: JsonRecord, section: HomeSection, rank: number): TokenPair | null {
  const address = str(row.id || row.address || row.mint || row.tokenAddress);
  if (!address) return null;

  const stats24h = rec(row.stats24h);
  const buys = num(stats24h.numBuys);
  const sells = num(stats24h.numSells);
  const buyVol = num(stats24h.buyVolume);
  const sellVol = num(stats24h.sellVolume);
  const holders = num(row.holders || stats24h.numTraders);

  const symbol = str(row.symbol) || "???";
  const name = str(row.name) || symbol;
  const tags = arr<string>(row.tags).map((tag) => str(tag).toLowerCase()).filter(Boolean);
  const strictFromTags = tags.includes("strict") || tags.includes("jupiter-strict");
  const verifiedFromTags =
    tags.includes("verified") || tags.includes("moonshot-verified");
  const isStrict = strictFromTags || asBool(row.strict);
  const jupiterVerified = asBool(row.isVerified) || asBool(row.verified) || verifiedFromTags || isStrict;
  const tokensXyzVerified = false;
  const isVerified = tokensXyzVerified;

  return {
    pairAddress: address,
    baseToken: { address, symbol, name },
    quoteToken: { symbol: "USD", name: "US Dollar" },
    info: {
      imageUrl: pickUrl(row.icon || row.logoURI || row.logoUrl || row.imageUrl) || undefined,
      socials: [],
      websites: [],
    },
    priceUsd: num(row.usdPrice || row.price || row.priceUsd),
    priceChange: { h24: num(stats24h.priceChange || row.priceChange24h) },
    volume: { h24: buyVol + sellVol },
    liquidity: { usd: num(row.liquidity || row.liquidityUsd) },
    marketCap: num(row.mcap || row.marketCap),
    fdv: num(row.fdv || row.mcap || row.marketCap),
    holder: holders,
    pairCreatedAt: toTimestampMs(row.createdAt || row.launchpadLaunchAt),
    txns: {
      h24: {
        buys,
        sells,
      },
    },
    dexId: "jupiter",
    isVerified,
    isStrict,
    jupiterVerified,
    tokensXyzVerified,
    homeSectionHints: [section],
    jupiter: {
      organicScore: num(row.organicScore),
      topHoldersPercentage: num(rec(row.audit).topHoldersPercentage, -1),
      mintAuthorityDisabled:
        typeof rec(row.audit).mintAuthorityDisabled === "boolean"
          ? (rec(row.audit).mintAuthorityDisabled as boolean)
          : null,
      freezeAuthorityDisabled:
        typeof rec(row.audit).freezeAuthorityDisabled === "boolean"
          ? (rec(row.audit).freezeAuthorityDisabled as boolean)
          : null,
      sectionRank: {
        [section]: rank,
      },
    },
  };
}

function mergeSocials(
  left: { type: string; url: string }[] | undefined,
  right: { type: string; url: string }[] | undefined
): { type: string; url: string }[] {
  const merged = [...(left ?? []), ...(right ?? [])];
  const out: { type: string; url: string }[] = [];
  const seen = new Set<string>();

  for (const item of merged) {
    const url = pickUrl(item?.url);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    out.push({ type: str(item?.type) || "link", url });
  }
  return out;
}

function mergeWebsites(
  left: { url: string }[] | undefined,
  right: { url: string }[] | undefined
): { url: string }[] {
  const merged = [...(left ?? []), ...(right ?? [])];
  const out: { url: string }[] = [];
  const seen = new Set<string>();

  for (const item of merged) {
    const url = pickUrl(item?.url);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    out.push({ url });
  }
  return out;
}

function mergePairs(base: TokenPair, patch: Partial<TokenPair>): TokenPair {
  const mergedHints = [
    ...(base.homeSectionHints ?? []),
    ...(patch.homeSectionHints ?? []),
  ];

  const uniqueHints = Array.from(new Set(mergedHints));

  const baseJupiter = base.jupiter ?? {
    organicScore: 0,
    topHoldersPercentage: -1,
    mintAuthorityDisabled: null,
    freezeAuthorityDisabled: null,
    sectionRank: {},
  };

  const patchJupiter = patch.jupiter;
  const patchBase: Partial<TokenPair["baseToken"]> = patch.baseToken ?? {};
  const patchQuote: Partial<TokenPair["quoteToken"]> = patch.quoteToken ?? {};

  const mergedBaseAddress = str(patchBase.address) || base.baseToken.address;
  const mergedBaseSymbol = str(patchBase.symbol) || base.baseToken.symbol;
  const mergedBaseName = str(patchBase.name) || base.baseToken.name;

  const mergedQuoteSymbol = str(patchQuote.symbol) || base.quoteToken.symbol;
  const mergedQuoteName = str(patchQuote.name) || base.quoteToken.name;

  const patchPriceUsd = num(patch.priceUsd, 0);
  const patchPriceChange = num(patch.priceChange?.h24, 0);
  const patchVolume = num(patch.volume?.h24, 0);
  const patchLiquidity = num(patch.liquidity?.usd, 0);
  const patchMcap = num(patch.marketCap, 0);
  const patchFdv = num(patch.fdv, 0);
  const patchHolder = num(patch.holder, 0);
  const patchCreatedAt = num(patch.pairCreatedAt, 0);
  const patchBuys = num(patch.txns?.h24?.buys, 0);
  const patchSells = num(patch.txns?.h24?.sells, 0);
  const mergedJupiterVerified =
    asBool(base.jupiterVerified) || asBool(patch.jupiterVerified);
  const mergedTokensXyzVerified =
    asBool(base.tokensXyzVerified) || asBool(patch.tokensXyzVerified);
  const mergedVerified = mergedTokensXyzVerified;
  const mergedStrict = asBool(base.isStrict) || asBool(patch.isStrict);

  return {
    ...base,
    ...patch,
    baseToken: {
      address: mergedBaseAddress,
      symbol: mergedBaseSymbol,
      name: mergedBaseName,
    },
    quoteToken: {
      symbol: mergedQuoteSymbol,
      name: mergedQuoteName,
    },
    info: {
      ...base.info,
      ...(patch.info ?? {}),
      imageUrl: pickUrl(patch.info?.imageUrl) || pickUrl(base.info?.imageUrl) || undefined,
      socials: mergeSocials(base.info?.socials, patch.info?.socials),
      websites: mergeWebsites(base.info?.websites, patch.info?.websites),
    },
    priceChange: {
      ...base.priceChange,
      h24:
        patchPriceChange !== 0 || num(base.priceChange?.h24, 0) === 0
          ? patchPriceChange
          : num(base.priceChange?.h24, 0),
    },
    volume: {
      ...base.volume,
      h24: patchVolume > 0 ? patchVolume : num(base.volume?.h24, 0),
    },
    liquidity: {
      ...base.liquidity,
      usd: patchLiquidity > 0 ? patchLiquidity : num(base.liquidity?.usd, 0),
    },
    txns: {
      h24: {
        ...base.txns.h24,
        buys: patchBuys > 0 ? patchBuys : num(base.txns?.h24?.buys, 0),
        sells: patchSells > 0 ? patchSells : num(base.txns?.h24?.sells, 0),
      },
    },
    priceUsd: patchPriceUsd > 0 ? patchPriceUsd : num(base.priceUsd, 0),
    marketCap: patchMcap > 0 ? patchMcap : num(base.marketCap, 0),
    fdv: patchFdv > 0 ? patchFdv : num(base.fdv, 0),
    holder: patchHolder > 0 ? patchHolder : num(base.holder, 0),
    pairCreatedAt: patchCreatedAt > 0 ? patchCreatedAt : num(base.pairCreatedAt, 0),
    dexId: str(patch.dexId) || base.dexId,
    isVerified: mergedVerified,
    isStrict: mergedStrict,
    jupiterVerified: mergedJupiterVerified,
    tokensXyzVerified: mergedTokensXyzVerified,
    homeSectionHints: uniqueHints,
    jupiter: patchJupiter
      ? {
          organicScore: patchJupiter.organicScore || baseJupiter.organicScore,
          topHoldersPercentage:
            patchJupiter.topHoldersPercentage >= 0
              ? patchJupiter.topHoldersPercentage
              : baseJupiter.topHoldersPercentage,
          mintAuthorityDisabled:
            patchJupiter.mintAuthorityDisabled ?? baseJupiter.mintAuthorityDisabled,
          freezeAuthorityDisabled:
            patchJupiter.freezeAuthorityDisabled ?? baseJupiter.freezeAuthorityDisabled,
          sectionRank: {
            ...baseJupiter.sectionRank,
            ...(patchJupiter.sectionRank ?? {}),
          },
        }
      : baseJupiter,
  };
}

function mapBirdeyeToPairPatch(token: JsonRecord): Partial<TokenPair> {
  const logoURI = pickUrl(token.logoURI || token.logo_uri || token.logoUrl || token.logo_url);

  const buys24 = num(token.buy24h || token.buy_24h);
  const sells24 = num(token.sell24h || token.sell_24h);
  const trade24 = num(token.trade24h || token.trade_24h || token.trade_24h_count);
  const fallbackBuys = buys24 > 0 || sells24 > 0 ? buys24 : Math.round(trade24 / 2);
  const fallbackSells =
    buys24 > 0 || sells24 > 0 ? sells24 : Math.max(0, trade24 - fallbackBuys);

  const socials: { type: string; url: string }[] = [];
  const websites: { url: string }[] = [];

  for (const social of arr<JsonRecord>(token.socials)) {
    const type = str(social.type);
    const url = pickUrl(social.url);
    if (url) socials.push({ type: type || "link", url });
  }

  for (const website of arr<JsonRecord>(token.websites)) {
    const url = pickUrl(website.url);
    if (url) websites.push({ url });
  }

  const extensions = rec(token.extensions);
  const twitter = pickUrl(extensions.twitter || extensions.x);
  const telegram = pickUrl(extensions.telegram);
  const discord = pickUrl(extensions.discord);
  const website = pickUrl(extensions.website);

  if (twitter) socials.push({ type: "twitter", url: twitter });
  if (telegram) socials.push({ type: "telegram", url: telegram });
  if (discord) socials.push({ type: "discord", url: discord });
  if (website) websites.push({ url: website });

  return {
    baseToken: {
      address: str(token.address || token.token_address),
      symbol: str(token.symbol),
      name: str(token.name),
    },
    info: {
      imageUrl: logoURI || undefined,
      socials,
      websites,
    },
    priceUsd: num(token.price || token.priceUsd),
    priceChange: {
      h24: num(
        token.price24hChangePercent ||
          token.priceChange24hPercent ||
          token.price_change_24h_percent
      ),
    },
    volume: {
      h24: num(token.volume24hUSD || token.volume24h || token.volume_24h_usd),
    },
    liquidity: {
      usd: num(token.liquidity || token.liquidityUsd),
    },
    fdv: num(token.fdv),
    marketCap: num(token.marketCap || token.marketcap || token.market_cap || token.fdv),
    holder: num(token.holder || token.holders || token.holderCount),
    pairCreatedAt: toTimestampMs(token.recent_listing_time || token.last_trade_unix_time),
    txns: {
      h24: {
        buys: fallbackBuys,
        sells: fallbackSells,
      },
    },
    dexId: str(token.source || token.dexId || "birdeye"),
  };
}

function mapTokensXyzToPairPatch(payload: JsonRecord): Partial<TokenPair> {
  const asset = rec(payload.asset);
  const includes = rec(payload.includes);
  const profile = rec(rec(includes.profile).data);
  const risk = rec(rec(includes.risk).data);
  const marketScore = rec(risk.marketScore);
  const marketScoreValue = num(marketScore.score, -1);
  const marketScoreGrade = str(marketScore.grade).toUpperCase();
  const marketScoreTone = str(marketScore.tone).toLowerCase();
  const hasInsufficientData = asBool(marketScore.hasInsufficientData);
  const explicitTokensXyzVerified = asBool(
    profile.isVerified || profile.verified || asset.isVerified || asset.verified
  );
  const derivedTokensXyzVerified =
    !hasInsufficientData &&
    (marketScoreTone === "safe" || marketScoreGrade === "A" || marketScoreValue >= 85);
  const tokensXyzVerified = explicitTokensXyzVerified || derivedTokensXyzVerified;

  const stats = rec(asset.stats);
  const variantGroups = rec(asset.variantGroups);

  let firstVariant = {} as JsonRecord;
  for (const variants of Object.values(variantGroups)) {
    if (!Array.isArray(variants) || variants.length === 0) continue;
    firstVariant = rec(variants[0]);
    if (Object.keys(firstVariant).length > 0) break;
  }

  const links = rec(profile.links);
  const socials: { type: string; url: string }[] = [];
  const websites: { url: string }[] = [];

  const twitter = pickUrl(links.twitter || links.x);
  const telegram = pickUrl(links.telegram);
  const discord = pickUrl(links.discord);
  const webCandidates = [links.website, links.homepage, links.site];

  if (twitter) socials.push({ type: "twitter", url: twitter });
  if (telegram) socials.push({ type: "telegram", url: telegram });
  if (discord) socials.push({ type: "discord", url: discord });

  for (const candidate of webCandidates) {
    const url = pickUrl(candidate);
    if (url) websites.push({ url });
  }

  return {
    baseToken: {
      address: str(firstVariant.mint),
      symbol: str(asset.symbol || firstVariant.symbol),
      name: str(asset.name || firstVariant.name),
    },
    info: {
      imageUrl:
        pickUrl(asset.imageUrl || firstVariant.icon || firstVariant.logoURI) || undefined,
      socials,
      websites,
    },
    priceUsd: num(profile.price || stats.price),
    priceChange: {
      h24: num(profile.priceChange24h || stats.priceChange24hPercent),
    },
    volume: {
      h24: num(profile.volume24h || stats.volume24hUSD),
    },
    liquidity: {
      usd: num(stats.liquidity),
    },
    marketCap: num(profile.marketCap || stats.marketCap),
    fdv: num(profile.fdv),
    tokenXyz: {
      riskLabel: str(marketScore.label),
      riskGrade: str(marketScore.grade),
    },
    tokensXyzVerified,
  };
}

async function fetchJupiterCategory(path: string, limit: number): Promise<JsonRecord[]> {
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

async function fetchJupiterSearch(query: string, limit: number): Promise<JsonRecord[]> {
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

async function fetchBirdeyeOverview(address: string): Promise<Partial<TokenPair> | null> {
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

async function fetchBirdeyeList(limit: number, offset: number): Promise<JsonRecord[]> {
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

async function fetchTokensXyzAsset(address: string): Promise<Partial<TokenPair> | null> {
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

async function mapWithConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>
): Promise<void> {
  const queue = [...items];
  const workers = Array.from({ length: Math.max(1, concurrency) }, async () => {
    while (queue.length > 0) {
      const next = queue.shift();
      if (typeof next === "undefined") return;
      await worker(next);
    }
  });
  await Promise.all(workers);
}

function qualityScore(pair: TokenPair): number {
  const liquidity = num(pair.liquidity?.usd);
  const volume = num(pair.volume?.h24);
  const mcap = num(pair.marketCap || pair.fdv);
  const holders = num(pair.holder);
  const organic = num(pair.jupiter?.organicScore);
  const change = Math.abs(num(pair.priceChange?.h24));
  const freshness = pair.pairCreatedAt > 0 ? Math.max(0, 365 - ageDays(pair)) : 0;

  return (
    Math.log10(liquidity + 1) * 18 +
    Math.log10(volume + 1) * 16 +
    Math.log10(mcap + 1) * 12 +
    Math.log10(holders + 1) * 8 +
    organic * 0.3 +
    Math.max(0, 80 - change) * 0.15 +
    freshness * 0.02
  );
}

function ageDays(pair: TokenPair): number {
  if (!pair.pairCreatedAt || pair.pairCreatedAt <= 0) return 0;
  return Math.max(0, (Date.now() - pair.pairCreatedAt) / 86_400_000);
}

function passesBaseFilter(pair: TokenPair): boolean {
  const symbol = str(pair.baseToken?.symbol);
  const name = str(pair.baseToken?.name);
  const liquidity = num(pair.liquidity?.usd);
  const volume = num(pair.volume?.h24);
  const mcap = num(pair.marketCap || pair.fdv);

  if (!symbol || symbol === "???") return false;
  if (!name) return false;
  if (liquidity < 25_000) return false;
  if (volume < 25_000) return false;
  if (mcap < 500_000) return false;
  return true;
}

function sectionScore(pair: TokenPair, section: HomeSection): number {
  const rank = pair.jupiter?.sectionRank?.[section] ?? 999;
  const invRank = rank > 0 ? 1 / rank : 0;
  const liquidity = num(pair.liquidity?.usd);
  const volume = num(pair.volume?.h24);
  const change = num(pair.priceChange?.h24);
  const mcap = num(pair.marketCap || pair.fdv);
  const organic = num(pair.jupiter?.organicScore);

  if (section === "attraction") {
    return (
      invRank * 100 +
      Math.max(0, change) * 0.5 +
      Math.log10(volume + 1) * 8 +
      Math.log10(liquidity + 1) * 6 +
      organic * 0.2
    );
  }

  if (section === "longTerm") {
    return (
      invRank * 100 +
      Math.log10(liquidity + 1) * 10 +
      Math.log10(mcap + 1) * 12 +
      organic * 0.4 -
      Math.abs(change) * 0.25
    );
  }

  return (
    invRank * 100 +
    Math.max(0, change) * 0.7 +
    Math.log10(volume + 1) * 8 +
    Math.max(0, 150 - mcap / 1_000_000) * 0.3
  );
}

function pickSectionTokens(
  tokens: TokenPair[],
  section: HomeSection,
  limit: number,
  used: Set<string>
): TokenPair[] {
  const primary = tokens
    .filter((pair) => (pair.homeSectionHints ?? []).includes(section))
    .filter((pair) => {
      const liquidity = num(pair.liquidity?.usd);
      const volume = num(pair.volume?.h24);
      const mcap = num(pair.marketCap || pair.fdv);
      const change = num(pair.priceChange?.h24);

      if (section === "attraction") {
        return liquidity >= 60_000 && volume >= 120_000 && change >= 1;
      }
      if (section === "longTerm") {
        return liquidity >= 400_000 && mcap >= 80_000_000 && Math.abs(change) <= 60;
      }
      return (
        liquidity >= 35_000 &&
        volume >= 120_000 &&
        mcap >= 1_000_000 &&
        mcap <= 400_000_000 &&
        change >= 3
      );
    })
    .sort((a, b) => sectionScore(b, section) - sectionScore(a, section));

  const fallback = tokens
    .filter((pair) => (pair.homeSectionHints ?? []).includes(section))
    .sort((a, b) => sectionScore(b, section) - sectionScore(a, section));

  const out: TokenPair[] = [];

  const tryAdd = (pair: TokenPair) => {
    const key = str(pair.baseToken?.address);
    if (!key || used.has(key)) return;
    used.add(key);
    out.push(pair);
  };

  for (const pair of primary) {
    if (out.length >= limit) break;
    tryAdd(pair);
  }

  if (out.length < limit) {
    for (const pair of fallback) {
      if (out.length >= limit) break;
      tryAdd(pair);
    }
  }

  return out;
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.floor(value)));
}

function searchRelevanceScore(pair: TokenPair, query: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;

  const symbol = str(pair.baseToken?.symbol).toLowerCase();
  const name = str(pair.baseToken?.name).toLowerCase();
  const address = str(pair.baseToken?.address).toLowerCase();

  let score = 0;

  if (symbol === q) score += 120;
  if (symbol.startsWith(q)) score += 80;
  if (symbol.includes(q)) score += 45;

  if (name === q) score += 100;
  if (name.startsWith(q)) score += 60;
  if (name.includes(q)) score += 30;

  if (address === q) score += 140;
  if (address.startsWith(q)) score += 55;
  if (address.includes(q)) score += 20;

  return score;
}

async function buildHomePayload(limit: number) {
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

  const candidates = Array.from(map.values()).sort((a, b) => qualityScore(b) - qualityScore(a));
  const enrichAddresses = candidates.slice(0, Math.max(limit, 60)).map((pair) => pair.baseToken.address);

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

async function buildSearchPayload(query: string, limit: number) {
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
  await mapWithConcurrency(addresses.slice(0, Math.min(20, addresses.length)), 6, async (address) => {
    const patch = await fetchBirdeyeOverview(address);
    if (!patch) return;
    const existing = map.get(address);
    if (!existing) return;
    birdeyeHits += 1;
    map.set(address, mergePairs(existing, patch));
  });

  let tokensXyzHits = 0;
  await mapWithConcurrency(addresses.slice(0, Math.min(20, addresses.length)), 4, async (address) => {
    const patch = await fetchTokensXyzAsset(address);
    if (!patch) return;
    const existing = map.get(address);
    if (!existing) return;
    tokensXyzHits += 1;
    map.set(address, mergePairs(existing, patch));
  });

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

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const type = str(sp.get("type") || "home");

  if (type !== "home" && type !== "tokens" && type !== "list" && type !== "search") {
    return NextResponse.json(
      { success: false, error: "invalid type" },
      { status: 400 }
    );
  }

  try {
    if (type === "search") {
      const q = str(sp.get("q"));
      if (!q) {
        return NextResponse.json(
          { success: false, error: "q required" },
          { status: 400 }
        );
      }
      const limit = clamp(num(sp.get("limit"), 10), 1, 50);
      const payload = await buildSearchPayload(q, limit);
      return NextResponse.json({
        success: true,
        ...payload,
      });
    }

    const limit = clamp(num(sp.get("limit"), 120), 30, 200);
    const payload = await buildHomePayload(limit);
    return NextResponse.json({
      success: true,
      ...payload,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[jupiter/home] ${message}`);
    return NextResponse.json(
      { success: false, error: "upstream error", message },
      { status: 500 }
    );
  }
}
