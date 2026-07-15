"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BottomNavItem<T extends string> = {
  value: T;
  label: string;
  /** Glyph above the label — decorative (aria-hidden); the label names the tab. */
  icon?: ReactNode;
};

/**
 * Mobile tab bar — 3–5 top-level destinations, labels always visible.
 * Positioning is the caller's (typically `fixed inset-x-0 bottom-0`
 * via className); safe-area padding is built in.
 */
export function BottomNav<T extends string>({
  items,
  value,
  onValueChange,
  className,
}: {
  items: BottomNavItem<T>[];
  value: T;
  onValueChange: (value: T) => void;
  /** Merged onto the nav (e.g. `fixed inset-x-0 bottom-0`). */
  className?: string;
}) {
  return (
    <nav
      className={cn(
        "grid border-t border-outline-variant bg-surface-page pb-[env(safe-area-inset-bottom)]",
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            aria-current={active ? "page" : undefined}
            onClick={() => onValueChange(item.value)}
            className={cn(
              "flex h-12 flex-col items-center justify-center gap-0.5",
              "transition-[color] duration-150",
              active ? "text-brand" : "text-fg-muted hover:text-fg",
            )}
          >
            {item.icon && (
              <span aria-hidden="true" className="text-base leading-none">
                {item.icon}
              </span>
            )}
            <span className={cn("text-[10px] leading-none", active && "font-semibold")}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
