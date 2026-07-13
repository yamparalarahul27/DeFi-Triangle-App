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

## The system

- **32 components** under [`src/design-system/`](src/design-system/) —
  Avatar, AvatarGroup, TokenIcon, TokenChip, ReactionBar, FollowButton,
  Lane, SocialProofChip, PostCard, Sheet, CommentThread, Onboarding,
  Skeleton, Tooltip, and the Phase-4 atoms — Button, IconButton, Badge,
  Input, Dialog, Menu (now stable), Switch, Checkbox, Select, Tabs,
  Toast, Divider, EmptyState, and the Phase-5 data layer — DataTable,
  RollingNumber, PriceChange, StatCell, Sparkline (18 stable · 14
  draft, per each doc's `Status:` header). Every one
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

## Roadmap

The end-to-end evolution plan — foundations, API contract, light theme,
core atoms, terminal-grade density, registry distribution — lives in
[docs/cids-roadmap.md](docs/cids-roadmap.md) with per-phase gates and an
M0→M4 maturity scorecard.

## Develop

```bash
npm install
npm run dev              # http://localhost:3000
```

## Repo history

This repo began as a DeFi trading app (DeFi Triangle / tide); the engine
(API routes under `src/app/api/`, wallet auth, Supabase) is intact but
dormant after the pivot to CIDS. The tide HTML prototypes under
`public/Prototypes/` now serve as design references, framed on the canvas.
