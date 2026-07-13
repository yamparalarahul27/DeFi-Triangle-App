"use client";

import { Checkbox as RadixCheckbox } from "radix-ui";
import { cn } from "@/lib/utils";

/** Checkbox on Radix — label it from the caller (htmlFor / aria-label). */
export function Checkbox({
  checked,
  onCheckedChange,
  disabled,
  className,
  ...rest
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
} & Omit<React.ComponentProps<typeof RadixCheckbox.Root>, "checked" | "onCheckedChange">) {
  return (
    <RadixCheckbox.Root
      checked={checked}
      onCheckedChange={(v) => onCheckedChange(v === true)}
      disabled={disabled}
      className={cn(
        "flex h-4 w-4 items-center justify-center rounded-control border",
        "transition-[background-color,border-color] duration-150",
        "data-[state=checked]:border-brand data-[state=checked]:bg-brand",
        "data-[state=unchecked]:border-outline data-[state=unchecked]:bg-surface-container",
        "disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
      {...rest}
    >
      <RadixCheckbox.Indicator className="text-[10px] font-bold leading-none text-on-brand">
        ✓
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
}
