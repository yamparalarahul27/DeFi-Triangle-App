import type { HomeSection, JsonRecord, TokenPair } from "./types";
import { arr, asBool, num, pickUrl, rec, str, toTimestampMs } from "./utils";

export function buildJupiterPair(
  row: JsonRecord,
  section: HomeSection,
  rank: number
): TokenPair | null {
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
  const tags = arr<string>(row.tags)
    .map((tag) => str(tag).toLowerCase())
    .filter(Boolean);
  const strictFromTags =
    tags.includes("strict") || tags.includes("jupiter-strict");
  const verifiedFromTags =
    tags.includes("verified") || tags.includes("moonshot-verified");
  const isStrict = strictFromTags || asBool(row.strict);
  const jupiterVerified =
    asBool(row.isVerified) ||
    asBool(row.verified) ||
    verifiedFromTags ||
    isStrict;
  const tokensXyzVerified = false;
  const isVerified = tokensXyzVerified;

  const audit = rec(row.audit);

  return {
    pairAddress: address,
    baseToken: { address, symbol, name },
    quoteToken: { symbol: "USD", name: "US Dollar" },
    info: {
      imageUrl:
        pickUrl(row.icon || row.logoURI || row.logoUrl || row.imageUrl) ||
        undefined,
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
    txns: { h24: { buys, sells } },
    dexId: "jupiter",
    isVerified,
    isStrict,
    jupiterVerified,
    tokensXyzVerified,
    homeSectionHints: [section],
    jupiter: {
      organicScore: num(row.organicScore),
      topHoldersPercentage: num(audit.topHoldersPercentage, -1),
      mintAuthorityDisabled:
        typeof audit.mintAuthorityDisabled === "boolean"
          ? (audit.mintAuthorityDisabled as boolean)
          : null,
      freezeAuthorityDisabled:
        typeof audit.freezeAuthorityDisabled === "boolean"
          ? (audit.freezeAuthorityDisabled as boolean)
          : null,
      sectionRank: { [section]: rank },
    },
  };
}

export function mergeSocials(
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

export function mergeWebsites(
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

export function mergePairs(
  base: TokenPair,
  patch: Partial<TokenPair>
): TokenPair {
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
    quoteToken: { symbol: mergedQuoteSymbol, name: mergedQuoteName },
    info: {
      ...base.info,
      ...(patch.info ?? {}),
      imageUrl:
        pickUrl(patch.info?.imageUrl) ||
        pickUrl(base.info?.imageUrl) ||
        undefined,
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
    pairCreatedAt:
      patchCreatedAt > 0 ? patchCreatedAt : num(base.pairCreatedAt, 0),
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
            patchJupiter.mintAuthorityDisabled ??
            baseJupiter.mintAuthorityDisabled,
          freezeAuthorityDisabled:
            patchJupiter.freezeAuthorityDisabled ??
            baseJupiter.freezeAuthorityDisabled,
          sectionRank: {
            ...baseJupiter.sectionRank,
            ...(patchJupiter.sectionRank ?? {}),
          },
        }
      : baseJupiter,
  };
}

export function mapBirdeyeToPairPatch(
  token: JsonRecord
): Partial<TokenPair> {
  const logoURI = pickUrl(
    token.logoURI || token.logo_uri || token.logoUrl || token.logo_url
  );

  const buys24 = num(token.buy24h || token.buy_24h);
  const sells24 = num(token.sell24h || token.sell_24h);
  const trade24 = num(
    token.trade24h || token.trade_24h || token.trade_24h_count
  );
  const fallbackBuys =
    buys24 > 0 || sells24 > 0 ? buys24 : Math.round(trade24 / 2);
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
    info: { imageUrl: logoURI || undefined, socials, websites },
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
    liquidity: { usd: num(token.liquidity || token.liquidityUsd) },
    fdv: num(token.fdv),
    marketCap: num(
      token.marketCap || token.marketcap || token.market_cap || token.fdv
    ),
    holder: num(token.holder || token.holders || token.holderCount),
    pairCreatedAt: toTimestampMs(
      token.recent_listing_time || token.last_trade_unix_time
    ),
    txns: { h24: { buys: fallbackBuys, sells: fallbackSells } },
    dexId: str(token.source || token.dexId || "birdeye"),
  };
}

export function mapTokensXyzToPairPatch(
  payload: JsonRecord
): Partial<TokenPair> {
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
    profile.isVerified ||
      profile.verified ||
      asset.isVerified ||
      asset.verified
  );
  const derivedTokensXyzVerified =
    !hasInsufficientData &&
    (marketScoreTone === "safe" ||
      marketScoreGrade === "A" ||
      marketScoreValue >= 85);
  const tokensXyzVerified =
    explicitTokensXyzVerified || derivedTokensXyzVerified;

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
        pickUrl(
          asset.imageUrl || firstVariant.icon || firstVariant.logoURI
        ) || undefined,
      socials,
      websites,
    },
    priceUsd: num(profile.price || stats.price),
    priceChange: {
      h24: num(profile.priceChange24h || stats.priceChange24hPercent),
    },
    volume: { h24: num(profile.volume24h || stats.volume24hUSD) },
    liquidity: { usd: num(stats.liquidity) },
    marketCap: num(profile.marketCap || stats.marketCap),
    fdv: num(profile.fdv),
    tokenXyz: {
      riskLabel: str(marketScore.label),
      riskGrade: str(marketScore.grade),
    },
    tokensXyzVerified,
  };
}
