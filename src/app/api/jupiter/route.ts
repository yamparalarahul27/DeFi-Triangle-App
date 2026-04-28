import { NextRequest, NextResponse } from "next/server";
import { buildHomePayload, buildSearchPayload } from "@/lib/jupiter/builders";
import { fetchJupiterSearch } from "@/lib/jupiter/upstream";
import { arr, clamp, num, str } from "@/lib/jupiter/utils";
import type { JsonRecord } from "@/lib/jupiter/types";
import { enforceRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function extractTokenInfo(row: JsonRecord) {
  const firstPool = row.firstPool && typeof row.firstPool === "object"
    ? (row.firstPool as JsonRecord)
    : null;
  const audit = row.audit && typeof row.audit === "object"
    ? (row.audit as JsonRecord)
    : null;
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
