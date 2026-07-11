"use client";

import { useState } from "react";
import {
  Avatar,
  AvatarGroup,
  FollowButton,
  Lane,
  PostCard,
  SocialProofChip,
  CommentThread,
  Onboarding,
  type Reaction,
  type Comment,
} from "@/design-system";

type LaneValue = "following" | "everyone";

type FeedPost = {
  id: string;
  kind: "watched" | "take" | "milestone";
  author?: { name: string; handle: string; seed?: string; you?: boolean };
  time: string;
  body: React.ReactNode;
  token?: { symbol: string; price: string; change24h: number };
  direction?: "up" | "down";
  reactions?: Reaction[];
};

const FOLLOWING: FeedPost[] = [
  {
    id: "mira",
    kind: "watched",
    author: { name: "Mira", handle: "mira", seed: "wallet-mira" },
    time: "2m",
    body: "peg's been glued on for three weeks. this is where boring gets beautiful.",
    token: { symbol: "PYUSD", price: "$0.9999", change24h: 0.01 },
    reactions: [
      { emoji: "♥", count: 12, mine: true },
      { emoji: "🧠", count: 4 },
    ],
  },
  {
    id: "kesh",
    kind: "take",
    author: { name: "Kesh", handle: "kesh", seed: "wallet-kesh" },
    time: "18m",
    body: "Rotation into stables is the real signal this week. Everyone's watching the runners; the smart money is parking.",
    reactions: [
      { emoji: "🔥", count: 8 },
      { emoji: "👀", count: 5 },
    ],
  },
  {
    id: "bonk-mile",
    kind: "milestone",
    direction: "up",
    time: "1h",
    body: (
      <div className="space-y-3">
        <span>
          BONK ran <span className="data-sm text-buy">+12.4%</span> in 24h — 5
          people you follow watch it.
        </span>
        <div className="flex items-center justify-between">
          <AvatarGroup
            members={[
              { name: "mira", seed: "wallet-mira" },
              { name: "sol", seed: "wallet-sol" },
              { name: "noor", seed: "wallet-noor" },
              { name: "kesh", seed: "wallet-kesh" },
              { name: "ali", seed: "wallet-ali" },
            ]}
          />
          <span className="text-xs text-brand">view BONK ›</span>
        </div>
      </div>
    ),
  },
  {
    id: "noor",
    kind: "take",
    author: { name: "Noor", handle: "noor", seed: "wallet-noor" },
    time: "3h",
    body: "JUP holding the 0.80 line through this chop is quietly impressive.",
    token: { symbol: "JUP", price: "$0.8123", change24h: 4.2 },
    reactions: [
      { emoji: "♥", count: 2 },
      { emoji: "📈", count: 6, mine: true },
    ],
  },
];

const EVERYONE: FeedPost[] = [
  FOLLOWING[1],
  FOLLOWING[2],
  FOLLOWING[3],
  {
    id: "ali",
    kind: "take",
    author: { name: "Ali", handle: "degen_ali", seed: "wallet-ali" },
    time: "5h",
    body: "high-risk rail is heating up again. not advice, just vibes 📈",
    reactions: [{ emoji: "🔥", count: 21 }],
  },
];

const SAMPLE_COMMENTS: Comment[] = [
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

export function FeedScreen() {
  const [lane, setLane] = useState<LaneValue>("following");
  const [reactions, setReactions] = useState<Record<string, Reaction[]>>(() =>
    Object.fromEntries(
      [...FOLLOWING, ...EVERYONE]
        .filter((p) => p.reactions)
        .map((p) => [p.id, p.reactions!]),
    ),
  );
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [handle, setHandle] = useState("");

  const posts = lane === "following" ? FOLLOWING : EVERYONE;

  return (
    <div className="relative mx-auto flex min-h-dvh max-w-[430px] flex-col bg-surface-page text-fg">
      {/* header */}
      <header className="sticky top-0 z-20 flex h-12 items-center justify-between border-b border-outline-variant bg-surface-page/90 px-4 backdrop-blur">
        <span
          className="text-sm font-semibold text-fg"
          style={{ fontFamily: "var(--font-geist-mono), monospace" }}
        >
          tide <span className="text-brand">~</span>
        </span>
        <Avatar name="You" you size={28} />
      </header>

      <main className="flex-1 px-4 pb-28 pt-3">
        {/* lane + new-tides pill */}
        <div className="flex items-center justify-between">
          <Lane
            options={[
              { value: "following", label: "Following" },
              { value: "everyone", label: "Everyone" },
            ]}
            value={lane}
            onChange={(v) => setLane(v as LaneValue)}
          />
          <button
            type="button"
            className="rounded-full border border-outline-variant bg-surface-bright px-3 py-1 font-mono text-[11px] text-fg-muted"
          >
            · 3 new tides ·
          </button>
        </div>

        {/* feed */}
        <div className="mt-3 space-y-3">
          {posts.map((p) => (
            <PostCard
              key={p.id}
              kind={p.kind}
              author={p.author}
              time={p.time}
              body={p.body}
              token={p.token}
              direction={p.direction}
              reactions={p.reactions ? reactions[p.id] : undefined}
              onReact={
                p.reactions
                  ? (e) =>
                      setReactions((prev) => ({
                        ...prev,
                        [p.id]: toggleReaction(prev[p.id], e),
                      }))
                  : undefined
              }
            />
          ))}

          {/* comments affordance (opens CommentThread) */}
          <button
            type="button"
            onClick={() => setCommentsOpen(true)}
            className="w-full rounded-lg border border-dashed border-outline bg-surface-container px-4 py-3 text-left text-xs text-fg-muted transition-transform active:scale-[0.99]"
          >
            💬 12 comments on @noor&apos;s take ›
          </button>

          {/* suggested follows (empty-lane teaser) */}
          <article className="rounded-lg border border-dashed border-outline bg-surface-container p-4">
            <div className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-fg-subtle">
              Grow your tide
            </div>
            <p className="mt-2 text-xs text-fg-muted">Suggested to follow:</p>
            <div className="mt-3 space-y-3">
              <SuggestRow name="sol_index" seed="wallet-sol" note={<SocialProofChip count={34} />} following={false} />
              <SuggestRow name="degen_ali" seed="wallet-ali" note="high-risk rail resident" following />
            </div>
          </article>
        </div>
      </main>

      {/* composer FAB */}
      <button
        type="button"
        aria-label="Compose"
        onClick={() => setJoinOpen(true)}
        style={{
          boxShadow:
            "0 4px 8px color-mix(in srgb, var(--brand) 20%, transparent), 0 12px 24px color-mix(in srgb, var(--brand) 12%, transparent)",
        }}
        className="sticky bottom-20 z-30 ml-auto mr-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand text-xl text-on-brand transition-transform active:scale-[0.96]"
      >
        ✎
      </button>

      {/* bottom bar */}
      <nav className="sticky bottom-0 z-20 grid h-16 grid-cols-4 border-t border-outline-variant bg-surface-page/90 backdrop-blur">
        {[
          { ic: "~", label: "Feed", active: true },
          { ic: "◍", label: "Markets" },
          { ic: "⌕", label: "Search" },
          { ic: "◐", label: "Me" },
        ].map((t) => (
          <span
            key={t.label}
            className={cnTab(t.active)}
          >
            <span className="text-xl leading-none">{t.ic}</span>
            {t.label}
          </span>
        ))}
      </nav>

      <CommentThread
        open={commentsOpen}
        onOpenChange={setCommentsOpen}
        comments={SAMPLE_COMMENTS}
      />
      <Onboarding
        open={joinOpen}
        onOpenChange={setJoinOpen}
        walletAddress={connected ? "7xKtPq4rZ9fQ2mNvB1cD" : null}
        onConnectWallet={() => setConnected(true)}
        handle={handle}
        onHandleChange={setHandle}
        availability={handle.length < 3 ? "idle" : handle.length % 2 === 0 ? "available" : "taken"}
        onJoin={() => setJoinOpen(false)}
      />
    </div>
  );
}

function cnTab(active?: boolean) {
  return [
    "flex flex-col items-center justify-center gap-0.5 text-[10px]",
    active ? "text-fg" : "text-fg-subtle",
  ].join(" ");
}

function SuggestRow({
  name,
  seed,
  note,
  following,
}: {
  name: string;
  seed: string;
  note: React.ReactNode;
  following: boolean;
}) {
  const [f, setF] = useState(following);
  return (
    <div className="flex items-center gap-2">
      <Avatar name={name} seed={seed} size={28} />
      <div className="min-w-0">
        <div className="font-mono text-[13px] text-fg">@{name}</div>
        <div className="truncate text-[11px] text-fg-subtle">{note}</div>
      </div>
      <div className="ml-auto">
        <FollowButton following={f} onToggle={() => setF((v) => !v)} />
      </div>
    </div>
  );
}
