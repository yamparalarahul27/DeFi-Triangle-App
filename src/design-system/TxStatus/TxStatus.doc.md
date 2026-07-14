# TxStatus

Status: stable
The transaction lifecycle, always visible (heuristic #1) -- the component no reference library ships.

## Usage

```tsx
import { TxStatus } from "@/design-system";

<TxStatus state="pending" detail="5D3k...Wq signature" />
<TxStatus state="confirmed" />
```

## Anatomy

```
o  Waiting for wallet...   signing: warning pulse
o  Pending confirmation... pending: info pulse
✓  Confirmed               buy   |  ✕ Failed  sell
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `state` | `"idle" \| "signing" \| "pending" \| "confirmed" \| "failed"` | -- | The lifecycle. |
| `detail` | `string` | -- | Mono line under the label (signature, error hint). |
| `className` | `string` | -- | cn-merged. |

## Tokens

- `--warning` (signing) - `--info` (pending) - `--buy`/`--sell` (terminal states) - `--fg-subtle` dot at idle

## States

idle - signing - pending - confirmed - failed. Copy per state is the component contract.

## Motion

Pulse on the in-flight dot only (status indicator, not data; collapses under reduced-motion). Terminal states are still.

## A11y

- `role="status"` + `aria-live="polite"`: transitions are announced without stealing focus -- the user acts in the wallet while the UI reports (heuristic #2).
- Terminal states carry ✓/✕ glyphs + words, never color alone.
