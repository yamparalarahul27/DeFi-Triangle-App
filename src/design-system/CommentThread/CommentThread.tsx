"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "../Avatar";
import { Sheet } from "../Sheet";

export type Comment = {
  author: { name: string; handle: string; seed?: string; you?: boolean };
  time: string;
  body: string;
  likes: number;
  liked?: boolean;
  replies?: Omit<Comment, "replies">[];
};

const MAX = 280;
const COUNTER_AT = 40; // show remaining once within this many chars

function CommentRow({
  comment,
  onLike,
  isReply = false,
}: {
  comment: Omit<Comment, "replies">;
  onLike?: () => void;
  isReply?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex gap-2.5 py-3",
        isReply && "ml-9 border-l border-outline-variant pl-3",
      )}
    >
      <Avatar
        name={comment.author.name}
        seed={comment.author.seed}
        you={comment.author.you}
        size="sm"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[13px] font-medium text-fg">
            @{comment.author.handle}
          </span>
          <span className="text-[11px] text-fg-subtle">{comment.time}</span>
        </div>
        <p className="mt-0.5 text-sm text-fg" style={{ textWrap: "pretty" }}>
          {comment.body}
        </p>
        <div className="mt-1.5 flex items-center gap-3">
          <button
            type="button"
            onClick={onLike}
            aria-pressed={comment.liked ?? false}
            className={cn(
              "inline-flex items-center gap-1 text-xs transition-transform active:scale-[0.96]",
              comment.liked ? "text-brand" : "text-fg-muted",
            )}
          >
            ♥ <span className="data-sm">{comment.likes}</span>
          </button>
          <button type="button" className="text-xs text-fg-muted">
            reply
          </button>
        </div>
      </div>
    </div>
  );
}

export function CommentThread({
  open,
  onOpenChange,
  comments,
  onLike,
  onSubmit,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comments: Comment[];
  /** (topLevelIndex, replyIndex?) — replyIndex present when a reply is liked. */
  onLike?: (index: number, replyIndex?: number) => void;
  onSubmit?: (text: string) => void;
  /** Merged onto the underlying Sheet panel (API contract: every component takes className). */
  className?: string;
}) {
  const [text, setText] = useState("");
  const remaining = MAX - text.length;

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit?.(trimmed);
    setText("");
  };

  const footer = (
    <div className="flex items-end gap-2">
      <div className="min-w-0 flex-1">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX))}
          rows={1}
          placeholder="Add a comment…"
          className="w-full resize-none rounded-control bg-surface-container px-3 py-2.5 text-sm text-fg placeholder:text-fg-subtle focus:outline-none"
        />
        {remaining <= COUNTER_AT && (
          <div
            className={cn(
              "mt-1 text-right text-[11px]",
              remaining < 0 ? "text-sell" : "text-fg-subtle",
            )}
          >
            {remaining}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={submit}
        aria-label="Send comment"
        disabled={!text.trim()}
        className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full bg-brand text-on-brand transition-transform active:scale-[0.96] disabled:opacity-40"
      >
        ↑
      </button>
    </div>
  );

  const count = comments.length;

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={`${count} ${count === 1 ? "comment" : "comments"}`}
      footer={footer}
      className={className}
    >
      <div className="divide-y divide-outline-variant">
        {comments.map((c, i) => (
          <div key={i}>
            <CommentRow comment={c} onLike={() => onLike?.(i)} />
            {c.replies?.map((r, ri) => (
              <CommentRow
                key={ri}
                comment={r}
                isReply
                onLike={() => onLike?.(i, ri)}
              />
            ))}
          </div>
        ))}
      </div>
    </Sheet>
  );
}
