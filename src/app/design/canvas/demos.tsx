"use client";

import { useEffect, useState, type ReactNode } from "react";
import { PATTERN_DEMOS } from "./patternDemos";
import { OrderBookPanel } from "../templates/exchange/OrderBookPanel";
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
  Skeleton,
  SectionSkeleton,
  Tooltip,
  Button,
  IconButton,
  Badge,
  Input,
  Dialog,
  Menu,
  Switch,
  Checkbox,
  Select,
  Tabs,
  ToastProvider,
  useToast,
  Divider,
  EmptyState,
  DataTable,
  type Column,
  RollingNumber,
  PriceChange,
  StatCell,
  Sparkline,
  AddressChip,
  PegBadge,
  NetworkBadge,
  TxStatus,
  AmountInput,
  type TxState,
  Accordion,
  Alert,
  Card,
  Progress,
  RadioGroup,
  Textarea,
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

function DialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Remove wallet…</Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Remove wallet?"
        description="This disconnects @mira from this device."
        footer={
          <>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => setOpen(false)}>
              Remove
            </Button>
          </>
        }
      />
    </>
  );
}

function SwitchDemo() {
  const [on, setOn] = useState(true);
  return (
    <label className="flex items-center gap-3 text-sm text-fg">
      <Switch checked={on} onCheckedChange={setOn} aria-label="Public watchlist" />
      Public watchlist
    </label>
  );
}

function RadioGroupDemo() {
  const [slippage, setSlippage] = useState<"0.1" | "0.5" | "1.0" | undefined>("0.5");
  return (
    <RadioGroup
      aria-label="Slippage tolerance"
      value={slippage}
      onValueChange={setSlippage}
      options={[
        { value: "0.1", label: "0.1%", description: "May fail on volatile pairs" },
        { value: "0.5", label: "0.5%", description: "Recommended" },
        { value: "1.0", label: "1.0%" },
      ]}
    />
  );
}

function ProgressDemo() {
  const [value, setValue] = useState(15);
  useEffect(() => {
    const id = setInterval(() => setValue((v) => (v >= 100 ? 0 : v + 17)), 1200);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <p className="text-xs text-fg-muted">Determinate — value {Math.min(value, 100)}%</p>
        <Progress aria-label="Upload progress" value={value} />
      </div>
      <div className="space-y-1.5">
        <p className="text-xs text-fg-muted">Indeterminate — unknown duration</p>
        <Progress aria-label="Syncing" />
      </div>
    </div>
  );
}

function CheckboxDemo() {
  const [checked, setChecked] = useState(true);
  return (
    <label className="flex items-center gap-2.5 text-sm text-fg">
      <Checkbox checked={checked} onCheckedChange={setChecked} aria-label="Show depegged" />
      Show depegged assets
    </label>
  );
}

function SelectDemo() {
  const [net, setNet] = useState<string | undefined>("sol");
  return (
    <Select
      aria-label="Network"
      value={net}
      onValueChange={setNet}
      options={[
        { value: "sol", label: "Solana" },
        { value: "eth", label: "Ethereum" },
        { value: "base", label: "Base", disabled: true },
      ]}
    />
  );
}

function TabsDemo() {
  const [tab, setTab] = useState("news");
  return (
    <Tabs
      value={tab}
      onValueChange={setTab}
      tabs={[
        { value: "news", label: "News", content: <p className="text-xs text-fg-muted">NVDAx leads tokenized-equity volume…</p> },
        { value: "kpis", label: "KPIs", content: <p className="data-md text-fg">$1.09B mcap · $84.2M vol</p> },
      ]}
    />
  );
}

function ToastInner() {
  const toast = useToast();
  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" onClick={() => toast({ title: "Watchlist updated", description: "JUP added", tone: "buy" })}>
        success toast
      </Button>
      <Button size="sm" variant="ghost" onClick={() => toast({ title: "Couldn't reach the network", tone: "sell" })}>
        error toast
      </Button>
    </div>
  );
}

function RollingDemo() {
  const [px, setPx] = useState(184.26);
  useEffect(() => {
    const id = setInterval(
      () => setPx((v) => +(v + (Math.random() - 0.5) * 0.4).toFixed(2)),
      1200,
    );
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex items-baseline gap-3">
      <RollingNumber value={`$${px.toFixed(2)}`} className="data-lg" />
      <PriceChange value={+(px - 184.26).toFixed(2)} suffix="" />
    </div>
  );
}

type MarketRow = { sym: string; px: number; ch: number; vol: string; trend: number[] };
const MARKET_ROWS: MarketRow[] = [
  { sym: "SOL", px: 184.26, ch: 3.6, vol: "$3.18B", trend: [3, 4, 3, 5, 6, 7] },
  { sym: "JUP", px: 0.8123, ch: -1.7, vol: "$142.6M", trend: [5, 4, 4, 3, 3, 2] },
  { sym: "BONK", px: 0.00002314, ch: 6.9, vol: "$318.4M", trend: [2, 2, 3, 4, 4, 6] },
  { sym: "JTO", px: 2.448, ch: -2.1, vol: "$38.2M", trend: [5, 5, 4, 4, 3, 3] },
];
const MARKET_COLS: Column<MarketRow>[] = [
  { key: "sym", header: "Token", cell: (r) => r.sym, sortable: true, sortValue: (r) => r.sym },
  { key: "px", header: "Price", align: "right", sortable: true, cell: (r) => `$${r.px}`, sortValue: (r) => r.px },
  { key: "ch", header: "24h", align: "right", sortable: true, cell: (r) => <PriceChange value={r.ch} />, sortValue: (r) => r.ch },
  { key: "vol", header: "Volume", align: "right", cell: (r) => r.vol },
  { key: "trend", header: "7d", align: "right", cell: (r) => <Sparkline data={r.trend} width={64} height={20} /> },
];

function TxStatusDemo() {
  const [state, setState] = useState<TxState>("idle");
  useEffect(() => {
    const SEQ: TxState[] = ["idle", "signing", "pending", "confirmed"];
    const id = setInterval(
      () => setState((s) => SEQ[(SEQ.indexOf(s) + 1) % SEQ.length]),
      1800,
    );
    return () => clearInterval(id);
  }, []);
  return <TxStatus state={state} detail={state === "pending" ? "5D3k…Wq signature" : undefined} />;
}

function AmountDemo() {
  const [amt, setAmt] = useState("1.25");
  return (
    <AmountInput
      value={amt}
      onValueChange={setAmt}
      symbol="SOL"
      fiatValue={`≈ $${(Number(amt || 0) * 184.26).toFixed(2)}`}
      onMax={() => setAmt("12.4821")}
    />
  );
}

export const DEMOS: Record<string, () => ReactNode> = {
  ...PATTERN_DEMOS,
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
          <Avatar name={hue} hue={hue} size="md" />
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
      <Avatar name="Mira" seed="wallet-mira" size="xs" />
      <Avatar name="Mira" seed="wallet-mira" size="sm" />
      <Avatar name="Mira" seed="wallet-mira" size="md" />
      <Avatar name="Mira" seed="wallet-mira" size="lg" />
      <Avatar name="You" you size="md" />
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
  Button: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="primary">Confirm</Button>
      <Button>Cancel</Button>
      <Button variant="ghost">Skip</Button>
      <Button variant="destructive" size="sm">Remove</Button>
      <Button disabled>Disabled</Button>
    </div>
  ),
  IconButton: () => (
    <div className="flex items-center gap-2">
      <IconButton aria-label="Settings" variant="secondary">⚙</IconButton>
      <IconButton aria-label="Close">×</IconButton>
      <IconButton aria-label="Add" variant="primary" size="lg">+</IconButton>
    </div>
  ),
  Badge: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>neutral</Badge>
      <Badge tone="brand">new</Badge>
      <Badge tone="buy">on peg</Badge>
      <Badge tone="sell">depegged</Badge>
      <Badge tone="warning">pending</Badge>
      <Badge tone="info">bridged</Badge>
    </div>
  ),
  Input: () => (
    <div className="space-y-2">
      <Input aria-label="Search" placeholder="Search tokens…" />
      <Input aria-label="Handle" invalid defaultValue="taken_handle" />
    </div>
  ),
  Dialog: DialogDemo,
  AddressChip: () => (
    <AddressChip
      address="7xKtF3aB9cD2eF4gH6jK8mN1pQ5rS7tU9vW2xY4z9fQ2"
      href="https://solscan.io/token/x"
    />
  ),
  PegBadge: () => (
    <div className="flex flex-wrap gap-2">
      <PegBadge deviationBps={4} />
      <PegBadge deviationBps={-38} />
      <PegBadge deviationBps={-230} />
    </div>
  ),
  NetworkBadge: () => (
    <div className="flex gap-2">
      <NetworkBadge name="Solana" iconSrc="https://cdn.defitriangle.xyz/logos/network/solana/32.png" />
      <NetworkBadge name="Base" />
    </div>
  ),
  TxStatus: TxStatusDemo,
  AmountInput: AmountDemo,
  OrderBook: () => <OrderBookPanel />,
  RollingNumber: RollingDemo,
  PriceChange: () => (
    <div className="flex items-center gap-4">
      <PriceChange value={9.4} />
      <PriceChange value={-4.2} />
      <PriceChange value={0.04} suffix=" bps" precision={2} />
    </div>
  ),
  StatCell: () => (
    <div className="grid grid-cols-3 divide-x divide-outline-variant rounded-card border border-outline-variant bg-surface-container">
      <StatCell label="Market cap" value="$1.09B" />
      <StatCell label="24h volume" value="$84.2M" change={<PriceChange value={12.4} />} />
      <StatCell label="Liquidity" value="$18.7M" change={<PriceChange value={-0.8} />} />
    </div>
  ),
  Sparkline: () => (
    <div className="flex items-center gap-4">
      <Sparkline data={[2, 3, 2, 5, 6, 8]} label="up trend" />
      <Sparkline data={[8, 7, 7, 5, 4, 3]} label="down trend" />
      <Sparkline data={[4, 5, 4, 5, 4, 5]} tone="neutral" label="flat" />
    </div>
  ),
  DataTable: () => (
    <DataTable columns={MARKET_COLS} rows={MARKET_ROWS} rowKey={(r) => r.sym} caption="Markets" />
  ),
  Switch: SwitchDemo,
  Checkbox: CheckboxDemo,
  Select: SelectDemo,
  Tabs: TabsDemo,
  Toast: () => (
    <ToastProvider>
      <ToastInner />
    </ToastProvider>
  ),
  Divider: () => (
    <div className="text-xs text-fg-muted">
      section one
      <Divider className="my-2" />
      section two
    </div>
  ),
  EmptyState: () => (
    <EmptyState
      title="No watchers yet"
      hint="Quiet tide. First one in sets the current."
      action={<Button variant="primary" size="sm">Watch JUP</Button>}
    />
  ),
  Menu: () => (
    <Menu
      trigger={<IconButton aria-label="Post actions" variant="secondary">⋯</IconButton>}
      items={[
        { label: "Copy link", onSelect: () => {} },
        { label: "Mute @deg", onSelect: () => {} },
        { kind: "separator" },
        { label: "Delete", onSelect: () => {}, destructive: true },
      ]}
    />
  ),
  Skeleton: () => (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <SectionSkeleton height={96} label="Stats" />
    </div>
  ),
  Card: () => (
    <div className="space-y-3">
      <Card>
        <p className="text-sm font-medium text-fg">Portfolio</p>
        <p className="text-xs text-fg-muted">3 positions · $12,480</p>
      </Card>
      <Card interactive>
        <p className="text-sm font-medium text-fg">Interactive card</p>
        <p className="text-xs text-fg-muted">hover lifts · press scales 0.98</p>
      </Card>
    </div>
  ),
  Accordion: () => (
    <Accordion
      items={[
        { value: "fees", title: "Fees", content: <p>0.25% taker · 0.10% maker</p> },
        { value: "route", title: "Route details", content: <p>SOL → USDC via Jupiter</p> },
        { value: "risk", title: "Risk", content: <p>Price impact 0.4% · slippage 0.5%</p> },
      ]}
    />
  ),
  Alert: () => (
    <div className="space-y-3">
      <Alert tone="warning" title="High price impact">
        This trade moves the pool price by 4.2%.
      </Alert>
      <Alert
        tone="error"
        title="Feed unavailable"
        action={<Button size="sm" variant="ghost">Retry</Button>}
      >
        Prices may be stale.
      </Alert>
    </div>
  ),
  Textarea: () => (
    <div className="space-y-3">
      <Textarea aria-label="Note" placeholder="Add a note to this transaction…" />
      <Textarea aria-label="Invalid note" invalid defaultValue="Too long for a memo field" rows={2} />
    </div>
  ),
  RadioGroup: RadioGroupDemo,
  Progress: ProgressDemo,
  Tooltip: () => (
    <div className="flex items-center gap-2 text-sm text-fg-muted">
      Organic score
      <Tooltip
        content="Jupiter's 0–100 estimate of how much volume is real-human."
        title="Organic score"
      >
        <button
          type="button"
          aria-label="About organic score"
          className="inline-flex h-6 w-6 items-center justify-center rounded-control bg-surface-container-high text-[11px] text-fg-muted"
        >
          ?
        </button>
      </Tooltip>
    </div>
  ),
};
