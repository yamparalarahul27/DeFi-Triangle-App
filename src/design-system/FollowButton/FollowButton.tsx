"use client";

import { cn } from "@/lib/utils";

// fill→outline morph on the reversible properties, plus a fast press scale.
const MORPH =
  "background-color var(--motion-settle), color var(--motion-settle), border-color var(--motion-settle), transform var(--motion-fast)";

export function FollowButton({
  following,
  onToggle,
  className,
}: {
  /** Controlled state. Callers flip optimistically and roll back on failure. */
  following: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={following}
      style={{ transition: MORPH }}
      className={cn(
        "inline-flex h-7 items-center rounded-control border px-3 text-xs font-semibold active:scale-[0.96]",
        following
          ? "border-outline bg-transparent text-fg-muted"
          : "border-transparent bg-brand text-on-brand",
        className,
      )}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
