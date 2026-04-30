import { NextResponse } from "next/server";

export const CACHE = {
  STATIC_LONG: "public, s-maxage=3600, stale-while-revalidate=86400",
  STATIC_MED: "public, s-maxage=300, stale-while-revalidate=1800",
  SEMI_STATIC: "public, s-maxage=60, stale-while-revalidate=300",
  VOLATILE: "public, s-maxage=15, stale-while-revalidate=60",
  NO_CACHE: "no-store",
} as const;

export type CachePolicy = (typeof CACHE)[keyof typeof CACHE];

export function cachedJson(
  body: unknown,
  policy: CachePolicy,
  init: ResponseInit = {}
) {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", policy);
  return NextResponse.json(body, { ...init, headers });
}
