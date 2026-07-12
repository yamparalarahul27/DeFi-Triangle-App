"use client";

import { cn } from "@/lib/utils";

export type LaneOption<T extends string> = { value: T; label: string };

// Active-segment glow: dark drop + brand halo derived from --brand (color-mix,
// not a hardcoded mint rgb), per the tide LaneToggle spec.
const ACTIVE_SHADOW =
  "0 1px 2px rgba(4,17,15,0.4), 0 4px 8px color-mix(in srgb, var(--brand) 20%, transparent)";
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
  return (
    <div
      role="tablist"
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
