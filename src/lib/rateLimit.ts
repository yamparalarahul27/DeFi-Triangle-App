import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

/**
 * Sliding-window rate limiting backed by Vercel KV (Upstash Redis).
 * Fail-open on KV errors — never block users because infra is down.
 *
 * Env vars are prefixed "ratelimit_" because the Vercel KV store is
 * named "rate-limit"; Vercel injects <storeName>_KV_REST_API_URL etc.
 */

const url = process.env.ratelimit_KV_REST_API_URL;
const token = process.env.ratelimit_KV_REST_API_TOKEN;

// Lazy so import-time failures in build don't break anything.
let _redis: Redis | null = null;
function getRedis(): Redis | null {
  if (_redis) return _redis;
  if (!url || !token) return null;
  _redis = new Redis({ url, token });
  return _redis;
}

function makeLimiter(requests: number, window: `${number}${"s" | "m"}`) {
  const redis = getRedis();
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: false,
  });
}

// Tiered limiters — named so we can adjust per-route intent.
let publicReadLimiter: Ratelimit | null = null;
let authFlowLimiter: Ratelimit | null = null;
let sessionLimiter: Ratelimit | null = null;
let walletWriteLimiter: Ratelimit | null = null;

function getPublicReadLimiter() {
  if (!publicReadLimiter) publicReadLimiter = makeLimiter(60, "60s");
  return publicReadLimiter;
}
function getAuthFlowLimiter() {
  if (!authFlowLimiter) authFlowLimiter = makeLimiter(10, "60s");
  return authFlowLimiter;
}
function getSessionLimiter() {
  if (!sessionLimiter) sessionLimiter = makeLimiter(30, "60s");
  return sessionLimiter;
}
function getWalletWriteLimiter() {
  if (!walletWriteLimiter) walletWriteLimiter = makeLimiter(30, "60s");
  return walletWriteLimiter;
}

export type RateLimitTier =
  | "public-read"
  | "auth-flow"
  | "session"
  | "wallet-write";

function limiterFor(tier: RateLimitTier): Ratelimit | null {
  switch (tier) {
    case "public-read":
      return getPublicReadLimiter();
    case "auth-flow":
      return getAuthFlowLimiter();
    case "session":
      return getSessionLimiter();
    case "wallet-write":
      return getWalletWriteLimiter();
  }
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "anonymous";
}

/**
 * Check a request against a tier. Pass optional `identifier` (e.g. wallet
 * address) to bucket per-user instead of per-IP.
 *
 * Returns null if allowed, or a 429 NextResponse if blocked.
 * Fails open if KV is unreachable.
 */
export async function enforceRateLimit(
  req: NextRequest,
  tier: RateLimitTier,
  identifier?: string
): Promise<NextResponse | null> {
  const limiter = limiterFor(tier);
  if (!limiter) return null; // No KV configured → allow

  const key = identifier ?? getClientIp(req);

  try {
    const { success, reset, remaining, limit } = await limiter.limit(
      `${tier}:${key}`
    );
    if (success) return null;

    return NextResponse.json(
      { success: false, error: "rate limited" },
      {
        status: 429,
        headers: {
          "Retry-After": Math.max(
            1,
            Math.ceil((reset - Date.now()) / 1000)
          ).toString(),
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": Math.max(0, remaining).toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      }
    );
  } catch (err) {
    // Fail open on KV errors — do not block users because infra is down.
    console.error("[rate-limit] KV error, failing open:", err);
    return null;
  }
}
