"use client";

import { Select as RadixSelect } from "radix-ui";
import { cn } from "@/lib/utils";

export type SelectOption<T extends string> = {
  value: T;
  label: string;
  disabled?: boolean;
};

/**
 * Single-value select on Radix Select: typeahead, arrow keys, form-safe.
 * Trigger matches Input's md height; label it from the caller.
 */
export function Select<T extends string>({
  options,
  value,
  onValueChange,
  placeholder = "Select…",
  disabled,
  className,
  "aria-label": ariaLabel,
}: {
  options: SelectOption<T>[];
  value: T | undefined;
  onValueChange: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Merged onto the trigger. */
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <RadixSelect.Trigger
        aria-label={ariaLabel}
        className={cn(
          "flex h-9 w-full items-center justify-between gap-2 rounded-control border border-outline-variant bg-surface-container px-3 text-sm text-fg",
          "transition-[border-color] duration-150 data-[placeholder]:text-fg-subtle",
          "disabled:pointer-events-none disabled:opacity-40",
          className,
        )}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon className="text-fg-subtle">▾</RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={4}
          className="z-[var(--z-raised)] min-w-[var(--radix-select-trigger-width)] rounded-chip border border-outline-variant bg-surface-bright p-1 shadow-raised"
        >
          <RadixSelect.Viewport>
            {options.map((o) => (
              <RadixSelect.Item
                key={o.value}
                value={o.value}
                disabled={o.disabled}
                className={cn(
                  "flex cursor-default select-none items-center justify-between rounded-control px-2.5 py-1.5 text-xs text-fg outline-none",
                  "data-[highlighted]:bg-surface-container-high data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
                )}
              >
                <RadixSelect.ItemText>{o.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator className="text-brand">✓</RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
