import { NextRequest } from "next/server";
import { fetchJupiterSearch } from "@/lib/jupiter/upstream";
import { num, rec, str } from "@/lib/jupiter/utils";
import type { JsonRecord } from "@/lib/jupiter/types";
import { enforceRateLimit } from "@/lib/rateLimit";
import { CACHE, cachedJson } from "@/lib/cacheControl";
import {
  STABLECOINS,
  type StableLiveData,
  type StablePendingData,
  type StablecoinsPayload,
} from "@/lib/home/stablecoins";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const limited = await enforceRateLimit(req, "public-read");
  if (limited) return limited;

  const pending: StablePendingData[] = STABLECOINS.filter(
    (s) => s.pendingListing
  ).map((s) => ({
    mint: s.mint,
    symbol: s.symbol,
    name: s.name,
    tagline: s.tagline ?? "",
    featured: s.featured,
    iconUrl: s.iconUrl,
    learnMoreUrl: s.learnMoreUrl,
  }));

  const liveEntries = STABLECOINS.filter((s) => !s.pendingListing);

  const liveResults = await Promise.all(
    liveEntries.map(async (entry) => {
      try {
        const rows = await fetchJupiterSearch(entry.mint, 5);
        const match = rows.find((r) => str(r.id) === entry.mint);
        if (!match) return null;
        return mapStableLive(match, entry.mint, entry.symbol, entry.name);
      } catch {
        return null;
      }
    })
  );

  const live: StableLiveData[] = liveResults.filter(
    (r): r is StableLiveData => r !== null
  );

  const payload: StablecoinsPayload = { live, pending };

  return cachedJson({ success: true, data: payload }, CACHE.SEMI_STATIC);
}

function mapStableLive(
  row: JsonRecord,
  fallbackMint: string,
  fallbackSymbol: string,
  fallbackName: string
): StableLiveData {
  const stats24h = rec(row.stats24h);
  const buyVol = num(stats24h.buyVolume);
  const sellVol = num(stats24h.sellVolume);
  const priceUsd = num(row.usdPrice || row.price || row.priceUsd);
  // Signed bps: positive = above peg, negative = below peg. UI uses the sign
  // for direction display; pegState() uses Math.abs() for magnitude buckets.
  // Don't abs here — sign is destructive once stripped.
  const pegDeviationBps =
    priceUsd > 0 ? Math.round((priceUsd - 1) * 10_000) : 0;

  const audit = rec(row.audit);
  const marketCapUsd = num(row.mcap || row.marketCap || row.fdv);
  const circulatingSupply =
    priceUsd > 0 && marketCapUsd > 0 ? marketCapUsd / priceUsd : 0;

  return {
    mint: str(row.id) || fallbackMint,
    symbol: str(row.symbol) || fallbackSymbol,
    name: str(row.name) || fallbackName,
    iconUrl: str(row.icon) || null,
    priceUsd,
    volume24hUsd: buyVol + sellVol,
    liquidityUsd: num(row.liquidity || row.liquidityUsd),
    pegDeviationBps,
    marketCapUsd,
    circulatingSupply,
    mintAuthorityDisabled:
      typeof audit.mintAuthorityDisabled === "boolean"
        ? (audit.mintAuthorityDisabled as boolean)
        : null,
    freezeAuthorityDisabled:
      typeof audit.freezeAuthorityDisabled === "boolean"
        ? (audit.freezeAuthorityDisabled as boolean)
        : null,
    tokenProgram: str(row.tokenProgram) || null,
    jupiterVerified: row.isVerified === true,
  };
}
