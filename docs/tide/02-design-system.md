# 02 · Design system — evolving the terminal for social

**Position:** evolve, don't replace. The near-black "Fey Dark Wealth"
system in [DESIGN.md](../../DESIGN.md) stays the base; this doc specifies
the *social extension layer* on top. DESIGN.md remains the source of
truth and is amended (not rewritten) when phase 0 is approved.

```
┌ SOCIAL LAYER (new) ──────────┐
│ identity/avatars · post cards│
│ reaction motion · threads    │
│ social-proof chips           │
├ POLISH LAYER (installed) ────┤
│ make-interfaces-feel-better  │
├ BASE SYSTEM (DESIGN.md) ─────┤
│ surfaces · type · spacing ·  │
│ semantic color · dark-only   │
└──────────────────────────────┘
```

## What does NOT change

- Dark-only, near-black surface ladder, semantic tokens via
  `globals.css` — `check:theme` guard stays.
- Mint-teal `--brand` as the single identity accent; `text-on-brand`
  on fills.
- Financial numbers in Geist Pixel Square / IBM Plex Mono.
- 8px spacing base, 2px radius family, 150ms transition base.
- WCAG AA on every fg/surface pair — new tokens must be verified,
  not eyeballed.

## Tone shift — amendment to "Identity"

Current anti-mood words include *Playful*. Amended position:

> **Calm base, playful moments.** The canvas, typography, and data
> surfaces keep calm authority. Playfulness is budgeted exclusively to
> *feedback on human actions* — reacting, following, watching,
> celebrating. If a static screen looks playful, we overspent.

Anti-mood words that survive unchanged: Flashy · Neon · Cluttered ·
Bright. *Gamified* is refined to: no mechanics (points/streaks/ranks) —
celebratory *feedback* is allowed.

## New foundation: identity hues

Social UIs need per-person color. One accent (`--brand`) can't carry N
people, and free hex would break the token system. Proposal: a fixed
**8-hue identity palette**, muted to sit on near-black, each with an
AA-verified `on-` pair. Deterministically assigned from the wallet
address (`hash(wallet) % 8`) — stable, no user picker in v1.

| Token | Hue direction |
|---|---|
| `--id-tide` | mint (brand-adjacent, reserved for "you") |
| `--id-coral` | soft coral |
| `--id-sand` | warm sand |
| `--id-lilac` | muted lilac |
| `--id-sky` | desaturated sky |
| `--id-moss` | moss green |
| `--id-rose` | dusty rose |
| `--id-slate` | cool slate |

Exact values are a phase-0 deliverable (picked + contrast-verified in
`globals.css`, consumed as `bg-id-*`/`text-on-id-*`). Identity hues are
for **avatars, handle accents, and presence** only — never for data
(buy/sell/warning stay untouchable).

## New components (the social kit)

| Component | Notes |
|---|---|
| `Avatar` | Generated, not uploaded (v1): identity-hue gradient disc + initial/glyph. Sizes 20/28/40. Stacked variant (`AvatarGroup`) with −8px overlap, max 3 + count. |
| `HandleChip` | `◐ @mira` — avatar + handle, tappable → profile. |
| `PostCard` | Feed unit. `surface-container`, existing card radius/press (`scale 0.98`). Variants: watch / take / milestone. |
| `TokenChip` | Inline live token: icon + symbol + price + 24h. Reuses `TokenIcon`, Pixel-Square numerals. |
| `ReactionBar` | Fixed emoji set + counts. The playful budget lives here (see motion). |
| `CommentThread` | Bottom-sheet; flat with single-level replies in v1. |
| `SocialProofChip` | `◔ 41 watching` — subtle, `fg-muted`, never louder than the price. |
| `FollowButton` | Brand-filled → outline "Following". Optimistic. |
| `LaneToggle` | Following/Everyone segmented control (reusable for profile tabs). |
| `EmptyState` | Designed empties for feed/profile/comments — cold-start is a first-class state. |

All new components: built from existing tokens, pass `check:polish`,
live-rendered in `/design`.

## Motion spec (the playful budget)

Base stays 150ms ease-out for hover/press/fade. New, used *only* for
human-action feedback:

| Moment | Motion |
|---|---|
| Reaction tap | Emoji spring-pop (~1.0→1.3→1.0, ~250ms spring), count ticks up; a one-shot 2–3-particle burst at most. |
| Follow | Button morphs fill→outline with a ~200ms settle. |
| Watch added | Star/wave icon draws in (~300ms); token card gets a one-time mint shimmer. |
| Milestone (watched token runs) | Card enters with a soft mint glow that decays ~1s. No confetti. |
| Feed refresh | New cards slide-fade in from top, 40ms stagger. |

Rules: `prefers-reduced-motion` collapses all of the above to opacity
fades; no `transition-all` (polish-skill rule); nothing loops or
auto-plays; data surfaces (charts, tickers) never bounce.

## Voice & copy

- Sentence case everywhere; verbs over nouns ("Watch", not "Add to
  watchlist").
- Warm-precise, never hype: "peg's holding" ✓ / "🚀 TO THE MOON" ✗.
- Numbers stay unrounded where the terminal DNA demands it; prose stays
  human.
- Empty states get one playful line each — that's part of the budget.

## The `/design` gallery

Goal #2 of the whole app: a **living component gallery** at `/design`.
Unlisted (no nav entry, `robots: noindex`), no auth gate.

```
┌ tide / design ───────────────┐
│ intro: 3-sentence principles │
├ Foundations ─────────────────┤
│ color (live swatches +       │
│  contrast ratios) · type ·   │
│  spacing · radius · motion   │
│  (tap-to-replay demos)       │
├ Components ──────────────────┤
│ every prod component,        │
│  rendered live, all variants │
│  & states (default/hover/    │
│  pressed/loading/empty/error)│
├ Patterns ────────────────────┤
│ post card anatomy · thread · │
│  social proof · empty states │
└──────────────────────────────┘
```

Build rules:

- **Imports production components** — never copies. If the gallery
  drifts from the app, the gallery is wrong by definition.
- Each entry: live render + variant switcher + the token names it
  consumes (e.g. `bg-surface-container` · `text-fg-muted`).
- Motion section demos replay on tap (mobile-friendly).
- Structured as data (`src/app/design/registry.ts`: name, variants,
  render fn) so adding a component to the gallery is a ~10-line entry.
- Respects the 700-LOC cap: one file per gallery section.

## DESIGN.md amendment procedure

Phase 0 opens a PR that amends DESIGN.md in place: tone paragraph,
identity-hue table, social-kit component specs, motion additions.
This plan-pack doc then becomes historical rationale; DESIGN.md stays
the single source of truth. Per CLAUDE.md, that PR needs explicit
approval — no silent edits to the system.
