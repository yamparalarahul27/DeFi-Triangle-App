"use client";

import { DropdownMenu as RadixMenu } from "radix-ui";
import { cn } from "@/lib/utils";

export type Network = {
  id: string;
  label: string;
  /** Network icon URL (e.g. Logobase network/<slug>); falls back to a dot. */
  iconSrc?: string;
};

function NetworkGlyph({ iconSrc }: { iconSrc?: string }) {
  return iconSrc ? (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src={iconSrc} alt="" className="h-3.5 w-3.5 rounded-full" />
  ) : (
    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-fg-subtle" />
  );
}

/**
 * Active network + switch menu — NetworkBadge's interactive sibling
 * (ethereum.org heuristic #3: always show the connected network; this
 * adds "and let me change it"). Radio semantics via Radix DropdownMenu.
 */
export function ChainSwitcher({
  networks,
  value,
  onValueChange,
  disabled,
  className,
}: {
  networks: Network[];
  /** Active network id. */
  value: string;
  onValueChange: (id: string) => void;
  disabled?: boolean;
  /** Merged onto the trigger. */
  className?: string;
}) {
  const active = networks.find((n) => n.id === value);
  return (
    <RadixMenu.Root>
      <RadixMenu.Trigger
        disabled={disabled}
        aria-label={`Network: ${active?.label ?? "unknown"} — switch`}
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-control border border-outline-variant bg-surface-container px-3 text-sm text-fg",
          "transition-[border-color,background-color] duration-150 hover:bg-surface-container-high",
          "disabled:pointer-events-none disabled:opacity-40",
          className,
        )}
      >
        <NetworkGlyph iconSrc={active?.iconSrc} />
        {active?.label ?? "Select network"}
        <span aria-hidden="true" className="text-fg-subtle">
          ▾
        </span>
      </RadixMenu.Trigger>
      <RadixMenu.Portal>
        <RadixMenu.Content
          align="start"
          sideOffset={4}
          className={cn(
            "z-[var(--z-raised)] min-w-44 rounded-chip border border-outline-variant bg-surface-bright p-1 shadow-raised",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0",
          )}
        >
          <RadixMenu.RadioGroup value={value} onValueChange={onValueChange}>
            {networks.map((n) => (
              <RadixMenu.RadioItem
                key={n.id}
                value={n.id}
                className={cn(
                  "flex cursor-default select-none items-center gap-2 rounded-control px-2.5 py-1.5 text-xs text-fg outline-none",
                  "data-[highlighted]:bg-surface-container-high",
                )}
              >
                <NetworkGlyph iconSrc={n.iconSrc} />
                <span className="flex-1">{n.label}</span>
                <RadixMenu.ItemIndicator className="text-brand">✓</RadixMenu.ItemIndicator>
              </RadixMenu.RadioItem>
            ))}
          </RadixMenu.RadioGroup>
        </RadixMenu.Content>
      </RadixMenu.Portal>
    </RadixMenu.Root>
  );
}
