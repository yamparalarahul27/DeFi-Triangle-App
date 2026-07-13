"use client";

import { cn } from "@/lib/utils";

/**
 * Streaming numeral (CDS RollingNumber's role): each character that
 * CHANGES rolls in on --motion-settle; unchanged characters keep their
 * DOM nodes still — so a last digit ticking doesn't animate the whole
 * figure. Pixel font + tabular-nums; zero layout shift by design.
 */
export function RollingNumber({
  value,
  className,
}: {
  /** Pre-formatted string ("$184.26") — formatting is the caller's. */
  value: string;
  className?: string;
}) {
  const chars = value.split("");
  return (
    <span
      className={cn("data-md inline-flex text-fg", className)}
      // One accessible label for the whole figure; per-char spans hidden.
      role="text"
      aria-label={value}
    >
      {chars.map((ch, i) => (
        <span
          // Position + character in the key: a char re-mounts (and rolls)
          // only when the character AT ITS SLOT changes.
          key={`${i}-${ch}`}
          aria-hidden="true"
          className="animate-roll-in inline-block"
        >
          {ch === " " ? " " : ch}
        </span>
      ))}
    </span>
  );
}
