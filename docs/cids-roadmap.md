# CIDS — Evolution Roadmap

> **North star.** Any designer or developer can pick up CIDS and build
> anything crypto — from a simple web3 app to a complex financial
> exchange. A **build-with system**, not a showcase. This doc is the
> end-to-end map from today's state to that bar, benchmarked against
> well-maintained systems (Material 3, Apple HIG, shadcn/ui, Radix,
> Polaris, Carbon, Primer) and the crypto-vertical references
> (Coinbase CDS, Reown/AppKit, ethereum.org design & UX).
>
> <sub>Written 2026-07-13 from a full codebase audit (file:line evidence) + reference research. Update the checkpoints table as phases land; this doc is the contract for the evolution, CONVENTIONS.md stays the contract for authoring.</sub>

---

## 1 · The range claim, made testable

"Simple dApp → financial exchange" decomposes into five capabilities.
Every phase below serves at least one; the maturity scorecard (§7)
measures all five.

```
R1 COVERAGE   enough components: atoms →
              molecules → data-dense pro parts
R2 DENSITY    one system serves consumer-airy
              AND terminal-dense (tokens, not forks)
R3 THEMING    a stranger can re-brand / re-theme
              without touching component code
R4 ADOPTION   time-to-first-component in minutes;
              templates for both ends of the range
R5 TRUST      docs/tests/versioning discipline that
              makes teams bet a product on it
```

---

## 2 · Where CIDS stands (audited)

Evidence-based snapshot @ `main` `3f68e82`. Full audit lives in the
PR that added this doc; file:line refs preserved where load-bearing.

**Strong — keep and defend:**
- **Doc-as-contract**: every component ships `.doc.md` in a fixed
  7-section shape (Usage·Anatomy·Props·Tokens·States·Motion·A11y),
  guard-enforced (`check:portable` P2). The canvas Inspector renders
  the *real* file from disk — docs cannot drift from source.
- **Token discipline**: components consume semantic tokens; hex is
  guard-banned (`check:theme`); per-theme WCAG contrast is *computed*,
  not eyeballed (`check:contrast`).
- **Portability**: import allowlist (react / radix-ui / cn) makes any
  component folder copy-pasteable (`check:portable` P1).
- **The canvas** as a docs surface (layers rail, doc+code inspector
  with copy buttons) — a genuine differentiator.
- 50 vitest tests incl. sign-discipline (▲/▼ + `Math.abs`) — the
  crypto-correctness seed.

**The 15 audited gaps, ranked:**

| # | Gap | Evidence |
|---|---|---|
| 1 | No distribution despite stated goal | `package.json` `private:true`, no `exports`; `components.json` registries `{}` |
| 2 | DESIGN.md (declared SoT) half-stale — documents the deleted app | `DESIGN.md:1,245-563,604-605` (dead `Button.tsx`, banned `transition-all`, old hex) |
| 3 | No shadow/elevation tokens; shadows hardcoded ×4 | `Lane.tsx:9`, `Sheet.tsx:60`, `ReactionBar.tsx:69`, `FeedScreen.tsx:237` |
| 4 | No CI — guards+tests run only by memory | no `.github/` |
| 5 | A11y holes: ReactionBar picker (no focus trap/Escape/outside-click), Lane tablist (no arrow keys) | `ReactionBar.tsx:66-86`, `Lane.tsx:41` |
| 6 | `className` contract broken 3 ways | `TokenIcon.tsx:40` concat; CommentThread/Onboarding omit it |
| 7 | `size` API non-uniform (numeric vs string vs absent 9/12) | `Avatar.tsx:4` vs `TokenIcon.tsx:5` vs `FollowButton.tsx:26` |
| 8 | No spacing / z-index tokens (8px scale documented, never tokenized) | `DESIGN.md:217-229` |
| 9 | Tests don't verify the promises (no axe, keyboard, theme-render, reduced-motion) | vs `CONVENTIONS.md:95-98` |
| 10 | Theme Studio 1/N — radius tokens only, no editor | `CHANGELOG.md:35-40` |
| 11 | `check:polish` path-brittle — new components silently escape | `check-polish.mjs:56-93` |
| 12 | Canvas: no search, no permalinks, no state switcher, desktop-only | `CanvasApp.tsx:77,237` |
| 13 | No per-component versioning / unused deprecation bucket | `CONVENTIONS.md:52,100`, `CHANGELOG.md:20` |
| 14 | Orphans muddy the boundary: `ui/{Skeleton,Tooltip}`, `agent-elements/` (dup `cn`), guard-exempt `evilcharts` | `src/components/*` |
| 15 | README says 11 components; there are 12 (TokenIcon omitted, still draft) | `README.md:23-24` |

**Inventory reality:** 12 components — 10 social/crypto molecules +
2 primitives (Avatar, TokenIcon). **No Button, no Input, no Dialog,
no Table.** ~15% of the canonical core (Material ≈35, shadcn ≈50,
Polaris/Carbon ≈60), but ahead of *all* generic systems in the social-
identity band. The floor is missing, not the differentiator.

---

## 3 · The reference bar

What "well-maintained" concretely means, per system (researched
2026-07, numbers verified against live docs) — and what CIDS takes
from each.

```
┌ UX heuristics   ethereum.org  ┐ ← why
├ Guidance        M3 · HIG      ┤ ← when
├ Product systems Polaris ·     ┤
│  Carbon · Primer · CDS        │ ← what
├ Behavior        Radix · BaseUI┤ ← how
└ Distribution    shadcn · Reown┘ ← ship
```

| System | Scale | The lesson for CIDS |
|---|---|---|
| **Material 3** | ~36 components · 6 categories | `md.ref → md.sys → md.comp` token tiers; paired `X`/`on-X` color roles (contrast baked into tokens); 15-style type ramp; **density as a numbered token scale** (0/−1/−2/−3, −4px per step, 48dp targets preserved) |
| **Apple HIG** | ~40 pages · 8 categories | Guidance voice ("Prefer X. Avoid Y because Z."); Dynamic Type as user-controlled scale; **per-page dated changelogs**; a11y woven into each page, not annexed |
| **shadcn/ui** | 79 components + Blocks | Copy-in registry + CLI (adopters *own* code — `check:portable`'s philosophy, unshipped); ~30 semantic CSS vars theme everything; CLI 3.0 ships namespaced registries + an **MCP server** (agent adoption) |
| **Radix / Base UI** | 28+ / 45 headless | Behavior bought, not built: focus traps, roving tabindex, typeahead, ARIA per WAI-ARIA APG. Caution: Radix handed to WorkOS 2025; **Base UI** (MUI + ex-Radix, v1.6) is the actively maintained successor |
| **Polaris** | 66 active + **24 visibly deprecated** | Token grammar `--p-color-bg-fill-critical-secondary`; **content guidelines per component** (exact button wording); deprecation as public IA; migration codemods. Caution: polaris-react → maintenance-mode 2025 (web-components rebuild) |
| **Carbon** | 67 components · 4 themes | **The density benchmark**: DataTable w/ 5 row heights, layering model (contextual `layer` tokens for nested surfaces), spacing-01..13, productive/expressive type sets; **biweekly releases, published schedule, `npx @carbon/upgrade` codemods**; a11y = WCAG 2.1 AA + Section 508 + EN 301 549 w/ published per-component evidence |
| **Primer** | 80+ dual-stack | **The lifecycle ladder**: draft → experimental → alpha → beta → stable → deprecated, criteria-gated, runtime deprecation warnings; 8-9 themes incl. colorblind/high-contrast (themes as a11y). Caution: repos archived Oct-Nov 2025 |
| **Coinbase CDS** | **141 components · 11 categories** | The crypto corporate bar: React+RN shared source; theme = spectrum+semantic tokens, 8px base, CSS vars for no-re-render theme switch, **nested themes**; 3 starter templates; explicit visual-versioning policy; **16 chart components + Scrubber + RollingNumber** (streaming price numerals) |
| **Reown / AppKit** | 5 wallet atoms · 11 framework quickstarts | White-labeling with ~8 variables — incl. **two master knobs** (`--apkt-border-radius-master`, `--apkt-font-size-master`) that rescale the whole kit; the canonical wallet-UX atom inventory (connect/account/network buttons) |
| **ethereum.org D&UX** | heuristics layer | **7 web3 heuristics**: tx status always visible; design the UI↔wallet seam; always show chain + switcher; accelerators (batch flows); vocabulary control. The patterns layer CIDS should encode as components |

### The 10 traits of a well-maintained system <sub>(ranked for the CIDS north star)</sub>

1. **Layered token architecture** — components never touch raw values *(M3)*
2. **Behavior from a headless a11y layer** — solved once, upstream *(Radix/Base UI)*
3. **Density/scale as a token axis** — "simple dApp" and "terminal" are two values of one variable, not two component sets *(Carbon, M3)*
4. **Criteria-gated lifecycle labels** — adopters know exactly what to trust *(Primer)*
5. **Minutes-to-first-component** — registry/CLI/templates/quickstarts *(shadcn; Reown, CDS in crypto)*
6. **Docs that encode judgment** — when-to-use, do/don't, exact content vocabulary; in crypto, wording ("Sign" vs "Approve" vs "Confirm") is a **security surface** *(HIG voice, Polaris content)*
7. **Release discipline w/ migration automation** — cadence, support phases, codemods, explicit visual-change policy *(Carbon; CDS)*
8. **A11y with published evidence** — stated target + CI automation + per-component test results *(Carbon, Primer)*
9. **A patterns/blocks layer above components** — recipes teach composition; components alone don't build an exchange *(Carbon Patterns, shadcn Blocks, HIG)*
10. **Visible governance/continuity** — 2025's lesson from polaris-react, Primer, Radix: trust = changelog + support phases + evidence someone's home *(Carbon)*

### The crypto whitespace (what nobody ships)

| Pattern | Closest reference |
|---|---|
| Tx lifecycle states (idle→sign→pending→confirmed/failed) | ethereum.org heuristic only — **no library ships this** |
| Account pill (address + balance + avatar) | Reown (closed web component) |
| Network badge + switcher | Reown; heuristic #3 |
| Streaming/rolling numerals | CDS `RollingNumber` |
| Price chart + scrubber | CDS Charts |
| Fiat ⇄ token amount display/formatting | **nobody documents it** |
| Address/ENS truncation + copy affordances | scattered, no canonical |
| Gas/fee communication | heuristics only |

> **The strategic finding:** every reference is strong on a different
> axis; **none combines crypto-native inventory + exchange-grade
> density + registry distribution.** That intersection is empty — and
> it is exactly where the CIDS north star points.

---

## 4 · Gap analysis → workstreams

Six workstreams; every gap in §2 maps to exactly one.

```
W1 FOUNDATIONS   tokens: spacing, type, elevation,
                 z, density · alias hygiene    (3,8,10)
W2 API CONTRACT  size/variant/className unification,
                 a11y fixes, test depth      (5,6,7,9)
W3 INVENTORY     atoms → data/pro components →
                 crypto verticals          (§2 inventory)
W4 SHOWCASE      canvas search/permalinks/states,
                 docs guidance density        (12)
W5 DISTRIBUTION  registry + CLI, versioning,
                 deprecation, changelog     (1,13)
W6 GOVERNANCE    CI, guard robustness, SoT truth,
                 orphan policy         (2,4,11,14,15)
```

---

## 5 · The evolution plan — phases, actions, checkpoints

Phases are sequenced so each unlocks the next; each has a **gate**
(merge criteria) and ships PR-sized. Estimates assume the current
one-PR-at-a-time rhythm.

### Phase 0 — Truth & safety net <sub>(W6 · unblocks everything)</sub>

The cheapest phase, and the one that makes "well-maintained" honest.

- [x] **DESIGN.md truth pass**: delete/rewrite the stale Components
      section (dead Button, Instrument Sans, `transition-all`, old
      hex, old title). DESIGN.md must only describe what exists.
- [x] **README truth**: 12 components, TokenIcon listed.
- [x] **CI**: GitHub Actions workflow — `tsc` + lint + all 4 guards +
      vitest on every PR. The contract stops depending on memory.
- [ ] **Orphan policy**: decide Skeleton/Tooltip (migrate → DS in
      Phase 2), `agent-elements` (delete or label), `evilcharts`
      (label as vendored, out-of-system).
- [x] **`check:polish` de-brittling**: rules keyed to component
      *pattern* (every DS folder) instead of literal paths.

**Gate:** CI green on a no-op PR; grep DESIGN.md for `Button.tsx`,
`transition-all`, `Instrument Sans` returns nothing.

### Phase 1 — Foundations completion <sub>(W1 · the scalability spine)</sub>

Tokenize what DESIGN.md already promises. Theme Studio needs these
axes to be impressive; density (R2) is impossible without them.

- [x] **Spacing tokens** (`--space-1…8`, 8px base). Shipped as raw
      vars + usage rules (deliberately not remapping Tailwind's scale);
      component-wide adoption rides with the Phase-5 density axis,
      where it becomes load-bearing.
- [x] **Type scale tokens** — financial ramp tokenized
      (`--text-data-*` + `font-pixel` utilities; `.data-*` classes now
      consume the vars). General UI sizes stay on Tailwind's ramp until
      density work needs them.
- [x] **Elevation tokens** (`--elevation-1…3` + `--glow-brand`/`-strong`
      → `shadow-card/raised/overlay/glow-brand*`) — all 4 hardcoded
      shadows replaced.
- [x] **Z-index scale** (`--z-base/raised/sticky/overlay/modal/toast`),
      adopted across DS + design app.
- [x] **Motion into `@theme`** — durations/easings split into tokens;
      `ease-settle`/`ease-spring` utilities.
- [x] **State-surface completeness**: `error-surface` +
      `success-surface` added.
- [x] **Alias hygiene**: raw → system tiers documented in DESIGN.md
      (Material ref→sys analogue).
- [x] Extended `check:theme`: T3 requires every new category; new T4
      bans raw shadows / numeric z / literal boxShadow in DS + design app.

**Gate:** zero hardcoded shadows/z-index in DS (`grep` guard added);
every token category has a DESIGN.md table + guard coverage.

### Phase 2 — API contract v1 + quality program <sub>(W2 · trust)</sub>

One breaking-change window, done once, announced in CHANGELOG.

- [x] **Prop conventions** codified in CONVENTIONS.md ("Component API
      contract"): className everywhere (cn-merged), shared string size
      scale, on<Event> callbacks, Radix-for-behavior, server-safe default.
- [x] Offenders fixed: TokenIcon cn-merges; CommentThread + Onboarding
      take className (forwarded to Sheet); Avatar/AvatarGroup sizes
      moved to the string scale (xs/sm/md/lg) — the declared break.
- [x] **A11y repairs**: ReactionBar picker → Radix Popover (Escape,
      outside-click, focus return — tested); Lane → roving tabindex +
      Arrow/Home/End (tested).
- [x] **Test depth**: axe matrix — every component × dark/mono, zero
      violations (caught + fixed a real aria-prohibited-attr in
      SocialProofChip); keyboard tests (Lane arrows, popover/sheet
      Escape + focus-return); motion/reduced-motion contract test.
- [x] **Skeleton + Tooltip migrated into the DS** (docs, tests, canvas
      demos; Tooltip re-tokenized: z-ladder, elevation, text-fg) —
      14 components, 12 stable.
- [x] TokenIcon promoted draft → stable under the new contract
      (10 stable / 2 draft).

**Gate:** axe zero violations across all components × all themes in
CI; CONVENTIONS "accessibility contract" is enforced, not promised.

### Phase 3 — Light theme + Theme Studio 2 <sub>(W1/R3 · the adaptability proof)</sub>

- [x] **`light` theme** shipped: full re-valuation (white canvas,
      dark-jewel identity hues, deep-teal brand, inverted glyph,
      softened elevations) — AA-verified; axe matrix runs 14×4 themes.
- [x] **`violet` demo theme**: accent family + reserved "you" hue
      swapped in ONE block — the white-labeling proof (R3).
- [x] **Theme Studio step 2** shipped: canvas "studio" panel with the
      Reown-style master knobs — accent (derives hover/bright/subtle +
      luminance-picked on-brand + the reserved "you" hue), radius
      master, spacing-scale master, data-type master — applied live as
      inline token overrides on <html>, layering over the active theme;
      **export css** copies a recipe-compatible `[data-theme]` block.
- [x] Adopter recipe documented in DESIGN.md (4-step: block → forced
      pairs → check:contrast → ThemeToggle list).

**Gate:** all themes pass `check:contrast` in CI; a theme authored
by following the recipe alone (no code reading) renders correctly.

### Phase 4 — Core atoms <sub>(W3/R1 · closes "where's the Button")</sub>

Radix-backed where behavior is nontrivial; every component ships the
full doc shape + axe/keyboard tests (Phase 2 program applies).

- [x] Tier 1 shipped: **Button, IconButton, Input, Badge, Dialog,
      Menu** — contract API, 7-section docs, tests, axe×4-themes,
      canvas Primitives zone. Draft status; promote after baking.
- [x] Tier 2 shipped: **Select, Switch, Checkbox, Toast (provider +
      useToast, first --z-toast consumer), Tabs (Lane generalized via
      Radix), Divider, EmptyState** — full program each.
- [x] Canvas "Primitives" zone live (6 demos incl. stateful Dialog).
      Gallery/feed adoption + promotions ride with Tier 2 (4b).

**Gate — MET (2026-07-13):** 27 components (≥25 ✓); every category
≥1 stable ✓ — actions: Button/IconButton · forms: Input · feedback:
Badge/Skeleton · containment: Sheet/Dialog · navigation: Lane ·
selection: Menu. Tier-1 promoted to stable after one bake cycle;
Tier-2 enters draft.

### Phase 5 — Terminal-grade layer <sub>(W3/R1+R2 · the exchange claim)</sub>

The phase that makes "complex financial exchanges" honest. Carbon
proves dense data UIs belong in a system; CIDS adds the crypto
domain generic systems lack.

- [x] **Density axis** shipped: `[data-density="compact"]` re-values
      spacing + data-type ramp + the new `--row-h`/`--cell-px` row
      grid; Theme Studio gained the switch. Zero component forks.
- [x] **DataTable** shipped: real table semantics, sticky header,
      aria-sort cycle, numeric alignment discipline, density-token row
      grid. Virtualization = TanStack pairing recipe in the doc (as
      decided — no reference ships it).
- [x] **Streaming-number kit** shipped: RollingNumber (per-slot roll,
      zero layout shift), PriceChange (sign discipline hard-coded +
      polish-guard-pinned), StatCell (density-responsive), Sparkline
      (direction-toned SVG). Numeric skeleton = Skeleton + tabular box.
- [x] **Crypto verticals shipped** — the whitespace column:
      AddressChip (full address always accessible), PegBadge (bps
      thresholds, guideline-#5 pinned by the polish guard),
      NetworkBadge (heuristic #3), TxStatus (lifecycle live-region,
      heuristics #1/#2), AmountInput (decimal-string, fiat echo, Max).
- [x] **Order-book demo** on the canvas Crypto zone: bids/asks depth
      bars + spread, streaming ticks every 900ms.

**Gate — MET (2026-07-13):** the order-book rows are fixed to the
density tokens (`--row-h`/`--cell-px`) with tabular numerals — ticks
change text and bar widths only, zero layout shift, and the studio's
compact switch tightens it live. PegBadge/PriceChange sign discipline
is guard-pinned; all five verticals pass the axe×4-themes matrix
(37 × 4 = 148 checks).

### Phase 6 — Patterns & templates <sub>(W3/W4/R4 · composition)</sub>

- [ ] **Patterns docs** (HIG-style): states catalog (loading/empty/
      error — the tide `states.html` mock formalized), forms,
      list→detail, tx-flow (review → sign → pending → result).
- [ ] **Do/Don't pairs** per pattern (the single most-copied HIG
      device), rendered on canvas frames.
- [ ] **Content guidelines** (Polaris's signature, crypto-critical):
      exact vocabulary per action — "Sign" vs "Approve" vs "Confirm"
      is a **security surface**, plus ethereum.org's heuristics
      (tx status always visible; show the chain; design the
      UI↔wallet seam) encoded as pattern rules.
- [ ] **Two starter templates**: `simple-dapp` (wallet connect +
      balances + send) and `exchange-shell` (markets table + order
      book + trade form) — both built *only* from the DS.

**Gate:** both templates build from documented components/patterns
with zero one-off styles (guards pass on template code).

### Phase 7 — Distribution & governance <sub>(W5/R4+R5 · adoptable)</sub>

- [ ] **Registry**: shadcn-compatible `registry.json` + item files so
      `npx shadcn add <cids-url>/button` works — the copy-in model
      `check:portable` was built for.
- [ ] **Versioning & lifecycle**: adopt Primer's criteria-gated
      ladder (`experimental → alpha → beta → stable → deprecated`,
      published entry criteria per rung) extending the current
      draft/stable pair; per-component `Version:` in the doc header;
      repo CHANGELOG gains per-component sections; CDS-style explicit
      policy on visual changes in minors.
- [ ] **Agent adoption**: expose the registry via an MCP server
      (shadcn CLI 3.0 precedent) — CIDS docs are already agent-
      readable by design; this makes them agent-*installable*.
- [ ] **Adopter docs**: quickstart (install → themed component in
      <5 min), theming guide, contribution guide (CONVENTIONS +
      promotion criteria → public).
- [ ] Decide npm (`@cids/react`) *after* registry traction — copy-in
      first, package if pulled.

**Gate:** a fresh Next.js app gets a themed CIDS Button via the
registry CLI in under 5 minutes, following only the quickstart.

---

## 6 · Presentation of information (the showcase itself)

How the surfaces evolve alongside (workstream W4, threaded through
phases rather than a phase of its own):

| Surface | Now | Target |
|---|---|---|
| Canvas | pan/zoom, layers, doc+code inspector | + search (⌘K), **URL permalinks** per item, **state switcher** (default/hover/loading/empty/error per demo), density toggle, Theme Studio panel |
| `/design` gallery | subset, static | index that links into the per-component pages below, "open in canvas" cross-links |
| **`/design/<component>` pages** | — none | **one page per component** (see anatomy below) — the primary read surface for designers & developers |
| Docs shape | 7 sections | + `Version:` header, + **"When to use / when not"** line, + Do/Don't where a pattern exists |
| Landing | 3 CTAs | + the range story: one hero composition per end (simple dApp / exchange), maturity scorecard badge |

### The component page (anatomy)

Every component gets an individual page at `/design/<component>` —
the Material/HIG-style read surface where a designer or developer
learns the component end-to-end. **Rendered from the same `.doc.md` +
`.tsx` on disk** (extending the Inspector's renderer), so pages can
never drift from source; page-only guidance ("when to use", Do/Don't)
is added to the `.doc.md` shape, not to a separate content store.

```
┌ ‹ components   Avatar     v1.0 stable ┐
│ 1 HERO   live demo · variant/state/  │
│          theme/density switchers      │
│ 2 WHAT   one-liner + when to use /   │
│          when NOT to (+ links to      │
│          sibling components)          │
│ 3 USAGE  copy-paste tsx · install    │
│          (registry cmd, Phase 7)      │
│ 4 ANATOMY  labeled wireframe          │
│ 5 PROPS  table from the doc           │
│ 6 STATES  every state, rendered live  │
│ 7 MOTION  which motion tokens, why,   │
│          tap-to-replay demo,          │
│          reduced-motion behavior      │
│ 8 A11Y   keyboard map · ARIA ·        │
│          contrast notes               │
│ 9 TOKENS  consumed tokens w/ swatches │
│ └ prev/next · "open in canvas" ──────┘
```

Ships incrementally: page shell + sections 1–5 can land with the
Phase 2 doc upgrades (the content already exists in `.doc.md`);
motion replay + state/density switchers land with Phases 3/5.

Principles: the Inspector and the pages keep rendering *real files
from disk* (no duplicated doc content — the anti-drift property is
the moat); mobile keeps the gallery + pages as its first-class
surface; the canvas stays the desktop wow.

---

## 7 · Maturity scorecard (the checkpoints)

Re-scored at the end of every phase; lives in README once ≥ M2.

| Level | Claim | Measurable criteria |
|---|---|---|
| **M0 — Collection** *(today)* | "12 documented components" | docs+guards exist; no CI; inventory <20% core |
| **M1 — Honest system** | "the contract is enforced" | Phase 0+1 gates: CI green, SoT truthful, all token categories exist |
| **M2 — Trustworthy** | "safe to depend on" | Phase 2+3 gates: axe×themes green, API conventions uniform, 3+ themes AA |
| **M3 — Buildable** | "you can build real apps" | Phase 4+5 gates: ≥25 components incl. data layer, density axis, exchange demo |
| **M4 — Adoptable** | "strangers ship with it" | Phase 6+7 gates: templates, registry, <5-min quickstart, versioning live |
```
M0 ──► M1 ──► M2 ──► M3 ──► M4
today  truth  trust  build  adopt
```

---

## 8 · Operating cadence

- **One phase = 1–4 PRs**, each PR gate-checked by CI (Phase 0 first
  for exactly this reason). Phases don't interleave; W4 showcase
  items ride along inside phase PRs.
- **Every new/changed component PR** ships: component + `.doc.md`
  (7 sections) + tests (render, a11y, keyboard, themes) + canvas
  registration — "a component without its doc is not done" extends
  to tests and the canvas.
- **Breaking changes** only inside a declared window (Phase 2) or
  under the deprecation policy after it.
- **This doc** is re-baselined at each phase gate: check the boxes,
  re-score §7, adjust the next phase from what was learned.

<sub>Related: `src/design-system/CONVENTIONS.md` (authoring contract) · `DESIGN.md` (token SoT, post-Phase-0) · `docs/api-inventory.md` + `docs/engine-contract.md` (dormant app engine, unaffected by this roadmap).</sub>
