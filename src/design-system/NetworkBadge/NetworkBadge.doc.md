# NetworkBadge

Status: stable
Version: 1.0.0
Chain indicator -- always show the network (ethereum.org heuristic #3). Neutral: chains are facts, not states.

## Usage

```tsx
import { NetworkBadge } from "@/design-system";

<NetworkBadge name="Solana" iconSrc="https://cdn.defitriangle.xyz/logos/network/solana/32.png" />
```

## Anatomy

```
( o Solana )  <- icon (or dot) + name, container-high tint
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `name` | `string` | -- | Chain name. |
| `iconSrc` | `string` | -- | e.g. Logobase `network/<slug>`; falls back to a dot. |
| `className` | `string` | -- | cn-merged. |

## Tokens

- `--surface-container-high` - `--fg-muted` - `--radius-chip`

## States

Static; with/without icon.

## Motion

None.

## A11y

- Name is real text; icon is decorative (`alt=""`).
