"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

export type LaneOption<T extends string> = { value: T; label: string };

// Active-segment glow: the tokenized brand halo (--glow-brand, defined in
// globals.css where it derives from --brand via color-mix — never a
// hardcoded mint rgb), per the tide LaneToggle spec.
const ACTIVE_SHADOW = "var(--glow-brand)";
const SEGMENT_TRANSITION =
  "background-color var(--motion-fast), color var(--motion-fast), box-shadow var(--motion-fast)";

export function Lane<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: LaneOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  const listRef = useRef<HTMLDivElement | null>(null);

  // Roving tabindex (WAI-ARIA tabs pattern): only the active segment is
  // tabbable; Arrow/Home/End move selection AND focus.
  const onKeyDown = (e: React.KeyboardEvent) => {
    const idx = options.findIndex((o) => o.value === value);
    let next = -1;
    if (e.key === "ArrowRight") next = (idx + 1) % options.length;
    else if (e.key === "ArrowLeft") next = (idx - 1 + options.length) % options.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = options.length - 1;
    if (next === -1) return;
    e.preventDefault();
    onChange(options[next].value);
    const tabs = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabs?.[next]?.focus();
  };

  return (
    <div
      role="tablist"
      ref={listRef}
      onKeyDown={onKeyDown}
      className={cn(
        "inline-flex gap-1 rounded-control border border-outline-variant bg-surface-container p-[3px]",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(opt.value)}
            style={{
              transition: SEGMENT_TRANSITION,
              boxShadow: active ? ACTIVE_SHADOW : "none",
            }}
            className={cn(
              "inline-flex h-9 items-center rounded-control px-3.5 text-xs font-medium active:scale-[0.98]",
              active ? "bg-brand text-on-brand" : "text-fg-muted",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
