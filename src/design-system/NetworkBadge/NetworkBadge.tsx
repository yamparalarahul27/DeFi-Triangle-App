import { cn } from "@/lib/utils";

/**
 * Chain indicator — ethereum.org heuristic #3: always show the connected
 * network. Neutral by design (chains are facts, not states); pass an
 * icon URL (e.g. Logobase network/<slug>) or it renders a dot.
 */
export function NetworkBadge({
  name,
  iconSrc,
  className,
}: {
  name: string;
  iconSrc?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-chip bg-surface-container-high px-1.5 py-0.5 text-[11px] font-medium text-fg-muted",
        className,
      )}
    >
      {iconSrc ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={iconSrc} alt="" className="h-3 w-3 rounded-full" />
      ) : (
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-fg-subtle" />
      )}
      {name}
    </span>
  );
}
