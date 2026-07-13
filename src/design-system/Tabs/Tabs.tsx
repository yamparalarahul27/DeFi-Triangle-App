"use client";

import { Tabs as RadixTabs } from "radix-ui";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Tab<T extends string> = {
  value: T;
  label: string;
  content: ReactNode;
};

// Lane, generalized (roadmap Phase 4): the same segmented control visual,
// with Radix Tabs supplying panels, aria wiring, and roving-tabindex
// keyboard behavior. Use Lane when there are no panels (a pure value
// switch); use Tabs when each segment owns content.
const ACTIVE_SHADOW = "var(--glow-brand)";

export function Tabs<T extends string>({
  tabs,
  value,
  onValueChange,
  className,
}: {
  tabs: Tab<T>[];
  value: T;
  onValueChange: (value: T) => void;
  /** Merged onto the root (list + panels wrapper). */
  className?: string;
}) {
  return (
    <RadixTabs.Root
      value={value}
      onValueChange={(v) => onValueChange(v as T)}
      className={className}
    >
      <RadixTabs.List className="inline-flex gap-1 rounded-control border border-outline-variant bg-surface-container p-[3px]">
        {tabs.map((t) => (
          <RadixTabs.Trigger
            key={t.value}
            value={t.value}
            style={{
              transition:
                "background-color var(--motion-fast), color var(--motion-fast), box-shadow var(--motion-fast)",
              boxShadow: t.value === value ? ACTIVE_SHADOW : "none",
            }}
            className={cn(
              "inline-flex h-9 items-center rounded-control px-3.5 text-xs font-medium active:scale-[0.98]",
              "data-[state=active]:bg-brand data-[state=active]:text-on-brand",
              "data-[state=inactive]:text-fg-muted",
            )}
          >
            {t.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {tabs.map((t) => (
        <RadixTabs.Content
          key={t.value}
          value={t.value}
          className="pt-3 outline-none"
        >
          {t.content}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  );
}
