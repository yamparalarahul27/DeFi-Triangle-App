# RollingNumber

Status: stable
Version: 1.0.0
Streaming numeral: only the characters that change roll in -- zero layout shift, calm by design.

## Usage

```tsx
import { RollingNumber } from "@/design-system";

<RollingNumber value={fmtUsd(price)} className="data-lg" />
```

## Anatomy

```
$ 1 8 4 . 2 6
          ^-^-- changed slots re-mount and roll in
(unchanged slots keep their DOM nodes still)
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `value` | `string` | -- | Pre-formatted figure -- formatting is the caller's (keep unrounded terminal DNA). |
| `className` | `string` | -- | cn-merged; defaults to `data-md`, override with `data-lg` etc. |

## Tokens

- `--motion-settle` (the roll) - financial ramp via `.data-*`

## States

steady - per-slot roll on change. No hover/press (display only).

## Motion

`roll-in` keyframe (0.45em rise + fade) on changed slots only; discrete, never looping; reduced-motion collapses globally.

## A11y

- One `aria-label` with the full figure; per-character spans are `aria-hidden` so screen readers hear "184.26", not spelled-out chaos.
- `tabular-nums` via the data ramp -- zero layout shift on ticks.
