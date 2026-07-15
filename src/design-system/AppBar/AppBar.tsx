import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Page header — the three-slot row (leading · title · actions) every
 * screen was hand-rolling. Pure composition: put an IconButton back
 * arrow in `leading`, IconButtons/Menu in `actions`. `sticky` pins it
 * on the --z-sticky rung.
 */
export function AppBar({
  title,
  leading,
  actions,
  sticky = false,
  className,
}: {
  title: string;
  /** Left slot — back button, logo. */
  leading?: ReactNode;
  /** Right slot — IconButtons, Menu triggers. */
  actions?: ReactNode;
  /** Pin to the top of the scroll container. */
  sticky?: boolean;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex h-14 items-center gap-3 border-b border-outline-variant bg-surface-page px-4",
        sticky && "sticky top-0 z-[var(--z-sticky)]",
        className,
      )}
    >
      {leading && <div className="flex flex-none items-center">{leading}</div>}
      <h1 className="min-w-0 flex-1 truncate text-sm font-semibold text-fg">
        {title}
      </h1>
      {actions && <div className="flex flex-none items-center gap-1">{actions}</div>}
    </header>
  );
}
