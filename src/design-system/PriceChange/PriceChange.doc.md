# PriceChange

Status: draft
The sign-discipline primitive: direction from the signed value, magnitude always Math.abs -- a green loss is impossible.

## Usage

```tsx
import { PriceChange } from "@/design-system";

<PriceChange value={-4.2} />        // ▼ −4.20%  (sell tone)
<PriceChange value={9.4} suffix="%" /> // ▲ +9.40%  (buy tone)
```

## Anatomy

```
▲ +4.20%   value >= 0: buy tone
▼ −4.20%   value <  0: sell tone, magnitude via Math.abs
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `value` | `number` | -- | SIGNED change. The component derives everything else. |
| `suffix` | `string` | `"%"` | Unit after the magnitude. |
| `precision` | `number` | `2` | toFixed digits. |
| `className` | `string` | -- | cn-merged. |

## Tokens

- `--buy` / `--sell` - data ramp (`.data-sm`) + `tabular-nums`

## States

up - down. That is the whole state space, on purpose.

## Motion

None of its own (flash-on-change belongs to the row/cell, not the number).

## A11y

- Direction is conveyed by BOTH the glyph and the +/− sign, never color alone.
- Glyph is `aria-hidden`; the signed text reads naturally.
