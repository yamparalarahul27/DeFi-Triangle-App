import { cn } from "@/lib/utils";

/**
 * Multi-line text entry — Input's sibling, same border/focus/invalid
 * grammar, vertical resize only (horizontal resize breaks layouts).
 * Height via `rows` (default 3).
 */
export function Textarea({
  invalid = false,
  rows = 3,
  className,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  /** Error state — sets aria-invalid + sell border. Pair with visible error text near the field. */
  invalid?: boolean;
}) {
  return (
    <textarea
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(
        "w-full resize-y rounded-control border bg-surface-container px-3 py-2 text-sm text-fg placeholder:text-fg-subtle",
        "transition-[border-color,background-color] duration-150",
        "disabled:pointer-events-none disabled:opacity-40",
        invalid
          ? "border-sell"
          : "border-outline-variant focus:border-outline",
        className,
      )}
      {...rest}
    />
  );
}
