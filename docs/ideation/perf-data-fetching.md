---
title: Data-fetching performance — cache strategy + Jupiter rate-limit fix
status: scoped (paused mid-session — resume from "Resume checklist" below)
captured: 2026-05-20
priority: high (next major engineering focus after NFT Edge)
---

# Data-fetching performance

> The app fans out to 3–6 upstream APIs per page load. Jupiter free-tier rate-limits us (HTTP 429), causing 500s in our route and 5–28s response times. Caching at our edge + caching token metadata in Supabase = the load-bearing fix.

## Status snapshot

```
Paused at:     evidence collected, fix plan drafted, no code change made yet
Why paused:    too many options to evaluate — user wants to ship NFT Edge first
Resume from:   "Resume checklist" at the bottom of this doc
```

## The evidence (don't re-investigate — read this)

User reported during local dev (2026-05-20):

```
GET http://localhost:3001/api/jupiter?type=home&limit=140    500 (Internal Server Error)
GET http://localhost:3001/api/jupiter?type=tokens&limit=140  500 (Internal Server Error)
```

Dev server log root cause:

```
[jupiter/home] jupiter /toporganicscore/24h 429
[jupiter/home] jupiter /toptrending/24h 429
[jupiter/home] jupiter /toptraded/24h 429

GET /api/jupiter?type=home   500 in 5.5s
GET /api/jupiter?type=tokens 500 in 5.2s
GET /api/jupiter?type=list   200 in 27.8s   ◄── 27 SECONDS
```

**What this means:** every home page load fires 3 parallel fetches to `/api/jupiter` with different `type=` params, each hits Jupiter's upstream. Jupiter's free tier rate-limits us (429), our route catches that and returns 500. The one request that does succeed is wildly slow (27s).

## Bonus issue spotted (lower priority)

Upstash Redis credentials in `.env.local` are invalid:

```
[rate-limit] KV error, failing open:
  Error [UpstashError]: WRONGPASS invalid username-password pair or user is disabled
```

[src/lib/rateLimit.ts:103](../../src/lib/rateLimit.ts#L103) fails open (lets the request through without rate-limit protection), so this doesn't break anything — but it means dev has no rate-limit protection, and prod needs the real Upstash creds verified.

## User's hypothesis (confirmed)

> *"different APIs are hit for different info"*

Right. And worse: the same API (`/api/jupiter`) is hit 3× per home load with different `type=` params. Each hits Jupiter upstream.

## The plan when we resume

### Phase 1 — Cache + Supabase metadata bundled

Two interventions, one PR:

```
┌─ Intervention A: Edge cache /api/jupiter responses ───────┐
│                                                           │
│   Add `Cache-Control: s-maxage=60, stale-while-revalidate │
│   =120` headers on /api/jupiter for the public top-N      │
│   queries (no per-user data).                             │
│                                                           │
│   The route already imports CACHE + cachedJson from       │
│   src/lib/cacheControl.ts — looks intended but not wired. │
│                                                           │
│   Win: 99% of requests serve from Vercel edge cache.      │
│        Jupiter only gets hit once per 60s per region.     │
│        No more 429s.                                      │
│                                                           │
│   Effort: ~2 hours                                        │
│   Risk:   low — opt-in per route, easy to roll back       │
└───────────────────────────────────────────────────────────┘

┌─ Intervention B: Supabase metadata cache (Pattern A) ─────┐
│                                                           │
│   Curated list of ~100 major Solana tokens:               │
│   SOL, USDC, USDT, JUP, BONK, WIF, JTO, etc.              │
│                                                           │
│   New table:                                              │
│     CREATE TABLE token_metadata (                         │
│       mint_address     text PRIMARY KEY,                  │
│       symbol           text NOT NULL,                     │
│       name             text,                              │
│       logo_url         text,                              │
│       decimals         smallint,                          │
│       total_supply     numeric,                           │
│       description      text,                              │
│       website          text,                              │
│       twitter          text,                              │
│       telegram         text,                              │
│       launch_date      timestamptz,                       │
│       category         text[],                            │
│       is_curated       boolean DEFAULT false,             │
│       refreshed_at     timestamptz DEFAULT now(),         │
│       refresh_ttl_days int DEFAULT 7,                     │
│       source           text                               │
│     );                                                    │
│                                                           │
│   One-time seed script populates from Birdeye.            │
│   Vercel Cron refreshes daily.                            │
│                                                           │
│   /api/birdeye + /api/jupiter modified:                   │
│     check Supabase first for IMMUTABLE fields             │
│     (name, symbol, logo, decimals, supply)                │
│     only call upstream for LIVE fields                    │
│     (price, 24h change, volume, mcap)                     │
│                                                           │
│   Win: ~60% of payload becomes near-instant.              │
│        Long-tail tokens fall back to current upstream.   │
│                                                           │
│   Effort: 1-1.5 days                                      │
│   Risk:   medium — schema migration + new code path      │
└───────────────────────────────────────────────────────────┘
```

### What's IMMUTABLE vs LIVE (the split that makes this work)

```
IMMUTABLE (cache in Supabase, ~indefinite TTL):
  mint_address, decimals, launch_date

QUASI-STABLE (cache in Supabase, ~7-day TTL):
  symbol, name, logo_url, total_supply, description, links

LIVE (always upstream, no cache — or 30s edge cache):
  price, 24h change %, volume, market cap, FDV, recent txns
```

## Other options considered (and why deferred)

| Option | Effort | Why deferred |
|---|---|---|
| C: React Server Components + streaming | 1-2 days | Bigger architectural change; A+B should be enough first |
| D: Client cache (SWR / React Query) | half day | Helps tab-switches but not cold load; do after A+B if needed |
| Paid Jupiter tier | $$$ | Wrong order — cache first, pay only if cache doesn't go far enough |

## Decision tree for the Supabase pattern (A vs B vs C)

Already mid-discussion. Three sync patterns proposed:

```
Pattern A — Curated seed + cron refresh         (RECOMMENDED START)
  ▸ Manually curate ~100 tokens
  ▸ One-time seed → Vercel Cron daily
  ▸ Long-tail falls back to current upstream

Pattern B — Cache-on-first-access (lazy)
  ▸ First fetch writes to Supabase
  ▸ Subsequent fetches read from cache
  ▸ TTL refresh on access if stale

Pattern C — Hybrid (A + B)
  ▸ Seeded curated layer (always-fresh top 100)
  ▸ Auto-cache long-tail with 7-day TTL
```

**Recommendation:** start with A, evolve to C later if usage patterns demand it.

## Resume checklist (do these in order when picking this back up)

```
1. Read this doc top-to-bottom (5 min)
2. Re-confirm Jupiter 429 still happening (one cold load → check dev log)
3. Decide if A+B is still the right plan, or if anything changed
4. Cut feature branch off main:  perf/jupiter-cache-supabase-metadata
5. Intervention A first (smaller win, half-day):
   - Add cache headers to /api/jupiter list endpoints
   - Verify 429s stop on prod after Vercel edge warms
   - Ship as standalone PR
6. Intervention B next:
   - Write migration SQL for token_metadata table
   - Dry-run on Supabase branch
   - Write seed script with ~100 curated mints
   - Modify /api/birdeye + /api/jupiter to consult cache first
   - Ship as second PR
7. Measure with __perf.capture() before & after each, attach
   to PR body
```

## Diagnostic toolkit

The `__perf.capture()` console script for measuring baseline/improvement lives in the conversation history (search for "DeFi Triangle perf —"). Paste it into Chrome DevTools console, run before & after each intervention to prove the win.

## Out of scope for this work

- App-wide perf observability (logging route durations to DataDog/PostHog) — capture separately later
- Paid Jupiter tier — only if Phase 1 isn't enough
- Image / asset optimization (LCP) — defer
- React rendering perf (memo, lazy) — defer
- Search query optimization — defer

## Prior art / reference

- [SWR with Next.js cache headers](https://nextjs.org/docs/app/api-reference/functions/fetch#optionscache) — what we'd use for intervention A
- [Vercel Edge Network caching](https://vercel.com/docs/edge-network/caching)
- [Supabase TTL patterns](https://supabase.com/docs/guides/database/postgres/triggers) — for the refresh strategy
