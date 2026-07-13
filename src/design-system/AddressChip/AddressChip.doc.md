# AddressChip

Status: draft
Truncated address with one-tap copy + optional explorer link; the full address is always the accessible name.

## Usage

```tsx
import { AddressChip } from "@/design-system";

<AddressChip address={mint} href={`https://solscan.io/token/${mint}`} />
```

## Anatomy

```
[ 7xKt...9fQ2  ⧉  ↗ ]  <- mono truncate - copy (✓ on success) - explorer
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `address` | `string` | -- | Full address; truncated visually (4...4). |
| `href` | `string` | -- | Explorer URL; renders the link when present. |
| `className` | `string` | -- | cn-merged. |

## Tokens

- `--surface-container` + `--outline-variant` - `--radius-chip/control` - `--buy` (copied tick) - `font-mono`

## States

rest - copy hover - copied (1.5s ✓ confirmation) - with/without explorer.

## Motion

Color transition 150ms on the affordances; nothing else.

## A11y

- Truncation is visual only: the text span carries the full address as `aria-label`, and the copy button names it ("Copy address <full>").
- Copy confirmation is a label change ("Copied"), not color alone.
