# Select

Status: stable
Version: 1.0.0
Single-value select on Radix Select; trigger matches Input's md height.

## Usage

```tsx
import { Select } from "@/design-system";

<Select aria-label="Network" options={[{value:"sol",label:"Solana"}]} value={net} onValueChange={setNet} />
```

## Anatomy

```
+ value            v +  <- trigger (h-9, container)
| Solana          ok |  <- popper panel, surface-bright
| Ethereum           |     highlight: container-high
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `options` | `SelectOption<T>[]` | -- | `{value,label,disabled?}`. |
| `value` / `onValueChange` | controlled pair | -- | |
| `placeholder` | `string` | `"Select..."` | Shown via `data-placeholder`. |
| `disabled` | `boolean` | -- | |
| `className` | `string` | -- | cn-merged onto the trigger. |
| `aria-label` | `string` | -- | Name the control when no visible label. |

## Tokens

- `--surface-container` trigger - `--surface-bright` panel - `--surface-container-high` highlight - `--radius-control/chip` - `--elevation-2` - `--z-raised`

## States

closed - open - item highlighted - item selected (brand check) - disabled (control or item).

## Motion

Panel fade via Radix presets; highlight moves instantly.

## A11y

- Radix Select: full listbox semantics, arrow keys, typeahead, Escape.
- Label via `aria-label` or an external `<label>`.
