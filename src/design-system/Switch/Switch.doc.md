# Switch

Status: stable
Version: 1.0.0
On/off toggle on Radix Switch.

## Usage

```tsx
import { Switch } from "@/design-system";

<Switch checked={on} onCheckedChange={setOn} aria-label="Public watchlist" />
```

## Anatomy

```
(o---)  off: surface-bright track
(---o)  on: brand track, on-brand thumb
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `checked` / `onCheckedChange` | controlled pair | -- | Caller owns state. |
| `disabled` | `boolean` | -- | Native semantics via Radix. |
| `className` | `string` | -- | cn-merged onto the track. |
| ...rest | Radix Switch props | -- | e.g. `aria-label`, `name`. |

## Tokens

- `--brand` / `--on-brand` (on) - `--surface-bright` + `--outline-variant` (off) - `--elevation-1` thumb

## States

off - on - focus-visible (global ring) - disabled.

## Motion

Track color + thumb translate, 150ms targeted; reduced-motion via global reset.

## A11y

- Radix Switch: `role="switch"`, `aria-checked`, Space/Enter toggle.
- Label from the caller (`aria-label` or an associated `<label>`).
