// Curated canvas layout — world coordinates (px at scale 1).
// Zones flow left→right: Foundations → Components → Screens → Mocks.

export type CanvasItemDef =
  | { kind: "label"; id: string; title: string; x: number; y: number }
  | { kind: "demo"; id: string; title: string; x: number; y: number; w: number }
  | {
      kind: "iframe";
      id: string;
      title: string;
      x: number;
      y: number;
      w: number;
      h: number;
      src: string;
    };

const COL = 400; // component column pitch
const CX = 60; // components zone origin x
const CY = 200;

export const CANVAS_ITEMS: CanvasItemDef[] = [
  // ── Zone: Foundations ────────────────────────────────────────
  { kind: "label", id: "z-foundations", title: "Foundations", x: 60, y: 60 },
  { kind: "demo", id: "surfaces", title: "Surfaces", x: CX, y: 120, w: 340 },
  { kind: "demo", id: "hues", title: "Identity hues", x: CX + COL, y: 120, w: 340 },
  { kind: "demo", id: "motion", title: "Motion", x: CX + COL * 2, y: 120, w: 340 },

  // ── Zone: Components (4 cols) ────────────────────────────────
  { kind: "label", id: "z-components", title: "Components", x: 60, y: CY + 200 },
  { kind: "demo", id: "Avatar", title: "Avatar", x: CX, y: CY + 260, w: 340 },
  { kind: "demo", id: "AvatarGroup", title: "AvatarGroup", x: CX + COL, y: CY + 260, w: 340 },
  { kind: "demo", id: "TokenChip", title: "TokenChip", x: CX + COL * 2, y: CY + 260, w: 340 },
  { kind: "demo", id: "SocialProofChip", title: "SocialProofChip", x: CX + COL * 3, y: CY + 260, w: 340 },
  { kind: "demo", id: "ReactionBar", title: "ReactionBar", x: CX, y: CY + 520, w: 340 },
  { kind: "demo", id: "FollowButton", title: "FollowButton", x: CX + COL, y: CY + 520, w: 340 },
  { kind: "demo", id: "Lane", title: "Lane", x: CX + COL * 2, y: CY + 520, w: 340 },
  { kind: "demo", id: "Sheet", title: "Sheet", x: CX + COL * 3, y: CY + 520, w: 340 },
  { kind: "demo", id: "PostCard", title: "PostCard", x: CX, y: CY + 780, w: 380 },
  { kind: "demo", id: "CommentThread", title: "CommentThread", x: CX + COL + 40, y: CY + 780, w: 340 },
  { kind: "demo", id: "Onboarding", title: "Onboarding", x: CX + COL * 2 + 40, y: CY + 780, w: 340 },
  { kind: "demo", id: "TokenIcon", title: "TokenIcon", x: CX + COL * 3 + 40, y: CY + 780, w: 300 },
  { kind: "demo", id: "Skeleton", title: "Skeleton", x: CX, y: CY + 1040, w: 340 },
  { kind: "demo", id: "Tooltip", title: "Tooltip", x: CX + COL, y: CY + 1040, w: 300 },

  // ── Zone: Primitives (Phase 4 core atoms) ────────────────────
  { kind: "label", id: "z-primitives", title: "Primitives — core atoms", x: CX, y: CY + 1240 },
  { kind: "demo", id: "Button", title: "Button", x: CX, y: CY + 1300, w: 380 },
  { kind: "demo", id: "IconButton", title: "IconButton", x: CX + COL + 40, y: CY + 1300, w: 300 },
  { kind: "demo", id: "Badge", title: "Badge", x: CX + COL * 2 + 40, y: CY + 1300, w: 340 },
  { kind: "demo", id: "Input", title: "Input", x: CX, y: CY + 1520, w: 340 },
  { kind: "demo", id: "Dialog", title: "Dialog", x: CX + COL, y: CY + 1520, w: 340 },
  { kind: "demo", id: "Menu", title: "Menu", x: CX + COL * 2 + 40, y: CY + 1520, w: 300 },
  { kind: "demo", id: "Select", title: "Select", x: CX + COL * 3 + 40, y: CY + 1520, w: 300 },
  { kind: "demo", id: "Switch", title: "Switch", x: CX, y: CY + 1740, w: 300 },
  { kind: "demo", id: "Checkbox", title: "Checkbox", x: CX + COL - 40, y: CY + 1740, w: 300 },
  { kind: "demo", id: "Tabs", title: "Tabs", x: CX + COL * 2 - 40, y: CY + 1740, w: 380 },
  { kind: "demo", id: "Toast", title: "Toast", x: CX, y: CY + 1980, w: 340 },
  { kind: "demo", id: "Divider", title: "Divider", x: CX + COL, y: CY + 1980, w: 300 },
  { kind: "demo", id: "EmptyState", title: "EmptyState", x: CX + COL * 2, y: CY + 1980, w: 380 },

  // ── Zone: Data (Phase 5 terminal-grade layer) ────────────────
  { kind: "label", id: "z-data", title: "Data — terminal grade", x: CX, y: CY + 2220 },
  { kind: "demo", id: "RollingNumber", title: "RollingNumber", x: CX, y: CY + 2280, w: 340 },
  { kind: "demo", id: "PriceChange", title: "PriceChange", x: CX + COL, y: CY + 2280, w: 300 },
  { kind: "demo", id: "StatCell", title: "StatCell", x: CX + COL * 2, y: CY + 2280, w: 380 },
  { kind: "demo", id: "Sparkline", title: "Sparkline", x: CX + COL * 3 + 40, y: CY + 2280, w: 300 },
  { kind: "demo", id: "DataTable", title: "DataTable", x: CX, y: CY + 2520, w: 560 },

  // ── Zone: Crypto (the whitespace no reference system ships) ──
  { kind: "label", id: "z-crypto", title: "Crypto — the vertical", x: CX, y: CY + 2900 },
  { kind: "demo", id: "AddressChip", title: "AddressChip", x: CX, y: CY + 2960, w: 340 },
  { kind: "demo", id: "PegBadge", title: "PegBadge", x: CX + COL, y: CY + 2960, w: 340 },
  { kind: "demo", id: "NetworkBadge", title: "NetworkBadge", x: CX + COL * 2, y: CY + 2960, w: 300 },
  { kind: "demo", id: "TxStatus", title: "TxStatus", x: CX + COL * 3, y: CY + 2960, w: 340 },
  { kind: "demo", id: "AmountInput", title: "AmountInput", x: CX, y: CY + 3200, w: 340 },
  { kind: "demo", id: "OrderBook", title: "Order book — exchange density (demo)", x: CX + COL, y: CY + 3200, w: 460 },

  // ── Zone: Patterns (PATTERNS.md — composition recipes, live) ─
  { kind: "label", id: "z-patterns", title: "Patterns — composition recipes", x: CX, y: CY + 3560 },
  { kind: "demo", id: "PatternStates", title: "P1 · States catalog", x: CX, y: CY + 3620, w: 420 },
  { kind: "demo", id: "PatternTxFlow", title: "P2 · Transaction flow", x: CX + COL + 80, y: CY + 3620, w: 420 },
  { kind: "demo", id: "PatternFormRow", title: "P3 · Form row", x: CX + COL * 2 + 160, y: CY + 3620, w: 380 },
  { kind: "demo", id: "PatternMarketList", title: "P4 · Market list", x: CX, y: CY + 4040, w: 520 },

  // Templates (Phase 6b) — the range claim, framed live
  { kind: "iframe", id: "tpl-dapp", title: "Template — simple dApp", x: CX + COL * 2 + 160, y: CY + 4040, w: 400, h: 640, src: "/design/templates/simple-dapp" },
  { kind: "iframe", id: "tpl-exchange", title: "Template — exchange (compact)", x: CX + COL * 3 + 240, y: CY + 4040, w: 560, h: 640, src: "/design/templates/exchange" },

  // ── Zone: Screens (live build vs HTML mock, side by side) ────
  { kind: "label", id: "z-screens", title: "Screens — mock vs build", x: 1780, y: 60 },
  {
    kind: "iframe",
    id: "mock-feed",
    title: "feed.html (mock)",
    x: 1780,
    y: 120,
    w: 430,
    h: 900,
    src: "/Prototypes/tide/feed.html",
  },
  {
    kind: "iframe",
    id: "live-feed",
    title: "FeedScreen (live build)",
    x: 2280,
    y: 120,
    w: 430,
    h: 900,
    src: "/design/feed",
  },

  // ── Zone: HTML mocks ─────────────────────────────────────────
  { kind: "label", id: "z-mocks", title: "HTML prototypes", x: 1780, y: 1120 },
  {
    kind: "iframe",
    id: "mock-design",
    title: "design.html",
    x: 1780,
    y: 1180,
    w: 430,
    h: 800,
    src: "/Prototypes/tide/design.html",
  },
  {
    kind: "iframe",
    id: "mock-markets",
    title: "markets.html",
    x: 2280,
    y: 1180,
    w: 430,
    h: 800,
    src: "/Prototypes/tide/markets.html",
  },
  {
    kind: "iframe",
    id: "mock-states",
    title: "states.html",
    x: 2780,
    y: 1180,
    w: 430,
    h: 800,
    src: "/Prototypes/tide/states.html",
  },
];
