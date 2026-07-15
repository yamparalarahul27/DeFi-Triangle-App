# Textarea

Status: draft
Version: 0.9.0
Multi-line text entry — Input's sibling, same border/focus/invalid grammar.

## Usage

```tsx
import { Textarea } from "@/design-system";

<Textarea placeholder="Describe the issue…" />
<Textarea rows={5} invalid aria-label="Note" />
```

Best for: free-form text longer than a line — notes, memos, feedback,
transaction messages. For single-line values use Input; for amounts use
AmountInput. Label it from the caller (visible `<label>` preferred,
`aria-label` otherwise).

## Anatomy

```
┌─────────────────────────────┐ ← border-outline-variant,
│ placeholder / typed text    │   rounded-control, px-3 py-2
│                             │ ← rows controls initial height
│                            ↕│ ← resize-y only (never horizontal)
└─────────────────────────────┘
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `invalid` | `boolean` | `false` | Sets `aria-invalid` + sell border. Pair with visible error text. |
| `rows` | `number` | `3` | Initial height in text lines. |
| `className` | `string` | — | cn-merged. |
| …rest | `TextareaHTMLAttributes` | — | `value`, `onChange`, `placeholder`, `disabled`, etc. |

## Tokens

`--surface-container` · `--outline-variant` · `--outline` (focus) ·
`--sell` (invalid) · `--radius-control`

## States

- **Rest**: outline-variant border.
- **Focus**: border raises to outline (no ring — matches Input).
- **Invalid**: sell border + `aria-invalid` — always with adjacent
  error text; the border alone is not the message.
- **Disabled**: 40% opacity, no pointer.

## Motion

150ms on border-color/background-color only. User resize (`resize-y`)
is native and unanimated.

## A11y

Real `<textarea>` — native semantics, form participation, IME support.
`invalid` sets `aria-invalid` for screen readers; the visible error text
next to the field is the actual message. Don't cap length silently —
show a counter if a max matters.
