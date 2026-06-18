# Engine & Data Contract

> **Why this doc exists.** We are about to revamp the UI/UX from scratch. The
> static HTML prototype under `public/Prototypes/` (PR #51) froze the **look** of
> the old app. This doc freezes the **seam** — the connection points between the
> presentation layer (the `.tsx` we will rebuild) and the engine (the API routes,
> hooks, and data logic we will **keep**). When the new UI is built, every screen
> plugs back into the hooks below with the exact data shapes recorded here.
>
> <sub>Snapshot as of <code>f0c776d</code> (2026-06-18). If a hook's signature or return shape changes, update this doc in the same PR — it is a contract, not a one-time note.</sub>

---

## 1. The two-layer model — what is safe to delete

```
┌─ PRESENTATION (rebuild for the revamp) ───────────────┐
│  src/app/page.tsx, token/[address]/page.tsx (JSX)      │
│  src/components/{home,tabs,token,search,nft,wallet,     │
│                  layout,ui}/*.tsx                       │
│  → all visual structure, Tailwind classes, layout      │
└────────────────────────────────────────────────────────┘
                         │  connects via hooks (the seam)
                         ▼
┌─ ENGINE (KEEP — irreplaceable, not captured by HTML) ──┐
│  src/app/api/**         route handlers                  │
│  src/lib/hooks/*        14 hooks (the seam itself)      │
│  src/lib/{home,jupiter,token,nft}/*  adapters/scoring   │
│  src/lib/{auth,supabase,rateLimit,featureFlags}.ts      │
└────────────────────────────────────────────────────────┘
```

**Rule:** deleting presentation `.tsx` is safe. Deleting anything under
`src/app/api/`, `src/lib/hooks/`, or `src/lib/*` logic modules destroys work the
HTML prototype cannot restore. The fresh UI **re-wires to the same hooks**.

> **Caveat — hooks live in `src/lib/hooks/` but some embed UI-coupled types.**
> A few domain types are currently *defined inside component files*
> (`OnChainData`, `HolderRow` in their panels). Before deleting those panels,
> move the type definitions into `src/lib/token/` so the hooks keep compiling.
> See §3 markers ⚠.

---

## 2. Screen → seam map

Each screen, the hooks that feed it, and the gate that shows it.

### Home — `/` · `src/app/page.tsx`

| View (tab) | Hook(s) | API route | Gate |
|---|---|---|---|
| Home rails | `useHomeJupiterPairs(refreshMs, paused)` → `{ data, sections, loading, refetch }` | `/api/jupiter?type=home` | always |
| Park Your Money rail | `useStablecoins(refreshMs, paused)` → `{ data:{live,pending}, loading, refetch }` | `/api/stablecoins` | `STABLECOIN` |
| Watchlist tab | `useWatchlist(authed)` → `{ items, loaded, starredSet, refresh, add, remove }` | `/api/watchlist` (auth'd) | `WATCHLIST` |
| NFT Edge tab | `useNftEdge(collectionMint, sessionWallet)` → see §3 | `/api/nft` | `NFT_EDGE` |
| ⌘K search modal | `useTokenSearch(query)`, `useRecentSearches()`, `useRecommendedTokens(enabled)` | `/api/jupiter?type=search` + localStorage | always |
| Token modal (card click) | `useTokenDetails(address)`, `useTokenSecurity(address)` | birdeye + jupiter + tokens-xyz | always |
| Stablecoin modal | (data passed from `useStablecoins`) | — | `STABLECOIN` |

### Token detail — `/token/[address]` · `src/app/token/[address]/page.tsx`

Single hook drives the whole page: **`useTokenDetails(address)`** plus
**`useTokenPriceTicker(address)`** for the live price tick. Per-section loading
flags let each section render independently (`statsLoading`, `onChainLoading`,
`holdersLoading`, `edgeScoreLoading`, `tradingActivityLoading`, `slippageLoading`,
`identityLoading`, `chartLoading`). The 13 sections all read off the one result
object — see the field map in §3 `useTokenDetails`.

### Static pages — no hooks

| Screen | Route | Data source |
|---|---|---|
| Brand kit | `/brand` | static |
| Maintenance | `/maintenance` | env flag (`MAINTENANCE_MODE`) |
| 404 | any unmatched | `src/app/not-found.tsx` — static |
| Route error | thrown in page | `src/app/error.tsx` — static |
| Global error | thrown at root | `src/app/global-error.tsx` — static |

> The 3 system pages (404 / error / global-error) are **not** in the HTML
> prototype. The revamp must redesign them from scratch.

### ⚠ Dormant tabs — orphaned presentation

`src/components/tabs/{Defi,Trending,Live,Meme,Whale,Smart}Tab.tsx` exist and use
`useTabPairs<T>(url, refreshMs, paused)` against `/api/birdeye`, **but they are
not wired into the live home flow** (`HomeTab = "home" | "watchlist" | "nft-edge"`
only). They are safe to delete with the rest of the presentation. `useTabPairs`
itself becomes unused if all 6 go — drop the hook too in that case.

---

## 3. Hook reference (the contract)

Signatures and exact return shapes the new UI must honor. Types resolved from
`src/lib/{home,jupiter,tokens-xyz,token}` and the noted component files.

<details><summary><b>useHomeJupiterPairs(refreshMs: number, paused: boolean)</b> — home rails</summary>

```ts
return { data, sections, loading, refetch }
// data: TokenPair[]
// sections: { attraction: TokenPair[]; longTerm: TokenPair[]; highRisk: TokenPair[] } | null
// loading: boolean
// refetch: () => Promise<void>
```
Route: `/api/jupiter?type=home&limit=140`. Consumer: `HomeSectionsView`.
</details>

<details><summary><b>useStablecoins(refreshMs: number, paused: boolean)</b> — Park Your Money</summary>

```ts
return { data, loading, refetch }
// data: { live: StableLiveData[]; pending: StablePendingData[] }

type StableLiveData = {
  mint: string; symbol: string; name: string; iconUrl: string | null;
  priceUsd: number; volume24hUsd: number; liquidityUsd: number;
  pegDeviationBps: number;          // SIGNED: + above peg, − below peg
  marketCapUsd: number; circulatingSupply: number;
  mintAuthorityDisabled: boolean | null; freezeAuthorityDisabled: boolean | null;
  tokenProgram: string | null; jupiterVerified: boolean;
}
type StablePendingData = {
  mint: string; symbol: string; name: string; tagline: string;
  featured?: boolean; iconUrl?: string; learnMoreUrl?: string;
}
```
Route: `/api/stablecoins`. Consumer: `ParkYourMoneyRail`.
</details>

<details><summary><b>useWatchlist(authed: boolean)</b> — Watchlist tab + star buttons</summary>

```ts
return { items, loaded, starredSet, refresh, add, remove }
// items: WatchlistItem[]
// loaded: boolean
// starredSet: Set<string>            // token addresses, for fast star state
// refresh: () => Promise<void>
// add: (p: { token_address: string; symbol?; name?; image_url? }) => Promise<void>
// remove: (tokenAddress: string) => Promise<void>

interface WatchlistItem {
  id: string; token_address: string;
  symbol: string | null; name: string | null; image_url: string | null;
  added_at: string;
}
```
Routes: GET/POST/DELETE `/api/watchlist` (all JWT-gated). Consumer: `WatchlistTab`.
</details>

<details><summary><b>useNftEdge(collectionMint: string, sessionWallet: string | null)</b> — NFT Edge tab</summary>

```ts
return {
  collection,     // NftCollection | null
  assets,         // NftAssetSummary[]
  selectedIndex,  // number
  selectIndex,    // (i: number) => void
  detail,         // AssetDetailPayload | null
  detailLoading,  // boolean
  otherOwned,     // { count: number; assets: NftAssetSummary[] } | null
  loading,        // boolean
  loadingMore,    // boolean
  hasMore,        // boolean
  loadMore,       // () => Promise<void>
  error,          // string | null
}

type NftAssetSummary = { id: string; name: string; number: number | null;
  image_url: string; owner?: string | null }
type NftCollection = { id: string; symbol: string; name: string | null;
  image: string | null; description: string | null;
  total_supply: number | null; royalty_bps: number | null }
type AssetDetailPayload = { asset: NftAssetDetail; collection: NftCollection;
  rarity: Record<string, RarityEntry>;
  live: { floorPrice: number|null; listedCount: number|null;
          listStatus: string|null; listPrice: number|null } }
```
Routes: `/api/nft?collection=` (list), `?asset=` (detail), `?owner=&collection=`.
Consumers: `NftRail`, `NftDetail`. (Types currently defined in the hook file.)
</details>

<details><summary><b>useTokenDetails(address: string)</b> — token modal + full token page</summary>

The page's single source of truth. Returns 24 fields: domain data + per-section
loading flags.

```ts
return {
  // ── data ──
  asset,            // AssetCore | null
  primary,          // Variant | null   (primary market/variant)
  variantsByKind,   // VariantsByKind
  profile,          // AssetProfile | undefined   (tokens-xyz includes.profile)
  risk,             // RiskData | undefined        (tokens-xyz A–F grade)
  markets,          // MarketVenue[]
  onChain,          // OnChainData | null     ⚠ type in OnChainPanel.tsx
  meta,             // { jupiter: JupiterTokenInfo|null; numberMarkets: number|null }
  edgeScore,        // EdgeScoreResult | null   (src/lib/token/edgeScore.ts)
  birdeyePrice,     // number | null
  topHolders,       // HolderRow[] | null     ⚠ type in TopHoldersPanel.tsx
  tradingActivity,  // MultiWindowData | null   (src/lib/token/tradingActivity.ts)
  slippage,         // SlippageResult | null    (src/lib/token/slippage.ts)
  chartCandles,     // Candle[]
  chartRange,       // string
  setChartRange,    // (label: string) => void
  // ── loading flags ──
  loading, chartLoading, statsLoading, onChainLoading, holdersLoading,
  edgeScoreLoading, tradingActivityLoading, slippageLoading, identityLoading,
  // ── error gates ──
  notIndexed,       // boolean   → "Token not indexed yet"
  invalidAddress,   // boolean   → "Invalid mint address"
}

type Candle = { o:number; h:number; l:number; c:number; v:number; unixTime:number }
// ⚠ OnChainData (move to src/lib/token/onChain.ts before deleting the panel):
//   { accountInfo: { mintAuthority: string|null; freezeAuthority: string|null } | null;
//     asset: { mutable: boolean; burnt: boolean;
//              royalty: { percent: number; target: string|null } | null } | null;
//     dasPrice: number | null }
// ⚠ HolderRow: { owner:string; amount:string; decimals:number; uiAmount:number }
```
Routes: `/api/birdeye?type=token|holders`, `/api/tokens-xyz?type=asset`,
`/api/jupiter?type=tokenInfo`, on-chain via `src/lib/token/onChain.ts` (`/api/helius`).
Consumers: `TokenModal`, `IdentityStrip` (+ every token-page section).
</details>

<details><summary><b>useTokenPriceTicker(address: string)</b> — live price tick</summary>

```ts
return { price, priceChange24h, lastUpdatedAt }   // all number | null
```
Route: **direct** `https://lite-api.jup.ag/price/v3?ids=` (~1.5s, bypasses proxy).
Consumer: token detail header.
</details>

<details><summary><b>useTokenChart(address: string)</b> — chart candles</summary>

```ts
return { candles, loading }   // candles: Candle[] | null
```
Routes (fallback order): `/api/birdeye?type=ohlcv` → `/api/tokens-xyz?type=price-chart`
→ `/api/jupiter?type=search` (derived). Folded into `useTokenDetails`.
</details>

<details><summary><b>useTokenSecurity(address: string)</b> — security signals</summary>

```ts
return { signals, loading, error }
// signals: { label: string; value: string }[]
```
Route: `/api/birdeye?type=security`. Consumer: `IdentityStrip`.
</details>

<details><summary><b>useTokenSearch(query) / useRecommendedTokens(enabled) / useRecentSearches()</b> — search modal</summary>

```ts
useTokenSearch(query: string)        → { results: TokenSearchResult[]; loading }
useRecommendedTokens(enabled: bool)  → { recommended: TokenSearchResult[]; loading }
useRecentSearches()                  → { recents, push, remove, clear }   // localStorage

interface TokenSearchResult {
  pairAddress?: string;
  baseToken?: { address?; symbol?; name? };
  quoteToken?: { symbol?; name? };
  info?: { imageUrl? };
  priceUsd?: number | string;
  priceChange?: { h24?: number | string };
  dexId?: string;
  [key: string]: unknown;
}
interface RecentSearch { address; symbol; name; imageUrl?; ts: number }
```
Routes: `/api/jupiter?type=search|home`; recents are localStorage (V2: server-side,
see CLAUDE.md pending followups). Consumers: `SearchModal`, `HomeSectionsView`.
</details>

<details><summary><b>useTabPairs&lt;T&gt;(url, refreshMs, paused)</b> — ⚠ dormant tabs only</summary>

```ts
return { data, loading, extra, refetch }   // data: any[]; extra: T (json minus {success,data})
```
Route: parameterized `url` (usually `/api/birdeye`). Consumers: the 6 dormant tabs.
Delete with them.
</details>

---

## 4. API route contracts

All under `src/app/api/`. All upstream fetches `cache: "no-store"`, rate-limited
via Upstash (fail-open), generic error bodies.

| Route | Verb | Key params | Returns |
|---|---|---|---|
| `/api/jupiter` | GET | `type=home\|search\|tokenInfo\|quote` | `{ success, data \| sections }` — primary token data, search, audit, slippage quote |
| `/api/birdeye` | GET | `type=token\|holders\|security\|ohlcv\|list_v3\|trending\|search` | `{ success, data, ... }` — overview, holders, security, candles |
| `/api/tokens-xyz` | GET | `type=asset\|price-chart`, `assetId` | `{ success, data }` — asset profile + risk A–F + markets, candles |
| `/api/helius` | GET/POST | RPC `method` | proxied Helius JSON-RPC — on-chain authority/supply/metadata |
| `/api/stablecoins` | GET | — | `{ success, data:{ live, pending } }` |
| `/api/nft` | GET | `asset \| collection&page&limit \| owner&collection` | `{ success, data }` — Supabase index + Magic Eden live pricing |
| `/api/watchlist` | GET/POST/DELETE | `?token=` (DELETE) | `{ success, data }` — JWT-gated, wallet from token |
| `/api/auth/nonce` | POST | `{ wallet }` | `{ success, data:{ nonce } }` |
| `/api/auth/verify` | POST | `{ wallet, nonce, signature }` | `{ success, data:{ token } }` + sets HTTP-only cookie |
| `/api/auth/me` | GET | — | `{ success, data:{ wallet } }` |
| `/api/auth/logout` | POST | — | `{ success }` |

See [docs/api-inventory.md](./api-inventory.md) for upstream provider detail and
the planned consolidation (Jupiter v2 as primary). **The consolidation work and
this revamp touch the same hooks** — sequence them deliberately (§6).

---

## 5. Auth & feature flags

- **Auth seam:** wallet connect → `/api/auth/nonce` → sign → `/api/auth/verify`
  (sets JWT cookie) → `useSession()` exposes the wallet. `getSessionWallet(req)`
  guards every protected route; wallet comes from the JWT, never the client.
- **Flags** (`src/lib/featureFlags.ts`, all currently `true`): `WATCHLIST`,
  `WALLET_CONNECT`, `STABLECOIN`, `NFT_EDGE`. The new UI must keep honoring these
  gates (or consciously retire a flag per CLAUDE.md).

---

## 6. How the revamp uses this doc

```
1. KEEP everything in §1 "ENGINE".
2. Before deleting token panels, move the ⚠ types
   (OnChainData, HolderRow) into src/lib/token/.
3. Build each new screen against the hook shapes in §3 —
   the hook is the only thing the UI may import from the engine.
4. Delete dormant tabs (§2 ⚠) + useTabPairs in the same pass.
5. Redesign the 3 system pages (404/error/global-error) fresh.
6. Decide ordering vs the api-inventory.md consolidation —
   both edit the hooks. Do consolidation FIRST or the new UI
   gets built against shapes that are about to change.
```

<sub>This doc is read-only reference. It changes no code. Keep it current whenever a hook signature or return shape moves.</sub>
