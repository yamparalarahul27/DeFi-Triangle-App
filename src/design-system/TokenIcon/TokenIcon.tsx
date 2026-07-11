"use client";

import { useState } from "react";

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
  className = "",
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
        className={`${SIZE_CLS[size]} ${TEXT_CLS[size]} ${className} rounded-full bg-surface-bright text-fg flex items-center justify-center font-semibold shrink-0`}
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
      className={`${SIZE_CLS[size]} ${className} rounded-full object-cover shrink-0`}
    />
  );
}
