# Token Details — Source of Truth Spec

**Branch:** `imp-token-details`
**Status:** Locked decisions from 2026-04-25 recon. Anchors implementation. Update only on user direction.

> Reference: [token-details-plan.md](./token-details-plan.md) for context, [tmp/recon/sol/MATRIX.md](../tmp/recon/sol/MATRIX.md) for the full capability matrix the decisions are based on (gitignored — local recon only).

---

## Lookup contract

- **Token search / detail entry-point:** Jupiter `/search` only. If Jupiter has no record → 404 / "not found" state. No Helius fallback.
- **Implication:** brand-new mints with zero DEX activity won't render. Acceptable for v1.

---

## Section-by-section sources

Each section lists the **fields** rendered, the **primary** source, and **fallback** (if any). If both primary and fallback fail → **hide the section entirely** (no skeletons, no error rows).

### A. Identity & on-chain truth

| Field | Primary | Fallback | Render rule |
|---|---|---|---|
| Mint, name, symbol, decimals, logo | Jupiter | — | (covered by lookup) |
| Token Program ID | Jupiter | Helius DAS | hide if both fail |
| Mint authority (address when present, else "renounced") | Helius RPC | Helius DAS | hide if both fail |
| Freeze authority (address when present, else "renounced") | Helius RPC | Helius DAS | hide if both fail |
| isInitialized | Helius DAS | Helius RPC | hide if both fail |
| Mutable | Helius DAS | Helius RPC | hide if both fail |
| Burnt | Helius DAS | Helius RPC | hide if both fail |

### B. Pricing

| Field | Primary | Notes |
|---|---|---|
| Realtime price ticker (live, decimals flickering) | **Jupiter Lite Price API** (`lite-api.jup.ag/price/v3`) | Poll every 1–2s — free, no auth |
| Snapshot price (rest of page) | Birdeye `token_overview` | Refresh every 30–60s |
| Price block / slot | Jupiter | from `priceBlockId` |
| All-time high + date | Tokens.xyz `profile` | only source |

### C. Market metrics

| Field | Primary | Notes |
|---|---|---|
| Market cap, FDV | Tokens.xyz | |
| Liquidity USD | Tokens.xyz | |
| Volume 24h, 7d | Tokens.xyz | 7d is unique to Tokens.xyz |
| Pools / market count | — | **Skipped per user** |

### D. Trading activity (multi-window)

**Window strategy:** merge — show every window where ≥1 source has data. Hide windows with no data. Mark which fields populated per window.

Window inventory:
- Birdeye: `1m, 5m, 30m, 1h, 2h, 4h, 8h, 24h`
- Jupiter: `5m, 1h, 6h, 24h`
- Union shown: **1m, 5m, 30m, 1h, 2h, 4h, 6h, 8h, 24h** (9 windows max — only render windows with data)

| Field | Primary | Fallback | Skip |
|---|---|---|---|
| Volume per window (USD + native) | Birdeye | — | — |
| Buy / sell volume | Birdeye | — | — |
| Trade count | Jupiter | Birdeye | — |
| Unique wallets per window | Birdeye | — | — |
| Net buyers per window | Jupiter | — | — |
| Organic buyers per window | Jupiter | — | — |
| Organic volume (buy/sell) | Jupiter | — | — |
| % change vs prior window | Birdeye | — | — |
| Number of traders | — | — | **Skipped** |
| Per-minute trade pulse | — | — | **Skipped** |

### E. Holders

| Field | Primary | Notes |
|---|---|---|
| Holder count | Jupiter | (Note: differs from Birdeye by ~2.6M for SOL — different definitions. Pick Jupiter consistently.) |
| Ranked top holders list (wallet + balance) | Birdeye `token_holder` | only source on free tier |
| Top-10 concentration % | — | **Skipped** |

### F. Chart / OHLCV

| Field | Primary | Fallback | Notes |
|---|---|---|---|
| OHLCV candles | Birdeye `/defi/ohlcv` | Tokens.xyz `/price-chart` | Tokens.xyz returned 0 candles for SOL during recon — needs retest on a memecoin to confirm fallback viability. Their data sourced from CoinGecko / aggregator. |

### G. Security & risk

| Field | Primary | Fallback | Skip |
|---|---|---|---|
| Mint / freeze authority bool (renounced / not) | Jupiter `audit` | Helius RPC | — |
| Dev / creator info | Jupiter `audit` | — | — |
| Organic score 0–100 + label | Jupiter | — | — |
| isVerified flag | Jupiter | — | — |
| Tags | Jupiter | — | — |
| Risk grade A–F | — | — | **Skipped** |
| Risk score signals (liquidityUsd, vol7d, mintTime, etc.) | Tokens.xyz `marketScoreInput` | — | — |
| Royalty config | Helius DAS | — | — |

### H. Metadata & content

| Field | Primary | Notes |
|---|---|---|
| Long-form description | Tokens.xyz `profile.description` | only source |
| Aliases / wrapped variants cross-chain | Tokens.xyz | only source |
| On-chain Metaplex metadata URI + off-chain JSON | Helius DAS | only source |
| Token age days | derived from Helius `getSignaturesForAddress` (oldest sig) | preferred over Jupiter `firstPool.createdAt` (which is first-pool, not first-mint) |

### I. Social links (union of sources)

| Field | Primary |
|---|---|
| Twitter / X | Tokens.xyz |
| Website | Tokens.xyz |
| Discord | Tokens.xyz |
| Telegram | Tokens.xyz |
| GitHub | Tokens.xyz |
| Whitepaper | Tokens.xyz |
| Medium | Birdeye `extensions` |
| CoinGecko ID | Birdeye `extensions` (also in Tokens.xyz) |

### J. DEX pools

| Field | Primary | Notes |
|---|---|---|
| First pool address + age | Jupiter `firstPool` | only source |
| Total markets count | Birdeye `numberMarkets` | (132,804 for SOL — illustrates aggregation scope) |
| Per-pool list (address, name, base/quote, liquidity, createdAt, price) | Tokens.xyz `includes.markets.data.markets[]` | only source |
| Pool APY | — | **Skipped** |

---

## Differentiators (v1 scope — all 5 included)

These are computed signals — no new API keys needed. Each has full attribution shown to the user.

### 1. Price-source divergence flag
- **Inputs:** Birdeye, Jupiter (snapshot), Tokens.xyz `stats.price`, Tokens.xyz `canonicalMarket.price`, Helius DAS `token_info.price_info.price_per_token`
- **Compute:** `max(prices) - min(prices)` / median(prices). Flag if > X% (start at 1%, tunable).
- **Display:** "5 sources within 0.3% (healthy)" green, or "spread 2.1% — Birdeye $86.3 / CG $84.5" amber

### 2. DEX vs CEX spread
- **Inputs:** Birdeye price (DEX-aggregated) vs Tokens.xyz `canonicalMarket.price` (CoinGecko / CEX-aggregated)
- **Compute:** `(dex - cex) / cex * 100`
- **Display:** "DEX trades 0.4% premium to CEX" with magnitude indicator

### 3. Real-human activity score
- **Inputs:** Birdeye `uniqueWallet5m / uniqueWallet1h` × Jupiter `numOrganicBuyers / numBuys` (organic ratio)
- **Compute:** `unique_wallets × organic_ratio` → percentile-rank within tag (memecoin / blue-chip)
- **Display:** Score 0–100 with sub-bars (unique wallets percentile, organic % filter)

### 4. Edge Score (composite safety)
- **Inputs:** chain-truth (Helius mint/freeze authority status, mutable, burnt) + Jupiter `audit` + Tokens.xyz `marketScoreInput` (liquidity / mcap / volume / mintTime)
- **Compute:** weighted sum of normalized signals. Each contributing signal has its raw value visible to user.
- **Display:** A–F grade + expandable breakdown ("authorities: ✅ renounced, mutability: ⚠ mutable, liquidity: ✅ high, age: 14 days")
- **Differentiator:** **fully attributed** — every input visible and traceable. Most competitors show only the score.

### 5. Slippage at size
- **Inputs:** Jupiter Quote API at sizes $1k, $10k, $100k (sell into SOL or USDC)
- **Compute:** `(quoteOut / spotPrice * inputUSD) - 1`
- **Display:** small table: "$1k → 0.02%, $10k → 0.18%, $100k → 1.4%"
- **Note:** Jupiter Quote API call cost is per-size; cache 30s.

---

## Refresh strategy

| Tier | Cadence | What |
|---|---|---|
| Realtime ticker | poll 1–2s | Jupiter Price API only |
| Live page data | refresh 30–60s | Birdeye `token_overview`, holders, trade activity, divergence calc |
| Static-ish | refresh 5–10min | Tokens.xyz profile/risk/markets, Helius DAS, slippage, Edge Score |
| One-shot at load | once per page | Token age, first pool, OHLCV history |

---

## Non-goals for v1

Tracked for future iteration:
- Wallet labels (CEX, MM, whale, smart money)
- Smart-money flow (curated wallet diff)
- Cross-token correlation
- Holder distribution change over time (snapshot history)
- Mint-event timeline
- Twitter / sentiment
- Token unlock schedule
- WebSocket streaming (requires Birdeye Premium)
- Multi-key Birdeye rotation pool
- Custom internal API/data layer (the wrapper around all five sources)

---

## Outstanding items

- Retest Tokens.xyz `/price-chart` on a non-canonical token (e.g. JUP, BONK) to confirm chart fallback viability.
- Confirm Birdeye free-tier per-second rate limit (current pacing uses 1.1s — works, but is it 1 RPS exactly?).
- User: remove `SOLSCAN_API_KEY` from Vercel.
- User: update `BIRDEYE_API_KEY` on Vercel to new account's key.
