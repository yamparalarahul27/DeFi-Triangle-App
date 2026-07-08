# 01 · Screens — navigation, wireframes, seam map

Mobile-first (customer audience is on phones). Desktop is the same
column, centered, max-w ~28rem, gutters on `--surface-dim`.

## Navigation shape

```
┌──────────────────────────────┐
│  screen content              │
│                              │
│                              │
├──────────────────────────────┤
│  ◉ Feed  ◍ Markets  ⌕  ◯ Me │ ← bottom bar
└──────────────────────────────┘
```

- **Feed** — social home (default tab for identified users)
- **Markets** — discovery rails (default for logged-out visitors)
- **Search** — opens the search overlay (existing `useTokenSearch` +
  recents + recommended), extended with people results later
- **Profile ("Me")** — own profile, or wallet-connect entry if logged out
- **Token detail** — pushed route `/token/[address]`, not a tab
- Other pushed routes: `/u/[handle]`, `/design`, system pages

## Screen inventory

| # | Screen | Route | Phase |
|---|---|---|---|
| S1 | Feed | `/` (tab) | 3 |
| S2 | Markets | `/` (tab) | 1 |
| S3 | Search overlay | modal | 1 |
| S4 | Token detail | `/token/[address]` | 1 (skin) · 3 (social strip) |
| S5 | Profile (own) | `/` (tab) | 2 |
| S6 | Profile (other) | `/u/[handle]` | 2 |
| S7 | Onboarding | modal flow | 2 |
| S8 | Design gallery | `/design` | 0–1 |
| S9 | 404 / error / global-error | system | 1 |

## S1 · Feed

```
┌ tide ~            [◐ avatar] ┐
│ ● Following   ○ Everyone     │ ← lane toggle
├──────────────────────────────┤
│ ◐ @mira watched  PYUSD   2m  │
│   "peg's been glued on"      │ ← watch + note
│   ♥ 12  💬 3    [PYUSD $1.00]│ ← token chip live
├──────────────────────────────┤
│ ◑ @deg  take            18m  │
│   Rotation into stables is   │
│   the real signal this week  │
│   🔥 8  💬 5                 │
├──────────────────────────────┤
│ ▲ JUP ran +14% — 5 people    │
│   you follow watch it        │ ← milestone card
└──────────────────────────────┘
```

- Two lanes: **Following** (people you follow) / **Everyone** (global,
  the cold-start + logged-out lane).
- Card types v1: `watch` (with optional note), `take` (short text,
  optional token tag), `milestone` (system-generated: watched token
  moved ±X%, N followers watched same token).
- Token chips inside cards show live price/24h from existing routes.
- Reactions: small emoji set (not free-form) + comment count → thread.

## S2 · Markets

Re-skin of the proven home rails — same hooks, new clothes, plus social
proof:

```
┌ Markets                    ⌕ ┐
│ ┌─ Attraction ──────── ‹ › ┐ │
│ │ [JUP] [WIF] [BONK] →     │ │ ← useHomeJupiterPairs
│ │ +4.2%  -1.1%  +12%       │ │   .sections
│ │ ◔ 41   ◔ 12   ◔ 96      │ │ ← "N watching" (new)
│ └───────────────────────────┘ │
│ ┌─ Park Your Money ────────┐ │
│ │ [USDC] [USDT] [PYUSD] →  │ │ ← useStablecoins
│ └───────────────────────────┘ │
│ ┌─ Long-term ▸ High-risk ▸ ┐ │
└──────────────────────────────┘
```

Watchlist lives here too (a "Yours" rail at top when identified) — the
Watchlist *tab* from the old app dissolves into Markets + Profile.

## S4 · Token detail

The 13 engine sections (`useTokenDetails` + `useTokenPriceTicker`) keep
their per-section loading flags; layout re-skinned. New: a **social
strip** between the header and the stats:

```
┌ ‹  JUP  $0.8123  ▲ +4.2%    ┐
│ [chart ────────────────────] │
├──────────────────────────────┤
│ ◔ 41 watching  [♥ Watch]     │ ← social strip
│ ◐◑◒ @mira @deg +38           │   (avatars of watchers
│ 💬 12 comments            ▸  │    you follow first)
├──────────────────────────────┤
│ stats · risk · holders ·     │ ← existing 13
│ activity · slippage · …      │   sections
└──────────────────────────────┘
```

Comments open a bottom-sheet thread (same component as feed threads).

## S5/S6 · Profile

```
┌ ‹  @mira            [Follow] ┐
│  ◐  Mira · joined May 26     │
│  "stables maxi"              │
│  120 followers · 89 following│
├──────────────────────────────┤
│ ● Watching  ○ Takes          │
├──────────────────────────────┤
│ [PYUSD] [USDC] [JUP]         │ ← public watchlist
│ $1.000  $0.999  $0.81        │
└──────────────────────────────┘
```

Own profile adds: edit profile, sign out. Public watchlist is the
follow-decision surface — you follow someone because of what they watch.

## S7 · Onboarding (identity)

```
browse freely (no wallet)
   │  first social act
   ▼
┌ Connect wallet ┐   existing nonce/
│ (Jupiter       │ ← verify/JWT flow,
│  adapter)      │   unchanged
└───────┬────────┘
        ▼
┌ Claim handle ──┐   one-time; skippable
│ @____________  │ ← never blocks reading
│ [◐◑◒◓] avatar  │
│ bio (optional) │
└────────────────┘
```

## S8 · `/design` gallery

Spec in [02-design-system.md](./02-design-system.md#the-design-gallery).
Unlisted (no nav link, `noindex`), but not secret — no auth gate.

## Seam map — screen → engine hook

| Screen | Existing hooks (contract §3) | New hooks needed |
|---|---|---|
| Feed | `useTokenPriceTicker` (chips) | `useFeed`, `useReactions`, `useComments` |
| Markets | `useHomeJupiterPairs`, `useStablecoins`, `useWatchlist` | `useWatcherCounts` |
| Search | `useTokenSearch`, `useRecentSearches`, `useRecommendedTokens` | — (people search later) |
| Token detail | `useTokenDetails`, `useTokenPriceTicker`, `useTokenSecurity`, `useWatchlist` | `useTokenSocial` (watchers, comments) |
| Profile | `useWalletAuth` / `useSession` | `useProfile`, `useFollows` |
| Onboarding | `useWalletAuth` | `useProfile` (claim/update) |
| `/design` | — (static + live components) | — |

New hooks follow the exact conventions of the existing 14 (return-shape
documented in engine-contract.md **in the same PR that adds them**).

## Engine-contract obligations (before any deletion/build)

From contract §6 — these are build-phase gates, recorded here so they
don't get lost:

1. Move `OnChainData` + `HolderRow` types into `src/lib/token/` before
   the old token panels are deleted.
2. Delete the 6 dormant tabs + `useTabPairs` in the same pass.
3. Redesign 404 / error / global-error fresh (not in the HTML prototype).
4. Sequence vs. the api-inventory.md Jupiter-v2 consolidation: decide
   before phase 1 whether consolidation lands first (recommended by the
   contract) or is deferred with hook shapes frozen.
