# IconButton

Status: stable
Version: 1.0.0
Square icon-only action — `aria-label` is a **required prop**, so an unnamed icon button is a compile error.

## Usage

```tsx
import { IconButton } from "@/design-system";

<IconButton aria-label="Close" onClick={close}>×</IconButton>
<IconButton aria-label="Settings" variant="secondary" size="lg">⚙</IconButton>
```

## Anatomy

```
┌────┐
│ ✕  │ ← square (28/36/44), icon centered
└────┘
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `aria-label` | `string` | **required** | The accessible name — enforced by the type. |
| `variant` | `ButtonVariant` | `"ghost"` | Same four variants as Button. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | 28 / 36 / 44 px square. `sm` only inside dense rows; prefer `lg` (44px target) on primary surfaces. |
| `className` | `string` | — | cn-merged. |
| …rest | `ButtonHTMLAttributes` | `type="button"` | Native pass-through. |

## Tokens

Same as Button (variant map) · `--radius-control`.

## States

default · hover · active (`scale 0.96`) · focus-visible (global ring) · disabled.

## Motion

Targeted transition 150ms + press scale, as Button. Reduced-motion via global reset.

## A11y

- The required `aria-label` prop is the point of the component.
- 44px (`lg`) meets the DESIGN.md touch-target floor; `md` (36) relies on surrounding spacing; document dense-row use.
