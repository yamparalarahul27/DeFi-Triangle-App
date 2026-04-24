import type { HomeSections, TokenPair } from "./types";

export function adaptHomeSectionsPayload(payload: unknown): HomeSections | null {
  const root = asRecord(payload);
  if (!root) return null;

  const sections = asRecord(root.sections);
  if (!sections) return null;

  const attraction = adaptTokenArray(sections.attraction);
  const longTerm = adaptTokenArray(sections.longTerm);
  const highRisk = adaptTokenArray(sections.highRisk);

  if (attraction.length + longTerm.length + highRisk.length === 0) {
    return null;
  }

  return { attraction, longTerm, highRisk };
}

export function flattenSections(sections: HomeSections | null): TokenPair[] {
  if (!sections) return [];
  return [...sections.attraction, ...sections.longTerm, ...sections.highRisk];
}

export function adaptJupiterPayloadToPairs(payload: unknown): TokenPair[] {
  const rows = extractTokenRows(payload);
  if (rows.length === 0) return [];

  const unique = new Set<string>();
  const out: TokenPair[] = [];

  for (let i = 0; i < rows.length; i += 1) {
    const pair = adaptTokenLikeToPair(rows[i]);
    if (!pair) continue;
    const key = tokenKey(pair);
    if (!key || unique.has(key)) continue;
    unique.add(key);
    out.push(pair);
  }

  return out;
}

function adaptTokenArray(input: unknown): TokenPair[] {
  if (!Array.isArray(input)) return [];
  const out: TokenPair[] = [];
  const unique = new Set<string>();

  for (const row of input) {
    const pair = adaptTokenLikeToPair(row);
    if (!pair) continue;
    const key = tokenKey(pair);
    if (!key || unique.has(key)) continue;
    unique.add(key);
    out.push(pair);
  }

  return out;
}

function extractTokenRows(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;

  const queue: unknown[] = [payload];
  const seen = new Set<unknown>();
  const candidateKeys = [
    "data",
    "tokens",
    "items",
    "results",
    "pairs",
    "assets",
    "list",
    "rows",
  ] as const;

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || typeof current !== "object" || seen.has(current)) continue;
    seen.add(current);

    const record = current as Record<string, unknown>;

    for (const key of candidateKeys) {
      const candidate = record[key];
      if (Array.isArray(candidate) && looksLikeTokenArray(candidate)) {
        return candidate;
      }
    }

    for (const value of Object.values(record)) {
      if (Array.isArray(value) && looksLikeTokenArray(value)) {
        return value;
      }
    }

    for (const value of Object.values(record)) {
      if (value && typeof value === "object") {
        queue.push(value);
      }
    }
  }

  return [];
}

function looksLikeTokenArray(value: unknown[]): boolean {
  if (value.length === 0) return true;
  return value.some((item) => !!item && typeof item === "object" && !Array.isArray(item));
}

function adaptTokenLikeToPair(value: unknown): TokenPair | null {
  const rec = asRecord(value);
  if (!rec) return null;

  const address = pickString(rec, [
    ["baseToken", "address"],
    ["base", "address"],
    ["token", "address"],
    ["address"],
    ["tokenAddress"],
    ["token_address"],
    ["mint"],
    ["id"],
    ["contractAddress"],
    ["contract_address"],
    ["tokenMint"],
    ["token_mint"],
    ["assetId"],
  ]);
  if (!address) return null;

  const symbol =
    pickString(rec, [
      ["baseToken", "symbol"],
      ["token", "symbol"],
      ["symbol"],
      ["ticker"],
      ["tokenSymbol"],
      ["token_symbol"],
    ]) || "???";

  const name =
    pickString(rec, [
      ["baseToken", "name"],
      ["token", "name"],
      ["name"],
      ["tokenName"],
      ["token_name"],
    ]) || symbol;

  const quoteSymbol =
    pickString(rec, [
      ["quoteToken", "symbol"],
      ["quote", "symbol"],
      ["quoteSymbol"],
      ["quote_symbol"],
    ]) || "USD";

  const imageUrl = pickString(rec, [
    ["info", "imageUrl"],
    ["logoURI"],
    ["logo_uri"],
    ["logoUrl"],
    ["logo_url"],
    ["imageUrl"],
    ["image_url"],
    ["icon"],
    ["iconUrl"],
  ]);

  const buys24 = pickNumber(rec, [
    ["txns", "h24", "buys"],
    ["transactions", "h24", "buys"],
    ["buys24h"],
    ["buy24h"],
    ["buy_24h"],
    ["buys"],
  ]);
  const sells24 = pickNumber(rec, [
    ["txns", "h24", "sells"],
    ["transactions", "h24", "sells"],
    ["sells24h"],
    ["sell24h"],
    ["sell_24h"],
    ["sells"],
  ]);
  const trade24 = pickNumber(rec, [
    ["trade24h"],
    ["trade_24h"],
    ["txns", "h24", "total"],
    ["transactions", "h24", "total"],
    ["swaps24h"],
  ]);

  const fallbackBuys =
    buys24 > 0 || sells24 > 0 ? buys24 : Math.round(Math.max(0, trade24) / 2);
  const fallbackSells =
    buys24 > 0 || sells24 > 0 ? sells24 : Math.max(0, trade24 - fallbackBuys);

  const marketCap = pickNumber(rec, [
    ["marketCap"],
    ["marketcap"],
    ["market_cap"],
    ["stats", "marketCap"],
    ["stats", "market_cap"],
    ["market", "marketCap"],
  ]);

  const fdv = pickNumber(rec, [
    ["fdv"],
    ["fullyDilutedValuation"],
    ["fully_diluted_valuation"],
  ]);

  const rawTags = getPath(rec, ["tags"]);
  const tags = Array.isArray(rawTags)
    ? rawTags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean)
    : [];
  const strictFromTags = tags.includes("strict") || tags.includes("jupiter-strict");
  const verifiedFromTags =
    tags.includes("verified") || tags.includes("moonshot-verified");
  const isStrict =
    pickBoolean(rec, [["isStrict"], ["strict"], ["jupiter", "isStrict"]]) ||
    strictFromTags;
  const jupiterVerified =
    pickBoolean(rec, [["isVerified"], ["verified"], ["jupiter", "isVerified"]]) ||
    verifiedFromTags ||
    isStrict;
  const tokensXyzVerifiedFromFlag = pickBoolean(rec, [
    ["tokensXyzVerified"],
    ["tokenXyz", "isVerified"],
    ["tokenXyz", "verified"],
    ["profile", "isVerified"],
    ["profile", "verified"],
  ]);
  const riskGrade = pickString(rec, [["tokenXyz", "riskGrade"], ["risk", "marketScore", "grade"]]).toUpperCase();
  const riskLabel = pickString(rec, [["tokenXyz", "riskLabel"], ["risk", "marketScore", "label"]]).toLowerCase();
  const tokensXyzVerified =
    tokensXyzVerifiedFromFlag ||
    riskGrade === "A" ||
    riskLabel === "established";
  const isVerified = tokensXyzVerified;

  return {
    pairAddress:
      pickString(rec, [["pairAddress"], ["pair_address"], ["address"]]) || address,
    baseToken: { address, symbol, name },
    quoteToken: { symbol: quoteSymbol, name: quoteSymbol },
    info: {
      imageUrl: imageUrl || undefined,
      socials: extractSocials(rec),
      websites: extractWebsites(rec),
    },
    priceUsd: pickNumber(rec, [
      ["priceUsd"],
      ["price_usd"],
      ["price"],
      ["usdPrice"],
      ["usd_price"],
      ["stats", "price"],
      ["market", "price"],
    ]),
    priceChange: {
      h24: pickNumber(rec, [
        ["priceChange", "h24"],
        ["priceChange24h"],
        ["price_change_24h"],
        ["priceChange24hPercent"],
        ["price24hChangePercent"],
        ["price_change_24h_percent"],
        ["stats", "priceChange24hPercent"],
        ["market", "priceChange24hPercent"],
      ]),
    },
    volume: {
      h24: pickNumber(rec, [
        ["volume", "h24"],
        ["volume24hUSD"],
        ["volume24h"],
        ["volume_24h"],
        ["volume_24h_usd"],
        ["stats", "volume24hUSD"],
        ["market", "volume24hUSD"],
      ]),
    },
    liquidity: {
      usd: pickNumber(rec, [
        ["liquidity", "usd"],
        ["liquidityUsd"],
        ["liquidity_usd"],
        ["liquidity"],
        ["stats", "liquidity"],
        ["market", "liquidity"],
      ]),
    },
    marketCap: marketCap || fdv,
    fdv,
    holder: pickNumber(rec, [
      ["holder"],
      ["holders"],
      ["holderCount"],
      ["holdersCount"],
      ["holders_count"],
    ]),
    pairCreatedAt: pickTimestamp(rec, [
      ["pairCreatedAt"],
      ["pair_created_at"],
      ["createdAt"],
      ["created_at"],
      ["launchTime"],
      ["launch_time"],
      ["lastTradeUnixTime"],
      ["last_trade_unix_time"],
    ]),
    txns: {
      h24: { buys: fallbackBuys, sells: fallbackSells },
    },
    isVerified,
    isStrict,
    jupiterVerified,
    tokensXyzVerified,
    dexId:
      pickString(rec, [["dexId"], ["dex"], ["source"], ["provider"]]) || "jupiter",
  };
}

function extractSocials(rec: Record<string, unknown>) {
  const out: { type: string; url: string }[] = [];
  const seen = new Set<string>();

  const push = (type: string, url: string) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    out.push({ type, url });
  };

  const appendFromArray = (value: unknown, fallbackType = "link") => {
    if (!Array.isArray(value)) return;
    for (const entry of value) {
      if (typeof entry === "string") {
        push(fallbackType, entry);
        continue;
      }
      const item = asRecord(entry);
      if (!item) continue;
      const url = pickString(item, [["url"], ["href"], ["link"], ["value"]]);
      if (!url) continue;
      const type = pickString(item, [["type"], ["name"], ["platform"]]) || fallbackType;
      push(type, url);
    }
  };

  appendFromArray(getPath(rec, ["info", "socials"]));
  appendFromArray(rec["socials"]);

  const links = asRecord(rec["links"]);
  if (links) {
    push("twitter", pickString(links, [["twitter"], ["x"]]));
    push("telegram", pickString(links, [["telegram"]]));
    push("discord", pickString(links, [["discord"]]));
  }

  const extensions = asRecord(rec["extensions"]);
  if (extensions) {
    push("twitter", pickString(extensions, [["twitter"], ["x"]]));
    push("telegram", pickString(extensions, [["telegram"]]));
    push("discord", pickString(extensions, [["discord"]]));
  }

  return out;
}

function extractWebsites(rec: Record<string, unknown>) {
  const out: { url: string }[] = [];
  const seen = new Set<string>();

  const push = (url: string) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    out.push({ url });
  };

  const appendFromArray = (value: unknown) => {
    if (!Array.isArray(value)) return;
    for (const entry of value) {
      if (typeof entry === "string") {
        push(entry);
        continue;
      }
      const item = asRecord(entry);
      if (!item) continue;
      const url = pickString(item, [["url"], ["href"], ["link"], ["value"]]);
      push(url);
    }
  };

  appendFromArray(getPath(rec, ["info", "websites"]));
  appendFromArray(rec["websites"]);

  const links = asRecord(rec["links"]);
  if (links) {
    push(pickString(links, [["website"], ["homepage"], ["site"]]));
  }

  const extensions = asRecord(rec["extensions"]);
  if (extensions) {
    push(pickString(extensions, [["website"], ["homepage"], ["site"]]));
  }

  return out;
}

function tokenKey(pair: TokenPair): string {
  return pair?.baseToken?.address ?? pair?.pairAddress ?? "";
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function getPath(record: Record<string, unknown>, path: readonly string[]): unknown {
  let current: unknown = record;
  for (const key of path) {
    if (!current || typeof current !== "object" || Array.isArray(current)) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

function pickString(
  record: Record<string, unknown>,
  paths: readonly (readonly string[])[]
): string {
  for (const path of paths) {
    const value = getPath(record, path);
    if (typeof value === "string") {
      const normalized = value.trim();
      if (normalized) return normalized;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }
  return "";
}

function pickNumber(
  record: Record<string, unknown>,
  paths: readonly (readonly string[])[]
): number {
  for (const path of paths) {
    const parsed = toNumber(getPath(record, path));
    if (parsed !== null) return parsed;
  }
  return 0;
}

function pickBoolean(
  record: Record<string, unknown>,
  paths: readonly (readonly string[])[]
): boolean {
  for (const path of paths) {
    const parsed = toBoolean(getPath(record, path));
    if (parsed !== null) return parsed;
  }
  return false;
}

function pickTimestamp(
  record: Record<string, unknown>,
  paths: readonly (readonly string[])[]
): number {
  for (const path of paths) {
    const parsed = toTimestamp(getPath(record, path));
    if (parsed > 0) return parsed;
  }
  return 0;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const normalized = value.replace(/[$,%\s,]/g, "");
    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function toBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1" || normalized === "yes") {
      return true;
    }
    if (normalized === "false" || normalized === "0" || normalized === "no") {
      return false;
    }
  }
  return null;
}

function toTimestamp(value: unknown): number {
  const numeric = toNumber(value);
  if (numeric !== null && numeric > 0) {
    return numeric > 1e11 ? numeric : numeric * 1000;
  }
  if (typeof value === "string") {
    const parsedDate = Date.parse(value);
    if (Number.isFinite(parsedDate) && parsedDate > 0) {
      return parsedDate;
    }
  }
  return 0;
}
