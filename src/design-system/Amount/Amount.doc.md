# Amount

Status: draft
Version: 0.9.0
Read-only formatted token amount — AmountInput's display sibling, financial type ramp.

## Usage

```tsx
import { Amount } from "@/design-system";

<Amount value={1234.5678} symbol="SOL" />        {/* 1,234.57 SOL */}
<Amount value={0.00002314} symbol="BONK" />       {/* 0.00002314 BONK */}
<Amount value={-12.5} symbol="USDC" size="lg" />  {/* −12.50 USDC */}
<Amount value={184.26} decimals={4} />            {/* 184.2600 */}
```

Best for: any token quantity the user reads — balances, positions,
totals. Formatting is magnitude-aware so BONK dust and SOL balances
both stay readable. For *entering* amounts use AmountInput; for signed
*changes* with buy/sell color use PriceChange — Amount is a fact, not
a movement, so it never colors by sign.

## Anatomy

```
−1,234.57 SOL
│└───┬───┘ └─ symbol (fg-muted)
│    └ magnitude — Math.abs, formatted
└ direction — from the signed value
  (guideline #5: two concerns, two computations)
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `value` | `number` | — | Signed; full precision kept in `title`. |
| `symbol` | `string` | — | Rendered after the number, muted. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | The `data-*` financial type ramp. |
| `decimals` | `number` | — | Fixed fraction digits; overrides the magnitude default. |
| `className` | `string` | — | cn-merged. |

Default formatting: `≥ 1` → 2 decimals + thousands separators;
`< 1` → 4 significant digits. Locale pinned to `en-US` (deterministic
server/client render).

## Tokens

`--text-data-*` sizes + `--font-pixel-stack` (via `data-sm/md/lg`) ·
`--fg` · `--fg-muted`

## States

Stateless display. Negative values render a true minus (−) prefix;
magnitude is always formatted from `Math.abs`.

## Motion

None. For values that change live, wrap in RollingNumber — Amount
itself never animates.

## A11y

Plain text — screen readers read the formatted number and symbol
naturally. The `title` attribute carries the unrounded value for
precision on hover. Never encode meaning in color here; sign is the
− character.
