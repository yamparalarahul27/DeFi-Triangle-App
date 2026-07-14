# Skeleton

Status: stable
Version: 1.0.0
Shimmering placeholder for content that is still loading — a block (`Skeleton`) and a labelled card-shaped region (`SectionSkeleton`).

## Usage

```tsx
import { Skeleton, SectionSkeleton } from "@/design-system";

<Skeleton className="h-4 w-2/3" />
<SectionSkeleton height={160} label="Stats" />
```

## Anatomy

```
┌ SectionSkeleton (rounded-card) ─┐
│ LABEL (uppercase, fg-muted)     │
│ ▬▬▬▬▬▬▬▬▬▬▬  ← Skeleton rows   │
│ ▬▬▬▬▬▬▬                        │
│ ▬▬▬▬▬▬▬▬▬                      │
└─────────────────────────────────┘
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `className` | `string` | — | cn-merged; shape the block with `w-*`/`h-*`. |
| `style` | `CSSProperties` | — | Escape hatch for computed dimensions. |
| `height` | `number` | — | SectionSkeleton only — `minHeight` in px, matches the loaded card to prevent layout shift. |
| `label` | `string` | — | SectionSkeleton only — section name; becomes the aria-label. |

## Tokens

- `--surface-container-high` (shimmer block) · `--surface-container` + `--outline-variant` (section card)
- `--radius-control` (block) · `--radius-card` (section)

## States

- Static shimmer via `animate-pulse` — there is no interactive state.
- SectionSkeleton announces itself with `aria-busy="true"`.

## Motion

- `animate-pulse` opacity shimmer only; collapses under
  `prefers-reduced-motion` via the global reset (no per-component code).

## A11y

- `Skeleton` is `aria-hidden` — screen readers skip decorative shimmer.
- `SectionSkeleton` carries `aria-busy` + an `aria-label` ("<label> loading")
  so the loading region is announced once, not per row.
