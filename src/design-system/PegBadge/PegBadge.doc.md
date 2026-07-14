# PegBadge

Status: stable
Version: 1.0.0
Stablecoin peg health from the SIGNED bps deviation -- tone by magnitude, sign kept visible.

## Usage

```tsx
import { PegBadge } from "@/design-system";

<PegBadge deviationBps={4} />     // on peg +4bps
<PegBadge deviationBps={-38} />   // drifting −38bps
<PegBadge deviationBps={-230} />  // depegged −230bps
```

## Anatomy

```
( on peg +4bps )     buy tint,  |bps| < 25
( drifting −38bps )  warning,   25 <= |bps| < 200
( depegged −230bps ) sell tint, |bps| >= 200
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `deviationBps` | `number` | -- | SIGNED deviation (+ above / − below peg). |
| `className` | `string` | -- | cn-merged. |

## Tokens

- `--buy/warning/sell(-surface)` pairs - `--radius-chip` - data ramp for the bps figure

## States

on peg - drifting - depegged. Thresholds are the component contract (25 / 200 bps).

## Motion

None (peg state is data).

## A11y

- State word + signed figure are real text -- health is never color alone.
- Guideline #5 encoded: magnitude drives tone (Math.abs), the sign stays in the readout.
