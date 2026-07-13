import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * Designed empty — cold-start is a first-class state (tide DS spec).
 * One quiet glyph, a title, one playful-budget hint line, optional action.
 */
export function EmptyState({
  glyph = "◍",
  title,
  hint,
  action,
  className,
}: {
  /** Decorative marker (emoji/char); aria-hidden. */
  glyph?: string;
  title: string;
  /** One line; this is where the playful budget lives. */
  hint?: string;
  /** Usually a Button. */
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-1 rounded-card border border-dashed border-outline bg-surface-container px-6 py-10 text-center",
        className,
      )}
    >
      <span aria-hidden="true" className="mb-1 text-2xl text-fg-subtle">
        {glyph}
      </span>
      <p className="text-sm font-medium text-fg">{title}</p>
      {hint && <p className="text-xs text-fg-muted">{hint}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
