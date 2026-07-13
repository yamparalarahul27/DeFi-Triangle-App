# Phase 6 handoff — patterns & templates

> Work plan for the next session(s) — written 2026-07-13 after Phase 5
> merged (PR #87). Phases 0–5 are ✅ with gates met; the system stands at
> **37 components (18 stable / 19 draft), 271 tests, axe × 4 themes in
> CI**. This doc breaks Phase 6 (cids-roadmap §5) into cloud-executable
> PRs with concrete specs. **Cloud sessions:** verify with
> `npx tsc --noEmit` + `npm run lint` + `npm test` + the 4 guards
> (all unmasked — never pipe lint through tail); review on the Vercel
> preview; CI is the referee.

---

## State you inherit

```
tokens     color·spacing·type·elevation·z·motion·radius·row-grid
           + density axis  (data-density="compact")
themes     dark · mono · light · violet  (+ Theme Studio w/ export)
atoms      Button IconButton Badge Input Dialog Menu Select Switch
           Checkbox Toast Tabs Divider EmptyState  (T1 stable)
molecules  Avatar(Group) TokenChip TokenIcon ReactionBar FollowButton
           Lane SocialProofChip PostCard Sheet CommentThread
           Onboarding Skeleton Tooltip
data       DataTable RollingNumber PriceChange StatCell Sparkline
crypto     AddressChip PegBadge NetworkBadge TxStatus AmountInput
surfaces   / · /design (gallery) · /design/canvas (zones: Foundations,
           Components, Screens, Prototypes, Primitives, Data, Crypto)
           · /design/feed (demo screen)
```

Conventions: `src/design-system/CONVENTIONS.md` (doc shape + API
contract + promotion criteria). Every component PR ships tsx + doc +
tests + canvas demo. Sign discipline is guard-pinned (`check:polish`).

## PR 6a — patterns docs + states catalog

**Goal:** the layer above components — recipes that teach composition
(Carbon Patterns / HIG Patterns / shadcn Blocks are the references).

1. `src/design-system/PATTERNS.md` — the patterns contract (mirrors
   CONVENTIONS.md): each pattern = Problem · Composition (which
   components) · States · Do/Don't · Code.
2. Four patterns, each a section in PATTERNS.md **plus a live canvas
   frame** in a new "Patterns" zone:
   - **States catalog** — loading/empty/error/offline for a data
     surface, composed from SectionSkeleton + EmptyState + Badge +
     Button retry. (The tide `states.html` mock is the visual
     reference — it's framed on the canvas already.)
   - **Tx flow** — review → sign → pending → result, composed from
     Dialog + AmountInput + TxStatus + Toast. Encodes ethereum.org
     heuristics #1/#2 (status always visible; design the wallet seam).
   - **Form row** — label + Input/Select/AmountInput + inline error
     (`aria-describedby`), the "errors next to the action" rule.
   - **Market list** — DataTable + TokenChip + PriceChange + Sparkline
     + AddressChip; density-ready.
3. **Do/Don't pairs**: 1–2 per pattern, rendered side-by-side in the
   canvas frames (✓ mint check / ✗ sell cross captions). Highest-value
   don'ts: green loss (sign), color-only state, hover-only tooltip
   content, unlabeled icon button.
4. Content-guidelines subsection (Polaris-style): the action-verb
   table — "Sign" vs "Approve" vs "Confirm" is a security surface;
   sentence case; verbs over nouns.

**Gate 6a:** every pattern renders live on the canvas from production
components only (guards pass on the pattern code); PATTERNS.md exists
with all four entries.

## PR 6b — the two starter templates

**Goal:** whole screens as proof the system composes (R4) — built
ONLY from the DS.

1. `/design/templates/simple-dapp` — wallet connect header
   (Button + NetworkBadge + AddressChip), balance StatCells, a send
   card (AmountInput + Button + TxStatus + Toast), one EmptyState.
   Mobile-first, mock data, ToastProvider at the root.
2. `/design/templates/exchange` — the terminal: market DataTable
   (sortable, streaming), order-book panel (lift the canvas demo into
   a composable piece), trade form (AmountInput ×2 + Select + Button),
   StatCell header strip. **Default to compact density**; must stay
   zero-layout-shift while streaming.
3. Landing page gains a "Templates" row linking both; canvas Screens
   zone frames them via iframes next to the mocks.

**Gate 6b (closes Phase 6):** both templates build from documented
components with zero one-off styles (`check:theme`/`check:polish`
pass on template code); exchange template streams at compact with no
layout shift.

## Parked items (pick up any time)

- **`next@16.2.4` upgrade PR** — the one remaining high advisory
  (accepted in CLAUDE.md). Dedicated PR: bump, full build + CI + manual
  canvas/gallery pass on preview.
- **`src/components/agent-elements/` deletion** — unused since the
  pivot (duplicate `cn`, spiral-loader). Proposed three times;
  one-line PR when approved.
- **Tier-2 + data/crypto promotions** — 19 drafts promote to stable
  after baking (CONVENTIONS criteria); natural to batch with 6b once
  the templates exercise them.
- **Phase 7 after this**: registry + CLI distribution, lifecycle
  ladder, per-component versioning (roadmap §5).

<sub>Working agreements: per-phase branches `feat/phase-6a-…`; commit
messages explain the why; PR bodies carry the gate table; roadmap
checkboxes tick in the same PR that ships the work.</sub>
