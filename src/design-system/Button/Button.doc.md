# Button

Status: draft
The action primitive — four variants on the semantic tokens, three heights on the shared scale.

## Usage

```tsx
import { Button } from "@/design-system";

<Button variant="primary" onClick={confirm}>Confirm</Button>
<Button variant="destructive" size="sm">Remove</Button>
```

## Anatomy

```
┌──────────────────────┐
│ [icon]  Label        │ ← inline-flex, gap-2, rounded-control
└──────────────────────┘
  primary: brand fill · secondary: container+border ·
  ghost: text only · destructive: sell fill
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `"primary" \| "secondary" \| "ghost" \| "destructive"` | `"secondary"` | Destructive pairs with a confirm step (Dialog). |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Heights 28 / 36 / 44 px (shared scale). |
| `className` | `string` | — | cn-merged. |
| …rest | `ButtonHTMLAttributes` | `type="button"` | Native pass-through (onClick, disabled…). |

## Tokens

- `--brand` / `--on-brand` / `--brand-hover` (primary) · `--surface-container(-high)` + `--outline-variant` (secondary) · `--sell(-strong)` (destructive)
- `--radius-control` · `--motion-fast` timing via the 150ms transition

## States

- default · hover (fill shift) · active (`scale 0.96`) · focus-visible (global brand ring) · disabled (`opacity-40`, no events)

## Motion

- Targeted `transition-[background-color,color,box-shadow,transform]` 150ms (never `transition-all`); press scale 0.96. Reduced-motion: global reset.

## A11y

- Native `<button type="button">` — space/enter, focusability for free.
- Disabled uses the native attribute (removed from tab order).
- `text-white` on destructive is deliberate: sell-strong is dark in every theme.
- Label is the accessible name — icon-only use belongs to IconButton.
