import { cn } from "@/lib/utils";
import { Avatar } from "../Avatar";
import type { IdHue } from "../identity";

export type AvatarGroupMember = {
  name: string;
  seed?: string;
  hue?: IdHue;
  you?: boolean;
};

// -8px overlap + 2px ring in surface-container, per DESIGN.md AvatarGroup spec.
const OVERLAP = "-ml-2 first:ml-0";
const RING = "ring-2 ring-surface-container";

export function AvatarGroup({
  members,
  max = 3,
  size = 20,
  className,
}: {
  /** Render order is the caller's concern (spec: followed-by-you first). */
  members: AvatarGroupMember[];
  /** Max avatars before collapsing to a +N disc. */
  max?: number;
  size?: 20 | 28;
  className?: string;
}) {
  const shown = members.slice(0, max);
  const extra = members.length - shown.length;
  const discSize = size === 20 ? "w-5 h-5 text-[9px]" : "w-7 h-7 text-[10px]";

  return (
    <span
      className={cn("inline-flex items-center", className)}
      aria-label={`${members.length} ${members.length === 1 ? "person" : "people"}`}
    >
      {shown.map((m, i) => (
        <Avatar key={i} {...m} size={size} className={cn(OVERLAP, RING)} />
      ))}
      {extra > 0 && (
        <span
          aria-hidden="true"
          className={cn(
            "inline-flex flex-none items-center justify-center rounded-full bg-surface-bright font-mono text-fg-muted",
            discSize,
            OVERLAP,
            RING,
          )}
        >
          +{extra}
        </span>
      )}
    </span>
  );
}
