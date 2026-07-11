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

  /**
   * NFT Edge — collection browser tab. V1 hard-codes IslandDAO PERKS as
   * the only collection; data cached in Supabase, ME piggyback for live
   * stats. See docs/ideation/nft-edge-data-spike.md.
   */
  NFT_EDGE: true,

  /**
   * /design — tide design-system gallery (noindex). Renders the
   * src/design-system/ components in their states so they can be verified
   * on the Vercel preview. On for branch-preview review; decide before
   * merging to main whether to keep it as a living styleguide in prod or
   * flip to false. See src/design-system/CONVENTIONS.md.
   */
  DESIGN_GALLERY: true,
} as const;
