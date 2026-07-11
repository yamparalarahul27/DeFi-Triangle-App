"use client";

import { useState, type ReactNode } from "react";
import {
  Avatar,
  TokenIcon,
  AvatarGroup,
  TokenChip,
  ReactionBar,
  FollowButton,
  Lane,
  SocialProofChip,
  PostCard,
  Sheet,
  CommentThread,
  Onboarding,
  ID_HUES,
  type Reaction,
  type Comment,
} from "@/design-system";

const SURFACES = [
  ["dim", "bg-surface-dim"],
  ["page", "bg-surface-page"],
  ["surface", "bg-surface"],
  ["container", "bg-surface-container"],
  ["high", "bg-surface-container-high"],
  ["bright", "bg-surface-bright"],
] as const;

const MOTION = [
  ["--motion-fast", "150ms ease-out", "state / hover"],
  ["--motion-settle", "200ms settle bezier", "enter / morph"],
  ["--motion-spring", "250ms overshoot", "human feedback"],
] as const;

const TRIGGER =
  "rounded-sm border border-outline bg-surface-container px-3 py-2 text-xs font-semibold text-fg transition-transform active:scale-[0.98]";

function toggle(prev: Reaction[], emoji: string): Reaction[] {
  const f = prev.find((r) => r.emoji === emoji);
  if (!f) return [...prev, { emoji, count: 1, mine: true }];
  return prev.map((r) =>
    r.emoji === emoji
      ? { ...r, mine: !r.mine, count: r.count + (r.mine ? -1 : 1) }
      : r,
  );
}

function ReactionDemo() {
  const [rs, setRs] = useState<Reaction[]>([
    { emoji: "♥", count: 12, mine: true },
    { emoji: "🔥", count: 8 },
  ]);
  return <ReactionBar reactions={rs} onReact={(e) => setRs((p) => toggle(p, e))} />;
}

function FollowDemo() {
  const [f, setF] = useState(false);
  return <FollowButton following={f} onToggle={() => setF((v) => !v)} />;
}

function LaneDemo() {
  const [v, setV] = useState("following");
  return (
    <Lane
      options={[
        { value: "following", label: "Following" },
        { value: "everyone", label: "Everyone" },
      ]}
      value={v}
      onChange={setV}
    />
  );
}

function PostCardDemo() {
  const [rs, setRs] = useState<Reaction[]>([
    { emoji: "♥", count: 5 },
    { emoji: "📈", count: 2, mine: true },
  ]);
  return (
    <PostCard
      kind="take"
      author={{ name: "Mira", handle: "mira", seed: "wallet-mira" }}
      time="4m"
      body="JUP printing a clean higher-low. Adding on the retest."
      token={{ symbol: "JUP", price: "$0.8123", change24h: 4.2 }}
      reactions={rs}
      onReact={(e) => setRs((p) => toggle(p, e))}
    />
  );
}

function SheetDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={TRIGGER} onClick={() => setOpen(true)}>
        Open sheet
      </button>
      <Sheet open={open} onOpenChange={setOpen} title="Sheet">
        <p className="pb-4 text-sm text-fg-muted">
          Backdrop, focus trap, drag-to-dismiss. The base for the sheets below.
        </p>
      </Sheet>
    </>
  );
}

const COMMENTS: Comment[] = [
  {
    author: { name: "Kip", handle: "kip", seed: "wallet-kip" },
    time: "6m",
    body: "Agreed — the retest held cleanly.",
    likes: 3,
    liked: true,
  },
  {
    author: { name: "Nova", handle: "nova", seed: "wallet-nova" },
    time: "1m",
    body: "Careful, low liquidity above.",
    likes: 0,
  },
];

function CommentsDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={TRIGGER} onClick={() => setOpen(true)}>
        Open comments
      </button>
      <CommentThread open={open} onOpenChange={setOpen} comments={COMMENTS} />
    </>
  );
}

function OnboardingDemo() {
  const [open, setOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [handle, setHandle] = useState("");
  return (
    <>
      <button type="button" className={TRIGGER} onClick={() => setOpen(true)}>
        Open onboarding
      </button>
      <Onboarding
        open={open}
        onOpenChange={setOpen}
        walletAddress={connected ? "7xKtPq4rZ9fQ2mNvB1cD" : null}
        onConnectWallet={() => setConnected(true)}
        handle={handle}
        onHandleChange={setHandle}
        availability={handle.length < 3 ? "idle" : handle.length % 2 === 0 ? "available" : "taken"}
        onJoin={() => setOpen(false)}
      />
    </>
  );
}

export const DEMOS: Record<string, () => ReactNode> = {
  surfaces: () => (
    <div className="grid grid-cols-3 gap-2">
      {SURFACES.map(([label, cls]) => (
        <div key={label}>
          <div className={`h-10 rounded-lg border border-outline-variant ${cls}`} />
          <div className="mt-1 text-[10px] text-fg-subtle">{label}</div>
        </div>
      ))}
    </div>
  ),
  hues: () => (
    <div className="flex flex-wrap gap-2">
      {ID_HUES.map((hue) => (
        <div key={hue} className="text-center">
          <Avatar name={hue} hue={hue} size={40} />
          <div className="mt-1 text-[10px] text-fg-subtle">{hue}</div>
        </div>
      ))}
    </div>
  ),
  motion: () => (
    <div className="space-y-2">
      {MOTION.map(([token, value, use]) => (
        <div key={token} className="flex items-baseline justify-between gap-3">
          <code className="text-xs text-brand">{token}</code>
          <span className="text-[11px] text-fg-muted">{value}</span>
          <span className="text-[10px] text-fg-subtle">{use}</span>
        </div>
      ))}
    </div>
  ),
  Avatar: () => (
    <div className="flex items-center gap-3">
      <Avatar name="Mira" seed="wallet-mira" size={20} />
      <Avatar name="Mira" seed="wallet-mira" size={28} />
      <Avatar name="Mira" seed="wallet-mira" size={40} />
      <Avatar name="Mira" seed="wallet-mira" size={64} />
      <Avatar name="You" you size={40} />
    </div>
  ),
  AvatarGroup: () => (
    <AvatarGroup
      members={[
        { name: "mira", seed: "wallet-mira" },
        { name: "kip", seed: "wallet-kip" },
        { name: "nova", seed: "wallet-nova" },
        { name: "sol", seed: "wallet-sol" },
        { name: "ali", seed: "wallet-ali" },
      ]}
    />
  ),
  TokenIcon: () => (
    <div className="flex items-center gap-3">
      <TokenIcon symbol="SOL" size="sm" />
      <TokenIcon symbol="JUP" size="md" />
      <TokenIcon symbol="BONK" size="lg" />
      <span className="text-[10px] text-fg-subtle">initials fallback · icon CDN default is a follow-up</span>
    </div>
  ),
  TokenChip: () => (
    <div className="flex flex-col items-start gap-2">
      <TokenChip symbol="JUP" price="$0.8123" change24h={4.2} />
      <TokenChip symbol="BONK" price="$0.0000213" change24h={-1.31} />
    </div>
  ),
  SocialProofChip: () => (
    <div className="flex items-center gap-4">
      <SocialProofChip count={41} />
      <SocialProofChip count={41} compact />
      <SocialProofChip count={7} label="holding" />
    </div>
  ),
  ReactionBar: ReactionDemo,
  FollowButton: FollowDemo,
  Lane: LaneDemo,
  PostCard: PostCardDemo,
  Sheet: SheetDemo,
  CommentThread: CommentsDemo,
  Onboarding: OnboardingDemo,
};
