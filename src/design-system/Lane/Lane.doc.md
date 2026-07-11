# Lane

Status: draft
Segmented control (e.g. Following / Everyone). Fill is the state — no underline.

## Anatomy

```
┌ surface-container, r-2, p-3, border outline-variant ┐
│ ┌──────────┐  ┌──────────┐                          │
│ │Following │  │ Everyone │  ← active: bg-brand +     │
│ └──────────┘  └──────────┘    on-brand + mint glow;  │
│   active         inactive     inactive: fg-muted     │
└──────────────────────────────────────────────────────┘
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `options` | `LaneOption<T>[]` | — | `{ value, label }`. Generic `T extends string` keeps `value`/`onChange` type-safe. |
| `value` | `T` | — | Controlled selected value. |
| `onChange` | `(value: T) => void` | — | Fired on segment tap. |
| `className` | `string` | — | Merged via `cn`. |

## Tokens

- `--color-surface-container`, `--color-outline-variant` — the track.
- `--color-brand`, `--color-on-brand` — active segment fill + text.
- `--color-fg-muted` — inactive label.
- `--motion-fast` — bg / color / shadow transition.
- Active glow derives from `--brand` via `color-mix` (no hardcoded mint rgb).

## States

- **Active** — `bg-brand text-on-brand` + brand glow shadow.
- **Inactive** — `text-fg-muted`, transparent.
- **Press** — `scale(0.98)`.

## Motion

`--motion-fast` (150ms) on background-color / color / box-shadow as selection moves. Reduced-motion: neutralized by the global reset.

## A11y

- `role="tablist"` + `role="tab"` + `aria-selected` per segment.
- Segment height 36px; the 6px padded track gives a ~42px tap target.
- State is conveyed by fill + text color together, not color alone.
