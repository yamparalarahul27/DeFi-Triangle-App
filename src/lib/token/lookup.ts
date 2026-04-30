export type LookupResult =
  | { found: true; source: "jupiter" | "helius" }
  | { found: false };

/**
 * Identity gate per source-of-truth lookup contract:
 *   1. Jupiter /search exact-address match
 *   2. Helius DAS getAsset fallback
 *   3. Both miss → not indexed
 *
 * Determines whether a token is real before showing data — separate from the
 * stat fetches (Birdeye, Tokens.xyz), which can return null without meaning
 * the token doesn't exist.
 */
export async function lookupToken(address: string): Promise<LookupResult> {
  if (!address) return { found: false };

  try {
    const res = await fetch(
      `/api/jupiter?type=search&q=${encodeURIComponent(address)}&limit=3`,
      { cache: "no-store" }
    );
    const json = res.ok ? await res.json() : null;
    const rows = Array.isArray(json?.data) ? (json.data as unknown[]) : [];
    const exact = rows.some((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return false;
      const record = item as Record<string, unknown>;
      const base = record.baseToken as Record<string, unknown> | undefined;
      return (
        String(base?.address ?? "").toLowerCase() === address.toLowerCase()
      );
    });
    if (exact) return { found: true, source: "jupiter" };
  } catch {
    // fall through to Helius
  }

  try {
    const res = await fetch(
      `/api/helius?type=getAsset&address=${encodeURIComponent(address)}`,
      { cache: "no-store" }
    );
    const json = res.ok ? await res.json() : null;
    if (json?.success && json.data) {
      return { found: true, source: "helius" };
    }
  } catch {
    // both miss
  }

  return { found: false };
}
