import { NextRequest, NextResponse } from "next/server";
import { getSessionWallet, UnauthorizedError } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const limited = await enforceRateLimit(req, "session");
  if (limited) return limited;

  try {
    const wallet = await getSessionWallet(req);
    return NextResponse.json({ wallet });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    console.error("[auth/me] unexpected error");
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
