# Token Details — Session Changelog

**Branch:** `claude/review-and-plan-YroJH`
**Session window:** 2026-04-27 → 2026-04-28
**Scope:** Phase A + B of [`token-details-roadmap.md`](./token-details-roadmap.md), plus polish items that surfaced during preview testing.

This file records **what shipped** in each PR. The roadmap is the plan; this is the audit trail.

---

## Session-end state (2026-04-28)

```
Phase A — Foundation        [ ✅ A1  ✅ A2  ✅ A3 ]
Phase B — Spec compliance   [ ✅ B1  ✅ B2  ✅ B2.5  ✅ B3 ]
Phase C — Net-new sections  [ ⏸ C1  ⏸ C2  ⏸ C3  ⏸ C4  ⏸ C5 ]
Phase D — Differentiators   [ ⏸ D1  ⏸ D2  ⏸ D3  ⏸ D4  ⏸ D5 ]
Polish (cross-cutting)      [ ✅ P1  ⏸ P2  ⏸ P3  ⏸ P4 ]
```

- **6 feature PRs merged into `stage`:** #3, #4, #5, #6, #7, #8
- **1 fix-only PR merged:** #8 (rolled into the count above)
- **Branch `claude/review-and-plan-YroJH` is 1 commit ahead of stage** — a doc-only commit (`a236dd8`) capturing the C2 open decisions. Will be batched into the next feature PR.
- **`stage` has not been promoted to `main`** during this session.

---

## What shipped, in order

### PR #3 — Foundation (A1 + A2 + A3) + chart fallback fix (B1)
**URL:** https://github.com/yamparalarahul27/defi_triangle_app/pull/3
**Merged:** 2026-04-27 15:34 UTC

- **A1 — Promote `_archive` components.** Moved 8 components from `src/app/_archive/solana/_components/` → `src/components/token/`, and `_utils.ts` → `src/lib/token/utils.ts`. Pure rename + import fixes. `_archive/` tree deleted.
- **A2 — `/api/helius` route.** New server route at `src/app/api/helius/route.ts` mirroring the birdeye route shape. Handlers: `getAsset` (DAS), `getAccountInfo`, `getTokenSupply`, `getSignaturesForAddress` (RPC). `HELIUS_API_KEY` server-side only, rate-limited via `enforceRateLimit(req, "public-read")`, address validated with `new PublicKey()`, generic error responses. **No UI integration yet — plumbing.**
- **A3 — Extract `useTokenDetails` hook.** Moved data-fetching out of the 576-LOC token page into `src/lib/hooks/useTokenDetails.ts`. Page → 144 LOC; hook → 183 LOC; pure builders/merge helpers in `src/lib/token/utils.ts`. No behavior change.
- **B1 — Birdeye-primary chart fallback.** Swapped order from `Tokens.xyz → Birdeye → Jupiter 2-candle synth` to `Birdeye → Tokens.xyz → empty state`. Deleted `fetchJupiterDerivedCandles` (the synth was rendering 2 fake candles for unindexed mints).

### PR #4 — Realtime price ticker (B2) + modal parity + NumberFlow
**URL:** https://github.com/yamparalarahul27/defi_triangle_app/pull/4

- **B2 — Jupiter Lite Price ticker.** New `useTokenPriceTicker` hook polls `https://lite-api.jup.ag/price/v3` every **1.5s** directly from the browser (free, no auth). Wired into `IdentityStrip` on the detail page. Existing 15s comprehensive Birdeye + Tokens.xyz refresh untouched.
- **Modal parity.** Same `useTokenPriceTicker` wired into the dashboard `TokenModal` so the modal price ticks at 1.5s instead of being static.
- **`@number-flow/react` digit animations.** Replaced the manual 150ms opacity flash from B2's first cut with proper per-digit animations on:
  - Detail page: price, 24h change %, ATH delta %
  - Modal: price, 24h change %
- **B2.5 captured in roadmap** (chart library swap to evilcharts).

**New deps:** `@number-flow/react@0.6.0` (MIT). Audit unchanged — same 3 documented Solana ecosystem highs in CLAUDE.md.

### PR #5 — Jupiter-first lookup (B3) + polish track captured
**URL:** https://github.com/yamparalarahul27/defi_triangle_app/pull/5

- **B3 — Lookup contract.** New `src/lib/token/lookup.ts` with `lookupToken(address)` — tries Jupiter `/search` exact-match, then Helius DAS `getAsset` fallback, returns `{ found, source }` or `{ found: false }`.
- `useTokenDetails` runs the lookup once per address (separate from the 15s stats poll), tracks state via address-keyed object (avoids `react-hooks/set-state-in-effect`).
- `/token/[address]/page.tsx` — when both lookup sources miss AND no stat sources returned data, renders **"Token not indexed yet — try a different address"** instead of the generic "Unable to load token right now."
- Captured **P1 + P2** polish items in the roadmap from PR #4 testing feedback (chart range smoothness + reload/SWR smoothness).

### PR #6 — Chart range smoothness (P1)
**URL:** https://github.com/yamparalarahul27/defi_triangle_app/pull/6

- Added `SpiralLoader` to chart loading states matching the home dashboard pattern.
- (Note: this loader treatment was later reworked in PR #7 because the user wanted it removed from next-to-the-buttons. Kept here for the audit trail.)

### PR #7 — Chart swap to evilcharts (B2.5) + upward-triangles
**URL:** https://github.com/yamparalarahul27/defi_triangle_app/pull/7

- **B2.5 shipped.** Replaced hand-rolled `RechartsPriceChart.tsx` with `EvilLineChart` from [`legions-developer/evilcharts`](https://github.com/legions-developer/evilcharts).
- The shadcn registry is unreachable from the cloud sandbox, so files were vendored directly from GitHub raw into `src/components/evilcharts/{charts,ui}/`. 7 files: `line-chart.tsx`, `chart.tsx`, `tooltip.tsx`, `legend.tsx`, `dot.tsx`, `evil-brush.tsx`, `background.tsx`.
- Import paths rewritten from `@/registry/*` → `@/components/evilcharts/*`.
- **Added `upward-triangles` background variant** alongside the upstream `falling-triangles` — apex-up SVG matching the project's brand triangle.
- `PriceChartSection.tsx` rewritten to use `EvilLineChart` with `backgroundVariant="upward-triangles"`, brand colors (`#19549b` light / `#3B7DDD` dark), `curveType="monotone"`, adapter `Candle[]` → `{ time, price }[]`.
- `RechartsPriceChart.tsx` deleted (no remaining consumers; `TokenModalChart.tsx` is a separate file).
- Loader UX reworked per user feedback — no spinner next to range buttons. EvilLineChart's built-in `isLoading` shimmer fires only on initial load.

**New deps:** `motion` (peer of evilcharts components — successor to framer-motion). recharts stays at `3.8.1` (evilcharts compiled cleanly against it; downgrade to `2.15.4` was not needed). Audit unchanged.

### PR #8 — Chart fixes (range OHLCV, line shape, triangle subtlety)
**URL:** https://github.com/yamparalarahul27/defi_triangle_app/pull/8

Fix-only PR — three real bugs spotted in PR #7 testing:

1. **Chart didn't react to range change.** `/api/birdeye?type=ohlcv` was hardcoded `&type=1H&time_from=now-24h&time_to=now`. Every range button refetched but received the same payload.
   - `src/app/api/birdeye/route.ts` — `handleOhlcv` now accepts `interval` / `time_from` / `time_to` query params, validated against Birdeye's allowed interval set. Defaults to 1H/24h for backward compat with `useTokenChart` (TokenModal's chart).
   - `src/lib/hooks/useTokenDetails.ts` — `fetchTokenChartCandles` passes `range.interval` + lookback to the new params.
   - **After:** 1D=24 hourly candles, 1W=168 hourly, 1M=~180 4-hour, 3M=90 daily, 1Y=365 daily.
2. **Line looked flat.** Y-axis defaulted to `[0, 'auto']`. `PriceChartSection.tsx` now sets `yAxisProps.domain = ["auto", "auto"]` so recharts fits the data range with sensible padding.
3. **Background too loud + dots cluttered.** Triangle pattern unit `18x36 → 32x56` (sparser), `fillOpacity 0.4 → 0.18`. `dotVariant="default"` removed (only `activeDotVariant` for hover). Line renders without per-candle markers.

### Doc-only commits on `claude/review-and-plan-YroJH` (not yet on stage)

- `6fcc85e` — added **P3** (chart visual polish to match app UI) and **P4** (evilcharts loading state polish) to roadmap, captured from PR #8 testing feedback.
- `a236dd8` — added open-decision note above C2 in roadmap (tooltip A/B + locked placement + tooltip definitions for organicScore/tags).

These will be carried into the next feature PR's diff.

---

## Open decisions to resolve when picking up

### C2 — Token meta strip (next-after-C1)
> Tooltip strategy: bundle info tooltips for `organicScore` + `tags` as part of C2 (Option A — recommended) vs. ship without and retrofit later (Option B).
> Definitions for the tooltips are pre-baked in the roadmap above the C2 step.

### Browser testing not exhaustively done
- Most PRs were merged after CI green + a smoke check. The user reviewed PR #7's chart visually and surfaced PR #8's bug fixes. For C-phase work going forward, recommend at least one targeted local browser pass per ship.

---

## Locked-in decisions (do not relitigate)

- **Birdeye-primary chart fallback** (B1).
- **Jupiter Lite Price for the live ticker** at 1.5s, browser-direct (no proxy).
- **Helius for chain truth** via the `/api/helius` route. Rate-limited, key never crosses to client.
- **Evilcharts vendored at `src/components/evilcharts/*`**, recharts stays at 3.8.1, `motion` is a runtime dep, `upward-triangles` is the chart background variant.
- **NumberFlow** (`@number-flow/react`) handles digit animation on price + change % + ATH delta on detail + modal.
- **C2 placement:** below `IdentityStrip`, above `PriceChartSection`.
- **Lookup gate UX:** "Token not indexed yet — try a different address" when both Jupiter and Helius miss.

---

## Suggestions for picking up locally

### Setup
```bash
# 1) Pull all merged work
git checkout stage
git pull origin stage

# 2) Continue on the same in-flight branch
git checkout claude/review-and-plan-YroJH

# 3) Sync the in-flight branch with stage so the next PR diff is clean
git pull origin stage --no-edit

# 4) Install new deps (motion, @number-flow/react were added this session)
npm install
```

### Before starting C1
- Confirm `HELIUS_API_KEY` is set in your local `.env.local` (just the UUID, no `https://...` prefix — see notes in `docs/token-details-plan.md`).
- Smoke-test `/api/helius` from local: `curl 'http://localhost:3000/api/helius?type=getAsset&address=So11111111111111111111111111111111111111112'` should return JSON with `result.content.metadata.name === "Wrapped SOL"`.

### npm audit accepted findings
The 3 high-severity vulns reported by `npm audit` are documented in CLAUDE.md as upstream Solana ecosystem issues (`bigint-buffer` chain via `@jup-ag/wallet-adapter`). Neither `@number-flow/react` nor `motion` introduced new high/critical findings. Do **not** run `npm audit fix --force` — it'll downgrade Next.js.

---

## Things I noticed but didn't fix (suggestions)

### Minor
- **`PriceChartSection` header text says "Price chart · Tokens.xyz"** — outdated since B1 made Birdeye primary. Either change to "Birdeye" / drop the source label entirely / show whichever source actually returned data.
- **TokenModal chart still uses the hand-rolled recharts** (`src/components/ui/TokenModalChart.tsx` + `src/lib/hooks/useTokenChart.ts`). For visual parity with the new evilcharts detail-page chart, this is a small follow-up — same swap pattern, smaller surface.
- **`useTokenChart` chart cache (`ohlcvCache`)** is module-level and never expires. Re-opening the same token in the dashboard modal shows session-old candles. Worth a TTL or just removing the cache.

### From CLAUDE.md "Pending followups" — still pending
- **Brand logo SVGs missing.** `src/components/layout/Header.tsx` references `/brand/defi_logo_dark.svg` and `/brand/defi_logo_white.svg` which don't exist in `public/brand/`. The top-left logo is 404-ing in preview/production. Either commit the SVGs or swap to a text wordmark.
- **Search recents → wallet-scoped server-side storage.** Listed in CLAUDE.md as the next iteration of the Watchlist feature; out of scope for the token-details roadmap but worth flagging when planning what to ship after Phase C/D.

### Architecture / forward-looking
- **The `useTokenChart` hook duplicates a lot of logic** from `useTokenDetails`'s `fetchTokenChartCandles`. After C-phase work settles, it might be worth merging the two hooks (or pulling the chart fetch into a shared util).
- **Once C1 + C2 land**, consider how D1 (Edge Score) will compose their inputs — the source-of-truth doc already specifies the formula, but you may want a small `src/lib/token/edgeScore.ts` pure-function layer that takes `{ chainTruth, audit, riskInputs }` and returns `{ score, grade, breakdown[] }`. Easier to test than wiring it all into a component.

---

## Where to read for context

- [`docs/token-details-source-of-truth.md`](./token-details-source-of-truth.md) — locked spec
- [`docs/token-details-roadmap.md`](./token-details-roadmap.md) — full step-by-step plan + per-step instructions
- [`docs/token-details-plan.md`](./token-details-plan.md) — original recon spike (kept for history)
- [`CLAUDE.md`](../CLAUDE.md) — repo-wide rules (collaboration, secrets, file size, etc.)
