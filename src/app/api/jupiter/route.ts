import { NextRequest, NextResponse } from "next/server";
import { buildHomePayload, buildSearchPayload } from "@/lib/jupiter/builders";
import { clamp, num, str } from "@/lib/jupiter/utils";
import { enforceRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const limited = await enforceRateLimit(req, "public-read");
  if (limited) return limited;

  const sp = req.nextUrl.searchParams;
  const type = str(sp.get("type") || "home");

  if (
    type !== "home" &&
    type !== "tokens" &&
    type !== "list" &&
    type !== "search"
  ) {
    return NextResponse.json(
      { success: false, error: "invalid type" },
      { status: 400 }
    );
  }

  try {
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
