# StatCell

Status: stable
Label-over-value stat block; padding and type ride the density tokens.

## Usage

```tsx
import { StatCell, PriceChange, RollingNumber } from "@/design-system";

<StatCell label="Market cap" value="$1.09B" />
<StatCell label="Price" value={<RollingNumber value="$184.26" />} change={<PriceChange value={3.6} />} />
```

## Anatomy

```
MARKET CAP          <- 10px uppercase fg-muted
$1.09B  ▲ +3.60%    <- data-md value + optional delta
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | -- | Uppercase micro-label. |
| `value` | `ReactNode` | -- | Pre-formatted figure or RollingNumber. |
| `change` | `ReactNode` | -- | Pass a PriceChange to keep sign discipline. |
| `className` | `string` | -- | cn-merged. |

## Tokens

- `--space-1` + `--cell-px` (density-responsive padding) - data ramp - fg ladder

## States

Static display; compact density tightens it automatically.

## Motion

None.

## A11y

- Label + value are real text in source order ("Market cap $1.09B").
