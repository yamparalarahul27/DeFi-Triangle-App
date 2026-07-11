"use client";

import { useState } from "react";
import {
  ReactionBar,
  FollowButton,
  Lane,
  PostCard,
  CommentThread,
  Onboarding,
  type Reaction,
  type Comment,
  type HandleAvailability,
} from "@/design-system";

const SAMPLE_COMMENTS: Comment[] = [
  {
    author: { name: "Kip", handle: "kip", seed: "wallet-kip" },
    time: "6m",
    body: "Agreed — the retest held cleanly. Watching the 0.80 shelf.",
    likes: 3,
    liked: true,
    replies: [
      {
        author: { name: "Mira", handle: "mira", seed: "wallet-mira", you: true },
        time: "2m",
        body: "Same. Sized in half here.",
        likes: 1,
      },
    ],
  },
  {
    author: { name: "Nova", handle: "nova", seed: "wallet-nova" },
    time: "1m",
    body: "Careful, low liquidity above.",
    likes: 0,
  },
];

// Toy availability: even-length handles read as available, odd as taken.
function fakeAvailability(handle: string): HandleAvailability {
  if (handle.length < 3) return "idle";
  return handle.length % 2 === 0 ? "available" : "taken";
}

const INITIAL: Reaction[] = [
  { emoji: "♥", count: 12, mine: true },
  { emoji: "🔥", count: 8 },
  { emoji: "🧠", count: 4 },
];

// Toggle own-reaction and bump the count — the caller-owned logic the
// component leaves to us. Reused by the bare bar and the PostCard demo.
function toggleReaction(prev: Reaction[], emoji: string): Reaction[] {
  const found = prev.find((r) => r.emoji === emoji);
  if (found) {
    return prev.map((r) =>
      r.emoji === emoji
        ? { ...r, mine: !r.mine, count: r.count + (r.mine ? -1 : 1) }
        : r,
    );
  }
  return [...prev, { emoji, count: 1, mine: true }];
}

export function InteractiveDemos() {
  const [reactions, setReactions] = useState<Reaction[]>(INITIAL);
  const [following, setFollowing] = useState(false);
  const [lane, setLane] = useState<"following" | "everyone">("following");
  const [postReactions, setPostReactions] = useState<Reaction[]>([
    { emoji: "♥", count: 5 },
    { emoji: "🔥", count: 2 },
  ]);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>(SAMPLE_COMMENTS);
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [handle, setHandle] = useState("");

  const likeComment = (i: number, ri?: number) => {
    setComments((prev) =>
      prev.map((c, ci) => {
        if (ci !== i) return c;
        if (ri === undefined) {
          return { ...c, liked: !c.liked, likes: c.likes + (c.liked ? -1 : 1) };
        }
        return {
          ...c,
          replies: c.replies?.map((r, rci) =>
            rci === ri
              ? { ...r, liked: !r.liked, likes: r.likes + (r.liked ? -1 : 1) }
              : r,
          ),
        };
      }),
    );
  };

  const triggerBtn =
    "rounded-sm border border-outline bg-surface-container px-3 py-2 text-xs font-semibold text-fg transition-transform active:scale-[0.98]";

  return (
    <div className="space-y-3">
      <ReactionBar
        reactions={reactions}
        onReact={(e) => setReactions((p) => toggleReaction(p, e))}
      />
      <div className="flex items-center gap-3">
        <FollowButton following={following} onToggle={() => setFollowing((v) => !v)} />
        <Lane
          options={[
            { value: "following", label: "Following" },
            { value: "everyone", label: "Everyone" },
          ]}
          value={lane}
          onChange={setLane}
        />
      </div>
      <PostCard
        kind="take"
        author={{ name: "Mira", handle: "mira", seed: "wallet-mira" }}
        time="4m"
        body="JUP printing a clean higher-low here. Adding on the retest, not chasing."
        token={{ symbol: "JUP", price: "$0.8123", change24h: 4.2 }}
        reactions={postReactions}
        onReact={(e) => setPostReactions((p) => toggleReaction(p, e))}
      />

      <div className="flex gap-2">
        <button type="button" className={triggerBtn} onClick={() => setCommentsOpen(true)}>
          Open comments
        </button>
        <button type="button" className={triggerBtn} onClick={() => setOnboardOpen(true)}>
          Open onboarding
        </button>
      </div>

      <CommentThread
        open={commentsOpen}
        onOpenChange={setCommentsOpen}
        comments={comments}
        onLike={likeComment}
        onSubmit={(text) =>
          setComments((prev) => [
            ...prev,
            {
              author: { name: "You", handle: "you", you: true },
              time: "now",
              body: text,
              likes: 0,
            },
          ])
        }
      />

      <Onboarding
        open={onboardOpen}
        onOpenChange={setOnboardOpen}
        walletAddress={connected ? "7xKtPq4rZ9fQ2mNvB1cD" : null}
        onConnectWallet={() => setConnected(true)}
        handle={handle}
        onHandleChange={setHandle}
        availability={fakeAvailability(handle)}
        onJoin={() => setOnboardOpen(false)}
      />
    </div>
  );
}
