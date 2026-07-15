"use client";

import { Popover as RadixPopover } from "radix-ui";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Anchored floating panel on Radix Popover — Menu's free-form sibling.
 * Menu is for lists of commands; Popover holds arbitrary content
 * (filters, mini-forms, detail cards). Trigger renders asChild — pass a
 * focusable element.
 */
export function Popover({
  trigger,
  children,
  align = "start",
  side = "bottom",
  className,
}: {
  trigger: ReactNode;
  children: ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  /** Merged onto the panel. */
  className?: string;
}) {
  return (
    <RadixPopover.Root>
      <RadixPopover.Trigger asChild>{trigger}</RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          align={align}
          side={side}
          sideOffset={4}
          className={cn(
            "z-[var(--z-raised)] w-64 rounded-chip border border-outline-variant bg-surface-bright p-3 text-sm text-fg shadow-raised",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0",
            className,
          )}
        >
          {children}
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}
