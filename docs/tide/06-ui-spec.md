# 06 · UI spec — layout, tokens, component anatomy, states

Companion to the HTML mocks in `public/Prototypes/tide/` (view on any
Vercel preview at `/Prototypes/tide/`). The mocks are the look; this doc
is the measurements. Values reference DESIGN.md tokens only — anything
new here (identity hues, motion primitives) is a proposed DESIGN.md
amendment, finalized in phase 0.

## App frame

```
┌──────────── 100dvh ──────────┐
│ header (48px, sticky,        │
│  surface-page/90 + blur)     │
├──────────────────────────────┤
│ scroll region                │
│  max-w 430px, mx-auto,       │
│  px-16px, pb-96px            │
│  (desktop: same column on    │
│   surface-dim gutters)       │
├──────────────────────────────┤
│ bottom bar (64px + safe-area,│
│  surface-page/85 + blur,     │
│  border-t outline-variant)   │
└──────────────────────────────┘
```

- Bottom bar items: 4 targets, each ≥ 44×44px hit area (polish-skill
  40×40 minimum exceeded). Active: `text-fg` + 3px brand underline dot;
  inactive: `text-fg-subtle`. Label 10px, icon 22px.
- Safe areas: `env(safe-area-inset-bottom)` padding on the bar;
  `viewport-fit=cover`.
- Radius family per DESIGN.md: cards 8px, buttons/pills/inputs 2px
  (`rounded-sm`), sheets 12px top corners, avatars 9999px.
- Elevation = surface ladder + DESIGN.md shadows; borders are
  `outline-variant` hairlines. Never both a heavy border and a shadow.

## Type usage per surface

| Surface | Font / class | Size |
|---|---|---|
| Screen titles ("Markets") | Geist Mono 700 | 24px |
| Card body text (takes, notes, comments) | IBM Plex Sans 400 | 14px / 1.5 |
| Handles (`@mira`) | IBM Plex Mono 500 | 13px |
| Prices, %, counts | Geist Pixel Square (`.data-md/.data-sm`) | 14 / 12px |
| Section labels | IBM Plex Sans 600 UPPERCASE, tracking 0.1em, `text-fg-subtle` | 11px |
| Timestamps, meta | IBM Plex Sans 400, `text-fg-subtle` | 11px |

Handles are mono deliberately — identity reads as *terminal-native*,
tying the social layer to the market DNA.

## Identity hues (proposed values — phase 0 verifies contrast)

Assigned `hash(wallet) % 8`; consumed only by Avatar, handle accents,
presence. Never for data.

| Token | Value | Note |
|---|---|---|
| `--id-tide` | `#5ad8c4` | reserved for the signed-in user |
| `--id-coral` | `#e8927c` | |
| `--id-sand` | `#d9b380` | |
| `--id-lilac` | `#b39fd8` | |
| `--id-sky` | `#7fb3d9` | |
| `--id-moss` | `#93b98a` | |
| `--id-rose` | `#cf8ca3` | |
| `--id-slate` | `#93a1b8` | |

Avatar fill: `radial-gradient(120% 120% at 30% 20%, <hue>, <hue-40%-darker>)`,
glyph = first letter of handle in `#07080a` (≥ 4.5:1 on every hue —
verified in phase 0), IBM Plex Mono 600.

## Component anatomy

### PostCard (feed unit)

```
┌ surface-container, r-8,      ┐
│ p-16, border outline-variant │
│ ◐28 @handle ·hue  kind  time │ ← 28px avatar,
│                               │   11px meta row
│ body text 14/1.5 (take/note) │
│ ┌ TokenChip ───────────────┐ │ ← only if tagged
│ │ ○20 JUP $0.8123 ▲+4.2%   │ │   surface, r-4,
│ └──────────────────────────┘ │   p-6×10
│ ♥12  🔥8  💬3           ⋯   │ ← ReactionBar 32px
└──────────────────────────────┘   row, gap-16
```

- Press: `scale(0.98)` 150ms (card-level, per polish skill).
- Kind tag: 9px uppercase badge (`watched` mint-tinted / `take` plain /
  `milestone` info-tinted) — DESIGN.md badge spec.
- Milestone variant: no author row; leading ▲/▼ glyph in buy/sell color,
  body is system copy, `border-l-2` in the same color.

### ReactionBar

- Each reaction: pill hit-area 32×44px, emoji 15px + count `.data-sm`.
- Own-reaction state: count in `text-brand`, pill `bg-brand/10`.
- Tap: spring-pop `1 → 1.3 → 1` ~250ms + count tick. `+` opens the
  6-emoji picker (♥ 🔥 👀 🧠 😅 📈) as a 44px-tall popover.

### SocialProofChip

`◔ 41 watching` — 12px, `text-fg-muted`, dotted-ring glyph in brand at
60% opacity. Never bolder than the price it sits near. On cards it
truncates to `◔ 41`.

### FollowButton

| State | Style |
|---|---|
| Follow | `bg-brand text-on-brand`, sm button (h-28, px-12, r-2) |
| Following | `bg-transparent border-outline text-fg-muted` |
| Pending (optimistic) | target state immediately; rollback on fail |

Morph fill→outline 200ms; label crossfades. Unfollow needs no confirm.

### AvatarGroup

Overlap −8px, max 3 + `+N` disc (`surface-bright`, `.data-sm`).
Order: followed-by-you first — recognition beats recency.

### Comment thread (bottom sheet)

- Sheet: 85dvh, `surface` bg, top radius 12, grab-handle 32×4
  `outline`; drag-down dismisses.
- Comment row: avatar 28 + handle + time / body 14px / row of
  react-♥ + reply. Replies indent 36px, single level, `border-l`
  `outline-variant`.
- Input pinned bottom: 44px min, `surface-container` r-2, send button
  brand-filled disc 36px. Counter appears at ≤ 40 remaining.

### LaneToggle (Following / Everyone)

Segmented control per DESIGN.md pill spec: h-36, r-2 segments; active
`bg-brand text-on-brand` + mint glow shadow; inactive `text-fg-muted`.
Underline-free — fill is the state.

### Onboarding sheet (identity gate)

- Steps stack vertically in one sheet; completed steps collapse to a
  checked row (`✓ wallet connected · 7xKt…9fQ2`).
- Handle input: `@` prefix baked into the field, IBM Plex Mono,
  availability inline right (`✓` buy-color / `taken` sell-color 11px).
- Avatar preview updates live as the handle changes (glyph = initial).
- CTA full-width `lg` brand button: "Join the tide".

## Screen specs (deltas from mocks)

### Feed
Cards stack gap-12; composer FAB 48px brand disc, bottom-right, 16px
above the bar, hides on scroll-down / returns on scroll-up. New-items
pill: centered under header, `surface-bright` r-full, "· new tides ·".

### Markets
Rail = section label + horizontal scroll of 148×172px cards (snap-x,
gap-8, peek 24px of next card). Card: icon 36, symbol 13px mono, price
`.data-md`, 24h ▲/▼ signed + colored, `◔ N` chip bottom-left. "Yours"
rail first when member has watches; stablecoin rail keeps peg-status
dot semantics (buy=on-peg, warning=drift ≥ 25bps, sell=broken < 0.98).

### Token detail
Header: back 44px, icon 28 + symbol, price `.data-lg` live-ticks
(no animation on tick — terminal calm), 24h signed `.data-sm`.
Social strip: h-auto p-12 `surface-container` r-8 — row 1: proof chip +
Watch button; row 2: AvatarGroup + "watched by @mira +38" 12px; row 3:
`💬 12 comments ▸` full-width tap row. Sections below unchanged from
engine contract (13 sections, own skeletons).

### Profile
Header: avatar 64, display name 20px Geist Mono, handle mono 13
hue-accented, bio 14, counts row `.data-sm` (tappable → follower list
sheet). Tabs: Watching / Takes (LaneToggle component reused). Watching
tab = 2-col grid of mini token cards with the *watcher's note* as
caption when present.

### `/design` gallery
Sidebar-less single column: sticky section nav pills under header
(Foundations · Components · Patterns · Motion). Each specimen: rendered
component on `surface` panel + token annotations 11px mono
(`bg-surface-container · text-fg-muted · r-8`) + variant switcher
pills. Motion specimens replay on tap.

## Motion tokens (proposed amendment)

| Token | Value | Used by |
|---|---|---|
| `--motion-fast` | 150ms ease-out | hover, press, fades (existing) |
| `--motion-settle` | 200ms cubic-bezier(.2,.8,.2,1) | follow morph, toggles |
| `--motion-spring` | 250ms cubic-bezier(.34,1.56,.64,1) | reaction pop, watch draw-in |
| `--motion-enter` | 300ms ease-out, 40ms stagger | feed card entrance |

`prefers-reduced-motion`: spring/enter collapse to 150ms opacity fades.
No `transition-all` anywhere (polish guard).

## Accessibility gates (every phase-0/1 PR)

- All interactive targets ≥ 44×44px effective.
- New tokens AA-verified (documented ratios in the amendment PR).
- Reaction/watch states never color-only: count weight + fill change
  accompany hue.
- Sheets: focus-trapped, `aria-modal`, ESC/drag dismiss parity.
- Live prices `aria-live="off"` (ticks would spam screen readers);
  explicit refresh announcements instead.
