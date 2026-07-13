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
import { useState } from "react";
import { axe } from "vitest-axe";
import {
  AddressChip,
  PegBadge,
  NetworkBadge,
  TxStatus,
  AmountInput,
  DataTable,
  RollingNumber,
  PriceChange,
  StatCell,
  Sparkline,
  Switch,
  Checkbox,
  Select,
  Tabs,
  ToastProvider,
  useToast,
  Divider,
  EmptyState,
  Button,
  IconButton,
  Badge,
  Input,
  Dialog,
  Menu,
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

const THEMES = ["dark", "mono", "light", "violet"] as const;

function ToastFirer() {
  const toast = useToast();
  // fire once on mount so the matrix axes a visible toast
  useState(() => {
    toast({ title: "Watchlist updated", description: "JUP added", tone: "buy" });
    return true;
  });
  return <p>app</p>;
}

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
  Button: () => <Button variant="primary">Confirm</Button>,
  IconButton: () => <IconButton aria-label="Settings">⚙</IconButton>,
  Badge: () => <Badge tone="buy">on peg</Badge>,
  Input: () => <Input aria-label="Handle" placeholder="@handle" />,
  Switch: () => <Switch checked onCheckedChange={() => {}} aria-label="Public watchlist" />,
  Checkbox: () => <Checkbox checked onCheckedChange={() => {}} aria-label="Agree" />,
  Divider: () => (
    <div>
      above
      <Divider />
      below
    </div>
  ),
  EmptyState: () => (
    <EmptyState title="No watchers yet" hint="Quiet tide." action={<Button>Watch</Button>} />
  ),
  Tabs: () => (
    <Tabs
      value="a"
      onValueChange={() => {}}
      tabs={[
        { value: "a", label: "News", content: <p>panel</p> },
        { value: "b", label: "KPIs", content: <p>panel b</p> },
      ]}
    />
  ),
  Toast: () => (
    <ToastProvider>
      <ToastFirer />
    </ToastProvider>
  ),
  RollingNumber: () => <RollingNumber value="$184.26" />,
  PriceChange: () => (
    <div className="flex gap-3">
      <PriceChange value={4.2} />
      <PriceChange value={-4.2} />
    </div>
  ),
  StatCell: () => (
    <StatCell label="Market cap" value="$1.09B" change={<PriceChange value={2.1} />} />
  ),
  Sparkline: () => <Sparkline data={[1, 3, 2, 5]} label="7-day trend" />,
  DataTable: () => (
    <DataTable
      caption="Markets"
      rowKey={(r: { sym: string }) => r.sym}
      rows={[{ sym: "JUP", px: 0.81 }, { sym: "SOL", px: 184.26 }]}
      columns={[
        { key: "sym", header: "Token", cell: (r: { sym: string }) => r.sym, sortable: true },
        { key: "px", header: "Price", align: "right", cell: (r: { px: number }) => `$${r.px}` },
      ]}
    />
  ),
  AddressChip: () => (
    <AddressChip address="7xKtF3aB9cD2eF4gH6jK8mN1pQ5rS7tU9vW2xY4z9fQ2" href="https://solscan.io/x" />
  ),
  PegBadge: () => (
    <div className="flex gap-2">
      <PegBadge deviationBps={4} />
      <PegBadge deviationBps={-38} />
      <PegBadge deviationBps={-230} />
    </div>
  ),
  NetworkBadge: () => <NetworkBadge name="Solana" />,
  TxStatus: () => <TxStatus state="pending" detail="5D3k…Wq" />,
  AmountInput: () => (
    <AmountInput value="1.25" onValueChange={() => {}} symbol="SOL" fiatValue="≈ $231.40" onMax={() => {}} />
  ),
  // Portal components rendered OPEN so axe sees the real overlay DOM.
  Select: () => (
    <Select
      aria-label="Network"
      options={[{ value: "sol", label: "Solana" }]}
      value={"sol"}
      onValueChange={() => {}}
    />
  ),
  Dialog: () => (
    <Dialog open onOpenChange={() => {}} title="Remove wallet?" description="Confirm below.">
      body
    </Dialog>
  ),
  Menu: () => (
    <Menu
      trigger={<IconButton aria-label="Actions">⋯</IconButton>}
      items={[{ label: "Copy link", onSelect: () => {} }]}
    />
  ),
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
