import { NextRequest, NextResponse } from "next/server";
import { buildHomePayload, buildSearchPayload } from "@/lib/jupiter/builders";
import { fetchJupiterSearch } from "@/lib/jupiter/upstream";
import { arr, clamp, num, str } from "@/lib/jupiter/utils";
import type { JsonRecord } from "@/lib/jupiter/types";
import { enforceRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const JUPITER_WINDOW_KEYS = ["5m", "1h", "6h", "24h"] as const;

function extractJupiterWindow(stats: JsonRecord | null) {
  if (!stats) return null;
  const out: Record<string, number> = {};
  const numFromKey = (k: string) =>
    typeof stats[k] === "number" && Number.isFinite(stats[k] as number)
      ? (stats[k] as number)
      : null;

  const numBuys = numFromKey("numBuys");
  if (numBuys != null) out.numBuys = numBuys;
  const numSells = numFromKey("numSells");
  if (numSells != null) out.numSells = numSells;
  const buyVolume = numFromKey("buyVolume");
  if (buyVolume != null) out.buyVolumeUsd = buyVolume;
  const sellVolume = numFromKey("sellVolume");
  if (sellVolume != null) out.sellVolumeUsd = sellVolume;
  const numNetBuyers = numFromKey("numNetBuyers");
  if (numNetBuyers != null) out.numNetBuyers = numNetBuyers;
  const numOrganicBuyers = numFromKey("numOrganicBuyers");
  if (numOrganicBuyers != null) out.numOrganicBuyers = numOrganicBuyers;
  const buyOrganicVolume = numFromKey("buyOrganicVolume");
  if (buyOrganicVolume != null) out.buyOrganicVolumeUsd = buyOrganicVolume;
  const sellOrganicVolume = numFromKey("sellOrganicVolume");
  if (sellOrganicVolume != null) out.sellOrganicVolumeUsd = sellOrganicVolume;
  const priceChange = numFromKey("priceChange");
  if (priceChange != null) out.priceChangePct = priceChange;
  return Object.keys(out).length > 0 ? out : null;
}

function extractTokenInfo(row: JsonRecord) {
  const firstPool = row.firstPool && typeof row.firstPool === "object"
    ? (row.firstPool as JsonRecord)
    : null;
  const audit = row.audit && typeof row.audit === "object"
    ? (row.audit as JsonRecord)
    : null;
  const windows: Record<string, Record<string, number>> = {};
  for (const k of JUPITER_WINDOW_KEYS) {
    const stats = row[`stats${k}`];
    if (stats && typeof stats === "object") {
      const extracted = extractJupiterWindow(stats as JsonRecord);
      if (extracted) windows[k] = extracted;
    }
  }
  return {
    address: str(row.id),
    tokenProgram: str(row.tokenProgram) || null,
    organicScore: typeof row.organicScore === "number" ? row.organicScore : null,
    organicScoreLabel: str(row.organicScoreLabel) || null,
    isVerified: row.isVerified === true,
    tags: arr<string>(row.tags).map(str).filter(Boolean),
    firstPool: firstPool
      ? { createdAt: str(firstPool.createdAt) || null }
      : null,
    audit: audit
      ? {
          mintAuthorityDisabled:
            typeof audit.mintAuthorityDisabled === "boolean"
              ? audit.mintAuthorityDisabled
              : null,
          freezeAuthorityDisabled:
            typeof audit.freezeAuthorityDisabled === "boolean"
              ? audit.freezeAuthorityDisabled
              : null,
        }
      : null,
    windows: Object.keys(windows).length > 0 ? windows : null,
  };
}

export async function GET(req: NextRequest) {
  const limited = await enforceRateLimit(req, "public-read");
  if (limited) return limited;

  const sp = req.nextUrl.searchParams;
  const type = str(sp.get("type") || "home");

  if (
    type !== "home" &&
    type !== "tokens" &&
    type !== "list" &&
    type !== "search" &&
    type !== "tokenInfo"
  ) {
    return NextResponse.json(
      { success: false, error: "invalid type" },
      { status: 400 }
    );
  }

  try {
    if (type === "tokenInfo") {
      const address = str(sp.get("address"));
      if (!address) {
        return NextResponse.json(
          { success: false, error: "address required" },
          { status: 400 }
        );
      }
      const rows = await fetchJupiterSearch(address, 5);
      const match = rows.find((r) => str(r.id) === address);
      return NextResponse.json({
        success: true,
        data: match ? extractTokenInfo(match) : null,
      });
    }

    if (type === "search") {
      const q = str(sp.get("q"));
      if (!q) {
        return NextResponse.json(
          { success: false, error: "q required" },
          { status: 400 }
        );
      }
      const limit = clamp(num(sp.get("limit"), 10), 1, 50);
      const payload = await buildSearchPayload(q, limit);
      return NextResponse.json({ success: true, ...payload });
    }

    const limit = clamp(num(sp.get("limit"), 120), 30, 200);
    const payload = await buildHomePayload(limit);
    return NextResponse.json({ success: true, ...payload });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[jupiter/home] ${message}`);
    return NextResponse.json(
      { success: false, error: "upstream error" },
      { status: 500 }
    );
  }
}
