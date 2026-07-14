# Checkbox

Status: stable
Checkbox on Radix -- brand fill when checked.

## Usage

```tsx
import { Checkbox } from "@/design-system";

<Checkbox checked={agreed} onCheckedChange={setAgreed} aria-label="Agree" />
```

## Anatomy

```
[ ]  unchecked: container bg, outline border
[x]  checked: brand fill, on-brand check
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `checked` / `onCheckedChange` | controlled pair | -- | Indeterminate not supported in v1. |
| `disabled` | `boolean` | -- | |
| `className` | `string` | -- | cn-merged. |
| ...rest | Radix Checkbox props | -- | `aria-label`, `name`... |

## Tokens

- `--brand` / `--on-brand` (checked) - `--outline` + `--surface-container` (unchecked) - `--radius-control`

## States

unchecked - checked - focus-visible - disabled.

## Motion

Fill/border 150ms targeted; no check-draw animation (data surfaces stay calm).

## A11y

- Radix Checkbox: `role="checkbox"`, `aria-checked`, Space toggles.
- 16px visual -- pair with a clickable label for the 40px hit-area rule.
