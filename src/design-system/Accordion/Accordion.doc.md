# Accordion

Status: draft
Version: 0.9.0
Collapsible sections on Radix Accordion — one open (default) or many.

## Usage

```tsx
import { Accordion } from "@/design-system";

<Accordion
  items={[
    { value: "fees", title: "Fees", content: <p>0.25% taker · 0.10% maker</p> },
    { value: "route", title: "Route details", content: <p>SOL → USDC via Jupiter</p> },
  ]}
/>

<Accordion type="multiple" items={items} />
```

Best for: progressive disclosure of secondary detail — FAQ blocks, fee
breakdowns, advanced settings, transaction route details. `single`
(default, collapsible) keeps the reading focused; `multiple` when
sections are independent and users compare across them. Don't bury
primary content in an accordion — if users always open it, it shouldn't
collapse.

## Anatomy

```
┌─ Fees ────────────────── ▾ ┐ ← Trigger (h-min 44px, chevron
├────────────────────────────┤    rotates 180° when open)
│ 0.25% taker · 0.10% maker  │ ← Content (height-animated)
├─ Route details ────────  ▾ ┤
└────────────────────────────┘ ← items divided by outline-variant
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` | `AccordionItem[]` | — | `{ value, title, content }` per section. |
| `type` | `"single" \| "multiple"` | `"single"` | Single is collapsible (all can close). |
| `className` | `string` | — | cn-merged onto the root. |

## Tokens

`--surface-container` · `--surface-container-high` (trigger hover) ·
`--outline-variant` · `--radius-card` · `--motion-settle`

## States

- **Closed** (default): title row only, chevron down.
- **Open**: `data-state="open"` — content revealed, chevron rotated 180°.
- **Hover** (trigger): surface raises to `surface-container-high`.

## Motion

Open/close animates height via `--radix-accordion-content-height`
(settle curve, ~180ms); the chevron rotates over 150ms. Neutralized by
`prefers-reduced-motion`.

## A11y

Radix wiring: triggers are real buttons with `aria-expanded` +
`aria-controls`; panels are regions labelled by their trigger. Keyboard:
↑/↓ move between triggers, Home/End jump, Enter/Space toggle. The
chevron is `aria-hidden` — state is conveyed by `aria-expanded`, not the
glyph.
