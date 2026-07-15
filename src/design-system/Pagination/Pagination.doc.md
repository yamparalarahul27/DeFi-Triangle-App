# Pagination

Status: draft
Version: 0.9.0
Page controls for long tables — windowed numbers with ellipses.

## Usage

```tsx
import { Pagination } from "@/design-system";

const [page, setPage] = useState(1);

<Pagination page={page} count={24} onPageChange={setPage} />
```

Best for: server-paged tables and lists where users need random access
("jump to the end"). If the data is small enough to sort client-side in
a DataTable, you may not need pagination; infinite scroll suits feeds,
pagination suits tables users reference and return to.

## Anatomy

```
‹  1  …  6  7  8  …  24  ›
│  │  │  └─┬─┘       │   └ next (disabled on last)
│  │  │    └ current ±siblings
│  │  └ ellipsis (aria-hidden)
│  └ first page — always visible
└ prev (disabled on first)
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `page` | `number` | — | Current page, 1-based. |
| `count` | `number` | — | Total pages. |
| `onPageChange` | `(page: number) => void` | — | Fires for numbers and ‹/›. |
| `siblings` | `number` | `1` | Pages shown each side of current. |
| `className` | `string` | — | cn-merged onto the nav. |

## Tokens

`--surface-container-high` (hover + current fill) · `--outline`
(current ring) · `--radius-control`

## States

- **Current page**: outline ring + fill + semibold +
  `aria-current="page"` — three non-color cues.
- **Prev/next at the ends**: disabled (40% opacity, no pointer).
- **Ellipsis**: static, `aria-hidden` — never clickable.

## Motion

150ms on background/color only. Page changes re-render the window
instantly — no sliding.

## A11y

`<nav aria-label="Pagination">` with a list of real buttons — 40px hit
targets (h-10/min-w-10). Prev/next carry explicit labels ("Previous
page"/"Next page"); the current page is `aria-current="page"`.
Callback-driven: if pages are URLs in your app, wrap in links at the
call site instead.
