import { cn } from "@/lib/utils";

export function SocialProofChip({
  count,
  label = "watching",
  compact = false,
  className,
}: {
  count: number;
  label?: string;
  /** On dense cards, drop the label and show just the count. */
  compact?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 text-xs text-fg-muted", className)}
      aria-label={`${count} ${label}`}
    >
      <span className="text-brand/60" aria-hidden="true">
        ◔
      </span>
      <span className="data-sm" aria-hidden="true">
        {count}
      </span>
      {!compact && <span aria-hidden="true">{label}</span>}
    </span>
  );
}
