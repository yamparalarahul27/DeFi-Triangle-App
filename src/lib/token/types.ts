/**
 * Token UI-data-contract types.
 *
 * These describe the SHAPE of token data the engine (hooks + lib) produces for
 * the presentation layer to render. They were previously defined inside
 * presentation components (MetaStrip, PriceChart, OnChainPanel, TopHoldersPanel);
 * moved here during the UI-revamp clean-shell so the engine no longer depends on
 * any `@/components/*` file. See docs/engine-contract.md.
 */

// ── Chart candles (was: ui/PriceChart.tsx) ──────────────────────────────────
export type Candle = {
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  unixTime: number;
};

// ── Jupiter token info + per-window metrics (was: token/MetaStrip.tsx) ───────
export type JupiterWindowKey = "5m" | "1h" | "6h" | "24h";

export interface JupiterWindowMetrics {
  numBuys?: number;
  numSells?: number;
  buyVolumeUsd?: number;
  sellVolumeUsd?: number;
  numNetBuyers?: number;
  numOrganicBuyers?: number;
  buyOrganicVolumeUsd?: number;
  sellOrganicVolumeUsd?: number;
  priceChangePct?: number;
}

export type JupiterWindowsByKey = Partial<
  Record<JupiterWindowKey, JupiterWindowMetrics>
>;

export interface JupiterTokenInfo {
  address: string;
  name: string | null;
  symbol: string | null;
  icon: string | null;
  decimals: number | null;
  tokenProgram: string | null;
  organicScore: number | null;
  organicScoreLabel: string | null;
  isVerified: boolean;
  tags: string[];
  firstPool: { createdAt: string | null } | null;
  audit: {
    mintAuthorityDisabled: boolean | null;
    freezeAuthorityDisabled: boolean | null;
  } | null;
  windows: JupiterWindowsByKey | null;
}

export interface MetaStripData {
  jupiter: JupiterTokenInfo | null;
  numberMarkets: number | null;
}

// ── On-chain truth (was: token/OnChainPanel.tsx) ────────────────────────────
export interface OnChainAccountInfo {
  mintAuthority: string | null;
  freezeAuthority: string | null;
}

export interface OnChainAsset {
  mutable: boolean;
  burnt: boolean;
  royalty: { percent: number; target: string | null } | null;
}

export interface OnChainData {
  accountInfo: OnChainAccountInfo | null;
  asset: OnChainAsset | null;
  /** Price reported by Helius DAS getAsset.token_info.price_info.price_per_token.
   * Not rendered in the panel — exposed for the price-divergence flag (D2). */
  dasPrice: number | null;
}

// ── Top holders (was: token/TopHoldersPanel.tsx) ────────────────────────────
export interface HolderRow {
  owner: string;
  amount: string;
  decimals: number;
  uiAmount: number;
}
