# Token Details — Implementation Roadmap

**Branch:** `imp-token-details`
**Status doc updated:** 2026-04-25

---

## Quick-start for any Claude session reading this

1. Read [CLAUDE.md](../CLAUDE.md) — repo-wide rules (Behavioral guidelines + Collaboration).
2. Read [token-details-source-of-truth.md](./token-details-source-of-truth.md) — **locked decisions**, do not relitigate.
3. Read this file's **Status snapshot** (below) to know which step is next.
4. When asked to "do step X", scroll to that step, follow its checklist verbatim, and use its `Commit msg` template.

> Do not skip steps. Each is independently shippable — after every step the page should still render and `npm run build` should pass. If a step would require also doing parts of a later step, **stop and ask** before bundling.

---

## Goal

Build the **best token information experience on Solana** — a token-details page (`/token/[address]`) that surfaces data and signals no competitor exposes in one place. Detailed scope and source-of-truth in [source-of-truth.md](./token-details-source-of-truth.md).

---

## Status snapshot

```
Phase A — Foundation        [ ✅ A1  ✅ A2  ✅ A3 ]
Phase B — Spec compliance   [ ✅ B1  ✅ B2  ✅ B2.5  ✅ B3  ✅ B4 ]
Phase C — Net-new sections  [ ✅ C1  ✅ C2  ✅ C3  ✅ C4  ⏸ C5 ]
Phase D — Differentiators   [ ✅ D1  ✅ D2  ✅ D3  ⏸ D4  ⏸ D5 ]
Polish (cross-cutting)      [ ✅ P1  ⏸ P2  ⏸ P3  ⏸ P4  ⏸ P5  ⏸ P6 ]
```

Legend: ⏸ pending · 🔄 in progress · ✅ shipped

**Next ship:** **D4** (Real-human activity score — now unblocked by C4 data) or **D5** (Slippage at size — small differentiator).

> When a step ships, update its status icon AND tick it off in the table below. Keep this snapshot in sync with the per-step sections — that's the canonical "where are we" indicator for the next session.

---

## Phase overview

| # | Step | Phase | User-visible? | Depends on |
|---|---|---|---|---|
| A1 | Promote `_archive` components | Foundation | no | — |
| A2 | Create `/api/helius` route | Foundation | no | — |
| A3 | Extract `useTokenDetails` hook | Foundation | no | A1 |
| B1 | Swap chart fallback to Birdeye-primary | Compliance | yes (charts) | A3 |
| B2 | Jupiter Lite Price realtime ticker | Compliance | yes (live price) | A3 |
| B2.5 | Chart library swap to evilcharts + triangle background | Compliance | yes (charts) | A3 |
| B3 | Jupiter-first lookup with Helius fallback | Compliance | yes (404 state) | A2, A3 |
| B4 | Invalid-mint hardening (format check + empty-data → not-found) | Compliance | yes (error states) | B3 |
| C1 | On-chain truth panel (Helius) | Sections | yes | A2 |
| C2 | Token meta strip (Token Program ID, organicScore, tags, first-pool age, market count) | Sections | yes | — |
| C3 | Top Holders ranked list | Sections | yes | — |
| C4 | Multi-window trading panel (9-window merge) | Sections | yes | — |
| C5 | All Pools polish (verify + sort by liquidity) | Sections | maybe | — |
| D1 | **Edge Score** composite + attribution | Differentiators | yes ⭐ | A2, C1, C2 |
| D2 | Price-source divergence flag | Differentiators | yes | — |
| D3 | DEX vs CEX spread | Differentiators | yes | — |
| D4 | Real-human activity score | Differentiators | yes | C4 |
| D5 | Slippage at size ($1k/$10k/$100k) | Differentiators | yes | — |
| P1 | Chart range-switch smoothness (no loading flash) | Polish | yes | A3 |
| P2 | Reload / address-change smoothness (stale-while-revalidate) | Polish | yes | A3 |
| P3 | Chart visual polish (match app UI) | Polish | yes | B2.5 |
| P4 | Evilcharts loading state polish | Polish | yes | B2.5 |
| P5 | NumberFlow coverage on mutating numerics | Polish | yes | — |
| P6 | Persistent caching + progressive page hydration | Polish | yes (perceived speed) | P2 |

---

## Per-step details

> Each step is sized to ship as **one PR / one commit**. If a step grows beyond that, stop and split before continuing.

---

### A1 — Promote `_archive/solana/_components/*`

**Goal:** clean up half-completed migration so new components land in a sensible directory.

**What to do:**
- Move all 8 files in [`src/app/_archive/solana/_components/`](../src/app/_archive/solana/_components/) → `src/components/token/`
  - `AboutSection.tsx`, `IdentityStrip.tsx`, `MarketsSection.tsx`, `PriceChartSection.tsx`, `RechartsPriceChart.tsx`, `RiskPanel.tsx`, `StatsGrid.tsx`, `VariantsSection.tsx`
- Move `src/app/_archive/solana/_utils.ts` → `src/lib/token/utils.ts`
- Update all imports in [`src/app/token/[address]/page.tsx`](../src/app/token/[address]/page.tsx)
- Verify [`src/app/_archive/solana/page.tsx`](../src/app/_archive/solana/page.tsx) is no longer referenced anywhere; delete it and the now-empty `_archive/` tree.

**Verify:**
- `npm run build` clean (no broken imports, no TS errors)
- `npm run dev`; navigate to `/token/So11111111111111111111111111111111111111112`; page renders identically to before

**Commit msg:**
```
refactor(token): promote archived components to src/components/token

Moves 8 components and _utils out of src/app/_archive/solana/ into
src/components/token/ + src/lib/token/utils.ts. Pure rename + import
updates, no behavior change. Removes _archive/ directory.
```

---

### A2 — Create `/api/helius` route

**Goal:** establish Helius integration plumbing — every later Helius-dependent step uses this.

**What to do:**
- New file: [`src/app/api/helius/route.ts`](../src/app/api/helius/route.ts) (mirror the shape of [`src/app/api/birdeye/route.ts`](../src/app/api/birdeye/route.ts) — single GET, query-param `type` switches handler)
- Implement handlers for these `type` values:
  - `getAsset` — calls Helius DAS `getAsset` with `showFungible: true`. Param: `address`
  - `getAccountInfo` — calls RPC `getAccountInfo` with `encoding: "jsonParsed"`. Param: `address`
  - `getTokenSupply` — calls RPC `getTokenSupply`. Param: `address`
  - `getSignaturesForAddress` — calls RPC `getSignaturesForAddress`, used to derive token age (oldest signature). Param: `address`, `limit` (default 1)
- Auth: `HELIUS_API_KEY` from env, build URL `https://mainnet.helius-rpc.com/?api-key=${KEY}` server-side only
- Add `enforceRateLimit(req, "public-read")` like other routes
- Generic error responses (no upstream message leak) per CLAUDE.md "External APIs"
- Reference for response shapes: re-run `node scripts/token-recon.mjs` to see expected payloads in `tmp/recon/sol/helius-*.json`

**Verify:**
- `npm run dev`
- `curl 'http://localhost:3000/api/helius?type=getAsset&address=So11111111111111111111111111111111111111112'` → 200, JSON with `result.content.metadata.name === "Wrapped SOL"`
- Repeat for the 3 other types → 200 each

**Commit msg:**
```
feat(api): add /api/helius route for DAS + RPC

Wires Helius as a server-side data source. Handlers: getAsset (DAS),
getAccountInfo, getTokenSupply, getSignaturesForAddress (RPC). Auth via
HELIUS_API_KEY, rate-limited. No UI integration yet — plumbing only,
unblocks Phase B/C/D steps that need on-chain truth.
```

---

### A3 — Extract `useTokenDetails(address)` hook

**Goal:** move data-fetching out of the 576-LOC page component into a reusable hook. Future sections add to the hook, not the page.

**What to do:**
- New file: `src/lib/hooks/useTokenDetails.ts`
- Move into the hook from [`src/app/token/[address]/page.tsx`](../src/app/token/[address]/page.tsx):
  - `fetchTokenData` callback (Birdeye + Tokens.xyz parallel)
  - `useEffect` for initial load
  - `useInterval` polling
  - chart fetch logic (`fetchTokenChartCandles`, `fetchJupiterDerivedCandles`) — keep behavior identical for now (B1 will swap order)
  - normalization helpers (`buildAssetFromPair`, `mergeAssetWithFallback`, etc.) — could move to `src/lib/token/utils.ts`
- Hook returns: `{ asset, primary, profile, risk, markets, chartCandles, chartRange, setChartRange, loading, chartLoading }`
- Page imports the hook and renders. Target page LOC: ~200 (down from 576).

**Verify:**
- Page renders identically for SOL and a memecoin (e.g. JUP `JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN`)
- Refresh interval still works (open devtools network tab; see refetch every 15s)
- File LOC: page < 250, hook < 250

**Commit msg:**
```
refactor(token): extract useTokenDetails hook

Moves all data-fetching, polling, and normalization out of the page
component into src/lib/hooks/useTokenDetails.ts. Page drops from 576 LOC
to ~200. No behavior change. Sets up future sections to add data sources
to the hook rather than to a giant client component.
```

---

### B1 — Swap chart fallback to Birdeye-primary

**Goal:** match the [source-of-truth](./token-details-source-of-truth.md#f-chart--ohlcv) chart order.

**What to do:**
- In `useTokenDetails` (or wherever chart fetch landed in A3), swap the order:
  - Current: Tokens.xyz → Birdeye → Jupiter-2-candle synth
  - Target: Birdeye → Tokens.xyz → (no synth fallback)
- Delete `fetchJupiterDerivedCandles` — the 2-candle synth is not in the spec; if both real sources fail, render the chart's empty state instead.

**Verify:**
- SOL chart loads (Birdeye OK)
- A memecoin chart loads (depends on Birdeye + memecoin coverage)
- A truly-broken mint shows empty-state, not 2 fake candles

**Commit msg:**
```
fix(token): swap chart fallback to Birdeye-primary per spec

Aligns chart fallback chain to source-of-truth.md §F: Birdeye → Tokens.xyz.
Drops the Jupiter 2-candle synth that was only there to render *something*
when both real sources failed; we now show a clean empty state instead.
```

---

### B2 — Jupiter Lite Price realtime ticker

**Goal:** the page "feels alive" — price flickers in realtime without page-wide refresh. First competitive-feel parity.

**What to do:**
- Add `useTokenPriceTicker(address)` hook in `src/lib/hooks/useTokenPriceTicker.ts`
- Polls `https://lite-api.jup.ag/price/v3?ids=${address}` every **1500ms**
- Returns `{ price, priceChange24h, lastUpdatedAt }`
- Wire into `IdentityStrip` (or wherever the displayed price is) — small flicker on update, no layout shift
- This polls **client-side direct** to Jupiter Lite (it's a free, no-auth endpoint per spec) — does NOT proxy through `/api/jupiter`
- Use `Decimal.js` for display formatting to avoid float drift

**Verify:**
- Open `/token/So111…112`; price digits visibly update every 1–2s
- Network tab shows `lite-api.jup.ag/price/v3` request every ~1.5s
- Existing 15s `useTokenDetails` poll continues alongside (don't remove it)

**Commit msg:**
```
feat(token): realtime price ticker via Jupiter Lite Price API

Adds useTokenPriceTicker hook polling https://lite-api.jup.ag/price/v3
every 1.5s, wired into IdentityStrip. Free, no-auth, designed for
high-frequency polling. Bigger refresh tier (token_overview, etc.)
remains on its existing 15s cadence.
```

---

### B2.5 — Chart library swap to evilcharts + triangle background

**Goal:** replace the hand-rolled SVG `src/components/ui/PriceChart.tsx` with [evilcharts](https://evilcharts.com/docs/line-chart/static), and add an upward-triangle pattern background (matching the project logo) using [evilcharts background components](https://evilcharts.com/docs/ui/background).

**Open questions to resolve before starting:**
- Is evilcharts an npm package or a copy-paste shadcn-style component? Install steps need to be captured.
- Does it support OHLCV / candlestick rendering, or line-only? If line-only, downstream Phase C work (TradingActivityPanel candle views) needs a separate solution.
- What's the data shape for the line chart props? Our current `Candle[]` has `{o, h, l, c, v, unixTime}` — needs adapter to whatever evilcharts expects.
- Triangle background: are the triangles a built-in evilcharts background variant, or does it need a custom SVG pattern matching `/brand/defi_logo_*.svg`?

**What to do (once questions answered):**
- Install evilcharts per docs (likely shadcn-style: copy components into `src/components/ui/charts/`).
- Add adapter in `src/lib/token/utils.ts` (or new file) to map `Candle[]` → evilcharts data shape.
- Replace `PriceChart` usage in [`src/components/token/PriceChartSection.tsx`](../src/components/token/PriceChartSection.tsx). Token Modal's `useTokenChart` consumer (`src/components/ui/TokenModalChart.tsx`) is out of scope — separate task.
- Wrap chart in evilcharts background component (or custom triangle SVG pattern) — upward triangles, brand-toned (cta-color `#3B7DDD` or frost-400 `#19549b` per [DESIGN.md](../DESIGN.md)). Subtle opacity so it doesn't fight the line.
- Verify mobile layout still works (charts are full-width on `<sm`).

**Verify:**
- SOL chart renders via evilcharts with triangle background visible behind it.
- 1D / 1W / 1M / 3M / 1Y range switching still works.
- Empty state (B1's behavior) still fires for sources that return no data.
- `npm run build` clean.
- No new high/critical `npm audit` findings beyond the documented Solana ecosystem ones in CLAUDE.md.

**Commit msg:**
```
feat(token): swap chart to evilcharts with triangle background

Replaces hand-rolled SVG PriceChart with evilcharts line chart, wrapped
in an upward-triangle pattern background that matches the brand logo.
Adapter maps Candle[] to evilcharts data shape. Token Modal chart is a
follow-up.
```

---

### B3 — Jupiter-first lookup with Helius DAS fallback ✅

**Goal:** match the lookup contract in [source-of-truth §lookup-contract](./token-details-source-of-truth.md#lookup-contract).

**What to do:**
- Add a `lookupToken(address)` server function in `src/lib/token/lookup.ts`:
  1. Try Jupiter `/search?query=${address}&limit=3`, find exact-match by address
  2. If miss, try Helius `getAsset` (via `/api/helius?type=getAsset`)
  3. If both miss, return `null`
- Use this in `useTokenDetails` as the entry-point identity source (replaces the implicit "Birdeye returned nothing → fail" path)
- Update the "not found" UI: when both sources miss, show `"Token not indexed yet — try a different address"` (not "Unable to load token right now")

**Verify:**
- Known mint (SOL) loads via Jupiter — verify in network tab
- A made-up mint (e.g. `1111...1111`) shows the new not-indexed state
- A brand-new mint Jupiter doesn't have but Helius does → loads via fallback (test with a freshly-launched memecoin if available)

**Commit msg:**
```
feat(token): Jupiter-first lookup with Helius DAS fallback

Implements the lookup contract from source-of-truth.md: Jupiter /search
primary, Helius getAsset fallback, clean not-found state if both miss.
Replaces the prior "Birdeye returns nothing → generic error" path.
```

---

### B4 — Invalid-mint hardening ✅

**Goal:** when the URL has a malformed or unindexed mint, fail clearly rather than rendering an empty page shell with `$0` placeholders.

**Context:** B3 ships the lookup contract and adds a "Token not indexed yet" copy. But on a structurally-bogus address like `1111…1111`, the page still synthesizes a stub asset from the URL via `buildAssetFromPair` and renders the full layout with empty stats. Users see a misleading "alive" page.

**What to do:**
- In `src/app/token/[address]/page.tsx` (or in `useTokenDetails`), add an upfront address-format check using `new PublicKey(address)`. If invalid → render a clean "Invalid mint address" state, **no API calls fired**.
- Treat "all-zero" payloads as not-found: if Birdeye + Tokens.xyz + lookup all return empty/zero data, fall through to the existing "Token not indexed yet" state instead of rendering shell UI. (Heuristic: check `asset.symbol` is non-empty and `stats.price > 0` OR `stats.liquidity > 0`.)
- Both error states should reuse the existing `notIndexed` styling (centered message + "Back to dashboard" link).
- Keep `OnChainPanel` and other section-level hide rules unchanged — those work correctly for partial-data tokens.

**Verify:**
- `/token/1111111111111111111111111111111111111111111` (43 chars, may or may not be a valid `PublicKey`) → "Invalid mint address" state OR "not indexed" depending on which path triggers; **no shell UI with $0 stats**
- `/token/notARealAddressAtAll` → "Invalid mint address"
- `/token/<valid-mint-but-unindexed>` → "Token not indexed yet" (existing B3 behavior)
- `/token/So11…112` (SOL) → renders normally, unchanged

**Commit msg:**
```
feat(token): invalid-mint hardening

Validates the URL address as a Solana PublicKey upfront — invalid
addresses render a clean "Invalid mint address" state with no API
calls. Treats all-zero data payloads as not-found instead of letting
buildAssetFromPair synthesize an empty page shell. Closes the gap left
open by B3 where bogus mints rendered $0-everywhere placeholder pages.
```

---

### C1 — On-chain truth panel ✅

**Goal:** new section showing chain-truth security data per [source-of-truth §G](./token-details-source-of-truth.md#g-security--risk).

**What to do:**
- New component: `src/components/token/OnChainPanel.tsx`
- Add to `useTokenDetails`: parallel fetch for `/api/helius?type=getAccountInfo` + `/api/helius?type=getAsset`
- Render rows (hide row if data missing — see source-of-truth render rule):
  - **Mint authority**: address (with copy + truncate) OR "Renounced ✓" badge
  - **Freeze authority**: same shape
  - **Mutable**: ✓/✗
  - **Burnt**: ✓/✗ (only show if true)
  - **Royalty**: percent + recipient if non-zero, else hide
- Place section between `StatsGrid` and `RiskPanel` in the page layout

**Verify:**
- For SOL: shows "Mint authority: Renounced ✓", "Freeze authority: Renounced ✓"
- For a memecoin with active mint authority: shows the wallet address, copyable
- If both Helius calls fail: section hidden entirely (no skeletons, no errors)

**Commit msg:**
```
feat(token): on-chain truth panel (Helius DAS + RPC)

Adds OnChainPanel showing mint/freeze authority (address or renounced),
mutable, burnt, royalty. Wires Helius as data source via /api/helius
created in A2. Section hides cleanly if both sources fail.
```

---

### C2 — Token meta strip ✅

> **⚠️ Open decision before starting C2 (raised by user 2026-04-28):**
> Most users won't know what `organicScore` or the `tags` mean without context. Confirm with user before implementation:
> - **(A)** Bundle info tooltips (`?` icon → hover/tap → 1–2 sentence definition) for organicScore + tags as part of C2. ~30 min added; uses shadcn `Tooltip`. Recommended default.
> - **(B)** Ship C2 without tooltips; retrofit later as a separate polish step.
>
> Placement decision (locked): MetaStrip sits **directly below `IdentityStrip`**, above `PriceChartSection`.
>
> Definitions for the tooltips (so we don't waste time researching at impl-time):
> - **organicScore** — Jupiter's 0–100 estimate of how much trading volume is real-human (vs. bots / wash). Higher = healthier. Reported alongside `organicScoreLabel` ("high" / "medium" / "low") which we'll use to color-tint the badge (green/amber/red).
> - **tags** — Jupiter's categorical labels: `verified`, `lst`, `community`, `meme`, `stablecoin`, `bridged`, `wrapped`, etc. Rendered as small pills.

**Goal:** surface trust signals from [source-of-truth §G](./token-details-source-of-truth.md#g-security--risk) and [§J](./token-details-source-of-truth.md#j-dex-pools).

**What to do:**
- New component: `src/components/token/MetaStrip.tsx`
- Data: extend Jupiter-search result already in `useTokenDetails` (after B3 it's the primary identity source) + add Birdeye `numberMarkets` from `token_overview` payload (already pulled)
- Render compact horizontal strip (mobile: wrap to grid):
  - Token Program ID (truncated, copy)
  - organicScore (0–100) + label badge
  - isVerified ✓ if true
  - Tags pills
  - First-pool age ("Listed 14d ago" — derive from `firstPool.createdAt`)
  - Total markets count ("132,804 markets")
- Hide individual cells where source value missing

**Verify:**
- For SOL: shows multiple markets, "Verified" badge, organicScore
- Each cell independently hides if data missing (e.g. a token with no Jupiter `firstPool` should hide that cell only)

**Commit msg:**
```
feat(token): meta strip (program ID, organicScore, tags, pool age, markets)

New MetaStrip component surfaces trust + listing signals from Jupiter
audit + Birdeye numberMarkets. Per-cell render rule: hide cells where
source value missing.
```

---

### C3 — Top Holders ranked list ✅

**Goal:** the holder distribution table per [source-of-truth §E](./token-details-source-of-truth.md#e-holders).

**What to do:**
- Add to `/api/birdeye?type=holders` (new handler in [`src/app/api/birdeye/route.ts`](../src/app/api/birdeye/route.ts)) — calls `/defi/v3/token/holder?address=...&limit=10`
- New component: `src/components/token/TopHoldersPanel.tsx`
- Add holder fetch to `useTokenDetails`
- Render 10-row list:
  - Wallet (truncated, copy, link to solscan.io)
  - UI amount (formatted)
  - % of supply (derive: `ui_amount / circulatingSupply * 100`)
- Sort: descending by amount

**Verify:**
- For SOL: shows top 10 wallets, amounts, %
- For a small memecoin: works
- Hidden if Birdeye returns empty / error (per render rule)

**Commit msg:**
```
feat(token): top holders ranked list (Birdeye token_holder)

Adds /api/birdeye?type=holders handler + TopHoldersPanel component.
10-row ranked list with wallet, amount, % of supply. Source: Birdeye
/defi/v3/token/holder (free-tier accessible, paced 1.1s).
```

---

### C4 — Multi-window trading panel ✅

**Goal:** the 9-window merged trading panel per [source-of-truth §D](./token-details-source-of-truth.md#d-trading-activity-multi-window).

**What to do:**
- New component: `src/components/token/TradingActivityPanel.tsx`
- Data: extend `useTokenDetails` to surface the multi-window fields already in Birdeye `token_overview` (`v5m / v1h / ... / v24h` and friends) + Jupiter search result `stats5m / stats1h / stats6h / stats24h`
- Build a unified `windows` map: keys are `1m, 5m, 30m, 1h, 2h, 4h, 6h, 8h, 24h`, values are `{ volume, uniqueWallets, organicBuyers, organicVolume, pctChange, source: 'birdeye' | 'jupiter' | 'merged' }`
- Render: tab/pill row at top picks active window; below shows volume + unique wallets + organic % + % change for that window
- **Per render rule: hide windows where no source has data.** Hide cells within a window if that field is missing.

**Verify:**
- For SOL: 8 windows from Birdeye + Jupiter's 6h adds 9th
- For a small memecoin: maybe only 5m/1h/24h survive — others hidden cleanly
- No "0" or "N/A" in UI — missing = hidden

**Commit msg:**
```
feat(token): multi-window trading activity panel (9 windows max)

Merges Birdeye multi-window stats with Jupiter organic signals into a
unified per-window view (1m, 5m, 30m, 1h, 2h, 4h, 6h, 8h, 24h). Hides
windows + fields where no source has data, per source-of-truth render
rules.
```

---

### C5 — All Pools polish

**Goal:** verify [`MarketsSection`](../src/app/_archive/solana/_components/MarketsSection.tsx) (post-A1: `src/components/token/MarketsSection.tsx`) shows every pool from Tokens.xyz `markets` array, sorted by liquidity, with name + DEX + liquidity USD.

**What to do:**
- Read current `MarketsSection` — verify it consumes `response.includes.markets.data.markets` correctly
- If sorting is missing / not by liquidity: add it
- If only some pools shown: lift the cap
- If polish needed (column widths, mobile wrap): apply per [DESIGN.md](../DESIGN.md)

**Verify:**
- For SOL: lots of pools listed; first row is the largest by liquidity
- Mobile layout doesn't break

**Commit msg:**
```
refactor(token): polish All Pools section

Verifies and tunes MarketsSection: sort by liquidity desc, no row cap,
mobile-friendly columns. Tokens.xyz markets[] is unique-source per
spec — make sure we display its full value.
```

---

### D1 — Edge Score (composite + attribution) ⭐ ✅

**Goal:** the headline differentiator per [source-of-truth §K-4](./token-details-source-of-truth.md#4-edge-score-composite-safety).

**What to do:**
- New file: `src/lib/token/edgeScore.ts` — pure function `computeEdgeScore({ chainTruth, audit, riskInputs }) → { score, grade, breakdown[] }`
  - Inputs:
    - chainTruth (from C1's Helius data): `mintAuthorityRenounced`, `freezeAuthorityRenounced`, `mutable`, `burnt`
    - audit (from Jupiter): `mintAuthorityDisabled`, `freezeAuthorityDisabled`, `topHoldersPercentage`, `devMintCount`, etc.
    - riskInputs (from Tokens.xyz): `liquidityUsd`, `marketCapUsd`, `volume24hUsd`, `volume7dUsd`, `tokenMintTime`
  - Each input contributes weighted 0–100; composite is weighted average
  - Returns A–F grade based on score thresholds
  - `breakdown[]`: array of `{ name, value, contribution, source }` so UI can show full attribution
- Replace existing `RiskPanel` (or expand it) with `src/components/token/EdgeScorePanel.tsx`:
  - Big A–F badge + score
  - Expandable list: each contributing signal with raw value, weight, source attribution
- Tunable weights — define as constants at top of `edgeScore.ts` for easy adjustment

**Verify:**
- For SOL: high score (renounced authorities, high liquidity, high volume, old)
- For a fresh memecoin: low score with clear breakdown explaining why
- Each row in breakdown shows source ("via Helius RPC", "via Jupiter audit", "via Tokens.xyz risk inputs")
- No competitor on Solana shows this depth of attribution

**Commit msg:**
```
feat(token): Edge Score composite safety with full attribution

Introduces Edge Score — a weighted composite of chain-truth (Helius),
trust audit (Jupiter), and risk inputs (Tokens.xyz). A–F grade with
expandable per-signal breakdown showing raw value + source attribution
for every input. Replaces RiskPanel as the primary safety signal.
```

---

### D2 — Price-source divergence flag ✅

**Goal:** [source-of-truth §K-1](./token-details-source-of-truth.md#1-price-source-divergence-flag).

**What to do:**
- New file: `src/lib/token/priceDivergence.ts` — pure function `computeDivergence({ birdeye, jupiter, tokensXyzStats, tokensXyzCanonical, helius }) → { spreadPct, healthy, sources }`
- Wire into `IdentityStrip`: small pill — green "5 sources within 0.3%" or amber "spread 2.1% — see breakdown"
- Click pill → small popover showing all 5 prices side by side

**Verify:**
- For SOL: healthy green
- Synthesize: temporarily mock one source to a wildly different number → amber state shows correctly

**Commit msg:**
```
feat(token): price-source divergence flag

Cross-references all 5 price sources (Birdeye, Jupiter, Tokens.xyz stats,
Tokens.xyz canonical/CG, Helius DAS) and surfaces a healthy/spread badge
in the identity strip. Click for per-source breakdown.
```

---

### D3 — DEX vs CEX spread ✅

**Goal:** [source-of-truth §K-2](./token-details-source-of-truth.md#2-dex-vs-cex-spread).

**What to do:**
- Compute `(dexPrice - cexPrice) / cexPrice * 100` where DEX = Birdeye and CEX = Tokens.xyz `canonicalMarket.price` (CoinGecko)
- Add inline metric next to price: "DEX +0.3% vs CEX" (color: green ≤0.5%, amber ≤2%, red >2%)
- Hide cleanly if either source missing

**Verify:**
- For SOL: small spread
- For an illiquid token: larger spread visible

**Commit msg:**
```
feat(token): DEX vs CEX price spread

Inline metric showing on-chain DEX price vs CoinGecko-aggregated CEX
price. Useful arbitrage / liquidity-fragmentation signal. Hides if
either source missing.
```

---

### D4 — Real-human activity score

**Goal:** [source-of-truth §K-3](./token-details-source-of-truth.md#3-real-human-activity-score).

**What to do:**
- New file: `src/lib/token/humanActivityScore.ts`
- Inputs from C4 data: Birdeye `uniqueWallet5m / uniqueWallet1h` + Jupiter `numOrganicBuyers / numBuys`
- Compute: `unique_wallets × organic_ratio` → percentile-rank within tag (need a small reference table — start with a fixed scale, refine later)
- Display: 0–100 score with sub-bars (unique wallets percentile + organic % filter)
- Place in `TradingActivityPanel` (from C4) as a header

**Verify:**
- For SOL: high score (lots of unique wallets, high organic ratio)
- For a wash-trade-suspected token: low score even if volume looks big

**Commit msg:**
```
feat(token): real-human activity score

Combines Birdeye unique-wallets-per-window with Jupiter organic-buyer
ratio to produce a 0–100 score that filters wash-trading bots. Surfaced
as a header on the multi-window trading panel.
```

---

### D5 — Slippage at size

**Goal:** [source-of-truth §K-5](./token-details-source-of-truth.md#5-slippage-at-size).

**What to do:**
- New API route: `src/app/api/jupiter-quote/route.ts` (or extend `/api/jupiter` with `type=quote`)
  - Takes `inputMint, outputMint, amountUSD` and queries Jupiter Quote API
  - Returns `{ outAmount, priceImpactPct }`
- Page-side: cache per `(address, sizeUSD)` for 30s
- New component: `src/components/token/SlippagePanel.tsx`
  - Three rows: $1k / $10k / $100k → slippage % + out USD
  - "Sell into USDC" by default; toggle to "Buy from USDC" optional

**Verify:**
- For SOL: small slippage at $1k, larger at $100k
- For an illiquid token: clearly worse slippage at size

**Commit msg:**
```
feat(token): slippage-at-size panel ($1k/$10k/$100k)

Adds /api/jupiter-quote (or /api/jupiter?type=quote) and SlippagePanel
component. Shows expected price impact at three trade sizes — directly
useful for traders sizing positions, no other Solana tool surfaces this
inline.
```

---

## Mobile workflow notes (for the user)

1. On mobile, after pulling the latest `imp-token-details`:
   - Open this file → confirm next step from **Status snapshot**
   - Open [source-of-truth.md](./token-details-source-of-truth.md) for the locked decisions if the step references them
2. Tell mobile Claude something like: "Do step **A1** from `docs/token-details-roadmap.md`."
3. After Claude ships the step:
   - Verify per the step's `Verify:` checklist
   - Use the step's `Commit msg:` template (or close to it)
   - Update **Status snapshot** + per-step status icon in this file
   - Push

Each step is self-contained — fresh Claude doesn't need conversation history beyond reading this file + source-of-truth.md.

---

## Outstanding non-blocking items

- Retest Tokens.xyz `/price-chart` on a memecoin (JUP / BONK) to confirm it actually returns candles; if it never does, simplify B1 to "Birdeye-only chart, hide section if it fails."
- Confirm Birdeye free-tier exact rate-limit (current pacing of 1.1s works empirically).
- Future-feature track: own API/data layer with multi-key rotation, response caching, normalized schema. Defer until pages start hammering the same endpoints.

---

## P1 — Chart range-switch smoothness

**User-reported friction (PR #4 testing):** clicking a different range button (1D / 1W / 1M / 3M / 1Y) shows a "Loading chart…" state for ~500–1500 ms before the new chart renders. Feels laggy.

**Root cause:** `useTokenDetails` sets `chartLoading: true` immediately on range change; `PriceChartSection` then renders the loading state instead of the previous candles.

**Fix options (pick one when implementing):**
- **(a) Optimistic keep:** don't render the loading overlay if we already have candles for the previous range. Only show "Loading chart…" on first load. Cheapest. Visual: the old chart stays until the new one lands (~ms), then swaps.
- **(b) Per-range cache:** cache candles per `(address, range)` in a `Map`; on range switch, render cached candles instantly if present, refetch in background to refresh. Tighter feel; ~30 LOC of cache logic.
- **(c) Pre-fetch all ranges:** after initial load, background-fetch the other 4 ranges. Best feel but biggest API cost.

**Recommendation:** start with (a). If still laggy, layer (b).

**Verify:**
- Click each range button. Old chart stays visible until new data lands; no "Loading chart…" flash.
- Initial page load still shows loading state once.

---

## P2 — Reload / address-change smoothness

**User-reported friction (PR #4 testing):** opening a new token (or refreshing) shows a "Loading token…" full-page state for the full first-fetch duration. App feels less smooth than competitors.

**Root cause:** `useTokenDetails` returns `loading: true` while the initial Birdeye + Tokens.xyz fetches resolve; page short-circuits to the loading screen.

**Fix options:**
- **(a) Stale-while-revalidate via cache:** session-level `Map<address, lastResult>` keyed by address. When the user opens a token they've seen this session, render cached values immediately; fetch in background and replace silently. Same pattern dashboard uses for token modals (`useTokenChart` already has `ohlcvCache`).
- **(b) Skeleton instead of "Loading token…":** render the page shell (Identity strip, chart frame, stats grid placeholders) with shimmer instead of a centered spinner. No data dependency for the layout.
- **(c) Both** — cache for known tokens, skeleton for unknown.

**Recommendation:** (c). Cache covers repeat visits (most common); skeleton covers cold visits + provides better LCP signal.

**Verify:**
- Visit SOL → open another token → return to SOL: SOL renders instantly from cache, refreshed silently.
- First visit to a new token: skeleton appears instead of full-page "Loading token…", real data swaps in when it lands.
- Range buttons + price ticker continue to work after data swap.

---

## P3 — Chart visual polish (match app UI)

**User-reported (PR #8 testing):** the new evilcharts price chart works correctly but its UI doesn't fully match the app's visual language — line stroke, axis typography, tooltip styling, gridlines, etc.

**To investigate when picking up:**
- Compare against [DESIGN.md](../DESIGN.md): colour tokens (Frost / Hela / Loki), typography (Geist Mono for body, Geist Pixel Square for financial numbers), spacing (8px base), border radii (rounded-sm 2px).
- Audit: line color (currently `#19549b` light / `#3B7DDD` dark — confirm match against DESIGN.md primary), axis label font (does it inherit Geist Mono via the wrapping `<section>`?), tooltip card (current shadcn-default rounded-lg vs. our app's rounded-sm), gridline color/opacity.
- Check whether evilcharts' `tooltipVariant="frosted-glass"` or a custom override gives a better fit.

**Out of scope (revisit only if we change libraries):** swapping evilcharts for a different chart lib.

---

## P4 — Evilcharts loading state polish

**User-reported (PR #8 testing):** the built-in `isLoading` shimmer skeleton from `EvilLineChart` doesn't feel as polished as the rest of the app.

**Options to consider:**
- **(a) Replace with our SpiralLoader** — pass `isLoading={false}` always; render the existing `SpiralLoader` (already used on home + briefly on the chart in P1) inside the chart container instead of evilcharts' shimmer. Simplest, matches the rest of the app.
- **(b) Customize evilcharts shimmer** — `chart.tsx` exports `LoadingIndicator` and `getLoadingData`. Override the shimmer's color / animation curve to match brand.
- **(c) Skeleton-shaped placeholder** — render a flat ghost line + grid silhouette in brand muted tones during loading. Closest to high-end fintech apps.

**Recommendation when implementing:** start with (a) — least change, immediate parity with rest of app. If "looks too plain", layer (c).

---

## P5 — NumberFlow coverage on mutating numerics

**Surfaced during:** number-flow audit, 2026-04-28.

`@number-flow/react ^0.6.0` is installed and wired into [IdentityStrip](../src/components/token/IdentityStrip.tsx) (price + 24h % + ATH delta on the **1.5s** Jupiter ticker) and [TokenModal](../src/components/ui/TokenModal.tsx). Every other shipped surface with mutating numerics still renders pre-formatted strings — they jump on each poll instead of animating, which feels inconsistent next to the live ticker.

**Polling cadences feeding mutating numerics:**
- `useTokenDetails` (15s) → StatsGrid, EdgeScore inputs, DexCexSpread, PriceDivergenceChip, MetaStrip markets, TopHolders
- `useHomeJupiterPairs` (120s) → DexCard (home rails)

**Coverage gap:**

| Component | Mutating fields | Cadence |
|---|---|---|
| [StatsGrid](../src/components/token/StatsGrid.tsx) | Market cap, 24h vol, FDV, 7d vol, circ supply, total supply, primary liq., ATH | 15s |
| [EdgeScorePanel](../src/components/token/EdgeScorePanel.tsx) | Score `/100`, per-signal contribution | 15s |
| [DexCexSpread](../src/components/token/DexCexSpread.tsx) | Spread % | 15s |
| [PriceDivergenceChip](../src/components/token/PriceDivergenceChip.tsx) | Spread % + per-source prices in tooltip | 15s |
| [MetaStrip](../src/components/token/MetaStrip.tsx) | Markets count, organicScore | 15s |
| [TopHoldersPanel](../src/components/token/TopHoldersPanel.tsx) | Holder amounts, % of supply | 15s |
| [DexCard](../src/components/ui/DexCard.tsx) (home rails) | Price, 24h %, liquidity, FDV, vol 24h, buys/sells | 120s |

**Friction:** format helpers `fmtUsd / fmtPct / fmtNum` return pre-formatted strings. NumberFlow takes a raw number + `Format` object. Each call site needs the swap, e.g. `fmtUsd(x, { compact: true })` → `<NumberFlow value={x} format={{ notation: 'compact', style: 'currency', currency: 'USD' }} />`.

**Tiered options (pick one when implementing):**
- **(a) Tier 1 — token detail page only.** StatsGrid + EdgeScore score + DexCexSpread + PriceDivergenceChip body. All 15s cadence, all sit next to the already-animated price. ~1h, ~80 LOC across 4 files. **Recommended first ship.**
- **(b) Tier 1 + DexCard (home rails).** Adds first-impression surface. 120s cadence is slow but every user lands here first. ~1.5h.
- **(c) Full sweep — also TopHolders amounts + MetaStrip markets/organicScore.** Diminishing returns: TopHolders rarely shifts within a session, MetaStrip markets is buried. ~2.5h.

**Recommendation:** ship (a) as a single PR. Re-audit after; (b) if home-rail jumpiness is still noticeable, (c) only if symmetry-OCD demands it.

**Verify:**
- Open `/token/So11…112`. Watch StatsGrid for ~30s — values animate (not jump) on 15s polls.
- EdgeScore "X / 100" digits roll when underlying inputs shift.
- DexCexSpread + PriceDivergenceChip percentages animate on poll.
- No layout shift; `tabular-nums` still in effect.
- Existing IdentityStrip price ticker continues to animate at 1.5s — no regression.

---

## P6 — Persistent caching + progressive page hydration

**Surfaced during:** roadmap planning, 2026-04-28.

Today every token-page load waits for `useTokenDetails` to resolve **all** upstream calls (Birdeye + Tokens.xyz + Helius + Jupiter) before rendering anything beyond a "Loading token…" state. P2 plans an in-memory session cache + skeleton; P6 layers **durable persistence** on top so:
- A repeat visit (same browser, days later) renders instantly from cached static fields.
- Volatile fields (price, vol, liq) refetch in background, per-section.
- Page sections light up **independently** as their data arrives, instead of one big spinner gating the whole page.

**Field classification (define exact list at impl time):**

| Tier | Refresh policy | Fields (examples) |
|---|---|---|
| **Static** (cache days) | One-shot, refresh weekly | name, symbol, decimals, logo, token program ID, first-pool date, ATH date |
| **Semi-static** (cache hours) | Refresh daily / on-demand | tags, isVerified, organicScore, mint/freeze authority state, audit booleans |
| **Volatile** (cache <30s) | Refresh per poll | price, 24h change/volume, liquidity, market cap, FDV, holder counts, trading window stats |

**Storage options:**
- **(a) HTTP `Cache-Control` on API routes + Vercel CDN.** Cheapest. Set `s-maxage=N, stale-while-revalidate=M` per route by tier (e.g. Helius `getAsset` → 1h SWR; Birdeye `token_overview` → 10s SWR). Browser + edge handle the rest. Zero schema work. Limit: only helps GETs keyed purely on URL; no cross-device warming.
- **(b) IndexedDB (browser-only).** Per-device durable cache. Static + semi-static fields persist across refreshes / tab closes. Zero server cost. Limit: no cross-device, no popular-token pre-warming.
- **(c) Supabase `token_cache` table.** Cross-device, sharable. Popular tokens get warmed by other users' visits. Cost: extra DB read on first hit; need `tier`, `fetched_at`, `ttl` columns + a prune cron. Fits existing Supabase pattern.
- **(d) Hybrid — IndexedDB + Supabase + API.** IDB first (instant), Supabase fallback (warm from others), upstream last (truly fresh). Most complex. Best UX.

**Progressive hydration (independent of storage choice):**
Split `useTokenDetails` into per-section hooks (`useTokenIdentity`, `useTokenStats`, `useTokenHolders`, `useTokenEdgeScore`, …). Each section renders the moment its data lands rather than waiting on the same `Promise.all`. Cached values render immediately; spinner only on truly cold sections.

**Recommendation:** ship **(a) HTTP Cache-Control + section-split hooks** first. Lowest effort, biggest perceived-speed win, no schema work, works alongside P2. If first-cold-visit still feels slow, layer **(b) IndexedDB** for static + semi-static fields. Hold off on **(c) Supabase** until usage data justifies the schema + prune work.

**Open questions before implementation:**
- Lock the static / semi-static / volatile field list per source. Some fields look static but mutate (Jupiter `tags`, audit flags after authority change).
- Cache invalidation when a token's mint/freeze authority changes mid-session — is per-tier TTL enough, or does this need a webhook (ties into the F2/F3 QuickNode work)?
- Per-section loading-state contract — today components consume `loading` / `chartLoading` booleans; with section-split hooks each section owns its own state. Migration path?
- Order of operations vs. P2: P2 ships in-memory session cache + skeleton. P6 assumes P2's cache layer exists and extends it. Decide whether to ship P2 standalone first or bundle the in-memory + section-split work together.

**Verify (when implementing):**
- Cold visit to `/token/<unseen mint>`: identity + meta strip render within 200ms; stats + holders + edge score fill in as they arrive.
- Repeat visit to same mint within minutes: full page renders from cache instantly; price ticker continues at 1.5s.
- Hard refresh after 1 day on the same mint: static fields render from durable cache immediately; volatile fields refetch in background.
- Network tab: per-tier `Cache-Control` headers visible on `/api/*` responses (Tier (a) only).
- No regression in P2's session-cache or skeleton behavior.

---

## Backlog / future ideas

Not sized or scheduled. Captured here so they don't get lost as we ship Phase A–D + polish.

### F1 — Stablecoin-specific section
**Surfaced during:** D2 visual check, 2026-04-28.

Stablecoins have different "interesting" data than volatile tokens. The current page treats them generically (price, volume, liquidity, etc.), but for a stablecoin most users care about:

- **Peg deviation** — `(price - 1.00) / 1.00` with a tight (basis-points) chart. Big alert when off-peg.
- **Reserves backing** — issuer attestations (Circle for USDC, Tether for USDT, etc.). Probably manual / curated initially.
- **Issuer info** — who, jurisdiction, last-attestation date.
- **De-peg history** — recent extremes from the OHLCV data we already pull.
- **Mint / burn flow** — net issuance over recent windows (if exposed by Helius enhanced tx or Birdeye trade data).

**Trigger:** Jupiter `tags` array includes `"stablecoin"` (already in our `meta.jupiter.tags`). When that tag is present, swap the price chart and stats section for stablecoin-specific equivalents (or render an extra panel above them).

**Open questions before implementation:**
- Replace existing chart vs. add as a second panel above?
- Where does reserves data come from (manual map keyed by mint? a third-party feed?)
- Same treatment for "wrapped" tokens (wSOL, wBTC) or is that different again?

---

### F2 — Live token pulse (real-time activity panel) ⭐
**Surfaced during:** QuickNode capability review, 2026-04-28.

Today every panel is a polling snapshot. A real-time activity stream on the token page would be the highest-visible differentiator of any item in this backlog — Birdeye charges for it, DexScreener Pro paywalls it, no free competitor surfaces it inline on a token detail page.

**What to show:**
- Rolling 60s buys vs sells (live counter, no refresh).
- Biggest single trade in the last 5 min ("$42.1k buy via Raydium 38s ago").
- "12 buys / 4 sells last min" pulse indicator.
- Optional: tape-style stream of last 10 swaps with size + side.

**Data source:** QuickNode **Yellowstone Geyser gRPC** — subscribe to the mint's top 1–3 pools (Raydium / Orca / Meteora program-account filters). Server-side stream worker → SSE/WS → client.

**Why QuickNode (not Helius):** Helius has webhooks but not Geyser gRPC at our tier. Geyser gives filtered, low-latency account/tx streaming.

**Open questions before implementation:**
- Server architecture: long-lived Node process (separate from Next.js) vs. edge-friendly approach? Vercel doesn't host long-lived gRPC clients — likely needs a separate worker on Railway / Fly / Render.
- Per-token vs. global subscription model? (Subscribing per token-page-visit doesn't scale; better to subscribe to top-N hot pools globally and filter client-side.)
- Fallback when stream drops or QuickNode quota exhausted: revert to polling Birdeye, hide the live indicator.
- Cost ceiling — gRPC streams charge by bandwidth; need to cap to known pools.

---

### F3 — Fresh launches rail (home page)
**Surfaced during:** QuickNode capability review, 2026-04-28.

A 4th horizontal rail on the home page surfacing newly-created pools (< 1h old) with our **Edge Score** already attached. Photon and GMGN have this; no free Solana research tool does — and our scoring is the moat.

**What to show:**
- Token thumbnail, symbol, mint age ("23m ago"), starting liquidity, Edge Score grade (A–F).
- Sorted by Edge Score desc within the time window — surfaces "safest fresh launches first" rather than the firehose.

**Data source:** QuickNode **Webhooks / Streams** — filter for Raydium / Pump / Meteora pool-init instructions. Persist to a new Supabase `fresh_pools` table with `(mint, pool_program, created_at, initial_liquidity_usd)`. Run Edge Score scoring on insert.

**Why QuickNode:** Streams + filtered webhooks are first-class; Helius webhooks work too but QuickNode's Streams product is more flexible for the multi-program filter.

**Open questions before implementation:**
- Webhook ingestion endpoint (`/api/webhooks/quicknode/pool-init`) — auth model? HMAC signature verification?
- Retention: keep fresh pools 24h then prune, or grow indefinitely?
- Edge Score on a 30-second-old token has very thin signal (no holders distribution, no volume) — may need a "Fresh-launch Edge Score" variant with different weights.
- How to handle pump.fun bonding-curve graduations vs. brand-new mints — same rail or separate?

---

### F4 — Whale watch (top-holder activity)
**Surfaced during:** QuickNode capability review, 2026-04-28.

Pairs with C3 (Top Holders ranked list). Once we render the top-10 holders, layer real-time movement: "Holder #3 sold 2% of supply 14m ago." Turns a static list into an actionable signal.

**Data source:** QuickNode **Yellowstone Geyser gRPC** — once C3 has the top-10 wallet list, subscribe to those 10 accounts for the active token. Diff balance changes against last-known to derive sells/buys.

**Open questions before implementation:**
- Subscriptions per token-page-visit again — same scale issue as F2; likely share the F2 worker.
- Top-10 list shifts as people buy/sell — re-subscribe on every change, or pin to the list at page-load?
- Privacy / norms: doxxing wallet behavior in real time is an aggressive UX choice. Consider whether to launder the source ("Whale activity detected" vs. "Wallet 7xK...3pQ sold").
- Depends on C3 shipping first.
