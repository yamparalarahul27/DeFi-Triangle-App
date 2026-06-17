"use client";

import type { ReactNode } from "react";

export interface TabProps {
  paused: boolean;
  onSelectPair: (pair: any) => void;
  starredSet: Set<string>;
  onStarToggle: (pair: any) => void;
}

export function TabLoading({ text = "Loading…" }: { text?: string }) {
  return <div className="py-12 text-center text-sm text-fg-muted">{text}</div>;
}

export function TabEmpty({ text = "No data available." }: { text?: string }) {
  return <div className="py-12 text-center text-sm text-fg-muted">{text}</div>;
}

export function TabGrid({
  minCardWidth = "280px",
  children,
}: {
  minCardWidth?: string;
  children: ReactNode;
}) {
  return (
    <div
      className="grid gap-3.5"
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${minCardWidth}), 1fr))`,
      }}
    >
      {children}
    </div>
  );
}

export function FilterChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((o) => {
        const active = o.key === value;
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            className={`min-h-[40px] px-3 rounded-sm text-xs font-medium transition-[background-color,color,box-shadow,transform] duration-150 active:scale-[0.96] ${
              active
                ? "bg-brand text-on-brand shadow-[0_1px_2px_rgba(4,17,15,0.40),0_4px_8px_rgba(90,216,196,0.20),0_12px_24px_rgba(90,216,196,0.12)]"
                : "bg-surface-container text-fg/60 border border-outline-variant hover:text-fg/90"
            }`}
            aria-pressed={active}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
