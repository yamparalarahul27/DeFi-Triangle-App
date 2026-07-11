"use client";

import { useState } from "react";
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
            "inline-flex h-11 items-center gap-1.5 rounded-sm px-2 text-[15px] transition-transform active:scale-[0.96]",
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

      <button
        type="button"
        onClick={() => setPickerOpen((v) => !v)}
        aria-label="Add reaction"
        aria-expanded={pickerOpen}
        className="inline-flex h-11 w-11 items-center justify-center rounded-sm text-[15px] text-fg-muted transition-transform active:scale-[0.96]"
      >
        +
      </button>

      {pickerOpen && (
        <div
          role="menu"
          className="absolute left-0 top-full z-10 mt-1 inline-flex items-center gap-1 rounded-sm border border-outline-variant bg-surface-bright px-1.5 py-1 shadow-lg"
        >
          {pickerEmojis.map((e) => (
            <button
              key={e}
              type="button"
              role="menuitem"
              onClick={() => {
                react(e);
                setPickerOpen(false);
              }}
              className="inline-flex h-10 w-10 items-center justify-center rounded-sm text-[15px] transition-transform active:scale-[0.9]"
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
