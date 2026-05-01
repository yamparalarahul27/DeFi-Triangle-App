# Park Your Money — Stablecoin Rail Handoff

**Feature:** "Park Your Money" — curated Solana stablecoin rail at the top of
the home page, with a click-through detail modal.
**Branch:** `claude/implement-stablecoin-wqe1f`
**Open PR:** [#39](https://github.com/yamparalarahul27/DeFi-Triangle-App/pull/39) → `stage`
**Last shipped:** PR [#38](https://github.com/yamparalarahul27/DeFi-Triangle-App/pull/38) (v1.0) merged into `stage`
**Last updated:** 2026-04-30 (cloud session close)

This file is the audit trail + strategic context for the stablecoin rail work.
If a Claude session picks this up, **read this first**, then [CLAUDE.md](../CLAUDE.md),
then dive in.

---

## TL;DR

```
┌─ Where things stand ─────────────────────────┐
│                                              │
│  v1.0  ✅ merged into stage                  │
│         Park Your Money rail with 6 mints    │
│         + peg health + liquidity/volume.     │
│                                              │
│  v1.1  🟡 in PR #39, awaiting your final    │
│         visual check + merge.                │
│         Adds click-through StableTokenModal, │
│         swaps USDe → USDG, fixes swap CTAs,  │
│         issuer subtitle on cards (β).        │
│                                              │
│  v1.2  📋 planned — see Roadmap below.       │
│         Yield, supply-trend arrow, internal  │
│         /swap page, Vitest setup, brand      │
│         images for PUSD + USDT.              │
└──────────────────────────────────────────────┘
```

---

## What's on `stage` today (v1.0 — PR #38 merged)

```
┌─ Home (top of page) ─────────────────────┐
│  Park Your Money                  < >    │  ← rail
│  Stablecoins on Solana — peg health…     │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌──── │
│ │PUSD│ │USDC│ │USDT│ │PYUSD│ │USDS│ │USDe│  ← v1.0
│ │Soon│ │Peg │ │Peg │ │Peg │ │Peg │ │Peg │
│ └────┘ └────┘ └────┘ └────┘ └────┘ └──── │
│  Tokens Gaining Attraction               │  ← unchanged
│  Tokens for Long-Term Wealth             │
│  High Risk, High Reward                  │
└──────────────────────────────────────────┘
```

**Files shipped in v1.0:**

| Path | Role |
|---|---|
| `src/lib/home/stablecoins.ts` | Curated mint list + peg-bucket thresholds + types |
| `src/app/api/stablecoins/route.ts` | Server proxy via Jupiter `/search` per mint |
| `src/lib/hooks/useStablecoins.ts` | Client hook (60s refresh) |
| `src/components/home/StableCard.tsx` | Live + pending card variants |
| `src/components/home/ParkYourMoneyRail.tsx` | Rail wrapper with chevron scrollers + skeleton |
| `src/lib/featureFlags.ts` | `STABLECOIN: true` |
| `src/components/home/HomeSectionsView.tsx` | Mounts rail at top |

**Also shipped (v1.0 piggyback):**

- `CLAUDE.md` — added the **"Explaining changes with ASCII"** rule. Every
  technical / UI / UX change in this repo should be described with an ASCII
  diagram alongside prose.

---

## What's in PR #39 (v1.1 — pending merge)

Three things, in commit order on the branch:

```
c8ff445  feat(home): add Park Your Money rail (v1.0, already on stage)
7bde7d1  docs(claude): add ASCII-diagram rule
47c5d52  feat(home): flip FEATURES.STABLECOIN on for preview verif
07a8d8a  feat(home): click-modal + USDG swap (v1.1 entry point)
717d6ee  fix(stablecard): swap Δ glyph for Up/Down SVG icons
423944a  fix(stablecard): issuer subtitle + correct swap pairs
```

### v1.1 changes

**1. Cards are clickable** → opens new `StableTokenModal`.

```
Tap a card  ▼

┌─ StableTokenModal (live variant) ──┐
│ ◯ USDC                       ✕     │
│   USD Coin                         │
│   Issued by Circle ↗               │
│                                    │
│ $1.0001              [On peg]      │
│ ▲ 0.01% from peg                   │
│                                    │
│ ─── Stats ─────────────────────    │
│ Liquidity         $42.1M           │
│ Volume 24h        $185M            │
│ Market Cap        $32.8B           │
│ Circulating       32.8B USDC       │
│                                    │
│ ─── Trust ─────────────────────    │
│ Mint Authority    ✓ Disabled       │
│ Freeze Authority  ✗ Active         │
│ Jupiter Verified  ✓ Yes            │
│ (Standard: Token-2022 if applies)  │
│                                    │
│ Mint  EPjFWdd…Dt1v   [Copy]        │
│                                    │
│ [ Swap USDC → USDC on Jupiter ↗ ]  │
└────────────────────────────────────┘
```

For PUSD (pending) the modal shows the brand pitch instead of stats.

**2. Mint roster: USDe REMOVED, USDG ADDED**

```
v1.0 list                    v1.1 list
─────────                    ─────────
PUSD   pending               PUSD   pending
USDC   live                  USDC   live
USDT   live                  USDT   live
PYUSD  live                  PYUSD  live
USDS   live (unverified)     USDS   live (unverified)
USDe   live (REMOVED)        USDG   live (Paxos / GDN)
```

USDG mint: `2u1tszSeqZ3qBWF3uNGPFc8TzMk2tdiwknnRMWGWjGWH`

**3. Up / Down SVG icons** replaced the `Δ` Greek letter on price-deviation
rows. Direction from peg: `priceUsd >= 1` → `/app/Up.svg`, else
`/app/Down.svg`. (NOT supply trend — see roadmap γ-3 for that.)

**4. Issuer subtitle on cards (β)** — card subtitle is now the issuer's
short name, not the token's official product name. Modal still shows
the official name + the `Issued by …` link.

```
Card subtitle today (v1.0):       After v1.1:
USDC  / USD Coin                  USDC  / Circle
USDT  / Tether USD                USDT  / Tether
PYUSD / PayPal USD                PYUSD / PayPal
USDS  / Sky USDS                  USDS  / Sky
USDG  / Global Dollar             USDG  / Paxos
PUSD  / Palm USD                  PUSD  / Palm USD (unchanged)
```

**5. Swap CTA fix** — the v1.1 modal had the wrong destinations. Corrected:

```
USDC card  →  SELL USDC  →  BUY SOL    ← USDC special-case
USDT card  →  SELL USDC  →  BUY USDT
PYUSD      →  SELL USDC  →  BUY PYUSD
USDS       →  SELL USDC  →  BUY USDS
USDG       →  SELL USDC  →  BUY USDG
PUSD       →  pending tile, no swap
```

**v1.1 file map:**

| Path | Change |
|---|---|
| `src/lib/home/stablecoins.ts` | USDe → USDG · added `issuerKey` field · added `marketCapUsd`, `circulatingSupply`, `mintAuthorityDisabled`, `freezeAuthorityDisabled`, `tokenProgram`, `jupiterVerified` to `StableLiveData` · added `TOKEN_2022_PROGRAM_ID` |
| `src/lib/home/stablecoinIssuers.ts` | NEW. Per-issuer brand metadata (name, shortName, url, pitch). |
| `src/app/api/stablecoins/route.ts` | Returns the new fields (mcap, supply, audit, prog, verified). |
| `src/components/home/StableCard.tsx` | `onClick` prop + keyboard a11y · subtitle = issuer.shortName · Up/Down SVG icons. |
| `src/components/home/StableTokenModal.tsx` | NEW. Live + pending variants, copy mint, Jupiter swap CTA. |
| `src/components/home/ParkYourMoneyRail.tsx` | `selectedMint` state · modal mount. |

---

## Open user feedback — pending verification

The user (you) asked for these on the v1.1 preview:

```
[x]  Up/Down SVG instead of Δ glyph              → 717d6ee
[x]  Issuer subtitle on cards (β)                → 423944a
[x]  Swap CTAs corrected                         → 423944a

[ ]  29-case visual checklist on PR #39 preview  ← needs YOU
[ ]  Verify USDG renders with real data          ← needs YOU
[ ]  Verify USDS renders (unverified mint)       ← needs YOU
[ ]  Click "Swap USDC → SOL" on USDC modal,
     confirm jup.ag opens with USDC sell + SOL
     buy                                         ← needs YOU
```

Full 29-case checklist lives in PR #39's body. Walk it on the preview URL,
mark ✓/✗, and either click Merge or tell Claude what failed.

---

## Locked decisions (do NOT relitigate)

```
✅  6-mint curated allowlist                     (v1.0 PR #38)
✅  Peg health + liquidity + volume in cards     (v1.0)
✅  Yield as future v1.2 follow-up               (v1.0)
✅  PUSD pending-listing tile, no fake numbers   (v1.0)
✅  "Park Your Money" rail at TOP of home        (v1.0)
✅  Feature flag pattern: hardcoded constants    (v1.0)
✅  STABLECOIN flag: ON for stage AND prod next  (v1.0)
✅  ASCII diagrams in all change-explanations    (v1.0 CLAUDE.md)
✅  Click-through opens StableTokenModal         (v1.1)
✅  No supply-trend arrow yet                    (v1.1, deferred to v1.2)
✅  USDe → USDG                                  (v1.1)
✅  Card subtitle = issuer shortName (β)         (v1.1)
✅  Swap CTA destinations: USDC→SOL, else→token  (v1.1)
✅  Brand images for PUSD + USDT — DEFERRED      (will queue separately)
```

---

## Roadmap — what's next (v1.2 and beyond)

```
v1.2 candidate scope (rough — confirm with user)
────────────────────────────────────────────────
[ ]  Brand images for PUSD + USDT
     User provided share.google links (sandbox-
     unreachable). Path: user attaches images
     in chat → Claude saves to /public/app/
     then references them on the StableCard
     pending tile + token icon override.

[ ]  ▲▼ supply-trend arrow on the card (γ-3)
     Currently NO arrow because we lack supply-
     history. Two options when picking this up:
       γ-2  Probe Birdeye token_overview for a
            supply24h field. Cheap if it exists,
            useless if it doesn't. ~1h.
       γ-3  Build supply snapshot infra:
            • Supabase table `stablecoin_supply`
              (mint, supply, snapshot_at)
            • Vercel cron at /api/cron/supply
              (15 min interval)
            • 24h delta query against table
            ~3-4 hours of work for an arrow.
     Recommend γ-2 first; fall back to γ-3.

[ ]  Internal /swap page
     Replaces the jup.ag deep-link CTA with an
     in-app swap surface using Jupiter Ultra.
     PUSD_INTEGRATION.md §6 has the full spec
     ported from a sister project. Big ship —
     own PR, multi-step.

[ ]  Set up Vitest
     Repo has zero automated tests. Every PR
     so far has used a manual test plan
     (CLAUDE.md merge policy required this
     compromise). Adding Vitest unlocks proper
     coverage for /api/stablecoins, peg-bucket
     logic, and modal rendering.

[ ]  PUSD live-data flip
     Once Jupiter `/search?query=CZzgUBvxa…HF3s`
     returns metadata + at least one pool, set
     pendingListing: false in stablecoins.ts.
     The same StableCard + StableTokenModal
     light up with live data — one-line change.

[ ]  api.palmusd.com/v1/circulation badge
     Show circulating supply on the PUSD pending
     tile / modal. Sandbox couldn't resolve the
     host but Vercel runtime can. Server-proxy
     it via /api/palmusd/circulation, cache it,
     surface "Circulation: X PUSD" in the modal.

[ ]  Depeg alerts
     Push-notification or email when a curated
     stablecoin crosses the "Depegged" bucket
     (>200 bps from $1 sustained N hours).
     Needs auth, push infra, alert preference UX.
     Big ship — separate roadmap entirely.

[ ]  Auto-discovery
     Heuristic-driven addition of new
     stablecoins (price ≈ $1, MCAP > X, low
     volatility) instead of hardcoded list.
     Risky for false positives. Park for now.
```

---

## How to pick up locally (desktop)

```bash
git fetch origin
git checkout claude/implement-stablecoin-wqe1f
git pull origin claude/implement-stablecoin-wqe1f
npm install                 # if you haven't already
npm run dev                 # localhost:3000
```

Agentation is already wired in `src/app/layout.tsx` gated by
`NODE_ENV === "development"`, so it lights up automatically on `npm run dev`.
For visual feedback on the deployed Vercel preview specifically (not local),
read [CLAUDE.md](../CLAUDE.md) §Production hygiene — gate change requires
careful handling.

```bash
npx tsc --noEmit            # typecheck (was clean at last push)
npm run lint                # has ~37 pre-existing problems (29 errors)
                            # — none introduced by the stablecoin work
                            # — Next 15 doesn't run lint at build time
```

---

## How to pick up in a fresh Claude session

1. Read [CLAUDE.md](../CLAUDE.md) — repo-wide rules.
2. Read **this file** (`stablecoin-rail-handoff.md`) end-to-end.
3. Read [PUSD_INTEGRATION.md](../PUSD_INTEGRATION.md) if working on the PUSD
   live-data flip or the swap surface.
4. Check PR #39 status via GitHub MCP — is it merged?
   - If **yes** → roadmap items are fair game. Pick one and propose a plan
     per CLAUDE.md "Stop, propose, suggest".
   - If **no** → the user is mid-review. Ask them what they need; don't
     start new work.
5. Always confirm environment (local desktop vs cloud/mobile) per
   CLAUDE.md "Session start protocol" before non-trivial work.

---

## Open questions waiting on user

```
1.  Swap CTA destination for v1.2 — keep
    jup.ag deep-link, or build internal /swap?
    Tradeoff: scope. Internal swap = ~1 week
    work; deep-link is shipping today.

2.  Brand images for PUSD and USDT — when
    user has time on desktop, attach the
    images. Then we replace the CSS-drawn
    fallback circle with the actual brand
    asset.

3.  Vitest setup — tests-first, or keep
    riding manual test plans for now?
    Recommend tests-first before any more
    rail features so coverage doesn't grow
    without validation.
```

---

*Maintained alongside the feature. Update on every session close.*
