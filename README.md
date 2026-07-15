# cids ~ crypto interface design system

Live React components, semantic tokens, and the patterns crypto UIs rebuild
badly every time — signed price direction, wallet-hashed identity, peg
status, social proof. Browse them on an infinite canvas, inspect the doc a
human and an AI agent both build from, and flip themes live.

> Shaped after [Astryx](https://github.com/facebook/astryx)'s ideas —
> tokens as the contract, themes as swappable value-sets, and docs written
> once for humans *and* AI agents — applied to the crypto vertical.

## Surfaces

| Route | What | Best on |
|---|---|---|
| `/` | Landing | anywhere |
| `/design/canvas` | **Infinite canvas** — pan/zoom the whole system; layers rail; select any component to inspect its real `.doc.md` | desktop |
| `/design` | Component gallery | mobile-friendly |
| `/design/feed` | The system composed as a real screen (mock data) | mobile-friendly |
| `/design/templates/simple-dapp` | **Template** — the consumer end (connect, balances, send flow) | mobile-friendly |
| `/design/templates/exchange` | **Template** — the terminal end (markets, order book, trade form) at compact density | desktop |

## The system

- **54 components** under [`src/design-system/`](src/design-system/) —
  Avatar, AvatarGroup, TokenIcon, TokenChip, ReactionBar, FollowButton,
  Lane, SocialProofChip, PostCard, Sheet, CommentThread, Onboarding,
  Skeleton, Tooltip, and the Phase-4 atoms — Button, IconButton, Badge,
  Input, Dialog, Menu (now stable), Switch, Checkbox, Select, Tabs,
  Toast, Divider, EmptyState, the Phase-5 data layer — DataTable,
  RollingNumber, PriceChange, StatCell, Sparkline — the crypto
  verticals nobody else ships: AddressChip, PegBadge, NetworkBadge,
  TxStatus, AmountInput — the containment & forms batch: Accordion,
  Alert, Card, Progress, RadioGroup, Textarea — the navigation &
  overlays batch: AppBar, BottomNav, Breadcrumbs, Combobox, Drawer,
  Pagination, Popover — and crypto round 2: Amount, ChainSwitcher,
  GasFee, WalletButton (**35 stable · 19 draft**,
  per each doc's `Status:` header; gap tracker in
  [`docs/cids-component-gaps.md`](docs/cids-component-gaps.md)). Every one
  ships a colocated `.doc.md` in the fixed shape defined by
  [`CONVENTIONS.md`](src/design-system/CONVENTIONS.md) (Anatomy · Props ·
  Tokens · States · Motion · A11y). The canvas inspector renders those
  files from disk — docs can't drift from source.
- **Tokens** live in [`src/app/globals.css`](src/app/globals.css) and are
  the only way components get color/motion values
  ([DESIGN.md](DESIGN.md) is the spec).
- **Themes** are `[data-theme]` blocks overriding the same token names —
  `dark` (default), `mono` (grayscale except the signal), `light` (full
  re-valuation: white canvas, dark-jewel hues), and `violet` (white-label
  demo: accent swapped in one block). Adding one = one CSS block + an AA
  pass (`check:contrast` auto-discovers it); recipe in DESIGN.md.

## Guards

```bash
npm run check:theme      # no hardcoded hex utility classes
npm run check:contrast   # WCAG AA per theme (identity hues)
npm run check:polish     # interaction polish rules
npm run check:portable   # DS import allowlist + doc completeness
npm test                 # vitest — component behavior + sign discipline
npx tsc --noEmit && npm run lint
```

All of the above run in CI on every PR (`.github/workflows/ci.yml`).

## Install (copy-in, shadcn-style)

Point the shadcn CLI at the registry and the code lands in your repo —
you own it. Full walkthrough: [docs/cids-quickstart.md](docs/cids-quickstart.md).

```bash
npx shadcn add @cids/tokens     # the token layer + 4 themes + density
npx shadcn add @cids/button @cids/data-table @cids/tx-status
```

Every item ships its `.doc.md` beside the code; cross-deps resolve
automatically; `check:registry` keeps `public/r/` generated-from-source.

**Agents:** `scripts/cids-mcp.mjs` is a zero-dep MCP server over the
registry — `list_components` / `get_component` / `get_quickstart`;
spec + source in one call. Contributing: [docs/cids-contributing.md](docs/cids-contributing.md).

## Roadmap

The end-to-end evolution plan lives in
[docs/cids-roadmap.md](docs/cids-roadmap.md). **All seven phases and
their gates are complete — maturity M4 "Adoptable"** (2026-07-13):
foundations → API contract + axe×themes → 4 themes + Theme Studio →
27 atoms → density + the terminal layer → patterns + templates →
registry + governance.

## Develop

```bash
npm install
npm run dev              # http://localhost:3000
```

## Credits

- **[EvilCharts](https://github.com/legions-developer/evilcharts)** by
  legions-developer — vendored under `src/components/evilcharts/` and the
  charting engine behind **PriceChart** (`src/components/PriceChart/`).
  PriceChart is a *composition* on recharts, deliberately outside the
  portable design-system core (see
  [docs/cids-component-gaps.md](docs/cids-component-gaps.md)).

## Repo history

This repo began as a DeFi trading app (DeFi Triangle / tide); the engine
(API routes under `src/app/api/`, wallet auth, Supabase) is intact but
dormant after the pivot to CIDS. The tide HTML prototypes under
`public/Prototypes/` now serve as design references, framed on the canvas.
