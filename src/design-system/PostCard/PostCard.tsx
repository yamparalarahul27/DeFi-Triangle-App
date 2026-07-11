"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "../Avatar";
import { TokenChip } from "../TokenChip";
import { ReactionBar, type Reaction } from "../ReactionBar";

export type PostKind = "watched" | "take" | "milestone";

type Author = { name: string; handle: string; seed?: string; you?: boolean };
type PostToken = {
  symbol: string;
  iconSrc?: string;
  price: string;
  change24h: number;
};

// Kind badge tint per DESIGN.md: watched=mint, take=neutral, milestone=info.
const KIND_BADGE: Record<PostKind, string> = {
  watched: "bg-brand/10 text-brand",
  take: "bg-surface-container-high text-fg-muted",
  milestone: "bg-info-surface text-info",
};

function KindBadge({ kind }: { kind: PostKind }) {
  return (
    <span
      className={cn(
        "rounded-sm px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
        KIND_BADGE[kind],
      )}
    >
      {kind}
    </span>
  );
}

export function PostCard({
  kind,
  author,
  time,
  body,
  token,
  reactions,
  onReact,
  direction = "up",
  className,
}: {
  kind: PostKind;
  /** Required for watched/take; omitted for milestone (system-authored). */
  author?: Author;
  time: string;
  body: ReactNode;
  token?: PostToken;
  reactions?: Reaction[];
  onReact?: (emoji: string) => void;
  /** Milestone only — colors the leading glyph + left border. */
  direction?: "up" | "down";
  className?: string;
}) {
  const isMilestone = kind === "milestone";
  const up = direction === "up";
  const dirColor = up ? "text-buy" : "text-sell";

  return (
    <article
      className={cn(
        "rounded-lg border border-outline-variant bg-surface-container p-4",
        isMilestone && (up ? "border-l-2 border-l-buy" : "border-l-2 border-l-sell"),
        className,
      )}
    >
      {isMilestone ? (
        <div className="flex items-start gap-2">
          <span className={cn("text-sm leading-6", dirColor)} aria-hidden="true">
            {up ? "▲" : "▼"}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm text-fg" style={{ textWrap: "pretty" }}>
              {body}
            </div>
            <div className="mt-1 text-[11px] text-fg-subtle">{time}</div>
          </div>
        </div>
      ) : (
        <>
          <header className="flex items-center gap-2">
            {author && (
              <Avatar
                name={author.name}
                seed={author.seed}
                you={author.you}
                size={28}
              />
            )}
            <span className="font-mono text-[13px] font-medium text-fg">
              @{author?.handle}
            </span>
            <KindBadge kind={kind} />
            <span className="ml-auto text-[11px] text-fg-subtle">{time}</span>
          </header>
          <div className="mt-3 text-sm text-fg" style={{ textWrap: "pretty" }}>
            {body}
          </div>
          {token && (
            <div className="mt-3">
              <TokenChip {...token} />
            </div>
          )}
        </>
      )}

      {reactions && onReact && (
        <div className="mt-3">
          <ReactionBar reactions={reactions} onReact={onReact} />
        </div>
      )}
    </article>
  );
}
