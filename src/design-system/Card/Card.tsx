import { cn } from "@/lib/utils";

/**
 * The generic container primitive — the `rounded-card border
 * bg-surface-container` recipe that templates and patterns were
 * hand-rolling, made canonical. `interactive` adds the hover lift +
 * card-grade press (0.98 — cards press softer than controls).
 */
export function Card({
  interactive = false,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & {
  /** Hover lift + press feedback for clickable cards. */
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-outline-variant bg-surface-container p-4",
        interactive &&
          "cursor-pointer transition-[background-color,transform] duration-150 hover:bg-surface-container-high active:scale-[0.98]",
        className,
      )}
      {...rest}
    />
  );
}
