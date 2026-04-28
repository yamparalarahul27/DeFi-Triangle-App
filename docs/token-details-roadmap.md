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
Phase B — Spec compliance   [ ✅ B1  ✅ B2  ⏸ B2.5  ⏸ B3 ]
Phase C — Net-new sections  [ ⏸ C1  ⏸ C2  ⏸ C3  ⏸ C4  ⏸ C5 ]
Phase D — Differentiators   [ ⏸ D1  ⏸ D2  ⏸ D3  ⏸ D4  ⏸ D5 ]
Polish (cross-cutting)      [ ⏸ P1  ⏸ P2 ]
```

Legend: ⏸ pending · 🔄 in progress · ✅ shipped

**Next ship:** **B3** (Jupiter-first lookup with Helius fallback). Polish items P1/P2 captured below — not blocking, can be picked off any time.

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

### B3 — Jupiter-first lookup with Helius DAS fallback

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

### C1 — On-chain truth panel

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

### C2 — Token meta strip

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

### C3 — Top Holders ranked list

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

### C4 — Multi-window trading panel

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

### D1 — Edge Score (composite + attribution) ⭐

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

### D2 — Price-source divergence flag

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

### D3 — DEX vs CEX spread

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
