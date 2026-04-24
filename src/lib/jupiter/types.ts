export type JsonRecord = Record<string, unknown>;
export type HomeSection = "attraction" | "longTerm" | "highRisk";

export const JUPITER_BASE = "https://api.jup.ag/tokens/v2";
export const BIRDEYE_BASE = "https://public-api.birdeye.so";
export const TOKENS_XYZ_BASE = "https://api.tokens.xyz/v1";

export type TokenPair = {
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
