# Menu

Status: draft
Dropdown action menu on Radix DropdownMenu — items as data, behavior (keyboard, typeahead, dismiss) from the primitive.

## Usage

```tsx
import { Menu, IconButton } from "@/design-system";

<Menu
  trigger={<IconButton aria-label="Post actions">⋯</IconButton>}
  items={[
    { label: "Copy link", onSelect: copy },
    { kind: "separator" },
    { label: "Delete", onSelect: del, destructive: true },
  ]}
/>
```

## Anatomy

```
[trigger]
   ┌ Copy link      ┐ ← surface-bright panel, shadow-raised
   │ ───────────────│ ← separator
   │ Delete         │ ← destructive: sell text
   └────────────────┘
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `trigger` | `ReactNode` | **required** | Rendered `asChild` — must be focusable (IconButton/Button). |
| `items` | `MenuItem[]` | **required** | `{label, onSelect, destructive?, disabled?}` or `{kind:"separator"}`. |
| `align` | `"start" \| "center" \| "end"` | `"start"` | Panel alignment to the trigger. |
| `className` | `string` | — | cn-merged onto the panel. |

## Tokens

- `--surface-bright` panel · `--surface-container-high` highlight · `--outline-variant` · `--sell` (destructive item) · `--radius-chip`/`--radius-control` · `--elevation-2` via `shadow-raised` · `--z-raised`

## States

closed · open · item highlighted (pointer or arrows) · item disabled · destructive item.

## Motion

fade-in preset on open; highlight moves instantly (no per-item animation). Reduced-motion via global reset.

## A11y

- Radix DropdownMenu: arrow-key navigation, Home/End, typeahead, Escape + outside-click dismiss, focus returns to the trigger.
- Destructive items get sell text — pair genuinely destructive actions with a Dialog confirm.
