/**
 * Feature flags for staged rollout.
 *
 * Flip to true in its own PR when the feature is ready to ship to users.
 * Kept as plain constants (not env-backed) so the flag state is versioned
 * in git history — no runtime drift between envs.
 */
export const FEATURES = {
  /**
   * Wallet-authenticated watchlist (connect + star + remove + persist).
   * v0.01: disabled until the watchlist UX is ready.
   */
  WATCHLIST: false,

  /**
   * Header Connect Wallet button. Currently only used by the watchlist
   * flow, so defaults to the same value as WATCHLIST.
   */
  WALLET_CONNECT: false,

  /**
   * "Park Your Money" stablecoin rail at the top of the home page.
   * Off until the curated mint list is verified on the Vercel preview
   * (USDS / USDe mints were added without sandbox verification — see
   * src/lib/home/stablecoins.ts `unverifiedFromSandbox: true` markers).
   */
  STABLECOIN: false,
} as const;
