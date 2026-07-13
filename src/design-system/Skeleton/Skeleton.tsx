"use client";

import { cn } from "@/lib/utils";

/** Shimmering placeholder block. Shape it with className (w-*, h-*). */
export function Skeleton({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse rounded-control bg-surface-container-high",
        className,
      )}
      style={style}
    />
  );
}

/** Card-shaped loading region: labelled, aria-busy, three shimmer rows. */
export function SectionSkeleton({
  height,
  label,
  className,
}: {
  height: number;
  label?: string;
  className?: string;
}) {
  return (
    <section
      aria-busy="true"
      aria-label={label ? `${label} loading` : "Loading"}
      className={cn(
        "rounded-card border border-outline-variant bg-surface-container p-4",
        className,
      )}
      style={{ minHeight: height }}
    >
      {label ? (
        <div className="mb-3 text-[10px] uppercase tracking-wider text-fg-muted">
          {label}
        </div>
      ) : null}
      <div className="space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </section>
  );
}
