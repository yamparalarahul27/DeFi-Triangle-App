/**
 * Curated Solana stablecoin list for the "Park Your Money" home rail.
 *
 * Mints are checked into git so the rail surface is deterministic. To add or
 * remove an entry, edit this file in its own PR — never via runtime config.
 *
 * `pendingListing: true` means the project is recognised but does not yet have
 * Jupiter-quotable liquidity on Solana. The card renders a brand-pitch tile
 * instead of live numbers. Flip to false once Jupiter `/search?query=<mint>`
 * returns metadata + at least one pool.
 */

export type StablecoinEntry = {
  /** Solana SPL mint address. */
  mint: string;
  /** Display symbol (e.g. "USDC"). */
  symbol: string;
  /** Display name (e.g. "USD Coin"). */
  name: string;
  /** Marketing tagline shown on the pending tile. Required when pendingListing. */
  tagline?: string;
  /**
   * If true, the rail renders a "Coming Soon" tile with brand copy instead of
   * fetching live data. Use for tokens whose Solana mint exists but has no
   * indexed liquidity / metadata yet.
   */
  pendingListing?: boolean;
  /**
   * Set to true if the mint has not been verified against Jupiter from this
   * environment yet. Visual check on the Vercel preview is the gate. The flag
   * is informational only — it does not change runtime behaviour.
   */
  unverifiedFromSandbox?: boolean;
};

export const STABLECOINS: StablecoinEntry[] = [
  {
    // Palm USD — featured per product decision. Mint confirmed by Palm USD docs
    // (https://www.palmusd.com/pages/developers.html) and PUSD_INTEGRATION.md.
    // No Jupiter liquidity at the time of writing — pending tile.
    mint: "CZzgUBvxaMLwMhVSLgqJn3npmxoTo6nzMNQPAnwtHF3s",
    symbol: "PUSD",
    name: "Palm USD",
    tagline: "Non-freezable. Non-blacklistable. USD-pegged.",
    pendingListing: true,
  },
  {
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    symbol: "USDC",
    name: "USD Coin",
  },
  {
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    symbol: "USDT",
    name: "Tether USD",
  },
  {
    mint: "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo",
    symbol: "PYUSD",
    name: "PayPal USD",
  },
  {
    // Sky / former MakerDAO USDS rebrand. Wormhole-bridged Solana SPL.
    // Verify on Vercel preview before flipping FEATURES.STABLECOIN to true.
    mint: "USDSwr9ApdHk5bvJKMjzff41FfuX8bSxdKcR81vTwcA",
    symbol: "USDS",
    name: "Sky USDS",
    unverifiedFromSandbox: true,
  },
  {
    // Ethena synthetic dollar. Wormhole-bridged Solana SPL.
    // Verify on Vercel preview before flipping FEATURES.STABLECOIN to true.
    mint: "DEkqHyPN7GMRJ5cArtQFAWefqbZb33Hyf6s5iCwjEonT",
    symbol: "USDe",
    name: "Ethena USDe",
    unverifiedFromSandbox: true,
  },
];

/** Compact shape returned by /api/stablecoins for live (Jupiter-indexed) tokens. */
export type StableLiveData = {
  mint: string;
  symbol: string;
  name: string;
  iconUrl: string | null;
  priceUsd: number;
  volume24hUsd: number;
  liquidityUsd: number;
  /**
   * Distance from $1 in basis points. 100bps = 1%.
   * Computed server-side so all clients see the same threshold buckets.
   */
  pegDeviationBps: number;
};

export type StablePendingData = {
  mint: string;
  symbol: string;
  name: string;
  tagline: string;
};

export type StablecoinsPayload = {
  live: StableLiveData[];
  pending: StablePendingData[];
};

/**
 * Peg-deviation thresholds in basis points. Same scale used by the StableCard
 * to colour the badge.
 *   ≤ 50bps   → "On peg"   (green)
 *   ≤ 200bps  → "Drifting" (amber)
 *   > 200bps  → "Depegged" (red)
 */
export const PEG_THRESHOLDS_BPS = {
  ON_PEG: 50,
  DRIFTING: 200,
} as const;
