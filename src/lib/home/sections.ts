import type { HomeSections, TokenPair } from "./types";

export function buildHomeSections(tokens: TokenPair[]): HomeSections {
  const byAttraction = tokens
    .filter((t) => {
      const change = n(t?.priceChange?.h24);
      return (
        change >= 2 &&
        change <= 300 &&
        n(t?.volume?.h24) >= 100_000 &&
        n(t?.liquidity?.usd) >= 100_000 &&
        n(t?.holder) >= 200
      );
    })
    .sort((a, b) => attractionScore(b) - attractionScore(a));

  const byLongTerm = tokens
    .filter((t) => {
      const age = ageDays(t);
      return (
        n(t?.liquidity?.usd) >= 500_000 &&
        n(t?.marketCap ?? t?.fdv) >= 50_000_000 &&
        n(t?.holder) >= 1_000 &&
        age >= 60 &&
        Math.abs(n(t?.priceChange?.h24)) <= 35
      );
    })
    .sort((a, b) => longTermScore(b) - longTermScore(a));

  const byHighRisk = tokens
    .filter((t) => {
      const mcap = n(t?.marketCap ?? t?.fdv);
      const change = n(t?.priceChange?.h24);
      return (
        mcap >= 1_000_000 &&
        mcap <= 250_000_000 &&
        change >= 8 &&
        change <= 500 &&
        n(t?.volume?.h24) >= 150_000 &&
        n(t?.liquidity?.usd) >= 35_000 &&
        n(t?.holder) >= 80
      );
    })
    .sort((a, b) => highRiskScore(b) - highRiskScore(a));

  const fallbackAttraction = tokens
    .filter(
      (t) =>
        n(t?.priceChange?.h24) > 0 &&
        n(t?.volume?.h24) >= 50_000 &&
        n(t?.liquidity?.usd) >= 50_000
    )
    .sort((a, b) => attractionScore(b) - attractionScore(a));

  const fallbackLongTerm = tokens
    .filter(
      (t) =>
        n(t?.marketCap ?? t?.fdv) >= 20_000_000 &&
        n(t?.liquidity?.usd) >= 250_000 &&
        n(t?.holder) >= 500
    )
    .sort((a, b) => longTermScore(b) - longTermScore(a));

  const fallbackHighRisk = tokens
    .filter(
      (t) =>
        n(t?.priceChange?.h24) >= 5 &&
        n(t?.marketCap ?? t?.fdv) <= 300_000_000 &&
        n(t?.liquidity?.usd) >= 25_000
    )
    .sort((a, b) => highRiskScore(b) - highRiskScore(a));

  const used = new Set<string>();
  return {
    attraction: pickUnique(byAttraction, fallbackAttraction, used, 6),
    longTerm: pickUnique(byLongTerm, fallbackLongTerm, used, 6),
    highRisk: pickUnique(byHighRisk, fallbackHighRisk, used, 6),
  };
}

function pickUnique(
  primary: TokenPair[],
  fallback: TokenPair[],
  used: Set<string>,
  limit: number
): TokenPair[] {
  const out: TokenPair[] = [];

  const tryAdd = (pair: TokenPair) => {
    const key = tokenKey(pair);
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

function tokenKey(pair: TokenPair): string {
  return pair?.baseToken?.address ?? pair?.pairAddress ?? "";
}

function attractionScore(pair: TokenPair): number {
  const change = n(pair?.priceChange?.h24);
  const volume = n(pair?.volume?.h24);
  const liquidity = n(pair?.liquidity?.usd);
  const holders = n(pair?.holder);
  return (
    Math.min(change, 140) * 0.6 +
    Math.log10(volume + 1) * 8 +
    Math.log10(liquidity + 1) * 6 +
    Math.min(holders / 1200, 10)
  );
}

function longTermScore(pair: TokenPair): number {
  const liquidity = n(pair?.liquidity?.usd);
  const mcap = n(pair?.marketCap ?? pair?.fdv);
  const holders = n(pair?.holder);
  const age = ageDays(pair);
  const volatilityPenalty = Math.abs(n(pair?.priceChange?.h24)) * 0.45;
  return (
    Math.log10(liquidity + 1) * 12 +
    Math.log10(mcap + 1) * 12 +
    Math.log10(holders + 1) * 10 +
    Math.min(age / 30, 24) * 1.4 -
    volatilityPenalty
  );
}

function highRiskScore(pair: TokenPair): number {
  const mcap = n(pair?.marketCap ?? pair?.fdv);
  const change = n(pair?.priceChange?.h24);
  const volume = n(pair?.volume?.h24);
  const age = ageDays(pair);
  const microCapBoost = Math.max(0, 180 - mcap / 1_000_000) * 0.35;
  const freshnessBoost = age > 0 ? Math.max(0, 90 - age) * 0.18 : 0;
  return change * 0.65 + Math.log10(volume + 1) * 8 + microCapBoost + freshnessBoost;
}

function ageDays(pair: TokenPair): number {
  const createdAtMs = n(pair?.pairCreatedAt);
  if (createdAtMs <= 0) return 0;
  return Math.max(0, (Date.now() - createdAtMs) / 86_400_000);
}

function n(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}
