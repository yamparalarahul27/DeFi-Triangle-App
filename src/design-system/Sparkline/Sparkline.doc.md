# Sparkline

Status: draft
Inline SVG trend line; tone follows series direction (sign discipline) unless overridden.

## Usage

```tsx
import { Sparkline } from "@/design-system";

<Sparkline data={closes} />
<Sparkline data={closes} label="7-day price trend" tone="neutral" />
```

## Anatomy

```
/\_/\__/  <- polyline, 1.25 stroke, buy/sell by direction
84 x 28 default box
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `data` | `number[]` | -- | Oldest -> newest; needs >= 2 points (else renders nothing). |
| `tone` | `"buy" \| "sell" \| "neutral"` | direction | Default: last >= first -> buy. |
| `label` | `string` | -- | Sets `role="img"` + name; omitted = `aria-hidden` decorative. |
| `width` / `height` | `number` | 84 / 28 | Viewbox + rendered size. |
| `className` | `string` | -- | cn-merged. |

## Tokens

- `--buy` / `--sell` / `--fg-muted` via `var()` strokes

## States

Static; re-renders with data.

## Motion

None (data surfaces never bounce).

## A11y

- Decorative by default (`aria-hidden`); pass `label` to name it as an image.
- Never the only carrier of direction -- pair with a signed value.
