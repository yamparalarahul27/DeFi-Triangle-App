# 04 · Roadmap — phases, flags, verification

Agreed order: **plan → design system → real coding.** Each phase is one
or a few small PRs to `main`, each tested on its Vercel preview before
merge (cloud/mobile workflow), each gated by the CLAUDE.md testing &
merge policy (test cases proposed + approved per PR).

```
0 ── design system ── tokens, kit,
│                     /design gallery
1 ── shell + markets ─ nav, S2, S4
│                      skin, system pgs
2 ── identity ──────── S7, S5/S6,
│                      follows
3 ── social ────────── S1 feed, comments,
│                      reactions, seeds
4 ── chat + beyond ─── rooms, DMs,
                       notifications
```

## Phase 0 — design system (no product screens)

The foundation phase the whole plan hinges on.

| Deliverable | Verify |
|---|---|
| Identity-hue tokens in `globals.css` (8 hues + `on-` pairs, contrast-verified) | `check:theme` + documented ratios |
| Social kit components (Avatar, HandleChip, PostCard, TokenChip, ReactionBar, SocialProofChip, FollowButton, LaneToggle, EmptyState) built against **fixture data** | `check:polish`, `tsc`, lint |
| Motion spec implemented as reusable primitives (spring pop, shimmer, stagger) with `prefers-reduced-motion` fallbacks | gallery motion demos |
| `/design` gallery rendering foundations + the kit live | Vercel preview on phone |
| DESIGN.md amendment PR (tone, hues, kit, motion) | explicit user approval |

Exit: every kit component visible and correct in `/design` on a phone.
The gallery ships **first** — it becomes the review tool for everything
after.

## Phase 1 — shell + markets (engine-ready surfaces)

| Deliverable | Notes |
|---|---|
| App shell: bottom bar, tab state, pushed-route pattern | Feed tab shows a designed "coming soon" empty state |
| S2 Markets: rails re-skinned on `useHomeJupiterPairs` + `useStablecoins` | honors `STABLECOIN` flag |
| S3 Search overlay re-skinned | existing three search hooks |
| S4 Token detail re-skin (13 sections, no social strip yet) | ⚠ move `OnChainData`/`HolderRow` types to `src/lib/token/` first; delete dormant tabs + `useTabPairs` in the same pass |
| 404 / error / global-error designed | fresh (not in prototype) |
| Decision: Jupiter-v2 API consolidation before or after | contract §6 recommends **before** — decide at phase-1 kickoff |

Exit: a logged-out visitor has a complete, polished market-browsing app.

## Phase 2 — identity

| Deliverable | Notes |
|---|---|
| `profiles` + `follows` tables, `/api/profile`, `/api/follows` | migrations + RLS |
| S7 onboarding: connect → claim @handle + avatar | reuses auth flow untouched |
| S5/S6 profiles with public watchlist | `is_public`/`note` columns land here |
| Follow/unfollow end-to-end | optimistic UI |
| Flag: `NEXT_PUBLIC_FF_SOCIAL` | preview=1, prod=0 until phase 3 completes |

Exit: on preview — connect, claim a handle, follow a seeded profile.

## Phase 3 — social (Tide becomes Tide)

| Deliverable | Notes |
|---|---|
| `posts`/`comments`/`reactions` tables + routes + `/api/feed` | |
| S1 Feed (both lanes) | milestone cards derived read-time |
| Comments bottom-sheet + reactions everywhere | the motion budget goes live |
| Token-detail social strip + Markets watch-counts | `/api/social/token/[mint]` |
| Seed personas + content | day-one liveliness |
| Flip `FF_SOCIAL` on prod after preview bake | flag deleted a few days later per CLAUDE.md |

Exit: the core loop (discover → watch → follow → feed → react) works
with real persistence on prod.

## Phase 4 — chat + beyond (vision, deliberately unbuilt)

Token rooms on Supabase Realtime → DMs → notifications → people search →
reporting/moderation tooling → possible NFT Edge return. Each gets its
own plan doc when its turn comes; nothing in phases 0–3 may take a
dependency on phase-4 shapes.

## Standing rules (every phase)

- In-sandbox verify: `npx tsc --noEmit` · `npm run lint` ·
  `npm run check:theme` · `npm run check:polish`.
- Every PR reviewed on its **Vercel preview on a phone** before merge —
  never merge-to-test.
- Test cases proposed and user-approved before merge per CLAUDE.md.
- 700-LOC cap; new hooks documented in engine-contract.md in the same
  PR; no new high/critical `npm audit` findings beyond the accepted
  list.
- Scope creep → this pack's backlog, not the open PR.
