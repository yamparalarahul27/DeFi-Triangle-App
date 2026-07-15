# CIDS — Component gap tracker

> Created 2026-07-15. The roadmap's original inventory (Tiers 1–3 +
> crypto whitespace) shipped in full by M4 — this file tracks the
> **next ring**: what reference systems (Material ~36, shadcn ~79,
> Carbon ~67, Coinbase CDS ~141) have that CIDS still lacks, so gaps
> stay recorded instead of rediscovered per session.
>
> Rules: one PR per batch; every component follows
> [cids-contributing.md](./cids-contributing.md) (7-section doc, tests,
> axe case, polish coverage, canvas demo, registry regen). New
> components enter as `draft @ 0.9.0` and are promoted per the
> CONVENTIONS.md ladder.

## Batch 1 — containment & forms (PR in flight)

The "every generic system has this" tier. All Radix-backed or trivial.

- [x] **Accordion** — collapsible sections (single/multiple)
- [x] **Card** — the generic container primitive (canonicalizes the
      hand-rolled `rounded-card border bg-surface-container` recipe)
- [x] **Alert** — inline callout on the tinted state surfaces
      (info/success/warning/error); Toast = events, Alert = conditions
- [x] **RadioGroup** — visible one-of-N (≤5 options; more → Select)
- [x] **Textarea** — Input's multi-line sibling, same grammar
- [x] **Progress** — determinate bar + indeterminate shimmer

## Batch 2 — navigation & overlays (PR in flight)

Every template/demo hand-rolls its header and bottom bar today —
repeated composition begging to be components.

- [x] **AppBar** — page header (title · actions · optional back)
- [x] **BottomNav** — mobile tab bar (the feed demo hand-rolls one)
- [x] **Combobox** — typeahead search-select; pick-from-list only
      (decision 2026-07-15). Hand-rolled ARIA 1.2 on Radix Popover —
      no cmdk (would break the portability import allowlist)
- [x] **Popover** — public primitive (Radix Popover was already used
      inside ReactionBar but wasn't exported)
- [x] **Drawer** — side sheet, right/left (Sheet stays bottom-only)
- [x] **Breadcrumbs** — path navigation for docs/console surfaces
- [x] **Pagination** — page controls for long tables
- [ ] ContextMenu — right-click menu (Radix; low urgency)

## Batch 3 — crypto vertical, round 2 (PR in flight)

Same argument as Phase 5b: the whitespace no generic system covers.

- [x] **WalletButton** — connect → connecting → connected account pill
      (Reown's atom; templates hand-rolled it from Button + AddressChip).
      Presentational; disconnect lives in the account UI, never on the button
- [x] **ChainSwitcher** — active network + switch menu (NetworkBadge
      stays display-only). Radix DropdownMenu radio semantics
- [x] **GasFee** — fee/priority display with congestion severity (no
      reference system ships this; pure whitespace). Word + tint, mono-safe
- [x] **Amount** — read-only formatted token amount (AmountInput's
      display sibling: magnitude-aware decimals, dust handling, sign discipline)
- [ ] **PriceChart** — scrubber chart (CDS's signature; Sparkline is a
      trendline, evilcharts is vendored outside the system). **Own PR** —
      biggest single component in the tracker
- [ ] QRCode — receive-address display (needs a dependency decision)
- [ ] SeedPhrase — reveal/confirm grid (only if onboarding flows land)

## Deliberate non-goals (recorded, not forgotten)

- **FAB / SplitButton** — no surface in the crypto vertical wants them.
- **DatePicker / Calendar** — heavy; defer until a real consumer asks.
- **Virtualized lists** — recipe documented (DataTable ↔ TanStack
  pairing) instead of a component.
- **RTL / i18n** — boundary documented in CONVENTIONS.md.

## History

| Date | Change |
|---|---|
| 2026-07-15 | File created; Batch 1 shipped as `feat/components-batch-1` (PR #97, merged). |
| 2026-07-15 | Batch 2 shipped as `feat/components-batch-2` (PR #98, merged; ContextMenu deferred). |
| 2026-07-15 | Batch 3 shipped as `feat/components-batch-3` (4 components; PriceChart split to its own PR). |
