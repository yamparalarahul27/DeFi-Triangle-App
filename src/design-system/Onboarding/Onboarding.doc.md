# Onboarding

Status: draft
Identity-gate sheet: connect wallet → pick a handle (live avatar) → join. Built on `Sheet`.

## Anatomy

```
┌ Sheet · "Join the tide" ───────────┐
│ ✓ wallet connected      7xKt…9fQ2  │ ← collapses once connected
│ ◐40  [ @handle        ✓ available ]│ ← live avatar + availability
│ ┌────────────────────────────────┐ │
│ │        Join the tide           │ │ ← full-width brand CTA
│ └────────────────────────────────┘ │
└──────────────────────────────────────┘
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` / `onOpenChange` | `boolean` / `(b) => void` | — | Controlled, forwarded to `Sheet`. |
| `walletAddress` | `string \| null` | — | Truthy → step 1 collapses to a checked row (shortened addr). |
| `onConnectWallet` | `() => void` | — | Shown when not connected. |
| `handle` | `string` | — | Controlled; sanitized to `[a-z0-9_]`. |
| `onHandleChange` | `(v: string) => void` | — | Availability check is the caller's job. |
| `availability` | `"idle" \| "checking" \| "available" \| "taken"` | `"idle"` | Inline indicator + gates the CTA. |
| `onJoin` | `() => void` | — | Fires only when connected + available. |

## Tokens

- Inherits `Sheet` tokens.
- `--color-surface-container` fields · `--color-outline` connect button.
- `--color-buy` (checked / available) · `--color-sell` (taken).
- `--color-brand` / `--color-on-brand` CTA · `--id-*` via the live `Avatar`.

## States

- **Wallet**: connect button ↔ collapsed checked row.
- **Handle step**: dimmed + non-interactive until connected.
- **Availability**: idle (hidden) / checking / available (buy) / taken (sell).
- **CTA**: enabled only when connected **and** available.

## Motion

Sheet slide + drag-dismiss; buttons press-scale `0.98`. Avatar updates instantly as the handle changes (no transition — identity is calm).

## A11y

- Handle input is `@`-prefixed with a real `<input>`; sanitized on change.
- CTA `disabled` communicates gating; availability is text + color, not color alone.
- Wallet address shortened for display; full value stays in caller state.
