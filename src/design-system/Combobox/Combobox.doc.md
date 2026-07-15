# Combobox

Status: draft
Version: 0.9.0
Typeahead select — an input that filters a listbox as you type. Pick-from-list only.

## Usage

```tsx
import { Combobox } from "@/design-system";

const [token, setToken] = useState<string>();

<Combobox
  aria-label="Search tokens"
  placeholder="Search tokens…"
  value={token}
  onValueChange={setToken}
  options={[
    { value: "sol", label: "SOL", hint: "$184.26" },
    { value: "jup", label: "JUP", hint: "$0.8123" },
    { value: "bonk", label: "BONK", hint: "$0.00002314" },
  ]}
/>
```

Best for: one-of-N where the list is worth searching — token pickers,
market search, wallet selection. Select is for short closed lists
(≤ ~10); Combobox earns its keyboard once scanning beats scrolling.
The value is always a known option — free text never sticks (dismiss
reverts the input to the selected label), so consumers never validate.

## Anatomy

```
┌ Search tokens…          ┐ ← input (role=combobox, Input's look)
├─────────────────────────┤
│ SOL              $184.26│ ← option (label · hint)
│ JUP              $0.8123│ ← active: surface-container-high
└─────────────────────────┘ ← listbox, trigger-width, max-h + scroll
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `options` | `ComboboxOption<T>[]` | — | `{ value, label, hint?, disabled? }`. |
| `value` | `T \| undefined` | — | Controlled; always a known option. |
| `onValueChange` | `(value: T) => void` | — | |
| `placeholder` | `string` | `"Search…"` | |
| `emptyText` | `string` | `"No matches"` | Zero-match message. |
| `disabled` | `boolean` | — | |
| `aria-label` | `string` | — | Names input + listbox when no visible label. |
| `className` | `string` | — | Merged onto the input. |

## Tokens

`--surface-container` (input) · `--surface-bright` (panel) ·
`--surface-container-high` (active option) · `--outline`/`--outline-variant` ·
`--radius-control`/`--radius-chip` · `--z-raised` · `--shadow-raised`

## States

- **Closed**: input shows the selected label (or placeholder).
- **Open + filtering**: typing filters (case-insensitive contains);
  the active option tracks arrows/hover.
- **Zero matches**: `emptyText` row — never an empty void.
- **Dismissed without selecting**: input reverts to the selected label.
- **Disabled** (input or per-option): 40% opacity.

## Motion

Panel fades in via `animate-in fade-in-0` (150ms). Filtering re-renders
instantly — no list animation; search must feel wired to the keys.

## A11y

ARIA 1.2 combobox, hand-rolled (no cmdk — keeps the component
registry-portable): input carries `role="combobox"`,
`aria-expanded`, `aria-controls`, `aria-autocomplete="list"`, and
`aria-activedescendant` pointing at the active option; options are
`role="option"` with `aria-selected`. Focus never leaves the input —
arrows move the active option, Enter selects, Escape closes, Tab
closes and moves on. Options use `onMouseDown.preventDefault()` so
clicking never blurs the input mid-selection.
