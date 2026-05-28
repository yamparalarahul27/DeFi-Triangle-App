import { NextRequest, NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { seedCollection } from "@/lib/nft/seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isValidAddress(addr: string): boolean {
  try {
    new PublicKey(addr);
    return true;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const seedToken = process.env.SEED_TOKEN;
  if (!seedToken) {
    return NextResponse.json(
      { success: false, error: "SEED_TOKEN not configured on server" },
      { status: 500 }
    );
  }

  if (req.headers.get("authorization") !== `Bearer ${seedToken}`) {
    return NextResponse.json(
      { success: false, error: "unauthorized" },
      { status: 401 }
    );
  }

  const collection = new URL(req.url).searchParams.get("collection");
  if (!collection || !isValidAddress(collection)) {
    return NextResponse.json(
      { success: false, error: "invalid or missing collection mint" },
      { status: 400 }
    );
  }

  try {
    const result = await seedCollection(collection);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error("[nft/admin/seed] error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "seed failed" },
      { status: 500 }
    );
  }
}
