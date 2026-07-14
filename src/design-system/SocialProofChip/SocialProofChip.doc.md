# SocialProofChip

Status: stable
Version: 1.0.0
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

- Accessible name is real text — count + label are readable (compact renders the label `sr-only`), only the ◔ glyph is `aria-hidden`. No `aria-label` on the generic span (axe `aria-prohibited-attr`).
- Weight stays at `text-xs`/muted so it never out-shouts adjacent price data.
