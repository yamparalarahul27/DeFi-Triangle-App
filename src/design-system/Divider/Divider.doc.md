# Divider

Status: draft
Hairline rule on the outline-variant token.

## Usage

```tsx
import { Divider } from "@/design-system";

<Divider />
<Divider orientation="vertical" className="mx-2" />
```

## Anatomy

```
-----------  horizontal (h-px)
|  vertical (w-px, self-stretch)
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Sets `aria-orientation`. |
| `className` | `string` | -- | cn-merged. |

## Tokens

- `--outline-variant`

## States

Static.

## Motion

None.

## A11y

- `role="separator"` + `aria-orientation` -- announced as a boundary, not content.
