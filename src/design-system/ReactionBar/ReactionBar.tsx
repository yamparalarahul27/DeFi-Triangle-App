"use client";

import { useState } from "react";
import { Popover as RadixPopover } from "radix-ui";
import { cn } from "@/lib/utils";

export type Reaction = { emoji: string; count: number; mine?: boolean };

// Default picker set from the tide spec.
const DEFAULT_PICKER = ["♥", "🔥", "👀", "🧠", "😅", "📈"];

export function ReactionBar({
  reactions,
  onReact,
  pickerEmojis = DEFAULT_PICKER,
  className,
}: {
  reactions: Reaction[];
  /** Called with the tapped/picked emoji. Count + mine state are the caller's to update. */
  onReact: (emoji: string) => void;
  pickerEmojis?: string[];
  className?: string;
}) {
  const [popping, setPopping] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const react = (emoji: string) => {
    setPopping(emoji); // re-arm the spring-pop; cleared on animationend
    onReact(emoji);
  };

  return (
    <div className={cn("relative inline-flex items-center gap-1", className)}>
      {reactions.map((r) => (
        <button
          key={r.emoji}
          type="button"
          onClick={() => react(r.emoji)}
          aria-pressed={r.mine ?? false}
          className={cn(
            "inline-flex h-11 items-center gap-1.5 rounded-control px-2 text-[15px] transition-transform active:scale-[0.96]",
            r.mine ? "bg-brand/10" : "bg-transparent",
          )}
        >
          <span
            className={cn(popping === r.emoji && "animate-pop")}
            onAnimationEnd={() => setPopping(null)}
          >
            {r.emoji}
          </span>
          <span className={cn("data-sm", r.mine ? "text-brand" : "text-fg-muted")}>
            {r.count}
          </span>
        </button>
      ))}

      {/* Picker behavior via Radix Popover: focus moves into the panel,
          Escape and outside-click dismiss, focus returns to the trigger
          (the a11y contract a hand-rolled div can't keep). */}
      <RadixPopover.Root open={pickerOpen} onOpenChange={setPickerOpen}>
        <RadixPopover.Trigger
          aria-label="Add reaction"
          className="inline-flex h-11 w-11 items-center justify-center rounded-control text-[15px] text-fg-muted transition-transform active:scale-[0.96]"
        >
          +
        </RadixPopover.Trigger>
        <RadixPopover.Portal>
          <RadixPopover.Content
            align="start"
            sideOffset={4}
            className="z-[var(--z-raised)] inline-flex items-center gap-1 rounded-control border border-outline-variant bg-surface-bright px-1.5 py-1 shadow-raised"
          >
            {pickerEmojis.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => {
                  react(e);
                  setPickerOpen(false);
                }}
                aria-label={`React ${e}`}
                className="inline-flex h-10 w-10 items-center justify-center rounded-control text-[15px] transition-transform active:scale-[0.9]"
              >
                {e}
              </button>
            ))}
          </RadixPopover.Content>
        </RadixPopover.Portal>
      </RadixPopover.Root>
    </div>
  );
}
