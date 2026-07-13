// Phase-2 quality gate (cids-roadmap §5): every component × every theme
// passes axe with zero violations. Renders a representative default state
// per component under <html data-theme="...">, runs axe-core on the live
// DOM (portals included), and fails on ANY violation.
//
// color-contrast is intentionally excluded — jsdom has no layout engine;
// contrast is guarded for real by `npm run check:contrast`. `region` is
// excluded because components are fragments, not full pages.
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { axe } from "vitest-axe";
import {
  Avatar,
  AvatarGroup,
  TokenChip,
  TokenIcon,
  ReactionBar,
  FollowButton,
  Lane,
  SocialProofChip,
  PostCard,
  Sheet,
  CommentThread,
  Onboarding,
  Skeleton,
  SectionSkeleton,
  Tooltip,
} from "./index";

const THEMES = ["dark", "mono"] as const;

const CASES: Record<string, () => React.ReactElement> = {
  Avatar: () => <Avatar name="mira" seed="wallet-mira" />,
  AvatarGroup: () => (
    <AvatarGroup
      members={[{ name: "mira" }, { name: "noor" }, { name: "kesh" }, { name: "ali" }]}
    />
  ),
  TokenIcon: () => <TokenIcon symbol="JUP" />,
  TokenChip: () => <TokenChip symbol="JUP" price="$0.8123" change24h={4.2} />,
  ReactionBar: () => (
    <ReactionBar
      reactions={[{ emoji: "♥", count: 12, mine: true }]}
      onReact={() => {}}
    />
  ),
  FollowButton: () => <FollowButton following={false} onToggle={() => {}} />,
  Lane: () => (
    <Lane
      options={[
        { value: "a", label: "Following" },
        { value: "b", label: "Everyone" },
      ]}
      value="a"
      onChange={() => {}}
    />
  ),
  SocialProofChip: () => <SocialProofChip count={41} />,
  PostCard: () => (
    <PostCard
      kind="take"
      author={{ name: "Mira", handle: "mira" }}
      time="2m"
      body="peg's been glued on"
      reactions={[{ emoji: "♥", count: 3 }]}
      onReact={() => {}}
    />
  ),
  Skeleton: () => (
    <div>
      <Skeleton className="h-4 w-24" />
      <SectionSkeleton height={120} label="Stats" />
    </div>
  ),
  Tooltip: () => (
    <Tooltip content="About this figure.">
      <button type="button">info</button>
    </Tooltip>
  ),
  // Portal components rendered OPEN so axe sees the real overlay DOM.
  Sheet: () => (
    <Sheet open onOpenChange={() => {}} title="Sheet title">
      <p>Sheet body</p>
    </Sheet>
  ),
  CommentThread: () => (
    <CommentThread
      open
      onOpenChange={() => {}}
      comments={[
        {
          author: { name: "Kesh", handle: "kesh" },
          time: "1h",
          body: "the 0.80 support is doing a lot of work",
          likes: 3,
        },
      ]}
    />
  ),
  Onboarding: () => (
    <Onboarding
      open
      onOpenChange={() => {}}
      walletAddress="7xKt…9fQ2"
      handle="mira"
      availability="available"
      onHandleChange={() => {}}
      onJoin={() => {}}
    />
  ),
};

const AXE_OPTS = {
  rules: {
    "color-contrast": { enabled: false }, // no layout in jsdom; check:contrast owns this
    region: { enabled: false }, // fragments, not pages
  },
};

describe.each(THEMES)("axe (theme: %s)", (theme) => {
  afterEach(() => {
    cleanup();
    document.documentElement.removeAttribute("data-theme");
  });

  for (const [name, make] of Object.entries(CASES)) {
    it(`${name} has zero axe violations`, async () => {
      document.documentElement.setAttribute("data-theme", theme);
      render(make());
      const results = await axe(document.body, AXE_OPTS);
      expect(results.violations).toEqual([]);
    });
  }
});
