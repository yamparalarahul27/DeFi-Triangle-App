export type HomeTab = "home" | "watchlist" | "nft-edge";

export type TokenPair = {
  pairAddress?: string;
  baseToken?: { address?: string; symbol?: string; name?: string };
  quoteToken?: { symbol?: string; name?: string };
  info?: {
    imageUrl?: string;
    socials?: { type: string; url: string }[];
    websites?: { url: string }[];
  };
  priceUsd?: number | string;
  priceChange?: { h24?: number | string };
  volume?: { h24?: number | string };
  liquidity?: { usd?: number | string };
  marketCap?: number | string;
  fdv?: number | string;
  holder?: number | string;
  pairCreatedAt?: number | string;
  txns?: { h24?: { buys?: number | string; sells?: number | string } };
  isVerified?: boolean;
  isStrict?: boolean;
  jupiterVerified?: boolean;
  tokensXyzVerified?: boolean;
  [key: string]: unknown;
};

export interface HomeSections {
  attraction: TokenPair[];
  longTerm: TokenPair[];
  highRisk: TokenPair[];
}

export const HOME_JUPITER_ENDPOINTS = [
  "/api/jupiter?type=home&limit=140",
  "/api/jupiter?type=tokens&limit=140",
  "/api/jupiter?type=list&limit=200",
  "/api/jupiter?limit=140",
  "/api/jupiter",
  "/api/jupiter/tokens?limit=140",
] as const;

export const EMPTY_STARRED: Set<string> = new Set();
