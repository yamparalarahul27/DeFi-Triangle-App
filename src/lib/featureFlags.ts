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
  WATCHLIST: true,

  /**
   * Header Connect Wallet button. Currently only used by the watchlist
   * flow, so defaults to the same value as WATCHLIST.
   */
  WALLET_CONNECT: true,
} as const;
