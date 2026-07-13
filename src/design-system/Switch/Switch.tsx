"use client";

import { Switch as RadixSwitch } from "radix-ui";
import { cn } from "@/lib/utils";

/** On/off toggle on Radix Switch — label it from the caller. */
export function Switch({
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
} & Omit<React.ComponentProps<typeof RadixSwitch.Root>, "checked" | "onCheckedChange">) {
  return (
    <RadixSwitch.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={cn(
        "relative h-5 w-9 rounded-full border border-outline-variant",
        "transition-[background-color] duration-150",
        "data-[state=checked]:bg-brand data-[state=unchecked]:bg-surface-bright",
        "disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
      {...rest}
    >
      <RadixSwitch.Thumb
        className={cn(
          "block h-4 w-4 rounded-full bg-fg shadow-card",
          "transition-transform duration-150",
          "data-[state=checked]:translate-x-[18px] data-[state=unchecked]:translate-x-0.5",
          "data-[state=checked]:bg-on-brand",
        )}
      />
    </RadixSwitch.Root>
  );
}
