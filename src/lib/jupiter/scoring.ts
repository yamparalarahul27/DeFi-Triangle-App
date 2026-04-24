import type { HomeSection, TokenPair } from "./types";
import { num, str } from "./utils";

export function ageDays(pair: TokenPair): number {
  if (!pair.pairCreatedAt || pair.pairCreatedAt <= 0) return 0;
  return Math.max(0, (Date.now() - pair.pairCreatedAt) / 86_400_000);
}

export function qualityScore(pair: TokenPair): number {
  const liquidity = num(pair.liquidity?.usd);
  const volume = num(pair.volume?.h24);
  const mcap = num(pair.marketCap || pair.fdv);
  const holders = num(pair.holder);
  const organic = num(pair.jupiter?.organicScore);
  const change = Math.abs(num(pair.priceChange?.h24));
  const freshness =
    pair.pairCreatedAt > 0 ? Math.max(0, 365 - ageDays(pair)) : 0;

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

export function passesBaseFilter(pair: TokenPair): boolean {
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

export function sectionScore(pair: TokenPair, section: HomeSection): number {
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

export function pickSectionTokens(
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
        return (
          liquidity >= 400_000 &&
          mcap >= 80_000_000 &&
          Math.abs(change) <= 60
        );
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

export function searchRelevanceScore(pair: TokenPair, query: string): number {
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
