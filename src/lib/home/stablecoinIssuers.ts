/**
 * Issuer metadata for the curated stablecoin list. Keyed by `issuerKey` from
 * src/lib/home/stablecoins.ts so a single issuer (e.g. Circle) can be reused
 * across multiple mints if we ever ship more than one of theirs.
 *
 * Edit this file directly to add or correct an issuer. Avoid runtime fetches
 * for issuer info — these are stable strings and shouldn't depend on the
 * network.
 */

export type StablecoinIssuer = {
  /** Short brand label, e.g. "Circle". */
  name: string;
  /**
   * Compact label used as the card subtitle (under the symbol). Falls back to
   * `name` if absent. Keep this short — the card is 260px wide on mobile.
   */
  shortName?: string;
  /** Canonical website. Opens in a new tab from the modal. */
  url: string;
  /**
   * Short pitch shown in the modal's "Why <symbol>" section. Only used for
   * pending-listing tiles right now; live tiles let the data speak for itself.
   */
  pitch?: string[];
};

export const STABLECOIN_ISSUERS: Record<string, StablecoinIssuer> = {
  palmusd: {
    name: "Palm USD",
    shortName: "Palm USD",
    url: "https://www.palmusd.com/",
    pitch: ["Non-freezable", "Non-blacklistable", "USD-pegged"],
  },
  circle: {
    name: "Circle",
    shortName: "Circle",
    url: "https://www.circle.com/usdc",
  },
  tether: {
    name: "Tether",
    shortName: "Tether",
    url: "https://tether.to/",
  },
  paypal: {
    name: "PayPal",
    shortName: "PayPal",
    url: "https://www.paypal.com/pyusd",
  },
  sky: {
    name: "Sky",
    shortName: "Sky",
    url: "https://sky.money/",
  },
  paxos: {
    name: "Paxos · Global Dollar Network",
    shortName: "Paxos",
    url: "https://www.usdg.com/",
  },
};
