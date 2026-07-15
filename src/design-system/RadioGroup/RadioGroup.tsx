"use client";

import { RadioGroup as RadixRadioGroup } from "radix-ui";
import { cn } from "@/lib/utils";

export type RadioOption<T extends string> = {
  value: T;
  label: string;
  /** Optional supporting line under the label. */
  description?: string;
  disabled?: boolean;
};

/**
 * Single-choice list on Radix RadioGroup — roving tabindex, arrow-key
 * movement, form-safe. Use when all options should be visible at once
 * (≤5, e.g. slippage presets, network selection); past that reach for
 * Select.
 */
export function RadioGroup<T extends string>({
  options,
  value,
  onValueChange,
  disabled,
  className,
  "aria-label": ariaLabel,
}: {
  options: RadioOption<T>[];
  value: T | undefined;
  onValueChange: (value: T) => void;
  disabled?: boolean;
  /** Merged onto the root. */
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <RadixRadioGroup.Root
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn("flex flex-col gap-1", className)}
    >
      {options.map((opt) => (
        <label
          key={opt.value}
          className={cn(
            "flex min-h-10 cursor-pointer items-start gap-3 rounded-control px-2 py-2",
            "transition-[background-color] duration-150 hover:bg-surface-container-high",
            "has-[[data-disabled]]:pointer-events-none has-[[data-disabled]]:opacity-40",
          )}
        >
          <RadixRadioGroup.Item
            value={opt.value}
            disabled={opt.disabled}
            className={cn(
              "mt-0.5 h-4 w-4 flex-none rounded-full border border-outline",
              "transition-[border-color,background-color] duration-150",
              "data-[state=checked]:border-brand",
            )}
          >
            <RadixRadioGroup.Indicator className="flex h-full w-full items-center justify-center">
              <span className="h-2 w-2 rounded-full bg-brand" />
            </RadixRadioGroup.Indicator>
          </RadixRadioGroup.Item>
          <span className="min-w-0">
            <span className="block text-sm text-fg">{opt.label}</span>
            {opt.description && (
              <span className="block text-xs text-fg-muted">{opt.description}</span>
            )}
          </span>
        </label>
      ))}
    </RadixRadioGroup.Root>
  );
}
