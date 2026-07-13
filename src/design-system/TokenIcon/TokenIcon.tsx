"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

const SIZE_CLS: Record<Size, string> = {
  sm: "w-5 h-5",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

const TEXT_CLS: Record<Size, string> = {
  sm: "text-[9px]",
  md: "text-[10px]",
  lg: "text-xs",
};

export function TokenIcon({
  src,
  symbol,
  size = "md",
  className,
}: {
  src?: string;
  symbol?: string;
  size?: Size;
  className?: string;
}) {
  // Track WHICH src errored — a new src is automatically un-errored,
  // no reset-on-prop-change effect needed.
  const [erroredSrc, setErroredSrc] = useState<string | null>(null);
  const errored = erroredSrc === src;

  const initials = (symbol ?? "?").slice(0, 2).toUpperCase();

  if (!src || errored) {
    return (
      <div
        className={cn(
          SIZE_CLS[size],
          TEXT_CLS[size],
          "flex shrink-0 items-center justify-center rounded-full bg-surface-bright font-semibold text-fg",
          className,
        )}
        aria-label={symbol ?? "token"}
      >
        {initials}
      </div>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt={symbol ?? "token"}
      onError={() => setErroredSrc(src ?? null)}
      className={cn(SIZE_CLS[size], "shrink-0 rounded-full object-cover", className)}
    />
  );
}
