"use client";

import type { ReactNode } from "react";

export interface TabProps {
  paused: boolean;
  onSelectPair: (pair: any) => void;
  starredSet: Set<string>;
  onStarToggle: (pair: any) => void;
}

export function TabLoading({ text = "Loading…" }: { text?: string }) {
  return <div className="py-12 text-center text-sm text-[#6a7282]">{text}</div>;
}

export function TabEmpty({ text = "No data available." }: { text?: string }) {
  return <div className="py-12 text-center text-sm text-[#6a7282]">{text}</div>;
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
            className={`min-h-[36px] px-3 rounded-sm text-xs font-medium transition-all duration-150 ${
              active
                ? "bg-[#19549b] text-white shadow-[0_2px_8px_rgba(25,84,155,0.25)]"
                : "bg-white text-[#11274d]/60 border border-[#cbd5e1] hover:text-[#11274d]/90"
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
