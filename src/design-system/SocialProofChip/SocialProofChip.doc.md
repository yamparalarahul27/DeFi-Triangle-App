# SocialProofChip

Status: draft
"◔ 41 watching" — quiet social-proof count. Never louder than the price it sits by.

## Usage

```tsx
import { SocialProofChip } from "@/design-system";

<SocialProofChip count={41} />            {/* ◔ 41 watching */}
<SocialProofChip count={41} compact />    {/* ◔ 41 */}
<SocialProofChip count={7} label="holding" />
```

## Anatomy

```
 ◔ 41 watching        ◔ 41      ← compact (on cards)
 │  │  └ label, fg-muted        └ label dropped
 │  └ count, .data-sm
 └ dotted-ring glyph, brand @60%
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `count` | `number` | — | The proof count. |
| `label` | `string` | `"watching"` | Trailing word. |
| `compact` | `boolean` | `false` | Drop the label; show glyph + count only. |
| `className` | `string` | — | Merged via `cn`. |

## Tokens

- `--color-brand` at 60% (`text-brand/60`) — the dotted-ring glyph only.
- `--color-fg-muted` — count + label.
- `.data-sm` — the numeral.

## States

- **Full** — glyph + count + label.
- **Compact** — glyph + count.

## Motion

None.

## A11y

- The whole chip carries `aria-label` ("41 watching"); glyph/count/label are `aria-hidden` so AT reads one clean phrase (and compact stays meaningful).
- Weight stays at `text-xs`/muted so it never out-shouts adjacent price data.
