# Token Details — Session Changelog

**Branches active across sessions:** `claude/review-and-plan-YroJH` (cloud session 1) → `imp-token-details` (local session 2). Both merge into `stage` via PR.

This file records **what shipped** and **what's next**. The roadmap is the plan; this is the audit trail + strategic context.

---

## Session-end state (2026-04-28 IST close)

```
Phase A — Foundation        [ ✅ A1  ✅ A2  ✅ A3 ]
Phase B — Spec compliance   [ ✅ B1  ✅ B2  ✅ B2.5  ✅ B3  ✅ B4 ]
Phase C — Net-new sections  [ ✅ C1  ✅ C2  ✅ C3  ✅ C4  ✅ C5 ]
Phase D — Differentiators   [ ✅ D1  ✅ D2  ✅ D3  ✅ D4  ✅ D5 ]
Polish (cross-cutting)      [ ✅ P1  ⏸ P2  ⏸ P3  ⏸ P4  ⏸ P5  ⏸ P6  ⏸ P7 ]
Backlog                     [ F1  F2  F3 ]
```

**Original Phase A–D scope is fully complete (19 of 19 ships).** The token-details page now renders 11 distinct sections fused from 4 independent data sources, including 5 differentiator signals no other Solana tool surfaces.

- **Last PR open at session close:** #20 (C5 polish — All Markets sort + count). Awaiting merge.
- **PRs #11–#19 already merged into `stage`** during this session.
- **`stage` → `main` promotion has not been done** — staged work is preview-deployed only.

---

## Session 2 — local desktop work, 2026-04-28 IST

10 PRs (#11–#20), 12 commits. Built every Phase C and D ship plus a small chore commit for code-quality hygiene.

### Ships landed (in order)

| PR | Commit | Ship | What it added |
|---|---|---|---|
| #11 | `6052cbd` | **C1 — OnChainPanel** | New section showing Helius chain-truth: mint authority (renounced or address), freeze authority, mutability, burnt flag, royalty. Per-row hide rules. |
| #12 | `de8d465` | **B4 — Invalid-mint hardening** | Validates URL address as Solana `PublicKey` upfront; treats all-zero data payloads as not-found. Closes the "$0 shell" UX gap. **Also formalized 2 new CLAUDE.md rules.** |
| #13 | `4fcf881` | **C2 — MetaStrip** | New section between IdentityStrip and chart with 6 cells: token program ID (copy), organicScore + label (color-tinted), isVerified, tags pills, listed age, market count. Tooltips on organicScore + tags labels (Option A). New shared `Tooltip` primitive built on `radix-ui`. |
| #14 | `786097a` | **D1 — Edge Score ⭐** | Headline differentiator. Pure-function `computeEdgeScore` lib weights chain-truth (Helius) + audit (Jupiter) + risk inputs (Tokens.xyz) into a 0–100 composite with grade A–F. Replaces the prior `RiskPanel` in the page layout (file kept on disk). Expandable per-signal breakdown shows raw value + source attribution for every input. |
| #15 | `2ba8879` | **D2 — Price-source divergence chip** | Small chip in IdentityStrip showing whether 5 independent prices (Jupiter Lite ticker, Birdeye, Tokens.xyz stats, CoinGecko via canonical, Helius DAS) agree. Hover tooltip lists all 5 + computed spread %. **Also added F1 (stablecoin section) to backlog.** |
| #16 | `eb70a1d` + `e6c7bd8` | **D3 + C3** | D3 = inline DEX-vs-CEX spread metric (Birdeye vs CoinGecko) below the divergence chip. C3 = TopHoldersPanel — 10-row Birdeye-fed list with wallet, amount, % of supply. New `/api/birdeye?type=holders` handler. **Also added F2 (live pulse via streaming) and F3 (fresh launches rail) to backlog.** |
| #17 | `e0ed212` | **C4 — TradingActivityPanel** | Pill-selector multi-window panel. Merges 8 Birdeye windows + 4 Jupiter windows (incl. Jupiter-exclusive 6h) into a unified 9-window view. Per-cell source attribution. Foundation for D4. |
| #18 | `4113326` | **D4 — Real-human activity score** | Header inside TradingActivityPanel showing 0–100 grade per window. Combines Birdeye `uniqueWallets` × Jupiter `numOrganicBuyers / numBuys`. Tuned with a 2% organic-ratio anchor so major liquid tokens grade B/A while wash-traded ones drop to F. |
| #19 | `d78c273` + `ac63f4d` | **chore + D5** | chore = vendored-code exemption note in CLAUDE.md + P7 (split birdeye/route.ts) added to backlog. D5 = SlippagePanel showing $1k/$10k/$100k price impact for selling token → USDC via Jupiter Quote API. New `/api/jupiter?type=quote` handler. |
| #20 | `6ecd7ef` | **C5 — All Markets polish** | Sort markets desc by liquidity, add count + sort indicator to header. Last core ship — closes Phase C. |

### CLAUDE.md additions (3 new rules)

1. **"No regressions"** (under "Testing UI features") — every ship must preserve existing behavior; exercise surrounding flows on each visual check; if a regression surfaces, stop and surface before continuing.
2. **"End-user experience is the priority"** (same section) — out-of-scope UX issues spotted during testing get noted as follow-ups, never fixed in-flight; scope creep dilutes ships.
3. **Vendored-code exemption** (under "File size") — `src/components/evilcharts/**` is exempt from the 700-LOC cap. Splitting would break internal coupling and make upstream sync painful.

### Roadmap additions (entries added across the session)

- **F1 — Stablecoin-specific section.** Trigger: Jupiter `tags` includes `"stablecoin"`. Content: peg deviation chart (basis-points scale), reserves backing, issuer info, de-peg history, mint/burn flow.
- **F2 — Live token pulse via streaming gRPC.** Real-time buys/sells indicator using Yellowstone Geyser (provider-agnostic — Helius LaserStream / QuickNode / Triton). Requires paid streaming tier + long-running worker on Railway/Fly/Render.
- **F3 — Fresh launches rail on home page.** New 4th rail surfacing pools < 1h old with Edge Score attached. GMGN-style competitor parity.
- **P7 — Split `src/app/api/birdeye/route.ts`.** Currently 690 LOC after C3/C4; near 700 cap. Captured proposed split into `src/lib/birdeye/{handlers,adapter,filters,client}.ts` with route as thin dispatcher.

### Locked-in decisions added this session

- **Edge Score weights:** mint authority 25 / freeze authority 20 / immutability 5 / liquidity 15 / volume24h 10 / volume7d 5 / age 15 / market cap 5. Tunable in `src/lib/token/edgeScore.ts`. Burnt flag = instant disqualifier (score = 0). Min 3 signals required for valid score.
- **Edge Score buckets:** 90+ A · 75+ B · 60+ C · 40+ D · <40 F.
- **Real-human activity score weights:** unique 0.6, organic 0.4. Organic full credit at 2% ratio (calibrated so major tokens grade B+; wash-traded drops to F).
- **DEX-CEX spread tone bands:** ≤0.5% green, ≤2% amber, >2% red.
- **Slippage tone bands:** same as DEX-CEX (≤0.5% green / ≤2% amber / >2% red).
- **Slippage sizes:** $1k / $10k / $100k. Direction: sell token → USDC. USDC mint hardcoded `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`.
- **Slippage upstream:** `https://lite-api.jup.ag/swap/v1/quote` (the legacy `quote-api.jup.ag/v6` host is deprecated and fails to resolve).
- **Tooltip primitive:** `src/components/ui/Tooltip.tsx` wrapping `radix-ui`'s Tooltip. No new deps — `radix-ui` was already installed.
- **Multi-window data shape:** `src/lib/token/tradingActivity.ts` defines `MultiWindowData` and `WindowMetrics`. Default-active window in TradingActivityPanel is 24h (or largest available).

---

## Session 1 — cloud work, 2026-04-27 → 2026-04-28 (PRs #3–#9)

### What shipped

#### PR #3 — Foundation (A1 + A2 + A3) + chart fallback fix (B1)

- **A1 — Promote `_archive` components.** Moved 8 components from `src/app/_archive/solana/_components/` → `src/components/token/`, and `_utils.ts` → `src/lib/token/utils.ts`. Pure rename + import fixes. `_archive/` tree deleted.
- **A2 — `/api/helius` route.** New server route mirroring the birdeye route shape. Handlers: `getAsset` (DAS), `getAccountInfo`, `getTokenSupply`, `getSignaturesForAddress` (RPC). `HELIUS_API_KEY` server-side only, rate-limited, address validated with `new PublicKey()`, generic error responses.
- **A3 — Extract `useTokenDetails` hook.** Moved data-fetching out of the 576-LOC token page into `src/lib/hooks/useTokenDetails.ts`. Page → 144 LOC; hook → 183 LOC.
- **B1 — Birdeye-primary chart fallback.** Swapped order from `Tokens.xyz → Birdeye → Jupiter 2-candle synth` to `Birdeye → Tokens.xyz → empty state`. Deleted `fetchJupiterDerivedCandles`.

#### PR #4 — Realtime price ticker (B2) + modal parity + NumberFlow

- **B2 — Jupiter Lite Price ticker.** New `useTokenPriceTicker` hook polling `https://lite-api.jup.ag/price/v3` every 1.5s directly from the browser. Wired into `IdentityStrip` + `TokenModal`.
- **`@number-flow/react` digit animations** for price + change % + ATH delta on detail page + modal.
- **B2.5 captured in roadmap** (chart library swap to evilcharts).

#### PR #5 — Jupiter-first lookup (B3)

- **B3 — Lookup contract.** New `src/lib/token/lookup.ts` — Jupiter `/search` exact-match → Helius DAS `getAsset` fallback → not-indexed copy ("Token not indexed yet — try a different address").
- Captured **P1 + P2** polish items in roadmap.

#### PR #6 — Chart range smoothness (P1)

- Added `SpiralLoader` to chart loading states (later reworked in PR #7).

#### PR #7 — Chart swap to evilcharts (B2.5) + upward-triangles

- Replaced hand-rolled `RechartsPriceChart.tsx` with `EvilLineChart` from [`legions-developer/evilcharts`](https://github.com/legions-developer/evilcharts). Vendored 7 files into `src/components/evilcharts/{charts,ui}/` because the shadcn registry is unreachable from the cloud sandbox.
- Added `upward-triangles` background variant matching brand triangle.
- New deps: `motion` (recharts stays at 3.8.1).

#### PR #8 — Chart fixes (range OHLCV, line shape, triangle subtlety)

- `/api/birdeye?type=ohlcv` now accepts `interval` / `time_from` / `time_to` query params (was hardcoded 1H/24h). Range buttons now actually drive different OHLCV.
- Y-axis domain `["auto", "auto"]` for sensible padding.
- Triangle pattern density / opacity reduced. Per-candle dots removed.

#### PR #9 — Doc-only

- `6fcc85e` — added P3 (chart visual polish to match app UI) and P4 (evilcharts loading state polish) to roadmap.
- `a236dd8` — added open-decision note above C2 about tooltips (resolved Option A in session 2).
- `150b835` — first version of this changelog.

---

## Picking up next (cloud session)

### Setup

```bash
# 1) Pull all merged work to date
git checkout stage
git pull origin stage

# 2) Continue on the rolling work branch
git checkout imp-token-details
git reset --hard origin/stage   # if branch is stale; otherwise just pull

# 3) Install deps if package.json changed
npm install

# 4) Local smoke test
cp .env.local.example .env.local   # if you have one; else copy keys manually
# Required keys: BIRDEYE_API_KEY, JUPITER_API_KEY (optional for ticker), TOKENS_XYZ_API_KEY, HELIUS_API_KEY
npm run dev
```

### Verify the setup

- `curl 'http://localhost:3000/api/helius?type=getAsset&address=So11111111111111111111111111111111111111112'` → JSON with name "Wrapped SOL"
- `curl 'http://localhost:3000/api/jupiter?type=tokenInfo&address=So11111111111111111111111111111111111111112'` → JSON with `tokenProgram`, `organicScore`, `decimals`, `windows`
- `curl 'http://localhost:3000/api/birdeye?type=holders&address=So11111111111111111111111111111111111111112&limit=3'` → top 3 holders
- Open `/token/So11111111111111111111111111111111111111112` in browser — every section should render with full data

### Order to consider for next ships

**Recommended next-up — quick polish wins (all single-PR ships, ~30 min – 2 hr each):**

| Priority | Ship | Reason |
|---|---|---|
| 1 | **CLAUDE.md pending followup: brand SVG logos** | Top-left logo is 404-ing in preview/prod — first thing users notice. Either commit `/public/brand/defi_logo_dark.svg` + `/defi_logo_white.svg` or swap `src/components/layout/Header.tsx` to a text wordmark. |
| 2 | **TokenModal chart parity (housekeeping)** | `src/components/ui/TokenModalChart.tsx` still uses hand-rolled recharts. Swap to `EvilLineChart` for visual parity with detail page. Same swap pattern as B2.5, smaller surface. |
| 3 | **`PriceChartSection` header copy** | Says "Price chart · Tokens.xyz" — outdated since B1 made Birdeye primary. Drop the source label or show whichever source actually returned data. |
| 4 | **`useTokenChart` `ohlcvCache` TTL** | Module-level cache never expires; modal re-opens show stale candles. Add 30s TTL or remove the cache. |

**Then the polish track (P2–P7), in roughly priority order:**

| # | Ship | Effort |
|---|---|---|
| **P6** | Caching + progressive section hydration | Medium-large. Highest perceived-speed win. Recommended approach: HTTP `Cache-Control` on API routes + section-split hooks, layer IndexedDB later if needed. |
| P5 | NumberFlow coverage on more mutating numerics | Small. Already done on price + 24h%. Extend to volume / liquidity / mcap / score numbers. |
| P3 | Chart visual polish (match app UI) | Small. Audit line color / axis font / tooltip card / gridlines vs DESIGN.md. |
| P4 | Evilcharts loading state polish | Small. Replace shimmer with SpiralLoader for app parity (recommended in P4 entry). |
| P2 | Reload smoothness (stale-while-revalidate) | Medium. Render cached data instantly on remount, refresh in background. Pairs with P6. |
| **P7** | Split `src/app/api/birdeye/route.ts` | Small-medium. Trigger before the next ship that adds another Birdeye handler — the file is at 690 LOC, no headroom. |

**Then the backlog (F1–F3), bigger bets:**

- **F1 — Stablecoin section.** Half a day. Trigger on Jupiter tag `"stablecoin"`. Peg-deviation chart is the biggest unlock here.
- **F3 — Fresh launches rail on home.** Half a day. Reuses Edge Score on home-page tokens — high value, low surface.
- **F2 — Live token pulse via streaming.** Multi-day. Requires paid Helius LaserStream / QuickNode tier + a long-running worker outside Vercel (Railway/Fly/Render). Highest visible "wow" but biggest infra lift.

---

## Growth & improvement opportunities (strategic)

This section captures **product directions beyond the immediate roadmap** — ideas to consider when planning the next quarter, not the next sprint. Captured here so they don't get lost.

### Where the product sits today

The token-details page now does something **no free Solana tool does**: surfaces 5 differentiator signals (Edge Score with full attribution, 5-source price divergence, DEX-CEX spread, real-human activity score, slippage at size) in one place, fused from 4 independent data sources (Birdeye, Jupiter, Tokens.xyz, Helius). The composite scoring with per-signal source attribution is the **moat** — competitors hide their methodology.

### Strategic directions (not yet in roadmap)

#### 1. Edge Score over time (highest leverage)

Today Edge Score is a snapshot. Storing it in Supabase per token per day unlocks:
- **"Edge Score moved from B to D this week — what changed?"** (delta breakdown identifies which signal degraded)
- **Historical chart** alongside the price chart
- **"Recovering" rail** on home (was risky, getting healthier — reverse momentum)
- **Score-change alerts** (push notification when watched token's grade drops)

This single capability is probably the biggest brand differentiator we could ship — score-history is what turns "tool" into "intelligence platform."

**Effort:** medium. Daily cron, schema, history hook, history mini-chart in EdgeScorePanel.

#### 2. Smart-money flow (curated wallet diff)

- Hand-curate a list of ~50 known "alpha" wallets (top traders by realised PnL, named whales, fund wallets)
- Track their token positions via Helius `getTokenAccounts` per wallet
- Surface: "3 alpha wallets bought $X of this token in the last 24h"
- Render in TopHoldersPanel as a separate "Smart money" tab

**Effort:** medium. Schema for the curated list, polling job, UI.

**Why important:** "Whales bought" is one of the highest-converting signals on competing tools. Doing it with curated wallets is honest and our own list = our own moat.

#### 3. Token compare view (`/compare?a=SOL&b=JUP`)

Side-by-side comparison of 2–3 tokens across all the metrics we already compute: Edge Score, organic score, holders, liquidity, slippage curves, etc. Free wins because the data already exists per-token.

**Effort:** small. Reuse all existing components in a 2-col layout.

**Why important:** people pick between memecoins all day. We can serve that intent natively.

#### 4. Sector / tag rankings

Pages like `/sector/lst` or `/tag/meme` showing all tokens in that category sorted by Edge Score, organic score, etc. Reuses Jupiter `tags` data.

**Effort:** small-medium. New route, list query against existing data.

#### 5. Edge Score embed widget

A `<iframe>`-able badge that any project can paste on their site:
> "Edge Score: A · 92 / 100 — by Y-Vault"

Drives backlinks. Drives brand awareness. Free.

**Effort:** small. New `/embed/edge-score/[mint]` route, simple SVG render.

#### 6. Public API as a product

The composite scoring engine is unique enough to expose as an API:
- `/api/v1/tokens/{mint}/edge-score` — JSON
- Free tier with rate limit, paid tier for bulk
- Keys / quotas via Supabase

**Effort:** medium. Already 80% there since the scoring is server-side.

**Why interesting:** new revenue stream and ecosystem-wide brand.

#### 7. Alerts + watchlist activity

Push notifications + email digest when:
- A watchlisted token's Edge Score drops by N grades
- Mint or freeze authority is reactivated on a watchlisted token (re-rugged?)
- Liquidity drops > X% on a watchlisted token
- Top-10 concentration jumps suddenly (whale accumulation or distribution)

**Effort:** medium-large. Notifications infrastructure, alert thresholds UI, daily/realtime processing job.

**Why critical:** retention. Today the app is a research tool you visit. Alerts make it a thing you receive.

#### 8. Mobile-native app

Web is responsive but a native app unlocks:
- Push notifications (essential for #7)
- Better realtime feel
- Home-screen presence

Plausible via Expo/React Native given the existing React stack.

**Effort:** large but doable with code reuse from web.

### Business / monetization candidates (when product is ready)

- **Pro tier ($19/mo)** — alerts, watchlist limit raise, API access, ad-free, historical Edge Score data
- **Affiliate** — embed Jupiter Swap widget, take a cut of fees on swaps initiated from the app
- **Embed widget paid tier** — basic free, branded white-label for $X/mo
- **Public API tier** — free 100 req/day, paid 10K req/day, enterprise

### Operational health track

- **Upstream cost monitoring.** Track Birdeye CU usage / Jupiter quote requests / Helius RPC calls in a small dashboard. Right now we'd only notice via failures. (~half day to set up basic Vercel KV counters per route.)
- **SLO dashboards.** For each upstream, p50/p95 latency + error rate. Drives confidence in scaling.
- **Dependency / multi-key strategy.** We've already discussed Birdeye's CU caps. When sustained traffic justifies it, multi-key rotation across Birdeye accounts (and a shared key pool with healthy-first selection) earns headroom — but **only with provider's blessing** to avoid ToS issues. Worth planning before scale.
- **`stage → main` promotion cadence.** `stage` has all this work but `main` is on the v0.01 release. Decide a cadence (e.g. weekly bundle, "ready when Phase X done") and document it.
- **Test coverage.** Currently zero automated tests on the new components. Worth adding at least snapshot tests on the major panels (EdgeScorePanel, TradingActivityPanel, TopHoldersPanel) before the next major refactor.

---

## Things noticed but not fixed (carried)

### Minor (good for a polish day)

- `PriceChartSection` header text says "Price chart · Tokens.xyz" — outdated since B1 made Birdeye primary. Fix copy.
- `TokenModal` chart still uses hand-rolled recharts (not evilcharts). Visual parity ship.
- `useTokenChart`'s module-level `ohlcvCache` never expires — modal re-opens show stale candles.
- `RiskPanel.tsx` is still on disk but no longer used (D1 replaced it). Safe to delete in a future cleanup, or leave as a fallback.
- `SOLSCAN_API_KEY` env var should be removed from Vercel (Solscan was dropped from the data layer; only public-explorer links remain to `solscan.io/token/...`).

### From CLAUDE.md "Pending followups"

- **Brand logo SVGs missing** — `Header.tsx` references `/brand/defi_logo_dark.svg` and `/brand/defi_logo_white.svg`. The dir doesn't exist. Logo 404s in preview/prod.
- **Search recents → wallet-scoped server-side** — currently localStorage-only. Listed in CLAUDE.md as the next iteration of Watchlist.

### Architecture / forward-looking

- **`useTokenChart` duplicates logic** from `useTokenDetails`'s `fetchTokenChartCandles`. Worth merging post-C-phase.
- **`useTokenDetails` is 340 LOC and growing.** Consider section-split hooks (per P6) — also splits the file naturally.
- **`src/app/api/birdeye/route.ts` is 690 LOC** (P7 in roadmap). Trigger split when next handler addition pushes it over 700.

---

## Where to read for context

- [`docs/token-details-source-of-truth.md`](./token-details-source-of-truth.md) — locked spec (data sources, render rules, differentiator formulas)
- [`docs/token-details-roadmap.md`](./token-details-roadmap.md) — full step-by-step plan + per-step instructions (Phase A–D + Polish + Backlog)
- [`docs/token-details-plan.md`](./token-details-plan.md) — original recon spike (kept for history)
- [`CLAUDE.md`](../CLAUDE.md) — repo-wide rules (collaboration, behavioral guidelines, secrets, file size, no-regressions, UX priority)
- This file — what shipped, locked decisions, growth ideas
