"use client";

import { Accordion as RadixAccordion } from "radix-ui";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type AccordionItem = {
  value: string;
  title: string;
  content: ReactNode;
};

/**
 * Collapsible sections on Radix Accordion — keyboard (arrows/Home/End),
 * ARIA wiring, and height animation for free. `type="single"` (default,
 * collapsible) is the FAQ shape; `type="multiple"` lets panels coexist
 * (transaction breakdowns, advanced settings).
 */
export function Accordion({
  items,
  type = "single",
  className,
}: {
  items: AccordionItem[];
  type?: "single" | "multiple";
  /** Merged onto the root. */
  className?: string;
}) {
  const shared = {
    className: cn(
      "divide-y divide-outline-variant rounded-card border border-outline-variant bg-surface-container",
      className,
    ),
  };
  const children = items.map((item) => (
    <RadixAccordion.Item key={item.value} value={item.value}>
      <RadixAccordion.Header>
        <RadixAccordion.Trigger
          className={cn(
            "group flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-fg",
            "transition-[background-color] duration-150 hover:bg-surface-container-high",
          )}
        >
          {item.title}
          <span
            aria-hidden="true"
            className="text-fg-subtle transition-transform duration-150 group-data-[state=open]:rotate-180"
          >
            ▾
          </span>
        </RadixAccordion.Trigger>
      </RadixAccordion.Header>
      <RadixAccordion.Content
        className={cn(
          "overflow-hidden text-sm text-fg-muted",
          "data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up",
        )}
      >
        <div className="px-4 pb-4 pt-1">{item.content}</div>
      </RadixAccordion.Content>
    </RadixAccordion.Item>
  ));

  return type === "single" ? (
    <RadixAccordion.Root type="single" collapsible {...shared}>
      {children}
    </RadixAccordion.Root>
  ) : (
    <RadixAccordion.Root type="multiple" {...shared}>
      {children}
    </RadixAccordion.Root>
  );
}
