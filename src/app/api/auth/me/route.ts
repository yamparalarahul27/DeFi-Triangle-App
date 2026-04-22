import { NextRequest, NextResponse } from "next/server";
import { getSessionWallet, UnauthorizedError } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
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
