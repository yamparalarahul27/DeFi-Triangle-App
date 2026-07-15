# Breadcrumbs

Status: draft
Version: 0.9.0
Path navigation — where am I, with links back up the tree.

## Usage

```tsx
import { Breadcrumbs } from "@/design-system";

<Breadcrumbs
  items={[
    { label: "Design", href: "/design" },
    { label: "Components", href: "/design#components" },
    { label: "Accordion" }, // current page — no href
  ]}
/>
```

Best for: hierarchical surfaces ≥3 levels deep — docs, console/settings
trees, registry browsers. A two-level app doesn't need breadcrumbs; a
back button in the AppBar is clearer.

## Anatomy

```
Design / Components / Accordion
└link────┘└link─────┘ └current (aria-current,
     └ "/" separators     text-fg, no link)
        (aria-hidden)
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` | `Crumb[]` | — | `{ label, href? }`; last item is the current page. |
| `className` | `string` | — | cn-merged onto the nav. |

## Tokens

`--fg` (current) · `--fg-muted` (links) · `--fg-subtle` (separators)

## States

- **Link crumbs**: `fg-muted`, hover raises to `fg`.
- **Current page** (last item): `fg` + medium weight +
  `aria-current="page"`, not a link.
- Long labels truncate; the list wraps on narrow screens.

## Motion

150ms color on link hover only.

## A11y

`<nav aria-label="Breadcrumb">` wrapping an ordered list — order is the
hierarchy. Separators are `aria-hidden` (screen readers read the list
structure, not the slashes). Renders plain anchors for portability —
document-level navigation works in any framework.
