# GasFee

Status: draft
Version: 0.9.0
Network-fee row — amount + optional congestion level, mono-safe.

## Usage

```tsx
import { GasFee } from "@/design-system";

<GasFee amount="0.000005 SOL" usd="≈ $0.0009" level="low" />
<GasFee amount="0.0021 SOL" usd="≈ $0.39" level="elevated" label="Priority fee" />
```

Best for: directly above the confirm button in any transaction flow —
fees users discover *after* signing are the #1 web3 trust killer
(ethereum.org heuristic: show costs up front). No generic design
system ships this; it's pure crypto whitespace. Omit `level` on
flat-fee chains — a permanent "low" is noise.

## Anatomy

```
Network fee     0.000005 SOL ≈ $0.0009 LOW
└ label (muted)  └ amount     └ fiat    └ level word
                  (data ramp)   (subtle)  (tone ink, uppercase)
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `amount` | `string` | — | Preformatted native units ("0.000005 SOL"). |
| `usd` | `string` | — | Fiat approximation ("≈ $0.0009"). |
| `level` | `"low" \| "normal" \| "elevated" \| "high"` | — | Congestion; omit for flat-fee chains. |
| `label` | `string` | `"Network fee"` | E.g. "Priority fee", "Bridge fee". |
| `className` | `string` | — | cn-merged. |

## Tokens

`--text-data-sm` (amount) · `--success` (low) · `--warning` (elevated) ·
`--error` (high) · `--fg-muted`/`--fg-subtle`

## States

The four levels are the states — each pairs an ink with its **word**
(LOW/NORMAL/ELEVATED/HIGH), never color alone (mono theme). Severity
maps to congestion pricing, not danger: success ink only at "low",
error ink only at "high".

## Motion

None. Fee updates swap text in place — if fees refresh live, debounce
upstream; a flickering fee row reads as instability.

## A11y

Plain text row — label, amount, fiat, and level word are all readable
in order. The level word doubles as the non-color cue. Keep `amount`
preformatted with its unit so screen readers say "0.000005 SOL", not
a bare float.
