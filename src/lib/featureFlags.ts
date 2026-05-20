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
   * v1: single watchlist per wallet. Multi-list ("named folders") is
   * backlogged — see docs/ideation/multi-watchlist.md.
   */
  WATCHLIST: true,

  /**
   * Header Connect Wallet button. Currently only used by the watchlist
   * flow, so defaults to the same value as WATCHLIST.
   */
  WALLET_CONNECT: true,

  /**
   * "Park Your Money" stablecoin rail at the top of the home page.
   * On for branch-preview verification. USDS / USDe mints were added
   * without sandbox verification — visually confirm all 6 tiles render
   * on the Vercel preview before merging to stage. See
   * src/lib/home/stablecoins.ts `unverifiedFromSandbox: true` markers.
   */
  STABLECOIN: true,
} as const;
