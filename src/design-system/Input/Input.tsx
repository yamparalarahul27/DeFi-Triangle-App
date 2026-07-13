import { cn } from "@/lib/utils";

export type InputSize = "sm" | "md" | "lg";

const SIZE: Record<InputSize, string> = {
  sm: "h-7 px-2.5 text-xs",
  md: "h-9 px-3 text-sm",
  lg: "h-11 px-3.5 text-sm",
};

export function Input({
  size = "md",
  invalid = false,
  className,
  ...rest
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
  /** sm 28 · md 36 · lg 44 px height (shared scale). */
  size?: InputSize;
  /** Error state — sets aria-invalid + sell border. Pair with visible error text near the field. */
  invalid?: boolean;
}) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(
        "w-full rounded-control border bg-surface-container text-fg placeholder:text-fg-subtle",
        "transition-[border-color,background-color] duration-150",
        "disabled:pointer-events-none disabled:opacity-40",
        invalid
          ? "border-sell"
          : "border-outline-variant focus:border-outline",
        SIZE[size],
        className,
      )}
      {...rest}
    />
  );
}
