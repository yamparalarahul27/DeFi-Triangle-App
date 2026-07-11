"use client";

import { useState } from "react";
import {
  ReactionBar,
  FollowButton,
  Lane,
  PostCard,
  type Reaction,
} from "@/design-system";

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
    </div>
  );
}
