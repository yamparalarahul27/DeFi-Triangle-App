"use client";

import { cn } from "@/lib/utils";

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
        "animate-pulse bg-surface-container-high rounded-sm",
        className
      )}
      style={style}
    />
  );
}

export function SectionSkeleton({
  height,
  label,
}: {
  height: number;
  label?: string;
}) {
  return (
    <section
      aria-busy="true"
      aria-label={label ? `${label} loading` : "Loading"}
      className="bg-surface-container rounded-sm border border-outline-variant p-4 sm:p-6"
      style={{ minHeight: height }}
    >
      {label ? (
        <div className="text-[10px] uppercase tracking-wider text-fg-muted mb-3">
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
