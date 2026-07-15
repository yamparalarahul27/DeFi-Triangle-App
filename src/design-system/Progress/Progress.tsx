"use client";

import { Progress as RadixProgress } from "radix-ui";
import { cn } from "@/lib/utils";

/**
 * Determinate progress bar on Radix Progress (ARIA progressbar wiring).
 * Pass `value` as 0–100; omit it for indeterminate (unknown duration —
 * the bar shimmers). For content placeholders use Skeleton; for
 * transaction stages use TxStatus.
 */
export function Progress({
  value,
  "aria-label": ariaLabel,
  className,
}: {
  /** 0–100. Omit for indeterminate. */
  value?: number;
  /** Names the bar for screen readers (e.g. "Upload progress"). */
  "aria-label": string;
  className?: string;
}) {
  const indeterminate = value === undefined;
  return (
    <RadixProgress.Root
      value={indeterminate ? null : value}
      aria-label={ariaLabel}
      className={cn(
        "relative h-1.5 w-full overflow-hidden rounded-full bg-surface-bright",
        className,
      )}
    >
      <RadixProgress.Indicator
        className={cn(
          "h-full rounded-full bg-brand transition-[width] duration-300 ease-out",
          indeterminate && "w-1/3 animate-progress-slide",
        )}
        style={indeterminate ? undefined : { width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </RadixProgress.Root>
  );
}
