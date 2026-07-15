# RadioGroup

Status: draft
Version: 0.9.0
Single-choice option list on Radix RadioGroup — all options visible.

## Usage

```tsx
import { RadioGroup } from "@/design-system";

const [slippage, setSlippage] = useState<"0.1" | "0.5" | "1.0">();

<RadioGroup
  aria-label="Slippage tolerance"
  value={slippage}
  onValueChange={setSlippage}
  options={[
    { value: "0.1", label: "0.1%", description: "May fail on volatile pairs" },
    { value: "0.5", label: "0.5%", description: "Recommended" },
    { value: "1.0", label: "1.0%" },
  ]}
/>
```

Best for: one-of-N choices where seeing every option matters — slippage
presets, network selection, order type. Rule of thumb: ≤5 options →
RadioGroup; more → Select. For on/off use Switch; for many-of-N use
Checkbox.

## Anatomy

```
◉  0.5%                    ← Item (16px ring, brand dot when
   Recommended             ← description (fg-muted, optional)
○  1.0%                    ← unchecked ring (outline)
```

Each row is a ≥40px-tall label — the whole row is the hit area.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `options` | `RadioOption<T>[]` | — | `{ value, label, description?, disabled? }`. |
| `value` | `T \| undefined` | — | Controlled. |
| `onValueChange` | `(value: T) => void` | — | |
| `disabled` | `boolean` | — | Disables the whole group. |
| `aria-label` | `string` | — | Name the group when no visible label precedes it. |
| `className` | `string` | — | cn-merged onto the root. |

## Tokens

`--outline` · `--brand` (checked ring + dot) ·
`--surface-container-high` (row hover) · `--radius-control`

## States

- **Unchecked**: outline ring, empty.
- **Checked**: `data-state="checked"` — brand ring + brand dot.
- **Hover** (row): surface raises to `surface-container-high`.
- **Disabled** (item or group): 40% opacity, no pointer.

## Motion

150ms on ring border-color; the dot appears without animation (selection
is instant feedback, not a transition).

## A11y

Radix wiring: `role="radiogroup"`, roving tabindex — Tab enters the
group once, ↑/↓/←/→ move selection. Rows are real `<label>`s so
clicking text selects. Always name the group (`aria-label` or a
preceding heading); descriptions are part of the label's text content.
