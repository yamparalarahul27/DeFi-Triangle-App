# ChainSwitcher

Status: draft
Version: 0.9.0
Active network + switch menu — NetworkBadge's interactive sibling.

## Usage

```tsx
import { ChainSwitcher } from "@/design-system";

const [chain, setChain] = useState("solana");

<ChainSwitcher
  value={chain}
  onValueChange={setChain}
  networks={[
    { id: "solana", label: "Solana", iconSrc: "https://cdn.defitriangle.xyz/network/solana.svg" },
    { id: "eclipse", label: "Eclipse" },
    { id: "sonic", label: "Sonic" },
  ]}
/>
```

Best for: multi-chain apps where the network is a user decision —
bridges, multi-chain wallets, deploy consoles. ethereum.org heuristic
#3 says *always show the connected network*; this adds "and let me
change it". Single-chain surface? Use NetworkBadge — a switcher with
one option is a lie.

## Anatomy

```
[ ◉ Solana ▾ ]        ← trigger (Select-height, icon + label)
┌──────────────┐
│ ◉ Solana   ✓ │      ← RadioItem (check = active)
│ ○ Eclipse    │
│ ○ Sonic      │
└──────────────┘      ← Menu-styled panel (surface-bright)
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `networks` | `Network[]` | — | `{ id, label, iconSrc? }` — Logobase URLs for icons; dot fallback. |
| `value` | `string` | — | Active network id. |
| `onValueChange` | `(id: string) => void` | — | Fire your adapter's switch here. |
| `disabled` | `boolean` | — | E.g. while a transaction is pending. |
| `className` | `string` | — | Merged onto the trigger. |

## Tokens

`--surface-container`/`-high` (trigger) · `--surface-bright` (panel) ·
`--outline-variant` · `--brand` (check) · `--z-raised` · `--shadow-raised`

## States

- **Closed**: trigger shows the active network — always visible.
- **Open**: radio list; the active item carries the brand ✓.
- **Disabled**: 40% opacity — disable during pending transactions so
  users can't switch mid-sign.

## Motion

Panel fades via `animate-in fade-in-0` (Menu's preset). The trigger
label swaps instantly on selection — network changes must read as
immediate facts.

## A11y

Radix DropdownMenu radio semantics: trigger has `aria-haspopup` +
`aria-expanded` and an explicit label naming the current network;
items are `role="menuitemradio"` with `aria-checked`; typeahead and
arrow keys work. Icons are decorative — labels carry the meaning.
