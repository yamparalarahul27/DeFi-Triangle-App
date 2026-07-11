"use client";

import { useState } from "react";
import {
  ReactionBar,
  FollowButton,
  Lane,
  type Reaction,
} from "@/design-system";

const INITIAL: Reaction[] = [
  { emoji: "♥", count: 12, mine: true },
  { emoji: "🔥", count: 8 },
  { emoji: "🧠", count: 4 },
];

export function InteractiveDemos() {
  const [reactions, setReactions] = useState<Reaction[]>(INITIAL);
  const [following, setFollowing] = useState(false);
  const [lane, setLane] = useState<"following" | "everyone">("following");

  // Toggle own-reaction and bump the count — the caller-owned logic the
  // component leaves to us.
  const onReact = (emoji: string) => {
    setReactions((prev) => {
      const found = prev.find((r) => r.emoji === emoji);
      if (found) {
        return prev.map((r) =>
          r.emoji === emoji
            ? { ...r, mine: !r.mine, count: r.count + (r.mine ? -1 : 1) }
            : r,
        );
      }
      return [...prev, { emoji, count: 1, mine: true }];
    });
  };

  return (
    <div className="space-y-3">
      <ReactionBar reactions={reactions} onReact={onReact} />
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
    </div>
  );
}
