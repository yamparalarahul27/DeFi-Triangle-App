# Input

Status: stable
Single-line text field on the container surface; `invalid` wires the error state.

## Usage

```tsx
import { Input } from "@/design-system";

<Input placeholder="Search tokens…" />
<Input invalid value={handle} onChange={…} aria-describedby="handle-err" />
```

## Anatomy

```
┌ placeholder / value ────────┐
└─────────────────────────────┘ ← container bg, hairline border,
                                  sell border when invalid
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Heights 28 / 36 / 44 px (shared scale). |
| `invalid` | `boolean` | `false` | Sets `aria-invalid` + sell border. Put the error text next to the field and link via `aria-describedby`. |
| `className` | `string` | — | cn-merged. |
| …rest | `InputHTMLAttributes` | — | Native pass-through (value, onChange, type…). |

## Tokens

- `--surface-container` · `--outline-variant`/`--outline` (rest/focus border) · `--sell` (invalid) · `--fg-subtle` (placeholder) · `--radius-control`

## States

rest · focus (border lifts to `--outline` + global focus-visible ring) · invalid · disabled (`opacity-40`).

## Motion

Border/background transition 150ms, targeted properties only.

## A11y

- Always label it: visible `<label htmlFor>` or `aria-label` from the caller.
- `invalid` sets `aria-invalid`; pair with a visible message via `aria-describedby` — errors appear next to where the action happens.
- Paste is never blocked.
