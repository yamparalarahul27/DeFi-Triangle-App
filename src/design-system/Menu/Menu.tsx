"use client";

import { DropdownMenu as RadixMenu } from "radix-ui";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type MenuItem =
  | { kind?: "item"; label: string; onSelect: () => void; destructive?: boolean; disabled?: boolean }
  | { kind: "separator" };

/**
 * Dropdown menu. Behavior is Radix DropdownMenu: typeahead, arrow-key
 * navigation, Escape/outside-click dismiss, focus return to the trigger.
 * Trigger renders asChild — pass a focusable element (e.g. IconButton).
 */
export function Menu({
  trigger,
  items,
  align = "start",
  className,
}: {
  trigger: ReactNode;
  items: MenuItem[];
  align?: "start" | "center" | "end";
  /** Merged onto the menu panel. */
  className?: string;
}) {
  return (
    <RadixMenu.Root>
      <RadixMenu.Trigger asChild>{trigger}</RadixMenu.Trigger>
      <RadixMenu.Portal>
        <RadixMenu.Content
          align={align}
          sideOffset={4}
          className={cn(
            "z-[var(--z-raised)] min-w-40 rounded-chip border border-outline-variant bg-surface-bright p-1 shadow-raised",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0",
            className,
          )}
        >
          {items.map((item, i) =>
            item.kind === "separator" ? (
              <RadixMenu.Separator
                key={i}
                className="mx-1 my-1 h-px bg-outline-variant"
              />
            ) : (
              <RadixMenu.Item
                key={i}
                disabled={item.disabled}
                onSelect={item.onSelect}
                className={cn(
                  "flex cursor-default select-none items-center rounded-control px-2.5 py-1.5 text-xs outline-none",
                  "data-[highlighted]:bg-surface-container-high data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
                  item.destructive ? "text-sell" : "text-fg",
                )}
              >
                {item.label}
              </RadixMenu.Item>
            ),
          )}
        </RadixMenu.Content>
      </RadixMenu.Portal>
    </RadixMenu.Root>
  );
}
