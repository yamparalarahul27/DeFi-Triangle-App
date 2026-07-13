# Badge

Status: draft
Small status label on the tinted-surface pairs — tone conveys state category, never price direction on its own.

## Usage

```tsx
import { Badge } from "@/design-system";

<Badge tone="buy">on peg</Badge>
<Badge tone="warning">pending</Badge>
```

## Anatomy

```
( label )  ← rounded-chip, 11px medium, tint bg + tone text
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `tone` | `"neutral" \| "brand" \| "buy" \| "sell" \| "warning" \| "info"` | `"neutral"` | Maps to the tinted state-surface pairs. |
| `className` | `string` | — | cn-merged. |
| …rest | `HTMLAttributes<span>` | — | Pass-through. |

## Tokens

- `--{buy,sell,warning,info}-surface` + tone text tokens · `--surface-container-high` (neutral) · `--radius-chip`

## States

Static — no interactive states. Tone is the only variant axis.

## Motion

None (static label).

## A11y

- Real text = accessible name; no ARIA needed.
- State is conveyed by text + tint together, not color alone (the label says "pending", the tint reinforces).
- Sign discipline: direction belongs to the signed value beside the badge, not the badge tone.
