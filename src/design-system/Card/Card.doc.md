# Card

Status: draft
Version: 0.9.0
The generic container primitive — outlined surface, card radius, base padding.

## Usage

```tsx
import { Card } from "@/design-system";

<Card>
  <h3 className="text-sm font-medium">Portfolio</h3>
  <p className="text-xs text-fg-muted">3 positions · $12,480</p>
</Card>

<Card interactive onClick={open}>…</Card>
```

Best for: grouping related content on the page surface — settings
sections, summary tiles, list containers. This is the canonical form of
the `rounded-card border bg-surface-container` recipe; reach for Card
before hand-rolling that class string. For specialized cards the system
already ships PostCard (social) and StatCell (data) — Card is what you
compose when neither fits.

## Anatomy

```
┌───────────────────────────┐  ← border-outline-variant,
│  p-4 padding              │    rounded-card, bg-surface-container
│  (children — caller owns  │
│   the internal layout)    │
└───────────────────────────┘
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `interactive` | `boolean` | `false` | Hover surface lift + `scale(0.98)` press. Set on clickable cards only. |
| `className` | `string` | — | cn-merged; override padding with `p-*` when needed. |
| …rest | `HTMLAttributes<HTMLDivElement>` | — | `onClick`, `role`, etc. pass through. |

## Tokens

`--surface-container` · `--surface-container-high` (interactive hover) ·
`--outline-variant` · `--radius-card`

## States

- **Static** (default): no hover response — content container only.
- **Interactive**: hover raises to `surface-container-high`, press
  scales to 0.98 (card-grade press — softer than the 0.96 of controls).
- Card has no disabled state; disable the controls inside it.

## Motion

150ms on `background-color` + `transform` only (no `transition-all`),
and only when `interactive`. Static cards are motionless.

## A11y

Renders a plain `div` — semantics come from the caller. If the whole
card is clickable, prefer wrapping it in a link/button or pass
`role="button"` + `tabIndex={0}` + key handlers; don't leave a bare
`onClick` on a div for keyboard users. Interactive cards must contain a
visible affordance (the hover lift alone is not discoverable).
