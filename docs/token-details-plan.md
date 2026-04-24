# Token Details Page — Planning & Recon

Branch: `imp-token-details`

## Goal

Build the **best token information experience on Solana** — a token-details page that shows data no competitor (DexScreener, Birdeye, GMGN, Solscan, CoinGecko) surfaces in one place. Users should prefer our app because it gives them info they can't easily get elsewhere.

## Existing data sources (already wired)

| API | Auth env | Where |
|---|---|---|
| Jupiter | `JUPITER_API_KEY` | [src/lib/jupiter/upstream.ts](../src/lib/jupiter/upstream.ts) |
| Birdeye | `BIRDEYE_API_KEY` | same file |
| Tokens.xyz | `TOKENS_XYZ_API_KEY` | same file |

Unified into `TokenPair` via adapters in [src/lib/jupiter/adapters.ts](../src/lib/jupiter/adapters.ts). Full inventory captured in the earlier session transcript.

## New data sources (keys added, not yet wired)

| API | Auth env | Purpose |
|---|---|---|
| Solscan Pro | `SOLSCAN_API_KEY` | Plan: Free Level 1 — holders, transfers, DeFi activities per token |
| Helius | `HELIUS_API_KEY` | DAS (metadata), RPC (supply/accounts), Enhanced Tx |

## Reconnaissance spike — 2026-04-24

Ran [scripts/token-recon.mjs](../scripts/token-recon.mjs) against SOL (mint `So11111111111111111111111111111111111111112`). Raw responses in `tmp/recon/sol/` (gitignored).

### Results: 5 / 19 endpoints returned data

**Worked**
- `jupiter-search` (15 KB)
- `birdeye-token_overview` (10 KB)
- `birdeye-ohlcv_1h_24h` (8.5 KB)
- `tokensxyz-asset` (99 KB — includes profile, risk, markets)
- `tokensxyz-price_chart` (5.5 KB)

**Failed — blockers to resolve before resuming**

1. **Helius: all 4 calls 401 "invalid api key"**
   - Root cause: `HELIUS_API_KEY` in `.env.local` holds a **full URL** (`https://beta.helius-rpc.com/?api-key=<UUID>`), not just the UUID. Script concatenated it into the final URL and broke.
   - **Action**: update `.env.local` so `HELIUS_API_KEY` is only the UUID (no `https://…` prefix). Script already deletes disk leak of URL for security — resume-safe.
   - **Mitigation idea**: next iteration of script should auto-strip a URL prefix if present, so either format works.

2. **Solscan Free L1: all 6 token endpoints return 401 "Please upgrade your api key level"**
   - Key is valid but Free L1 **does not grant access to `/token/*` endpoints** (meta, price, holders, transfer, markets, defi/activities).
   - **Action needed from user**: check Solscan dashboard → which endpoints ARE available on Free L1? If none of the token endpoints are included, Solscan may not be usable for our core needs and we'd need to plan without it (or upgrade tier).

3. **Birdeye: 4 calls failed with 400 "Compute units usage limit exceeded"**
   - Failed: `token_security`, `token_holder`, `token_creation_info`, `token_trade_data`
   - Current Birdeye plan appears to have a CU cap that these premium endpoints exhaust quickly.
   - **Action needed from user**: confirm Birdeye plan tier and whether these endpoints are ever accessible, or if CU quota needs a paid upgrade.

### Security hygiene
- Leaked Helius URL files (`tmp/recon/sol/helius-*.json`) deleted from disk. `tmp/` is gitignored so never reached remote.
- Going forward: store only the bare API key (UUID/token) in env vars — never a full URL.

## Where to resume

When user returns:

1. **Confirm blockers cleared** — Helius key format fixed, Solscan tier status known, Birdeye tier status known.
2. **Re-run recon** — `node scripts/token-recon.mjs` will top up tmp/recon/sol/ with any newly-working endpoints.
3. **Build MATRIX.md** — field × API coverage table based on actual response shapes. Three dimensions:
   - Coverage per field (✅ / ❌ / ⚠️ partial)
   - Unique contributions per API (where does each win)
   - Gaps — data NO API gives us (these become the "differentiator ideas" — synthesized signals, on-chain derivations, etc.)
4. **Scope v1 of the token details page** — once the matrix is in hand, pick the sections that (a) are feasible with our data and (b) outshine existing tools.
5. **Design architecture** — route structure (`/token/[mint]`), API routes (`/api/token/[mint]/*`), caching strategy given rate limits.

## Open product questions (carried forward)

- v1 scope: minimal (hero + stats + chart + holders) vs full (+ activities + transfers)?
- Holders depth: top 10, 20, or paginated?
- Transfers vs DeFi activities — activities is richer (swap USD amounts, DEX); do we need both or skip transfers for v1?
- Polling interval for live sections — 30s / 60s / on-demand refresh only?
