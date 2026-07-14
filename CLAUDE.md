# CLAUDE.md — CIDS (Crypto Interface Design System)

Rules for Claude Code when working in this repo. Read on every session.

## Product (pivoted 2026-07-11)

**This repo is CIDS — the crypto interface design system.** The product is
the design system itself: users browse live components on an infinite
canvas, inspect each component's `.doc.md`, check layers, and flip themes.
It began as a DeFi trading app (DeFi Triangle / Y-Vault, then the "tide"
social plan); that app's engine is **dormant, not deleted** — see
"Dormant engine" below.

| Surface | What |
|---|---|
| `/` | Landing (name + CTAs) |
| `/design/canvas` | Infinite canvas: pan/zoom · layers rail · `.doc.md` inspector · theme toggle. Desktop-first. |
| `/design` | Component gallery (mobile-friendly) |
| `/design/feed` | The system composed as a demo screen (mock data) |

Core structure:

- `src/design-system/` — 11 components, each `<Name>/<Name>.tsx` +
  `<Name>.doc.md` + `index.ts`. **`CONVENTIONS.md` in that folder is the
  authoring contract** (fixed doc shape: Anatomy · Props · Tokens ·
  States · Motion · A11y). A component without its doc is not done.
- `src/app/design/canvas/` — canvas engine (`CanvasApp`), item registry
  (`items.ts` — NOT `layout.ts`, that name is reserved by Next.js),
  demos, `LayersPanel`, `Inspector` (renders the real `.doc.md` from
  disk — never duplicate doc content into a registry).
- **Themes** are `[data-theme="x"]` blocks in `globals.css` overriding
  the same token names. Current: `dark` (default) + `mono` (grayscale
  except buy/sell + identity hues). `npm run check:contrast` verifies
  every theme. Adding a theme = one CSS block + AA pass.
- The tide HTML prototypes under `public/Prototypes/` are design
  references, framed on the canvas as iframes.

## Dormant engine

`src/app/api/*`, wallet auth, watchlist, Supabase, rate-limiting — all
working but unused by CIDS. **Do not delete without an explicit decision.**
The Auth & API / User input / External APIs / Supabase sections below
still apply in full whenever that code is touched or woken.

---

## Collaboration

- **Stop, propose, suggest** before any non-trivial change (new deps, new files, architecture, security-sensitive code, "cleanup"). Wait for explicit approval.
- Never take autonomous decisions on design, path/folder structure, or dependencies.
- Give 2–3 options with a recommendation — not a single pre-decided path.
- When in doubt, ask.

### Markdown / docs

- When writing `.md` files (PR bodies, memory files, backlog entries, design docs), reach for **inline HTML** when it makes the information clearer than what raw Markdown can express. Markdown renderers all support a useful subset of HTML inline.
- Reference: https://thariqs.github.io/html-effectiveness/ — examples of HTML constructs that meaningfully improve readability inside `.md` (callouts, nested tables, side-by-side columns, expandable `<details>` blocks, badge rows, etc.).
- Don't reach for HTML for the sake of it — only when the alternative (plain prose / a flat table / a long list) genuinely hurts scannability. The goal is the reader's mental load, not visual cleverness.
- Most useful in practice: `<details><summary>` for collapsible sections, `<sub>` / `<sup>` for terse annotations, side-by-side `<table>` for comparisons that a single column would obscure.

## Explaining changes with ASCII

The user reads on mobile Safari. Walls of bullet points get skimmed; diagrams get read. **When proposing or recapping any technical, UI, or UX change, include a small ASCII diagram alongside the prose** showing the relevant structure.

**When to draw**:
- New UI surfaces (rails, modals, page layouts) → wireframe of the layout
- Data flow / API changes → request → server → upstream → response chain
- File-structure changes → tree of new vs. modified vs. unchanged files
- Branching / conditional rendering → state-machine or if/else tree
- Promotion / merge flow → branch graph

**When NOT to draw**: copy-only tweaks, single-line config flips, trivial fixes.

**Style**:
- Box-drawing characters (`┌ ─ ┐ │ └ ┘ ├ ┤ ▲ ▼ ◀ ▶`) where they add clarity; plain `+ - |` otherwise.
- Annotate inline (`← like this`) — don't just draw; explain.
- Keep diagrams ≤ ~40 chars wide so they don't wrap on mobile.
- One diagram per concept. Don't stack five — pick the most-load-bearing one.

**Example** (rail wireframe):

```
┌─ Park Your Money ──────────── < > ┐
│ Stablecoins on Solana — peg, depth │
├────────────────────────────────────┤
│ [PUSD]  [USDC]  [USDT]  [PYUSD] →  │  ← horizontal scroller
│  Soon   On peg  On peg  On peg     │
│   —     $1.0001 $0.9997 $0.9999    │
└────────────────────────────────────┘
```

The diagram is the contract. If your prose disagrees with the diagram, the diagram is what the user remembers.

## Session start protocol

**Ask the user which environment they're on at the start of every new session**, after their first non-trivial request.

The user works from two environments and the right process is different in each:

- **(a) Local desktop** — has `localhost`, can run dev server + tests + browser DevTools.
- **(b) Cloud / mobile** — Claude Code on web/mobile, no `localhost`, no terminal beyond what the sandbox provides, browser is mobile Safari/Chrome.

Once answered, **do not re-ask within the same session.** Tailor everything that follows.

### Per-env behaviour

**Local desktop:**
- After edits: run `npm run lint`, `npx tsc --noEmit`, and `npm run dev` as needed. Tell the user what to test on `localhost:3000`.
- Before opening a PR: encourage browser-test on localhost.
- After CI green on the PR, the user can self-merge (they trust-tested locally).
- Preferred for: complex logic, multi-step debugging, anything needing fast iterate-on-localhost loops.

**Cloud / mobile:**
- Do NOT suggest "test on localhost" — the user can't.
- Lean on `npx tsc --noEmit` + `npm run lint` for in-sandbox verification.
- After opening a PR, **always remind the user to test on the PR's Vercel preview URL** (Vercel posts the URL automatically as a bot comment on the PR) BEFORE merging — never merge-to-test.
- Preferred for: small UI tweaks, polish iterations, anything where mobile feedback shapes the design.
- Avoid for: complex logic that needs multi-state debugging — defer to a local session.

If the user opens the conversation already on a feature branch / mid-flow, infer the env from context (e.g., "I can't run npm" → cloud) and confirm with one line before continuing.

## Workflow & release flow

This repo uses a **main + feature branches** flow. All PRs target `main`.

### Branch model

| Branch | Means | Who sees it |
|---|---|---|
| `main` | Production. Polished, user-facing. | Everyone on the prod URL. |
| `claude/<topic>-<id>` or `<topic>` | Per-Claude-session feature branch. | Only via PR preview. |

### Per-session flow

1. New Claude session → new branch off `main` (auto-named or topic-named).
2. Work, commit.
3. PR → `main`.
4. **Test on the PR's Vercel preview URL** — Vercel auto-posts the link as a bot comment.
5. Merge to `main` only after verifying on preview.

### Feature flags for not-yet-polished code

`src/lib/featureFlags.ts` reads `NEXT_PUBLIC_FF_*` env vars at build time.

Pattern for code that's technically ready but UX is still rough:

```tsx
{FEATURES.NEW_THING && <NewThing />}
```

Vercel env vars hold the actual on/off state per environment:
- **preview:** `NEXT_PUBLIC_FF_NEW_THING=1` → visible on PR preview for testing
- **prod:** `NEXT_PUBLIC_FF_NEW_THING=0` → hidden from users on main

Users don't see the gated feature until the prod env var flips. **Delete the flag + conditional once the feature is stable on prod for a few days** — accumulating flags is technical debt.

## Testing & merge policy

Applies to any merge into `main` (and any PR targeting `main`).

Before merging, Claude must:

1. **Stop and propose test cases.** List the scenarios the change should cover — golden path, edge cases, regressions, security-relevant paths. Do not write tests yet.
2. **Wait for explicit user approval** of the proposed test list. The user may add, remove, or reword cases. No "I'll just write them and you can review" — approval comes first.
3. **Implement the approved tests** and run them. All must pass.
4. **Show the user the results** (test names + pass/fail) and wait for confirmation that they've verified the outcome.
5. **Only then** prepare the merge / PR.

Triggers: `git merge` into `main`, `git push` to `main`, opening a PR with `main` as the base, and `gh pr merge` / equivalent MCP calls. Does not apply to merges into feature branches unless the user asks.

If tests are genuinely not applicable (docs-only change, asset commit, comment tweak), say so explicitly and ask the user to waive the requirement for that change. Never self-waive.
## Behavioral guidelines

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

### 5. Sign / Direction Display: Trace the Data, Don't Trust Names

When fixing UI that renders direction (`+` / `−` prefix, ▲ / ▼ icon, red / green color), do a 30-second upstream trace before touching the UI:

- Grep for where the value is computed.
- Look for `Math.abs(...)`, `>= 0`, or any arithmetic that could strip the sign.
- Verify with both a positive and a negative real example loaded in the browser — not imagined examples.

If the value can't be negative when it should be, fix the source, not the UI. UI fixes for sign-bugs caused upstream are placebos — they look right in the diff and stay broken in production.

Variable names like `XxxDeviation`, `XxxDelta`, `XxxChange` *sound* signed by convention but only carry sign if the producer kept it.

For magnitude-vs-direction split UIs (icon + colored text, peg health + deviation, etc.):

- Magnitude → drives tone / severity buckets. Use `Math.abs(value)`.
- Direction → drives `+` / `−` prefix and direction icon. Use the signed `value`.
- Two concerns, two computations. Don't conflate them.

### 6. Asset Tracking: Local Existence ≠ Deployment

When code references a path under `public/` (or any non-imported asset), `git ls-files <path>` must succeed before you commit.

Next.js dev serves untracked files in `public/` — a 200 response in dev is **not** proof the file will ship. Vercel deployments only contain tracked files; an untracked `/public/foo.png` becomes a 404 in prod even though the import path looks fine.

Before committing a change that references an asset:

- Run `git status` — flag every untracked file in the touched directories.
- Either `git add` it (if it should ship) or confirm it shouldn't.
- Don't trust the dev-server HTTP 200 as a deploy gate.

This is the same shape of bug as guideline #5 — *local environment lying to you about deploy state*. Trace the artifact end-to-end (filesystem → git index → deployment) before claiming the change is complete.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## File size

- **700 LOC cap for files under `src/`.** Excludes generated files, tests, lockfiles, and `*.d.ts`.
- Split by responsibility before a file hits the cap: extract hooks, components, utilities, types into their own files.
- Prefer colocation over deep nesting — types near usage, helpers near callers.
- **Vendored third-party code is exempt** from the cap. Specifically `src/components/evilcharts/**` (vendored from [legions-developer/evilcharts](https://github.com/legions-developer/evilcharts) in B2.5 because the shadcn registry is unreachable from the cloud sandbox). Splitting these would break internal coupling and make upstream sync painful. Treat as third-party — don't refactor.

## Secrets & environment

- No hardcoded secrets, tokens, or API keys — ever. Enforced by `.claude/hooks/scan-secrets.js`.
- `.env*` files are never committed (enforced by `.gitignore` + deny-list in `.claude/settings.json`).
- API keys and service-role keys live on the server only. Never `NEXT_PUBLIC_*` for anything secret.
- Never log secret values, tokens, or wallet private material to console or logs.
- Never include secret values in error responses, client payloads, or toast messages — return generic `{ error: "…" }`.
- No default credentials, example keys, or placeholder tokens in code. Use env-var reads that fail loudly on missing values in production.

## Production hygiene

- Debug UI (Agentation, verbose panels) must be gated behind `process.env.NODE_ENV === "development"`.
- Never expose stack traces or internal error details in API responses. Log internally, respond generically.
- Dependency additions require: (a) proposal to user, (b) `npm audit` clean after install (enforced by `.claude/hooks/audit-if-deps-changed.sh`), except for the accepted-risk findings listed below.

### Accepted upstream vulnerabilities

> Re-baselined 2026-07-13 (Phase 2b). Correction from the same day: the
> `bigint-buffer` chain briefly appeared "fixed upstream" only because the
> machine-local `legacy-peer-deps=true` npm config had pruned the peer-dep
> subtree from the lockfile entirely. The lockfile is now generated with
> strict peer resolution (the full, honest graph — required for `npm ci`
> to work on CI and any contributor machine), which restores that chain.
> `npm audit fix` (non-breaking) was also applied: 18 → 7 findings before
> the graph restore.

Current accepted state:

- **3 high — the original `bigint-buffer` chain**
  ([GHSA-3gc7-fjrx-p6mg](https://github.com/advisories/GHSA-3gc7-fjrx-p6mg),
  CVSS 7.5): transitive via `@jup-ag/wallet-adapter` →
  `@solana/spl-token` → `@solana/buffer-layout-utils` — the **dormant
  engine's** chain, unused by CIDS at runtime. Accepted pending a
  wallet-adapter major upgrade (or engine retirement decision).
- ~~1 high — `next@16.2.4`~~ **RESOLVED 2026-07-13**: upgraded to
  `next@16.2.10` (the grouped advisories were fixed across 16.2.x
  patches; audit no longer reports next). Verified per this section's
  re-baseline rule.
- **6 moderate** — transitive via the dormant engine's Solana chain and the
  `shadcn` CLI's `@modelcontextprotocol/sdk` (dev-only, not shipped).
  Accepted pending upstream releases.

Rules:
- Do **not** add new high or critical vulnerabilities beyond the above.
- Do **not** remove this section without re-running `npm audit` and
  verifying the findings above are resolved.
- The audit hook will fire on these — that is expected and documented.
  Verify the reported vulns match this list before proceeding.

## Pending followups

> Audited 2026-07-11 during the CIDS truth pass. Earlier entries referenced
> app components deleted in the clean-shell commit and a stale lint count.

**CIDS (active product):**

- **🔴 Production is not public (blocks M4 live verification).**
  `defi-triangle-app.vercel.app` 307-redirects to `defistage.vercel.app`,
  which sits behind Vercel SSO Deployment Protection — the landing,
  canvas, templates, AND the `/r/*` registry are invisible to anyone
  not logged into the Vercel team. Fix is dashboard-only:
  Settings → Deployment Protection → "Only Preview Deployments";
  Settings → Domains → stop the `defistage` redirect (stale from the
  app-era stage branch; consider `cids.defitriangle.xyz`). Once public:
  run the fresh-app quickstart against the live URL (the literal M4
  gate) and replace the `<your-cids-deployment>` placeholder in
  `docs/cids-quickstart.md`.

- **Iframe theme bridge.** Canvas iframe frames (live feed, HTML mocks) don't inherit the parent's `data-theme` — flipping dark/mono leaves them dark. Fix via a URL param or postMessage the embedded pages honor. (Known limitation since the mono-theme PR #68.)
- **Mobile canvas gestures.** The canvas is desktop-first by decision. Pinch-zoom + touch pan tuning for mobile Safari is deferred to a local-desktop session (needs fast iteration).
- **More themes.** The `mono` pattern makes each theme one `[data-theme]` block + `check:contrast` pass. Candidates when wanted: light-terminal, high-contrast.
- **Inspector v2.** Variant matrices per component, px measurements, computed-token readout on hover.
- **Astryx endgame (only if external consumers appear):** publishable `@cids/core` package + CLI.

**Lint (current reality: 19 errors, none in CIDS code):**

- **16× `set-state-in-effect`** — all in dormant-engine hooks (`src/lib/hooks/use*`, `SessionContext`, `TokenIcon`). Legitimate "fetch on mount / reset on prop change" patterns; **do not piecemeal-fix.** Decide when (if) the engine wakes: disable the rule project-wide with a note, or migrate the data layer to SWR/React Query as its own project.
- **2× `no-require-imports`** in `.claude/hooks/scan-secrets.js` — mechanical, safe any time.
- **1× `no-explicit-any`** in `src/app/api/watchlist/route.ts` — dormant engine; fix if touched.

**Dormant engine (only relevant if the app side wakes):**

- **Search recents → wallet-scoped server-side storage.** V1 shipped `localStorage`-only in `src/lib/hooks/useRecentSearches.ts`; server version wants a `search_recents` Supabase table + `/api/search-recents` endpoints on the same JWT/rate-limit pattern as `/api/watchlist`.
- **Jupiter-v2 data consolidation** (was the blocker on closed draft PR #61) — replaces the fragile 3-source merge in `useTokenDetails`. Prerequisite for any live-data screens.

## Auth & API

- Every protected route and API endpoint requires a JWT cookie check via `getSessionWallet(req)`. No "hidden URL = security".
- Object-level authorization on every resource access. `wallet_address` is taken **from the JWT**, never from the client payload — no IDOR via `/watchlist?wallet=...`.
- Session tokens: HTTP-only, Secure (prod), SameSite=Lax, Path=/, Max-Age=604800 (7d). Never `localStorage` for tokens.
- Nonces: 32 bytes random, base58, one-shot, 5-min TTL, deleted immediately on successful verify.
- Login / reset flows: generic responses. Never reveal whether an account or wallet has prior activity.
- **Every API endpoint is rate-limited** via Upstash sliding-window. Fail-open if Upstash is unreachable (no UX impact).
  - Public read routes: per-IP
  - Auth'd write routes: per-wallet
- API responses return the minimum data needed — no broad object dumps.
- Destructive actions (watchlist delete, future: change email, disconnect wallet permanently) require an explicit confirmation step.
- CORS: **same-origin only** — no CORS headers set. Next.js default.
- Admin routes (if added later): real role check, not URL obscurity.

## User input

- All DB queries go through `@supabase/supabase-js` — parameterized by default. Never use `.rpc()` with string-built SQL.
- Render user text safely — React escapes by default. Never `dangerouslySetInnerHTML` without a hardened sanitizer (`DOMPurify`) and explicit justification.
- File uploads (future): validate MIME, extension, and size server-side before accepting. Client validation is advisory.
- Payment / billing / pricing (future): server-authoritative. Never trust client-computed amounts.
- Wallet addresses: validate as Solana public key (`new PublicKey(addr)` throws on invalid) before using in queries.

## External APIs

- **Birdeye** (`public-api.birdeye.so`): only called from server routes with `BIRDEYE_API_KEY` + `x-chain: solana`. Never from the browser.
- **DexScreener** (`api.dexscreener.com`): server-proxied too (even though unauthenticated) to centralize rate-limiting, adapters, and scoring.
- All upstream fetches: `cache: "no-store"`. Per-request failures are swallowed and logged, not exposed to the client verbatim.
- No retry/backoff on upstream errors by default (spec §14 limitation). Return `{ success: false, error: "…" }` generic + HTTP 500, let client hold last-good state.

## Supabase

- All access server-side via `SUPABASE_SERVICE_ROLE_KEY`. No RLS required for watchlist/auth_nonces — authorisation handled in route handlers via JWT.
- If additional tables are added later with sensitive data, prefer enabling RLS as defense-in-depth.
- Never expose the service-role key in client bundles, error responses, or logs.

## Design system

- **The design system IS the product** (see "Product" at the top). Components live in `src/design-system/` under the `CONVENTIONS.md` contract — every component ships its `.doc.md`, consumes tokens only, and appears in the canvas/gallery.
- Follow [DESIGN.md](./DESIGN.md) for all UI work — semantic colour tokens in `globals.css` (surface / fg / brand / buy / sell / warning / identity hues / motion), typography (Geist Mono / IBM Plex / Geist Pixel Square), spacing (8px base), components (rounded-sm 2px, 150ms transitions).
- The system is **dark-family, multi-theme**: `:root` = `dark` (market-dark), plus `[data-theme]` overrides (`mono`). No light mode. Consume colour via semantic Tailwind utilities (`bg-surface-container`, `text-fg`, `text-brand`) — **never hardcode `bg-[#hex]`**. `npm run check:theme` enforces this; `npm run check:contrast` verifies AA per theme.
- Financial numbers: **Geist Pixel Square** via `.data-lg/md/sm` (fallback IBM Plex Mono). Never serif or variable-weight. Sign discipline per guideline #5: direction from the signed value, number from `Math.abs`.
- Identity accent is **mint-teal** `--brand #5ad8c4` in the default theme; consume the token, never the hex (mono resolves it to white ink). Filled brand surfaces use `text-on-brand`, never `text-white`.
- When a design decision isn't covered by DESIGN.md, stop and ask.

## Installed skills

- **`jakubkrehel/make-interfaces-feel-better`** — polish layer beneath DESIGN.md. Enforces concentric border radius, layered shadows, targeted transitions (no `transition-all`), `scale(0.96)` press feedback (cards use `0.98`), 40×40 hit areas, `text-wrap: balance/pretty`, and font smoothing. Run on any UI edit.
- **DESIGN.md wins on conflicts** — if the skill suggests a value that contradicts DESIGN.md (e.g. a different radius), DESIGN.md is the source of truth. The skill is the polish layer beneath it, not above it.
- **`src/components/evilcharts/**` is exempt** — same reasoning as the file-size exemption (vendored, would break upstream sync). Don't apply skill rules to chart internals.
- **Static guard:** `npm run check:polish` greps the relevant files and asserts the rules above are still in place. Run it before opening a PR that touches UI.

## Testing UI features

- For UI/frontend changes: after edit, start the dev server and exercise the feature in a browser before reporting done.
- If browser testing isn't possible in this session, say so explicitly — do not claim success based on a passing type-check alone.
- **No regressions.** Every ship must preserve existing feature behavior. When testing a new feature, also exercise the surrounding flows (landing → canvas pan/zoom/layers/inspect/theme-flip → gallery → demo feed) and confirm nothing broke. If a regression surfaces, stop and surface it before continuing.
- **End-user experience is the priority.** When a UX issue surfaces outside the current ship's scope (broken layouts, confusing copy, edge-case failures, slow interactions), **note it as a follow-up — don't fix it in-flight.** Capture it in the roadmap, the commit message, or PR body. Scope creep dilutes ships.
