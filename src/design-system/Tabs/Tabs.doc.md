# Tabs

Status: stable
Version: 1.0.0
Lane generalized: the same segmented control, with Radix Tabs panels + keyboard.

## Usage

```tsx
import { Tabs } from "@/design-system";

<Tabs value={tab} onValueChange={setTab} tabs={[
  { value: "news", label: "News", content: <NewsList /> },
  { value: "kpis", label: "KPIs", content: <KpiGrid /> },
]} />
```

## Anatomy

```
[ News ][ KPIs ]   <- Lane-style segmented list
+----------------+
| active panel   | <- Radix Content, pt-3
+----------------+
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `tabs` | `Tab<T>[]` | -- | `{value,label,content}`. |
| `value` / `onValueChange` | controlled pair | -- | |
| `className` | `string` | -- | cn-merged onto the root. |

Use **Lane** for a pure value switch (no panels); **Tabs** when segments own content.

## Tokens

- Same as Lane: `--brand`/`--on-brand` active, `--glow-brand`, `--surface-container` track, `--radius-control`, `--motion-fast`

## States

active/inactive segment - focus-visible - panel switches with value.

## Motion

Segment transition on `--motion-fast` (bg/color/shadow); panels swap instantly.

## A11y

- Radix Tabs: `tablist`/`tab`/`tabpanel` wiring, roving tabindex, arrow keys, `aria-controls` for free.
