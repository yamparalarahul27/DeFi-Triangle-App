# API Inventory & Consolidation Reference

> **Why this doc exists.** We integrated many upstream APIs to build richer token
> content by combining all of them per screen. That fan-out hurt performance
> (multiple round-trips per token for largely the same numbers). This document
> records (a) every external API wired today, (b) what each provider's **latest**
> API version offers, and (c) a consolidation map of which single provider should
> own each data need. It is the reference for the API cleanup work.
>
> <sub>Researched mid-2026 against official provider docs. Citations at the bottom of each section. Treat pricing/quota figures as approximate — they live on dashboards, not API reference pages.</sub>

---

## 1. Current integrations (what's wired today)

| Provider | Host | Auth | What it serves today | Proxy route |
|---|---|---|---|---|
| **Birdeye** | `public-api.birdeye.so` | `BIRDEYE_API_KEY` + `x-chain: solana` | trending, token list, search, token overview (price/vol/liq/mcap/holders), top holders, security flags, OHLCV | `/api/birdeye` |
| **Jupiter** | `api.jup.ag`, `lite-api.jup.ag` | `JUPITER_API_KEY` (server) | token search, categories, price-impact quotes (slippage), live price ticker (v3), audit/organic-score | `/api/jupiter` + direct ticker call |
| **Tokens.xyz** | `api.tokens.xyz/v1` | `TOKENS_XYZ_API_KEY` | asset profile, risk score (A–F), markets, price-chart | `/api/tokens-xyz` |
| **Helius** | `mainnet.helius-rpc.com` | `HELIUS_API_KEY` | RPC + DAS: mint/freeze authority, supply, tx history, NFT asset/collection search | `/api/helius`, `/api/nft/admin/seed` |
| **Magic Eden** | `api-mainnet.magiceden.dev/v2` | none | NFT floor price, listings, trait rarity | `/api/nft` |
| **Supabase** | `<project>.supabase.co` | service-role (server) | our own data: watchlist, auth nonces, NFT index | `/api/watchlist`, `/api/auth/*`, `/api/nft` |
| **Upstash KV** | Vercel KV | KV token | rate limiting only (fail-open) | all `/api/*` |

### Direct client call (bypasses proxy)
- `lite-api.jup.ag/price/v3` — live price ticker (~1.5s refresh) in `src/lib/hooks/useTokenPriceTicker.ts`

### Call flow

```
Browser (React hooks)
  └─→ Next.js /api/* proxies
        ├─ /api/birdeye    → Birdeye    (trending, list, search, overview,
        │                                 holders, security, OHLCV)
        ├─ /api/jupiter    → Jupiter    (search, tokenInfo, quote, home)
        ├─ /api/tokens-xyz → Tokens.xyz (asset, price-chart)
        ├─ /api/helius     → Helius RPC (getAsset, getAccountInfo,
        │                                 getTokenSupply, searchAssets)
        ├─ /api/nft        → Supabase index + Magic Eden live pricing
        ├─ /api/auth/*     → Supabase auth_nonces + JWT
        └─ /api/watchlist  → Supabase watchlist
```

---

## 2. The redundancy problem

Multiple providers return the **same** token numbers. A token-detail render can
hit Birdeye + Jupiter + Tokens.xyz + Helius for overlapping data.

```
DATA NEED          │ Birdeye │ Jupiter │ Tokens.xyz │ Helius
───────────────────┼─────────┼─────────┼────────────┼────────
spot price         │   ✓     │   ✓     │     ✓      │ (DAS)
24h change / vol   │   ✓     │   ✓     │     ✓      │
liquidity / mcap   │   ✓     │   ✓     │     ✓      │
price chart/OHLCV  │   ✓     │ (derive)│     ✓      │
search             │   ✓     │   ✓     │            │
risk / security    │   ✓     │ (audit) │  ✓ (A–F)   │ ✓ (authority)
top holders        │   ✓     │         │            │
slippage quote     │         │   ✓     │            │
NFT                 │         │         │            │ ✓
```

---

## 3. Latest version — per provider

### Jupiter — Token API **v2** (current; v1 sunset Sep 2025)

The single richest call we have. **One `tokens/v2` request returns, per token:**

- `usdPrice`; `priceChange` for **5m / 1h / 6h / 24h**
- volume, buy/sell volumes, buy/sell counts, traders — per window
- `liquidity`, `mcap`, `fdv`, `holderCount`
- `audit` { `mintAuthorityDisabled`, `freezeAuthorityDisabled`, `topHoldersPercentage` }
- `isVerified`, `organicScore` + label, `tags`, `decimals`, `circSupply`, `totalSupply`

Surface: `tokens/v2/search` (≤100 mints), `tokens/v2/tag`, `tokens/v2/{category}/{interval}`, `tokens/v2/recent`.

- **Price API v3** — `price/v3?ids=` (≤50 mints): `usdPrice`, `blockId`, `decimals`, `priceChange24h`. Single authoritative price; unreliable tokens return `null`.
- **Swap quote v1** — `swap/v1/quote`: `priceImpactPct`, `otherAmountThreshold`, `routePlan[]`, slippage. Still current.

**Hosts:** `lite-api.jup.ag` = keyless, 0.5 RPS (lite-api deprecation was *postponed*, no deadline). `api.jup.ag` + key = higher RPS. Rate limits are **per-account**, 60s sliding window. Free paid-key tier = 1 RPS; Developer $25/mo = 10 RPS.

**Forward note:** new swap work should target the unified **Swap v2** (`/order` + `/execute`, launched Mar 2026) — it folds in Ultra/Metis. Our `swap/v1/quote` is safe to keep.

<sub>Docs: developers.jup.ag (moved from dev.jup.ag) — tokens/v2/token-information, price/v3, swap/get-quote, portal/rate-limits, pricing, changelog.</sub>

### Birdeye — mostly **v3** now (`public-api.birdeye.so`)

Versioned per family, not globally. Current paths:

| Family | Path | Notes |
|---|---|---|
| OHLCV | `/defi/v3/ohlcv` | **sub-minute (1s/15s/30s)** + up to **5000 candles/call** |
| Token security | `/defi/token_security` | v1, current — mint/freeze, holder concentration |
| Top holders | `/defi/v3/token/holder` | Solana only, `offset+limit ≤ 10000` |
| Token list | `/defi/v3/token/list` | rich filter/sort discovery |
| Search | `/defi/v3/search` | exact/fuzzy, market filters |
| Trending | `/defi/token_trending` | v1, **limit capped at 20** |
| Token overview | `/defi/token_overview` | v1, current — **the rich blob Jupiter v2 now duplicates** |
| Market data | `/defi/v3/token/market-data` | v3-native lighter counterpart |
| Price / multi | `/defi/price`, `/defi/multi_price` | multi caps at 100 mints |

**Auth:** `X-API-KEY` + `x-chain` (matches our CLAUDE.md convention). **Billing = compute units**, rate limit **per-account** (Standard 1 RPS … Premium 50 RPS). **Deprecated:** `/v1/wallet/token_list`.

<sub>Docs: docs.birdeye.so — token-list/market-data/ohlcv/search/holder v3 references, token_overview, token_security, rate-limiting, compute-unit-cost, changelog.</sub>

### Tokens.xyz — **v1 stable**, now public docs (`api.tokens.xyz/v1`)

- `GET /v1/assets/:id?include=profile,risk,ohlcv,markets`
  - `risk` block → **`riskLabel` + `riskGrade` (A–F) + `riskScore` + `riskFactors`** — its unique value
  - `stats` → price, marketCap, volume24h/30d, liquidity, priceChange24hPercent
  - `markets` → per-DEX liquidity/volume/trades
- `GET /v1/assets/:id/price-chart` — candles, intervals `1m | 5m | 15m | 1H | 4H | 1D | 1W`
- Also: `search`, **`resolve`** (cbBTC/WBTC/tBTC → one Bitcoin), `trending`, batch `market-snapshots`, news feed
- **Auth:** `x-api-key`, scoped (`assets:read`, `assets:risk:read`). Pricing/quotas **not published** — gated behind `app.tokens.xyz`.

**Dependency read:** Solana Foundation **public good**, integrators incl. Phantom/Titan/DFlow — credible, but **young (v1 left beta ~Apr 2026), no published SLA/pricing.** Keep behind a feature flag with last-good fallback.

<sub>Docs: docs.tokens.xyz (v1/*), tokens.xyz/assets-api, solana.com/news/inside-tokens-xyz.</sub>

### Helius — **DAS** current (`mainnet.helius-rpc.com`)

- `getAsset` → authority, supply, decimals, metadata **+ best-effort `price_info`** ({ `price_per_token`, `currency` } only)
- **Price caveats:** top ~10k tokens by volume only, **cached ≤10 min**, no liquidity/volume/mcap → **not a live-price source.**
- Standard RPC (`getAccountInfo`, `getTokenSupply`) = 1 credit each; `getAsset`/DAS = 10 credits. For pure on-chain truth, `getAccountInfo`+`getTokenSupply` (2 credits) beats one `getAsset` (10) when metadata/price aren't needed.
- **Auth:** `api-key` in URL. No deprecations affecting our stack.

> **Verdict:** keep Helius for **on-chain truth only** (authority/supply/metadata). Do not rely on it for live price/market data.

<sub>Docs: helius.dev/docs — das-api, getasset reference, billing/credits, billing/plans.</sub>

---

## 4. Consolidation map — keep / drop

```
DATA NEED          │ KEEP          │ DROP / DEMOTE
───────────────────┼───────────────┼──────────────────────
price + 24h + vol  │ Jupiter v2    │ Birdeye overview,
 liq + mcap + fdv  │  (1 call)     │  Tokens.xyz profile
holder count       │ Jupiter v2    │ —
audit(mint/freeze) │ Jupiter v2    │ Helius (for this)
live price tick    │ Jupiter price │ —
───────────────────┼───────────────┼──────────────────────
OHLCV / chart      │ Birdeye v3    │ Tokens.xyz chart,
                   │               │  Jupiter-derived
top holders        │ Birdeye v3    │ —
token security     │ Birdeye       │ —
search             │ Jupiter v2    │ Birdeye search
───────────────────┼───────────────┼──────────────────────
risk grade A–F     │ Tokens.xyz    │ unique — keep ONLY if
                   │               │  surfaced in UI
on-chain authority │ Helius        │ only if not covered
 / supply truth    │               │  by Jupiter audit
NFT floor/traits   │ Magic Eden    │ —
NFT on-chain/index │ Helius+Supa   │ —
```

**Headline:** **Jupiter Token v2 alone replaces the Birdeye-`token_overview` + Jupiter + Tokens.xyz trio** for price/vol/liq/mcap/holders/audit — collapsing ~3 upstream round-trips per token to 1. After consolidation:

- **Jupiter** → primary token data + live price + slippage + search
- **Birdeye** → chart (OHLCV) + security + top holders + trending
- **Tokens.xyz** → risk grade A–F only (drop entirely if the grade isn't surfaced)
- **Helius** → on-chain authority/supply truth + NFT
- **Magic Eden / Supabase / Upstash** → unchanged

---

## 5. Open decisions before implementing

1. **Is the Tokens.xyz A–F risk grade surfaced in the UI?** If no → drop Tokens.xyz entirely.
2. **Does Jupiter v2's `audit` (mint/freeze) satisfy our security display**, or do we still need Birdeye `token_security` / Helius authority for the full picture?
3. Per-screen call audit (home / search / token detail / NFT) — what each calls today vs. after — to confirm no regressions before editing.

<sub>This doc is the input to that consolidation plan; it does not itself change any code.</sub>
