# Design System — DeFi Triangle / Y-Vault

> Single source of truth for the DeFi Triangle product design language.
> Authored to the [Stitch Design.md specification](https://stitch.withgoogle.com/docs/design-md/specification).
> All AI agents, Stitch prompts, and code generation must follow these specifications.
> Last audited against: `globals.css`, `Button.tsx`, `Card.tsx`, `Pill.tsx`, `Navbar.tsx`, `BottomBar.tsx`, `StatusDot.tsx`, `TokenIcon.tsx`

---

## Identity

**Product name:** TBD (Y-Vault)
**Visual theme:** Near-Black Financial Terminal — "Fey Dark Wealth" / market-dark
**Aesthetic:** A premium, data-dense trading interface that communicates competence and authority. A cinematic near-black canvas with soft charcoal elevation; mint-teal is the single identity accent. Numbers are the hero, decoration is the enemy — depth comes from tonal layering and soft shadows, not borders.

**Mood words:** Precise · Premium · Spacious · Trustworthy · Calm authority · Cinematic
**Anti-mood words:** Flashy · Neon · Cluttered · Bright

> **Amendment — tide social layer (calm base, playful moments).** The
> canvas, typography, and data surfaces keep calm authority. Playfulness
> is budgeted *exclusively* to feedback on human actions — reacting,
> following, watching, celebrating. If a static screen looks playful, we
> overspent. *Playful* is therefore removed from the anti-mood list as an
> absolute; *Gamified* is refined to **no mechanics** (points / streaks /
> ranks) — celebratory feedback is allowed, game loops are not. Rationale
> and scope: [docs/tide/02-design-system.md](./docs/tide/02-design-system.md).

---

## Color

> **Single source of truth: `src/app/globals.css`.** Every colour is a CSS variable
> exposed as a semantic Tailwind utility via `@theme inline`. **Consume tokens —
> never hardcode hex in classes.** Use `bg-surface-container`, `text-fg`,
> `text-brand`, `text-buy`, etc. The `npm run check:theme` guard fails CI if a
> `*-[#hex]` utility class reappears anywhere under `src/` (evilcharts exempt).
> The whole app is dark; there is no light mode.

> **Amendment — themes (CIDS pivot).** The system now supports multiple
> **dark themes** as swappable token sets: `:root` is the default
> (`market-dark`), and each `[data-theme="x"]` block in `globals.css`
> overrides the same token names (activated via `<html data-theme="x">`,
> switchable at runtime from `/design` and the canvas). Current themes:
> **dark** (market-dark) and **mono** (pure-neutral grayscale surfaces +
> white-ink brand; buy/sell/warning/info and identity hues deliberately
> kept — *everything is grayscale except the signal*).
> `npm run check:contrast` verifies every theme's values, with `:root`
> as fallback for tokens a theme doesn't override.

### Surfaces (near-black, layered by elevation)

| Token | Value | Utility | Role |
|---|---|---|---|
| `--surface-dim` | `#030405` | `bg-surface-dim` | Deepest frame, gutters, masked edges |
| `--surface-page` | `#090a0d` | `bg-surface-page` | Default app background (body) |
| `--surface` | `#101115` | `bg-surface` | Panel / dashboard body surface |
| `--surface-container` | `#17191e` | `bg-surface-container` | Cards, table rows, inputs |
| `--surface-container-high` | `#202228` | `bg-surface-container-high` | Hover, dropdowns, raised controls |
| `--surface-bright` | `#2a2d34` | `bg-surface-bright` | Selected rows, popovers, tooltips |

### Borders

| Token | Value | Utility | Role |
|---|---|---|---|
| `--outline` | `#383b43` | `border-outline` | Visible card / control separator |
| `--outline-variant` | `#23262d` | `border-outline-variant` | Hairline dividers, table rules |

### Foreground / Text

| Token | Value | Utility | Role |
|---|---|---|---|
| `--fg` | `#f4f4f5` | `text-fg` | Primary text, headline figures, active tabs |
| `--fg-muted` | `#a7abb3` | `text-fg-muted` | Secondary text, supporting labels |
| `--fg-subtle` | `#868b95` | `text-fg-subtle` | Tertiary metadata, placeholders, faint hints |
| `--fg-inverse` | `#07080a` | `text-fg-inverse` | Text on light pills (e.g. white CTA) |
| `--on-brand` | `#04110f` | `text-on-brand` | Text/icon on mint brand fills |

<sub>All fg-on-surface pairs clear WCAG AA (4.5:1) on every surface; `fg-subtle` is AA on page/container and AA-large on the rare `surface-bright`. Verified, not eyeballed.</sub>

### Identity hues (tide social layer)

> **Amendment — new foundation.** Social UIs need per-person color; one
> accent (`--brand`) can't carry N people, and free hex would break the
> token system. This adds a fixed **8-hue identity palette**, muted to sit
> on near-black. Assigned deterministically from the wallet address
> (`hash(wallet) % 8`) — stable, no user picker in v1. Consumed **only** by
> avatars, handle accents, and presence indicators — **never for data or
> state** (buy / sell / warning keep their semantic hues).

| Token | Value | Utility | Note |
|---|---|---|---|
| `--id-tide` | `#5ad8c4` | `text-id-tide` / `bg-id-tide` | reserved for the signed-in user (matches `--brand`; kept a separate token so it can diverge) |
| `--id-coral` | `#e8927c` | `*-id-coral` | |
| `--id-sand` | `#d9b380` | `*-id-sand` | |
| `--id-lilac` | `#b39fd8` | `*-id-lilac` | |
| `--id-sky` | `#7fb3d9` | `*-id-sky` | |
| `--id-moss` | `#93b98a` | `*-id-moss` | |
| `--id-rose` | `#cf8ca3` | `*-id-rose` | |
| `--id-slate` | `#93a1b8` | `*-id-slate` | |

**Verification (not eyeballed).** `npm run check:contrast` asserts WCAG AA
(4.5:1) for both consumption paths and fails CI otherwise:

- **Avatar glyph** — dark `--fg-inverse` (`#07080a`) on the flat hue:
  **7.6–11.5:1** ✓
- **Handle / presence accent** — the hue as text on `surface-page`,
  `surface-container`, and `surface-bright`: lowest **5.2:1** ✓

**Avatar fill** is a radial gradient
`radial-gradient(120% 120% at 30% 20%, var(--id-x), color-mix(in srgb, var(--id-x) 60%, black))`
— always reference the token, never a hardcoded dark end. The gradient's
*darkest corner* measures 3.2–4.4:1 against the glyph, but the glyph is
centered (~30% down the gradient from the light origin) and never occupies
that corner, so it stays above 4.5:1 in use. The verifier reports the
corner value as an informational note.

### Brand — mint-teal identity accent

| Token | Value | Utility | Role |
|---|---|---|---|
| `--brand` | `#5ad8c4` | `text-brand` / `bg-brand` | Primary CTA, links, selected state, focus |
| `--brand-hover` | `#78e8d7` | `bg-brand-hover` | Hover on brand-filled actions |
| `--brand-bright` | `#a7fff0` | — | High-contrast glow for charts/highlights |
| `--brand-subtle` | `#c9fbf2` | — | Pale mint tint for soft brand fills |

> **Filled mint surfaces use dark text (`text-on-brand`), never `text-white`** — mint
> is a light accent; white text on it fails contrast. The guard enforces this.

### Semantic — trading + state

| Token | Value | Utility | Role |
|---|---|---|---|
| `--buy` / `--buy-strong` | `#34d399` / `#10b981` | `text-buy` | Positive PnL, success, live, on-peg |
| `--sell` / `--sell-strong` | `#f87171` / `#ef4444` | `text-sell` | Negative PnL, errors, short |
| `--warning` / `--warning-strong` | `#f4d35e` / `#f59e0b` | `text-warning` | Warnings, pending, cautionary |
| `--info` / `--info-strong` | `#75a7ff` / `#3b82f6` | `text-info` | Informational accent (secondary to brand) |
| `--error` / `--error-strong` | `#fb7185` / `#f43f5e` | `text-error` | Destructive feedback (rose) |

### Tinted state surfaces (dark)

| Token | Value | Utility | Role |
|---|---|---|---|
| `--buy-surface` | `#0f1f1a` | `bg-buy-surface` | Subtle positive/success background |
| `--sell-surface` | `#211214` | `bg-sell-surface` | Subtle error background |
| `--warning-surface` | `#211d10` | `bg-warning-surface` | Subtle warning background |
| `--info-surface` | `#111827` | `bg-info-surface` | Subtle info background |

<sub>Sign vs. magnitude (guideline #5): magnitude drives tone via `Math.abs()`, direction drives the signed `+`/`−` and ▲/▼. Two concerns, two computations. Peg-health colour reflects health, not price direction.</sub>

### Hero Gradient

```css
background: linear-gradient(
  #000003,
  #000036 37.9%,
  #143f79 81.7%,
  #496d93 110%,
  #8cacc6 152.7%,
  #b6d0dc 196.7%,
  #fcffff 285%
);
```

Used on the full-bleed landing hero section only.

---

## Typography

### Font Stack

| Family | Source | Role |
|---|---|---|
| **Geist Mono** | Google Fonts | Hero display headings |
| **Geist Pixel Square** | Self-hosted `/fonts/GeistPixel-Square.woff2` | Financial data (prices, APY, PnL) |
| **IBM Plex Mono** | Google Fonts | Fallback data font, addresses |
| **IBM Plex Sans** | Google Fonts | All UI labels, buttons, descriptions |
| **Instrument Sans** | Google Fonts | Alternative UI sans |
| **Inter** | Google Fonts | Body copy fallback |

**Font smoothing:** `antialiased` on all body text.

### CSS Utility Classes

```css
.font-satoshi        /* Geist Mono → IBM Plex Mono fallback */
.font-ibm-plex-sans  /* IBM Plex Sans → Inter fallback */
.font-instrument     /* Instrument Sans → Inter fallback */
```

### Type Scale

| Class / Level | Font | Weight | Size (mobile → desktop) | Line-height | Letter-spacing | Use |
|---|---|---|---|---|---|---|
| Hero Display | Geist Mono | 700 | 2rem → 3rem | 1.2 | −0.02em | Landing headline |
| Page Title (H1) | Geist Mono | 700 | 1.5rem → 2rem | 1.2 | −0.01em | Page headings |
| `.label-section` | IBM Plex Sans | 600 | 0.6875rem | 1 | 0.1em | Dark-bg section dividers (uppercase) |
| `.label-section-light` | IBM Plex Sans | 600 | 0.6875rem | 1 | 0.1em | Light-bg section dividers (uppercase) |
| Nav Item | IBM Plex Sans | 500 | 0.875rem | 1.35 | 0 | Navigation links |
| Body | Inter / IBM Plex Sans | 400 | 0.875rem | 1.5 | 0 | Descriptions, general UI |
| Button | IBM Plex Sans | 600 | 0.875rem | 1 | 0.01em | Button labels |
| `.data-lg` | Geist Pixel Square | 400 | 1.125rem → 1.875rem | 1.2 | 0 | Hero financial figures |
| `.data-md` | Geist Pixel Square | 400 | 0.875rem | 1.2 | 0 | Table values, prices |
| `.data-sm` | Geist Pixel Square | 400 | 0.75rem | 1.2 | 0 | Secondary data, timestamps |
| State notice text | IBM Plex Sans | 500 | 0.75rem | 1.333 | 0 | State/alert messages |
| State severity label | IBM Plex Sans | 600 | 0.625rem | 1.2 | 0.02em | Alert severity badge |

### Rules

- All financial numbers use **Geist Pixel Square** (fallback: IBM Plex Mono). Never a serif or variable-weight font.
- Section labels are always **uppercase with letter-spacing ≥ 0.08em**.
- Section labels use `text-fg-subtle` (or `rgba(255,255,255,0.4)` on glass surfaces).
- Never use serif fonts anywhere in the UI.

---

## Spacing

**Base unit:** 8px

| Step | Value | Name | Use |
|---|---|---|---|
| 1 | 4px | Micro | Icon-to-text gap, inline |
| 2 | 8px | Tight | Related elements within a group |
| 3 | 12px | Compact | Form field gaps, tight card padding |
| 4 | 16px | Standard | Component spacing, card padding |
| 5 | 24px | Comfortable | Section padding, modal padding |
| 6 | 32px | Spacious | Between major sections |
| 7 | 48px | Generous | Hero section padding, page-level |

**Border radius scale:**
- `4px` — icon boxes, segmented control segments
- `6px` — state notice, inner segments
- `8px` — cards, buttons, inputs, pills (default)
- `12px` — large modals, connect-wallet button
- `9999px` — filter pills, badges

---

## Components

### Button

> Source: `src/components/ui/Button.tsx`
> Base classes: `font-instrument font-semibold rounded-sm transition-all duration-150 inline-flex items-center justify-center gap-2`
> Disabled: `opacity-40 cursor-not-allowed`

**⚠️ Important:** Buttons use `rounded-sm` (2px radius) and `Instrument Sans` — NOT `rounded` (8px) or IBM Plex Sans.

| Variant | Background | Text | Hover |
|---|---|---|---|
| `primary` | `bg-brand` | `text-on-brand` (dark) | `bg-brand-hover` |
| `execute` | `bg-brand` | `text-on-brand` (dark) | `bg-brand-hover` |
| `secondary` | `bg-surface-container` + `border border-outline-variant` | `text-fg` | `bg-surface-container-high` |
| `ghost` | transparent or `bg-white/10` (on glass) | `text-fg` / `text-fg-muted` | `bg-surface-container` / `bg-white/20` |

| Size | Padding | Font size |
|---|---|---|
| `sm` | `6px 12px` | 12px |
| `md` | `8px 16px` | 14px |
| `lg` | `10px 20px` | 14px |

**Transition:** `all 150ms` (not 200ms)

**Connect Wallet button (navbar):**
- Uses `ghost-light` variant + explicit `border border-outline-variant bg-surface-container hover:bg-surface-container-high`
- Height: `28px` (h-7), padding: `0 12px`

---

### Pills / Filter Tabs

> Source: `src/components/ui/Pill.tsx`
> Base: `rounded-sm` (2px) — NOT fully rounded pills
> Font: IBM Plex Sans medium
> Transition: `all 150ms`

**Active:**
- Background: `bg-brand`
- Text: `text-on-brand` (dark)
- Shadow: layered mint glow → `0 1px 2px rgba(4,17,15,0.40), 0 4px 8px rgba(90,216,196,0.20), 0 12px 24px rgba(90,216,196,0.12)`

**Inactive:**
- Background: transparent (or `bg-surface-container`)
- Text: `text-fg-muted`
- Border: `border-outline-variant`
- Hover text: `text-fg`

| Size | Height | Padding | Font size |
|---|---|---|---|
| Mobile | `36px` (h-9) | `6px 16px` | 12px |
| Desktop (lg+) | `40px` (h-10) | `8px 18px` | 14px |

**Leverage / Status Badge (inline):**
- Background: `bg-surface-container` (or `bg-brand/10` tint)
- Text: `text-fg-muted` (or `text-brand` on tint), 9px, uppercase, `tracking-wider`
- Border-radius: `rounded-sm`
- Padding: `2px 6px`
- Example: "Soon" badge in navbar disabled items

---

### Cards & Containers

**Card surface:**
- Background: `bg-surface-container`
- Border: `border border-outline-variant`
- Border-radius: `8px`
- Padding: `16–24px`
- Shadow (rest): `0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)`
- Hover: lift to `bg-surface-container-high`
- Shadow (active/selected): layered mint → `0 12px 24px rgba(90,216,196,0.12)`

**Flat variant (dense panels):**
- Background: `bg-surface-container`
- Border: `border-outline-variant`
- No shadow — depth via background shift only
- Hover border: `border-outline`, `200ms ease`

**Gradient card (e.g. featured StableCard):**
```
bg-gradient-to-br from-surface-container to-surface-container-high
```

**Card footer tint:**
```css
background-color: rgba(255,255,255,0.03); /* subtle dark tint */
```

---

### Inputs & Form Controls

**Text / Search Input:**
- Background: `transparent` or `rgba(255,255,255,0.03)`
- Border: `1px solid rgba(255,255,255,0.12)`
- Border-radius: `8px`
- Padding: `10px 14px`
- Text: white, IBM Plex Sans 400, 14px
- Placeholder: `fg-subtle`
- Focus border: `rgba(255,255,255,0.25)`

**Segmented Control (e.g. Slippage):**
- Container: `rgba(255,255,255,0.05)`, border-radius `8px`
- Active segment: `surface-container`, text white
- Inactive segment: transparent, text `fg-muted`
- Segment border-radius: `6px`
- Padding per segment: `8px 12px`

**Slider (Leverage 1x–9x):**
- Track: `rgba(255,255,255,0.1)`, height `4px`
- Filled: `bg-brand`
- Thumb: white circle, `16px`

**Toggle Switch:**
- Active: `--brand` or teal track
- Inactive: gray track
- Thumb: white circle, height `20px`

---

### State Notice

```
.state-notice           padding: 10px 12px; border-radius: 6px; border: 1px solid;
.state-info             bg #EFF6FF, border #BFDBFE
.state-warning          bg #FFFBEB, border #FDE68A
.state-error            bg #FEF2F2, border #FECACA
.state-notice-text      IBM Plex Sans 500, 12px/16px
.state-severity-label   IBM Plex Sans 600, 10px/12px, tracking 0.02em
.state-stale-badge      pill, warning colours, 10px/12px 600
.state-action-btn       brand (#5ad8c4), IBM Plex Sans 500, 12px; hover #143F78
```

---

### Navigation (Top Bar)

> Source: `src/components/layout/Navbar.tsx`

**Container:**
- `sticky top-0 z-20`
- Background: `rgba(241,245,249,0.95)` (`bg-surface-page/95`) + `backdrop-blur-lg`
- Border: `border-b border-outline-variant`
- Height: **48px** (h-12) — not 56–64px
- Max-width: `1400px`, centered
- Padding: `0 16px` mobile, `0 24px` desktop (lg+)

**Logo area (left):**
- Logo `/logo.svg` — `24×24px`
- Wordmark: Geist Mono (`.font-satoshi`) bold 14px `text-fg` — hidden on mobile, visible `lg+`

**Nav items (desktop, hidden on mobile):**
- Font: IBM Plex Sans, `12px`, weight `400`
- Inactive: `text-fg-muted` → `text-fg` on hover
- Active: `text-fg`
- Transition: `colors 150ms`
- Gap between items: `24px`

**Nav items (mobile):**
- Horizontal scroll row below main bar (`pb-2`, `overflow-x-auto scrollbar-hide`)
- Same font as desktop but no hover (touch)
- Visible only below `lg` breakpoint

**Right side controls:**

| Control | Style |
|---|---|
| Settings button | `h-7 px-2 rounded-sm bg-surface-container border border-outline-variant text-fg hover:bg-surface-container-high` |
| Connect Wallet | `Button ghost-light sm` + `border border-outline-variant bg-surface-container hover:bg-surface-container-high` |
| Hamburger | Same as settings button, `lg:hidden` |
| Wallet chip (connected) | `h-7 px-3 bg-surface-container border border-outline-variant rounded-sm text-xs IBM Plex Sans hover:bg-surface-container-high` |

---

### Dropdown Menus

> Used in: Settings menu, Wallet menu (Navbar)

- Background: `#FFFFFF`
- Border: `1px solid #cbd5e1`
- Border-radius: `rounded-sm` (2px)
- Shadow: `raised-frosted`
- `z-30`, `min-w-[180px]` (settings) / `min-w-[240px]` (wallet)
- Position: `absolute right-0 top-8`
- Padding: `py-1`

**Menu item:**
- `w-full flex items-center gap-2 px-3 py-2`
- Font: IBM Plex Sans, 12px, `text-fg`
- Hover: `bg-surface-page`, transition `colors`
- Icon: 12px, `text-fg-muted`

**Wallet chip (connected state):**
- Green dot (`w-1.5 h-1.5 rounded-full bg-buy`) + truncated address (`0x1234...5678`) + `ChevronDown` icon
- Address label: `font-mono text-xs text-fg`
- "Connected" badge header inside dropdown: `text-[10px] uppercase tracking-wider text-fg-muted`
- Full address: `font-mono text-[11px] text-fg break-all`

**Dismiss:** Click outside or `Escape` key

---

### Tables

**Dark background:**
- Header: `fg-subtle`, uppercase, IBM Plex Sans 500, 12px, `letter-spacing: 0.05em`
- Row border: `1px solid rgba(255,255,255,0.08)`
- Row hover: `rgba(255,255,255,0.02)`
- Cell padding: `12–16px` vertical, `16px` horizontal
- Numbers: Geist Pixel Square / IBM Plex Mono
- Text cells: IBM Plex Sans

**Light modal:**
- Header: `fg-subtle`, uppercase, 12px
- Row border: `1px solid #E5E7EB`
- Row hover: `rgba(0,0,0,0.02)`

---

### Modals & Overlays

- Background: `#FFFFFF`
- Border-radius: `12–16px`
- Padding: `24px`
- Max-width: `480px` (settings), `640px` (pair selector)
- Shadow: `0 25px 50px rgba(0,0,0,0.5)`
- Backdrop: `rgba(0,0,0,0.6)`, `backdrop-filter: blur(4px)`
- Title: `#111827`, IBM Plex Sans 600, 18px
- Body text: `#111827` primary, `fg-subtle` secondary
- Dividers: `#E5E7EB`
- Mobile: full-width bottom-sheet, border-radius top only

---

### Frosted Icon Box

```css
.frosted-icon-box {
  width: 2rem; height: 2rem; border-radius: 0.25rem;
  background: rgba(255,255,255,0.10);
  border: 1px solid rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.70);
}
```
Icon size: `1rem`.

---

### Token Icons

> Source: `src/components/ui/TokenIcon.tsx`

| Size prop | Class | Pixels |
|---|---|---|
| `sm` | `w-5 h-5` | 20×20 |
| `md` (default) | `w-6 h-6` | 24×24 |
| `lg` | `w-8 h-8` | 32×32 |

- Shape: `rounded-full object-cover shrink-0`
- Source: Solana token-list CDN via `getTokenIcon(mint, symbol)`
- Fallback: `handleIconError` replaces with avatar URL

**Token Pair (`TokenPairIcons`):**
- Wrapper: `flex -space-x-1` (4px overlap)
- Each icon: `border-2 border-white` (white separator ring)

### StatusDot

> Source: `src/components/ui/StatusDot.tsx`

- Size: `w-1.5 h-1.5` (6×6px), `rounded-full`
- Wrapper: `relative inline-flex`

| Variant | Color |
|---|---|
| `live` | `text-buy` |
| `success` | `text-buy` |
| `danger` | `#ef4444` |
| `warning` | `#f59e0b` |

**Pulse mode** (`pulse={true}`):
- Adds `absolute` behind-dot ring: `animate-ping opacity-75` in same color
- Use sparingly — only for "live" real-time indicators

---

### Bottom Status Bar

> Source: `src/components/layout/BottomBar.tsx`

**⚠️ Correction:** Bottom bar is **light**, not dark.

- `fixed bottom-0 left-0 right-0 z-40`
- Background: `rgba(255,255,255,0.95)` + `backdrop-blur`
- Border: `border-t border-outline-variant`
- Height: `36px` (h-9)
- Max-width: `1400px`, centered, padding `0 16px` / `0 24px` desktop

**Left side:**
- `StatusDot` (live, no pulse) + "Live" label — IBM Plex Sans 12px `text-fg-muted`
- SOL price — `font-mono text-xs text-fg-muted`, fetched from Binance every 30s, shows `...` while loading

**Right side:**
- "Design & Engineered by Yamparala Rahul" — IBM Plex Sans 12px `#94a3b8`

---

### Banner / CTA Strip

- Background: `linear-gradient(#0D9373, <darker>)`
- Text: white, IBM Plex Sans 500, 14px
- Border-radius: `8px`
- Padding: `12px 16px`
- Left: emoji or icon

---

## Layout

### Page Structure

- **Split layout:** dark gradient hero header → light `#f1f5f9` body
- **Max content width:** `1400px`, centered
- **Page padding:** `24px` desktop · `16px` tablet · `12px` mobile
- **Trade terminal:** `70/30` split — chart left, order panel right

### Breakpoints

| Name | Width | Behaviour |
|---|---|---|
| Mobile | `< 640px` | Single column, hamburger nav, bottom-sheet modals |
| Tablet | `640–1024px` | Stacked layouts, compressed nav |
| Desktop | `1024–1400px` | Full layouts, horizontal nav |
| Wide | `> 1400px` | Capped at 1400px content width |

### Content Density

| Context | Density | Notes |
|---|---|---|
| Dashboard / Invest | Medium | Generous spacing, scannable |
| Trade Terminal | High | Maximise data, compact |
| Modals / Settings | Low | Generous whitespace, focused |

### Touch Targets

- Minimum `44px` height for all interactive elements on mobile
- `48px` recommended for primary CTAs

---

## Depth & Elevation

### Surface Hierarchy (dark-first)

| Layer | Token / Value | Role |
|---|---|---|
| 0 | `surface-dim` | Bottom status bar (floor) |
| 1 | `surface-page` / `#030f1a` | Page background |
| 2 | `surface-container` / `#1d2836` | Cards, side panels |
| 3 | `rgba(255,255,255,0.05)` | Hovered cards, active inputs |
| 4 | `rgba(0,0,0,0.6) + blur(4px)` | Modal backdrop |
| 5 | `#FFFFFF` | Modals, overlays |

### Shadow Rules

| Class | Value | Use |
|---|---|---|
| Card (rest) | `0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)` | Default dark card |
| Active/selected pill | `0 1px 2px rgba(4,17,15,0.40), 0 4px 8px rgba(90,216,196,0.20), 0 12px 24px rgba(90,216,196,0.12)` | Layered mint glow on `bg-brand` selection |
| Modal / floating | `0 24px 80px rgba(0,0,0,0.7)` | Deep shadow over `bg-surface-dim/60` backdrop |

- **Depth comes from tonal layering** (surface → container → container-high → bright) first; shadows are secondary and deep/black.
- The **only** coloured shadow allowed is the subtle mint glow on an active `bg-brand` pill. No other neon glows.

---

## Motion

| Interaction | Duration | Easing | Property |
|---|---|---|---|
| Button / Pill hover | **`150ms`** | `ease` | all (background, color, border) |
| Nav item color | `150ms` | — | color |
| Card hover (interactive) | `150ms` | `ease-in-out` | all |
| `.animate-fade-up` | `400ms` | `ease-out` | opacity, transform (Y +8px → 0) |
| Active card press | — | — | `scale(0.98)` |
| Active CTA press (landing) | — | `200ms` | `scale(0.97)` |
| Chevron rotate (dropdown) | — | — | `rotate-180` on open |
| Modal entry | `300ms` | `ease-out` | opacity, transform |

**Note:** The standard transition is `150ms` across all interactive UI components — the old doc incorrectly stated `200ms`.

### Motion primitives (tide social layer)

> **Amendment — named tokens.** Three duration + easing pairs live in
> `globals.css` so motion is consumed by name, not by re-typed magic
> numbers. Consume via CSS (`transition: transform var(--motion-fast)`) or
> an arbitrary-value utility. All honor `prefers-reduced-motion` through
> the global reset.

| Token | Value | Use |
|---|---|---|
| `--motion-fast` | `150ms ease-out` | state / hover / press — the `150ms` base above, as a token |
| `--motion-settle` | `200ms cubic-bezier(0.2, 0.8, 0.2, 1)` | enter / morph (e.g. FollowButton fill→outline) |
| `--motion-spring` | `250ms cubic-bezier(0.34, 1.56, 0.64, 1)` | playful feedback on human actions only (react-pop) — the "budgeted playfulness" from Identity |

### `fade-up` keyframe
```css
@keyframes fade-up {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

**Rules:**
- Reserve `backdrop-filter: blur()` for modal backdrops only — never on cards
- No shine, sweep, or parallax effects
- No looping animations on data elements
- **Honor `prefers-reduced-motion`** — all motion is disabled under it via a global guard in `globals.css`. New motion must degrade to its final state instantly. See [Accessibility](#accessibility).

---

## Accessibility

> Keyboard, motion, and contrast guarantees the UI must hold. Not optional polish —
> the floor. Verified, not eyeballed.

### Keyboard focus

Every interactive element shows a **`:focus-visible` ring** on keyboard / programmatic focus —
brand mint, drawn with `outline` (never `box-shadow`, so layout never shifts), never removed.
The ring is suppressed for pointer interaction (`:focus` without `-visible`), so mouse users
don't see it. The base rule lives in `globals.css`:

```css
:focus-visible {
  outline: 2px solid var(--brand);   /* #5ad8c4 */
  outline-offset: 2px;
}
```

- **Never** `outline: none` without an equivalent visible replacement.
- Component-level focus styling (e.g. input focus border) is **additive**, not a replacement.
- One-off Tailwind override: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand`.

### Reduced motion

All animation and transition is **disabled under `prefers-reduced-motion: reduce`** via a global
guard in `globals.css`. `.animate-fade-up`, modal entry, and press scales collapse to their final
state instantly:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Never gate meaning behind an animation.

### Contrast

All `fg`-on-surface pairs clear **WCAG AA (4.5:1)**; `fg-subtle` is AA on page/container and
AA-large on `surface-bright`. Filled mint surfaces use `text-on-brand` (dark) — white on mint
fails contrast, and `check:theme` blocks it. See [Color](#color).

### Touch targets

Interactive controls are **≥ 40×40px**. When the visual is smaller, extend the hit area with a
`before:` pseudo-element rather than padding the visual (see the `MetaStrip` info dot). See
[Touch Targets](#touch-targets).

### Icon-only controls

Buttons or links with no visible text label require an **`aria-label`** describing the action.

---

## Scrollbar

```css
::-webkit-scrollbar        { width: 6px; height: 6px; }
::-webkit-scrollbar-track  { background: var(--main-bg); }
::-webkit-scrollbar-thumb  { background: rgba(255,255,255,0.10); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.20); }
.scrollbar-hide            { scrollbar-width: none; }
```

---

## Do's & Don'ts

### Do ✅
- Use background-color shifts for depth on dark surfaces (not shadows)
- Keep all financial numbers in **Geist Pixel Square** or IBM Plex Mono
- Use `rounded-sm` (2px) on buttons, pills, cards, inputs — it is the system default radius
- Use `bg-brand` (mint) as the single identity accent — links, selected state, primary CTA. Filled brand always pairs with `text-on-brand` (dark text)
- Use `bg-surface` modals over `bg-surface-dim/60` blurred backdrops for clear layer separation
- Show `text-buy` (mint-green) for positive values, `text-sell` (red) for negative — always
- Use 0.08–0.10em letter-spacing on all uppercase section labels
- Keep a minimum `44px` touch target on mobile
- Use `150ms` for all hover/active transitions

### Don't ❌
- Don't use `border-radius: 0` — minimum is `rounded-sm` (2px)
- Don't use `rounded-full` (9999px) on buttons or pills — that's for status dots only
- Don't use neon glows or text shadows (the one allowed coloured shadow is the subtle mint glow on an active `bg-brand` pill)
- Don't use `backdrop-filter: blur()` on cards (Navbar and BottomBar use it — but not data cards)
- Don't use decorative corner accents or shine/sweep animations
- Don't use serif fonts anywhere
- Don't use gradients on cards or buttons (flat surface tokens only, except the featured StableCard, banners, and hero)
- Don't alternate table row background colours
- Don't hardcode hex in Tailwind classes (`bg-[#…]`) — always use a semantic token; `npm run check:theme` enforces this
- Don't put `text-white` on a `bg-brand` fill — mint needs dark `text-on-brand`

---

## Font Loading

```html
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600;700&family=Instrument+Sans:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

```css
/* Self-hosted: place .woff2 in /public/fonts/ */
@font-face {
  font-family: 'Geist Pixel Square';
  src: url('/fonts/GeistPixel-Square.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

---

## Quick Reference for AI Agents

### Colour Tokens (semantic Tailwind utilities)

> Use these utilities — **never** `bg-[#hex]`. Defined in `globals.css @theme`.

```
/* Surfaces (low → high elevation) */
bg-surface-page              /* page background */
bg-surface                   /* panel body */
bg-surface-container         /* cards, rows, inputs */
bg-surface-container-high    /* hover / dropdowns */
bg-surface-bright            /* selected / popovers / tooltips */

/* Text */
text-fg                      /* primary / figures */
text-fg-muted                /* secondary */
text-fg-subtle               /* tertiary / placeholders */

/* Brand (mint) + filled */
text-brand                   /* links, selected, accent */
bg-brand text-on-brand hover:bg-brand-hover   /* primary CTA — DARK text */

/* Semantic */
text-buy   text-sell   text-warning   text-info
bg-buy-surface  bg-sell-surface  bg-warning-surface  /* tinted state bg */

/* Borders + glints on dark */
border-outline               /* visible separator */
border-outline-variant       /* hairline / table rule */
border-white/15              /* subtle glass rim on hero/glass only */
```

### Font Tokens

```
/* Hero numbers */
font-['Geist_Pixel_Square','IBM_Plex_Mono',monospace]

/* Headings */
font-['Geist_Mono','IBM_Plex_Mono',monospace] font-bold

/* UI / Labels */
font-['IBM_Plex_Sans','Inter',sans-serif]

/* Section labels */
font-['IBM_Plex_Sans'] font-semibold text-[11px] uppercase tracking-[0.1em]
```

### Component Prompt Recipes

**Data table:**
> "`bg-surface-container`. Headers: IBM Plex Sans 600, 12px, uppercase, `tracking-[0.05em]`, `text-fg-subtle`. Numbers: Geist Pixel Square, `text-fg`. Row rule: `border-outline-variant`. Row hover: `bg-surface-container-high`. `text-buy` positive, `text-sell` negative."

**Card:**
> "`bg-surface-container`, `border border-outline-variant`, `rounded-sm` (5–8px), `16–24px` padding. Layered shadow; hover lifts to `bg-surface-container-high`. Text `text-fg` / `text-fg-muted`."

**Modal:**
> "`bg-surface` panel, `rounded-xl` (12px), `24px` padding, deep shadow `0 24px 80px rgba(0,0,0,0.7)`, over `bg-surface-dim/60` backdrop with `backdrop-blur`. Title: `text-fg`, IBM Plex Sans 600, 18px."

**Primary button:**
> "`bg-brand text-on-brand` (DARK text on mint), IBM Plex Sans 600 14px, `10px 20px` padding, `rounded-sm`. Hover `bg-brand-hover`, targeted `transition-[background-color,color,box-shadow,transform]`, `active:scale-[0.96]`."

**Filter pills:**
> "Fully-rounded (`9999px`), `min-h-[40px]`. Active: `bg-brand text-on-brand` + layered mint shadow. Inactive: transparent, `border-outline-variant`, `text-fg-muted`. Hover: brighten border + text."

**Trade layout:**
> "70/30 CSS Grid. Left: chart, `bg-surface`. Right: order panel, `bg-surface-container`, `border-outline-variant` left border. Stack vertically below `1024px`."

**Hero section:**
> "Full-bleed gradient: `#000003 → #000036 (37.9%) → #143f79 (81.7%) → #fcffff (285%)` (the one place a literal gradient is allowed — it's a `style` background, not a utility class). Geist Mono bold display heading. Fade-up on entry (`400ms ease-out`)."
