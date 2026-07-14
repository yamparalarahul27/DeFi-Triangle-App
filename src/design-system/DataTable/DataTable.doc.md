# DataTable

Status: stable
Version: 1.0.0
Terminal-grade table: real table semantics, sticky header, aria-sort client sorting, density-token row grid.

## Usage

```tsx
import { DataTable, type Column } from "@/design-system";

const cols: Column<Row>[] = [
  { key: "sym", header: "Token", cell: (r) => r.sym, sortable: true, sortValue: (r) => r.sym },
  { key: "px", header: "Price", align: "right", sortable: true, cell: (r) => fmtUsd(r.px), sortValue: (r) => r.px },
];

<DataTable columns={cols} rows={rows} rowKey={(r) => r.sym} caption="Markets" maxHeight="20rem" />
```

## Anatomy

```
TOKEN        PRICE ▾   <- sticky thead, sort buttons, aria-sort
-------------------------
JUP        $0.8123      <- row-h/cell-px from density tokens
SOL      $184.26        <- numeric: right + data-md + tabular
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `columns` | `Column<T>[]` | -- | `{key, header, cell, align?, sortable?, sortValue?, width?}`. |
| `rows` | `T[]` | -- | Data. |
| `rowKey` | `(row) => string` | -- | Stable identity (streaming-safe). |
| `caption` | `string` | -- | Visually-hidden table name (required). |
| `maxHeight` | `string` | -- | Scroll container + sticky header. |
| `className` | `string` | -- | cn-merged onto the frame. |

**Virtualization recipe:** not shipped by design (no reference system ships it). Past ~200 streaming rows, wrap rows with TanStack Virtual: keep this table for layout/semantics, virtualize `<tbody>` children, preserve `rowKey` stability.

## Tokens

- `--row-h` + `--cell-px` (THE density consumers) - `--surface-container(-high)` - `--outline-variant` - `--radius-card` - data ramp on numeric cells

## States

header sort: none -> desc -> asc -> none - row hover - scrolled (sticky header).

## Motion

Row hover + sort-header color, 150ms targeted. Nothing animates on data ticks (zero layout shift is the contract).

## A11y

- Real `<table>`/`<th scope=col>`/`<caption>` semantics.
- `aria-sort` reflects the active column; sort controls are real buttons.
- Numeric right-alignment + tabular-nums keep figures scannable.
