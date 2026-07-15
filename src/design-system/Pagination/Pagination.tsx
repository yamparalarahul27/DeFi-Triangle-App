"use client";

import { cn } from "@/lib/utils";

// Page window: first + last always visible, `siblings` pages around the
// current one, ellipses where ranges collapse.
function pageWindow(page: number, count: number, siblings: number): (number | "…l" | "…r")[] {
  const start = Math.max(2, page - siblings);
  const end = Math.min(count - 1, page + siblings);
  const out: (number | "…l" | "…r")[] = [1];
  if (start > 2) out.push("…l");
  for (let i = start; i <= end; i++) out.push(i);
  if (end < count - 1) out.push("…r");
  if (count > 1) out.push(count);
  return out;
}

/**
 * Page controls for long tables/lists. Callback-driven (buttons, not
 * links) — wire `onPageChange` to your data layer or router. `page` is
 * 1-based.
 */
export function Pagination({
  page,
  count,
  onPageChange,
  siblings = 1,
  className,
}: {
  /** Current page, 1-based. */
  page: number;
  /** Total pages. */
  count: number;
  onPageChange: (page: number) => void;
  /** Pages shown on each side of the current one. */
  siblings?: number;
  className?: string;
}) {
  const cell =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-control px-1 text-xs transition-[background-color,color] duration-150";
  return (
    <nav aria-label="Pagination" className={className}>
      <ul className="flex items-center gap-1">
        <li>
          <button
            type="button"
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className={cn(cell, "text-fg-muted hover:bg-surface-container-high hover:text-fg disabled:pointer-events-none disabled:opacity-40")}
          >
            ‹
          </button>
        </li>
        {pageWindow(page, count, siblings).map((p) =>
          typeof p === "number" ? (
            <li key={p}>
              <button
                type="button"
                aria-current={p === page ? "page" : undefined}
                onClick={() => onPageChange(p)}
                className={cn(
                  cell,
                  p === page
                    ? "border border-outline bg-surface-container-high font-semibold text-fg"
                    : "text-fg-muted hover:bg-surface-container-high hover:text-fg",
                )}
              >
                {p}
              </button>
            </li>
          ) : (
            <li key={p} aria-hidden="true" className={cn(cell, "text-fg-subtle")}>
              …
            </li>
          ),
        )}
        <li>
          <button
            type="button"
            aria-label="Next page"
            disabled={page >= count}
            onClick={() => onPageChange(page + 1)}
            className={cn(cell, "text-fg-muted hover:bg-surface-container-high hover:text-fg disabled:pointer-events-none disabled:opacity-40")}
          >
            ›
          </button>
        </li>
      </ul>
    </nav>
  );
}
