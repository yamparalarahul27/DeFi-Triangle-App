# Popover

Status: draft
Version: 0.9.0
Anchored floating panel on Radix Popover — free-form content near its trigger.

## Usage

```tsx
import { Popover, Button, Switch } from "@/design-system";

<Popover trigger={<Button variant="secondary" size="sm">Filters</Button>}>
  <p className="mb-2 font-medium">Show</p>
  {/* any content — filters, mini-forms, detail cards */}
</Popover>
```

Best for: light contextual UI that belongs *next to* its trigger —
filter panels, column pickers, inline detail cards. Menu is for lists
of commands; Dialog/Drawer are for tasks that deserve a surface;
Tooltip is text-only. Popover is the free-form middle.

## Anatomy

```
[ Filters ]        ← trigger (asChild — pass a focusable element)
┌────────────────┐
│ panel (w-64,   │ ← surface-bright, chip radius,
│ children)      │   raised shadow, z-raised
└────────────────┘
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `trigger` | `ReactNode` | — | Rendered asChild — must be focusable. |
| `children` | `ReactNode` | — | Panel content. |
| `align` | `"start" \| "center" \| "end"` | `"start"` | |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | `"bottom"` | |
| `className` | `string` | — | Merged onto the panel (e.g. `w-80`). |

## Tokens

`--surface-bright` · `--outline-variant` · `--radius-chip` ·
`--z-raised` · `--shadow-raised`

## States

- **Closed** (default): trigger only.
- **Open**: `data-state="open"` on the panel; outside-click, Escape,
  or re-clicking the trigger closes it.

## Motion

Panel fades in via the `animate-in fade-in-0` preset (150ms). No exit
animation — dismissal is instant by design (same as Menu).

## A11y

Radix wiring: trigger gets `aria-haspopup="dialog"` + `aria-expanded`;
focus moves into the panel on open and returns to the trigger on close;
Escape dismisses. Don't put critical-path actions *only* inside a
popover — it's an enhancement surface.
