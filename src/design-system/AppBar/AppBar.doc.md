# AppBar

Status: draft
Version: 0.9.0
Page header — leading · title · actions, optionally sticky.

## Usage

```tsx
import { AppBar, IconButton, Menu } from "@/design-system";

<AppBar
  title="Markets"
  leading={<IconButton aria-label="Back" variant="ghost">‹</IconButton>}
  actions={<IconButton aria-label="Settings" variant="ghost">⚙</IconButton>}
  sticky
/>
```

Best for: the top row of any screen — every template was hand-rolling
this composition. Pure layout: the slots take real components
(IconButton, Menu, ThemeToggle); AppBar owns only the row, the border,
and the sticky rung.

## Anatomy

```
┌──────────────────────────────────┐
│ [‹]  Markets              [⚙][⋯] │ ← h-14, border-b,
└──────────────────────────────────┘   bg-surface-page
  └leading └title (truncates) └actions
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `string` | — | Required; renders as the page `<h1>`, truncates. |
| `leading` | `ReactNode` | — | Back button / logo slot. |
| `actions` | `ReactNode` | — | Right slot; gap-1 between items. |
| `sticky` | `boolean` | `false` | `sticky top-0` on the `--z-sticky` rung. |
| `className` | `string` | — | cn-merged. |

## Tokens

`--surface-page` · `--outline-variant` · `--z-sticky`

## States

Static composition — interaction lives in the slotted components. When
`sticky`, the bar stays above scrolling content (below overlays/modals
on the z ladder).

## Motion

None. Headers don't animate; the content scrolls under them.

## A11y

Renders a `<header>` landmark with the title as `<h1>` — one AppBar per
page. Slot buttons must carry their own labels (IconButton enforces
`aria-label`). Sticky bars must not trap focus or obscure focused
elements — keep the bar h-14 and let the browser's scroll-into-view do
its job.
