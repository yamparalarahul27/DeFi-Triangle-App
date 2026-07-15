# BottomNav

Status: draft
Version: 0.9.0
Mobile tab bar — 3–5 top-level destinations, labels always visible.

## Usage

```tsx
import { BottomNav } from "@/design-system";

const [tab, setTab] = useState<"feed" | "markets" | "portfolio">("feed");

<BottomNav
  className="fixed inset-x-0 bottom-0"
  value={tab}
  onValueChange={setTab}
  items={[
    { value: "feed", label: "Feed", icon: "≋" },
    { value: "markets", label: "Markets", icon: "▤" },
    { value: "portfolio", label: "Portfolio", icon: "◎" },
  ]}
/>
```

Best for: the phone-width shell's primary navigation (the feed demo
hand-rolled exactly this). 3–5 items; more belongs in a Menu or a
dedicated screen. Positioning is the caller's — pass
`fixed inset-x-0 bottom-0` (safe-area padding is built in). For
switching content *within* a screen use Tabs or Lane.

## Anatomy

```
┌────────┬────────┬────────┐
│   ≋    │   ▤    │   ◎    │ ← icon (aria-hidden)
│  Feed  │Markets │Portfol.│ ← label (always visible)
└────────┴────────┴────────┘ ← border-t, safe-area pb
   active: brand ink + semibold
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` | `BottomNavItem<T>[]` | — | `{ value, label, icon? }`; equal-width columns. |
| `value` | `T` | — | Controlled active tab. |
| `onValueChange` | `(value: T) => void` | — | |
| `className` | `string` | — | cn-merged (positioning lives here). |

## Tokens

`--surface-page` · `--outline-variant` · `--brand` (active ink)

## States

- **Inactive**: `fg-muted`, hover raises to `fg`.
- **Active**: brand ink + semibold label + `aria-current="page"` —
  weight change keeps the cue non-color (mono theme).

## Motion

150ms on color only. No indicator slide in v1 — tab switches are
instant context changes, not transitions.

## A11y

`<nav>` landmark; items are real buttons ≥48px tall; the active item
carries `aria-current="page"`. Icons are decorative (`aria-hidden`) —
the visible label names the tab, so there are no icon-only mystery
tabs.
