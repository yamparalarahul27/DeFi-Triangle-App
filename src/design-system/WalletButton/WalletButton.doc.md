# WalletButton

Status: draft
Version: 0.9.0
The connect-wallet atom — one button, three states (disconnected · connecting · connected).

## Usage

```tsx
import { WalletButton } from "@/design-system";

<WalletButton status="disconnected" onClick={connect} />
<WalletButton status="connecting" />
<WalletButton
  status="connected"
  address="7xKtF2mPqR8vN3wLbJd5cYhT6gAeS4uZ1oXnE9fQ2rM"
  onClick={openAccountDrawer}
/>
```

Best for: the header of any web3 surface — the templates hand-rolled
this from Button + AddressChip until now. Presentational by design:
wire `onClick` to your wallet adapter when disconnected, and to your
account UI (Drawer/Menu with balance, copy, disconnect) when connected.
**Disconnect never lives on this button** — accidental disconnects are
hostile; it belongs inside the account UI a click opens.

## Anatomy

```
disconnected   [ Connect wallet ]   ← primary Button
connecting     [ ● Connecting… ]    ← disabled, warning dot pulses
connected      [ ● 7xKt…9fQ2 ]      ← secondary, buy dot, mono
                 └ truncated 4…4 (full address in aria-label)
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `status` | `"disconnected" \| "connecting" \| "connected"` | — | Drives the whole rendering. |
| `address` | `string` | — | Required when connected; truncated 4…4 visually. |
| `onClick` | `() => void` | — | Connect (disconnected) / open account (connected). |
| `className` | `string` | — | cn-merged onto the Button. |

## Tokens

Inherits Button's tokens (`--brand`/`--on-brand`, surfaces, outline) ·
`--buy` (connected dot) · `--warning` (connecting dot)

## States

- **Disconnected**: primary emphasis — connecting is the on-ramp CTA.
- **Connecting**: disabled + pulsing warning dot; the wallet popup owns
  the interaction now.
- **Connected**: quiet secondary pill — a status, not a call to action.
  Dot + mono address are the dual cue (color + glyph).

## Motion

The connecting dot pulses (status, not data — TxStatus's rule). Press
and hover ride Button's 150ms/0.96 contract.

## A11y

Composes Button (real `<button>`, focusable, 0.96 press). Connected
state's `aria-label` carries the **full** address — truncation is
visual only (AddressChip's rule). Dots are `aria-hidden`; the visible
text names each state.
