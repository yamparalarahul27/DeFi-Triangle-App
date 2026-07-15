# Changelog

All notable user-visible changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning is **date-based** (`YYYY-MM-DD`) rather than SemVer — there is no
public API to version yet, and "released on date X" is more meaningful than
a synthetic version number until v1.0.

<details>
<summary><b>Conventions used in this file</b></summary>

- **[Unreleased]** — what is currently on `stage` and not yet on `main`. Users do not see this on prod yet.
- **[YYYY-MM-DD]** — each dated section corresponds to one `stage → main` release PR. The PR number is linked in the section heading.
- **Change-type buckets** (per Keep a Changelog):
  - **Added** — new features / surfaces / capabilities
  - **Changed** — modifications to existing behaviour or appearance
  - **Fixed** — bug fixes
  - **Removed** — features taken out
  - **Deprecated** — marked-for-removal, still works
  - **Security** — vulnerability fixes
- **Feature-flagged work** lives under `### Changed → behind flag` until the flag is flipped on prod, at which point it is reframed as **Added** in the next release.
- **Each bullet** ends with the PR or commit it shipped in: `(#NN)` for PRs, `abc1234` for direct commits.

</details>

---

## Design-system versioning (policy)

Components under `src/design-system/` carry their own SemVer in the
doc header (`Version:`), independent of this date-based file. Rules
live in `src/design-system/CONVENTIONS.md → Lifecycle`; the short
form: patch = fix · minor = additive **or visual** (noted here) ·
major = breaking, stable-only, with a migration note; `deprecated`
precedes removal by one release. Per-component changes get their own
bullets under the release's buckets, prefixed with the component name.

## [Unreleased]

### Added

- **Navigation & overlays batch (component-gaps Batch 2)** — seven new
  components, all entering as `draft @ 0.9.0`: **AppBar** (leading ·
  title · actions header row, optional sticky), **BottomNav** (mobile
  tab bar, labels always visible, safe-area built in), **Combobox**
  (typeahead select, pick-from-list only — hand-rolled ARIA 1.2 on
  Radix Popover, no cmdk dependency, registry-portable), **Popover**
  (the Radix primitive, now public — Menu's free-form sibling),
  **Drawer** (side sheet right/left on Radix Dialog — Sheet's desktop
  sibling), **Breadcrumbs** (path navigation), **Pagination** (windowed
  page controls with ellipses). ContextMenu deferred (tracker).

- **Containment & forms batch (component-gaps Batch 1)** — six new
  components, all entering as `draft @ 0.9.0`: **Accordion**
  (single/multiple, Radix, height-animated), **Card** (the generic
  container primitive; `interactive` adds hover lift + 0.98 press),
  **Alert** (inline callout on the tinted state surfaces, tone word +
  tint, `role=alert` only for errors), **RadioGroup** (Radix, visible
  one-of-N with descriptions), **Textarea** (Input's multi-line
  sibling), **Progress** (Radix bar, determinate + indeterminate
  shimmer — the system's one sanctioned looping animation). Plus
  `docs/cids-component-gaps.md`, the tracked next-ring gap list
  (batches 2–3: navigation/overlays, crypto round 2).

- **Design system v1.0.0 baseline** — all 35 stable components set to
  `Version: 1.0.0` (drafts at 0.9.0: CommentThread, Onboarding);
  lifecycle ladder + versioning policy adopted; registry item
  descriptions surface versions. (Phase 7b)

> Currently on `stage`, not yet released to `main`.

### Added

- **Shape tokens (Theme Studio step 1).** The radius family is now
  token-driven: `--radius-control/chip/card/sheet` in `globals.css`,
  consumed via `rounded-control/chip/card/sheet` utilities across all
  design-system components. Defaults identical to before (2/4/8/12px) —
  zero visual change — but themes and the upcoming canvas token panel can
  reshape every component live. Stroke + spacing tokens deferred. (#76)

- **9 components promoted `draft → stable`** under the new stability
  contract: Avatar, AvatarGroup, TokenChip, SocialProofChip, ReactionBar,
  FollowButton, Lane, Sheet, PostCard. Their prop APIs are now frozen
  (adds-only; breaking changes require a migration note here). Held at
  `draft`: TokenIcon (icon-CDN default pending), CommentThread and
  Onboarding (APIs expected to churn when live data lands). (#76)
- **Agentic-kit ideation doc** (`docs/ideation/agentic-kit.md`) — the
  AI-native crypto pattern families (intent, explanation, agent
  permission, proactive insight, trust primitives) parked for Phase E. (#76)

- **Design-system stability program (Phase D).** Behavior test suite for all
  12 CIDS components — 50 tests via vitest + testing-library (render,
  interactions, a11y contracts, sign-discipline cases). New `npm test`
  script; `stable` promotion contract documented in
  `src/design-system/CONVENTIONS.md`; test files colocated but excluded
  from the vendored/portability surface. (#75)
- **Watchlist v1 live** — single watchlist per wallet, JWT-gated CRUD via `/api/watchlist`, optimistic add/remove with rollback. Sign-in via Solana wallet message-signing through `@jup-ag/wallet-adapter`. Plumbing was previously gated by `FEATURES.WATCHLIST` + `FEATURES.WALLET_CONNECT`; both now `true`.
- Multi-watchlist backlog captured at [docs/ideation/multi-watchlist.md](./docs/ideation/multi-watchlist.md) — named folders per wallet, planned as the next major Watchlist iteration after v1 sees usage signal.
- Static polish guard — `npm run check:polish` Node script asserting the 6 [make-interfaces-feel-better](https://github.com/jakubkrehel/make-interfaces-feel-better) rules stay in place. (#44)
- `docs/ideation/` folder with first-batch product captures: Trade Edge tab, NFT Edge tab, cosmos canvas, visual gas fees, parabolic add animation, trash-throw delete animation.
- Root `CHANGELOG.md` (this file) — reusable template for other apps too.
- Inline-HTML guidance for `.md` files in `CLAUDE.md` (use `<details>`, side-by-side `<table>`, `<sub>` / `<sup>` when they meaningfully improve readability).

### Changed
- UI polish pass across tab pills, cards, info-dot hit areas, and rail headings — targeted transitions (no `transition-all`), 40×40 hit areas, layered shadows, scale-on-press feedback, concentric border radius, `text-wrap: balance/pretty`. (#44)

### Removed
- `package-lock.json` resolver drift (untracked).
- Local skill installer artifacts (`.claude/skills/`, `skills-lock.json`) now in `.gitignore` — never shipped.

---

## [2026-05-01] — Stablecoin rail v1.1 ([PR #43](https://github.com/yamparalarahul27/defi_triangle_app/pull/43))

### Added
- Featured **PUSD tile** with peg-health legend tooltip in the Park Your Money rail. (#39)
- Asset-tracking rule documented in `CLAUDE.md` — *local existence ≠ deployment*, every `public/` asset must be `git add`'d. (#41 follow-up)
- PUSD logo committed to `public/` (was previously dev-server-only, would 404 on Vercel). (#41)

### Fixed
- **Sign preservation** on `pegDeviationBps` — peg-state badge now uses `|bps|` for tier bucketing while keeping the signed delta for direction arrows. (#39)
- StableTokenModal icon mismatch on `LiveBody`. (#39)
- Percent-sign + stablecoin icon colour/direction mismatch on home + search results. (#39)

---

## [2026-05-01] — Stablecoin rail v1.0 + token polish batch ([PR #40](https://github.com/yamparalarahul27/defi_triangle_app/pull/40))

### Added
- **Park Your Money** stablecoin rail on home, gated behind `FEATURES.STABLECOIN`. (#38)
- Stablecoin click-modal with USDe → USDG swap pair. (#38)
- Session handoff doc for stablecoin rail work — `docs/stablecoin-rail-handoff.md`. (#38)
- ASCII-diagram rule in `CLAUDE.md` — every non-trivial UI/UX change recap includes a small ASCII diagram for mobile-Safari readers. (#38)

### Changed
- StableCard issuer subtitle + correct swap pair labels. (#38)
- Stablecard Δ glyph swapped for Up/Down SVG icons. (#38)

### Fixed
- Chart tooltip showed wrong price on small-cap tokens. (#34, #35)

---

## [2026-04-30] — Brand completeness + chart polish + token-detail upgrades ([PR #37](https://github.com/yamparalarahul27/defi_triangle_app/pull/37))

### Added
- **Brand kit page** at `/brand` — minimal reference for colour tokens (Frost/Hela/Loki), typography stack, spacing. (#26, #36)
- **NumberFlow** library wired up on token-detail mutating numerics (P5 Tier a). (#33)
- **Progressive token rendering** + edge cache layer on home + token detail. (#30)
- Orphaned PNG asset wired in + `apple-icon`. (#36)

### Changed
- Search palette `kbd` Unicode glyphs swapped for Lucide icons — consistent icon set across the app. (#32)
- Token chart-area polish batch 1.2 + 1.3 + 1.4. (#25)

### Fixed
- Top holders external link goes to Birdeye (was Solscan). (#24)
- Edge-score 2-line rows + hardened mobile tooltip detection. (#22, #23)
- Edge score row overflow + mobile-aware tooltips. (#22)

---

## [2026-04-28] — Token-detail v0 ([PR #10](https://github.com/yamparalarahul27/defi_triangle_app/pull/10) and earlier)

<details>
<summary>Show earlier history</summary>

### Added
- First-pass token-detail page with edge-score breakdown.
- Holder distribution + variants section.
- Session-start protocol + workflow & release flow rules in `CLAUDE.md`.

### Changed
- `CLAUDE.md` synced from `stage` to `main` as the canonical source.

### Fixed
- Various small token-detail layout fixes and copy tweaks.

> History before 2026-04-28 is best read from `git log origin/main --oneline` directly — the project was still in early scaffolding and per-release notes would be more noise than signal.

</details>

---

## Reusing this file in another app

If you're copying this template into another project:

1. Keep the **header, conventions block, and section structure** — they document the format.
2. Replace the **release history** with your own — populate from `git log` grouped by release-PR boundary.
3. Adjust the **change-type buckets** if you have project-specific categories (e.g. *Database migrations* for backend-heavy apps).
4. Keep the **[Unreleased]** section at the top — it's the contract between `stage` and `main`.

The template assumes a `stage → main` workflow (see [CLAUDE.md → Workflow & release flow](./CLAUDE.md#workflow--release-flow)). If your project uses trunk-based or release-branch flow, rename `Unreleased` → `Next` or `main` accordingly.
