export interface TokenMarket {
  price: number;
  liquidity: number;
  volume24hUSD: number;
  marketCap: number;
  priceChange24hPercent: number;
  priceChange1hPercent: number;
  decimals: number;
  logoURI: string;
  lastFetchedAt: number;
}

export type VariantKind =
  | "native"
  | "wrapped"
  | "bridged"
  | "etf"
  | "yield"
  | "leveraged"
  | "basket"
  | "lst"
  | "stablecoin"
  | "tokenized_equity";

export type TrustTier = "tier1" | "tier2" | "tier3";

export interface Variant {
  variantId: string;
  mint: string;
  kind: VariantKind;
  trustTier: TrustTier;
  tags: string[];
  issuer?: string;
  symbol: string;
  name: string;
  label?: string;
  rank: number;
  liquidityTier?: TrustTier;
  market: TokenMarket;
}

export interface VariantGroups {
  spot?: Variant[];
  etf?: Variant[];
  yield?: Variant[];
  bridged?: Variant[];
  leveraged?: Variant[];
  [key: string]: Variant[] | undefined;
}

export interface AssetStats {
  price: number;
  liquidity: number;
  volume24hUSD: number;
  marketCap: number;
  priceChange24hPercent: number;
  priceChange1hPercent: number;
}

export interface CanonicalMarket {
  source: string;
  coinId?: string;
  price: number;
  marketCap: number;
  volume24hUSD: number;
  priceChange24hPercent: number;
  lastFetchedAt?: number;
  providerLastUpdatedAt?: number;
}

export interface AssetCore {
  assetId: string;
  name: string;
  symbol: string;
  category?: string;
  aliases?: string[];
  symbols?: string[];
  imageUrl?: string;
  stats: AssetStats;
  canonicalMarket?: CanonicalMarket;
  variantGroups: VariantGroups;
}

export interface AssetProfile {
  marketCap: number;
  fdv: number;
  circulatingSupply: number;
  totalSupply: number;
  price: number;
  priceChange24h: number;
  volume24h: number;
  allTimeHigh: number;
  allTimeHighDate: string;
  description: string;
  links: Record<string, string>;
}

export type RiskTone = "safe" | "caution" | "danger";

export interface RiskComponent {
  score: number;
  status: RiskTone;
  hasData: boolean;
}

export interface MarketScore {
  score: number;
  grade: string;
  label: string;
  tone: RiskTone;
  isTrustedLaunch: boolean;
  caps: string[];
  borderlineSignals: string[];
  hasInsufficientData: boolean;
  insufficientDataReason: string | null;
  components: {
    liquidityHealth: RiskComponent;
    holderDistribution: RiskComponent;
    tradingActivity: RiskComponent;
    holderCount: RiskComponent;
  };
  tokenAgeDays: number | null;
}

export interface RiskScoreInput {
  liquidityUsd: number;
  marketCapUsd: number;
  holderCount: number | null;
  top10HoldersPercent: number | null;
  volume24hUsd: number;
  volume7dUsd: number;
  tokenMintTime: number | null;
  tokenAddress: string;
}

export interface RiskData {
  tokenData: unknown;
  tradingData: unknown;
  marketScoreInput: RiskScoreInput;
  marketScore: MarketScore;
}

export interface MarketVenue {
  address: string;
  base: { address: string; decimals: number; icon?: string; symbol?: string };
  quote: { address: string; decimals: number; icon?: string; symbol?: string };
  createdAt: string;
  liquidity: number;
  name: string;
  price: number;
  source: string;
  trade24h: number;
  trade24hChangePercent: number;
  uniqueWallet24h: number;
  uniqueWallet24hChangePercent: number;
  volume24h: number;
}

export interface AssetResponse {
  asset: AssetCore;
  includes?: {
    profile?: { ok: boolean; data?: AssetProfile };
    risk?: { ok: boolean; data?: RiskData };
    markets?: {
      ok: boolean;
      data?: {
        markets: MarketVenue[];
        total: number;
        offset: number;
        limit: number;
      };
    };
  };
}
