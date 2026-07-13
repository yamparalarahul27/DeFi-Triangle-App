"use client";

import { useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Column<T> = {
  key: string;
  header: string;
  /** Numeric columns: right-align + tabular pixel font. */
  align?: "left" | "right";
  sortable?: boolean;
  /** Cell renderer; also the sort accessor when it returns a primitive. */
  cell: (row: T) => ReactNode;
  /** Sort accessor when `cell` renders rich nodes. */
  sortValue?: (row: T) => string | number;
  width?: string;
};

type Sort = { key: string; dir: "asc" | "desc" } | null;

/**
 * The terminal-grade table: real <table> semantics, sticky header,
 * client sort with aria-sort, numeric alignment discipline. Row height
 * and cell padding ride the density tokens (--row-h / --cell-px) — the
 * compact axis retunes every row with zero component changes.
 *
 * Virtualization is deliberately not shipped (no reference system ships
 * it either); for streaming lists beyond ~200 rows pair with TanStack
 * Virtual — recipe in the doc.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  caption,
  maxHeight,
  className,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** Screen-reader table name (visually hidden). */
  caption: string;
  /** Enables the scroll container + sticky header (e.g. "20rem"). */
  maxHeight?: string;
  className?: string;
}) {
  const [sort, setSort] = useState<Sort>(null);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return rows;
    const val = (r: T) => col.sortValue?.(r) ?? (col.cell(r) as string | number);
    return [...rows].sort((a, b) => {
      const [x, y] = [val(a), val(b)];
      const cmp =
        typeof x === "number" && typeof y === "number"
          ? x - y
          : String(x).localeCompare(String(y));
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [rows, sort, columns]);

  const toggle = (key: string) =>
    setSort((s) =>
      s?.key !== key
        ? { key, dir: "desc" }
        : s.dir === "desc"
          ? { key, dir: "asc" }
          : null,
    );

  return (
    <div
      className={cn(
        "rounded-card border border-outline-variant bg-surface-container",
        maxHeight && "overflow-y-auto",
        className,
      )}
      style={maxHeight ? { maxHeight } : undefined}
    >
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="sticky top-0 z-[var(--z-base)] bg-surface-container">
          <tr className="border-b border-outline-variant">
            {columns.map((c) => {
              const active = sort?.key === c.key;
              const ariaSort = !c.sortable
                ? undefined
                : active
                  ? sort!.dir === "asc"
                    ? ("ascending" as const)
                    : ("descending" as const)
                  : ("none" as const);
              return (
                <th
                  key={c.key}
                  scope="col"
                  aria-sort={ariaSort}
                  style={{ width: c.width, padding: "0 var(--cell-px)", height: "var(--row-h)" }}
                  className={cn(
                    "whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider text-fg-subtle",
                    c.align === "right" ? "text-right" : "text-left",
                  )}
                >
                  {c.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggle(c.key)}
                      className={cn(
                        "inline-flex items-center gap-1 uppercase transition-colors duration-150 hover:text-fg",
                        active && "text-fg",
                      )}
                    >
                      {c.header}
                      <span aria-hidden="true" className="w-2">
                        {active ? (sort!.dir === "desc" ? "▾" : "▴") : ""}
                      </span>
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr
              key={rowKey(row)}
              className="border-b border-outline-variant transition-colors duration-150 last:border-b-0 hover:bg-surface-container-high"
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  style={{ padding: "0 var(--cell-px)", height: "var(--row-h)" }}
                  className={cn(
                    "whitespace-nowrap",
                    c.align === "right"
                      ? "data-md text-right tabular-nums text-fg"
                      : "text-left text-fg",
                  )}
                >
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
