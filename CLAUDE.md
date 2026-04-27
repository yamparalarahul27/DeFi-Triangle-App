# CLAUDE.md — DeFi Triangle / Y-Vault

Rules for Claude Code when working in this repo. Read on every session.

---

## Collaboration

- **Stop, propose, suggest** before any non-trivial change (new deps, new files, architecture, security-sensitive code, "cleanup"). Wait for explicit approval.
- Never take autonomous decisions on design, path/folder structure, or dependencies.
- Give 2–3 options with a recommendation — not a single pre-decided path.
- When in doubt, ask.

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

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## File size

- **700 LOC cap for files under `src/`.** Excludes generated files, tests, lockfiles, and `*.d.ts`.
- Split by responsibility before a file hits the cap: extract hooks, components, utilities, types into their own files.
- Prefer colocation over deep nesting — types near usage, helpers near callers.

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

The following `npm audit` findings are **pre-existing Solana ecosystem issues** with no patched upstream release. They arrived via the `@jup-ag/wallet-adapter` → `@solana-mobile/*` transitive chain and are accepted risk pending a Jupiter wallet-adapter major upgrade tracked as a separate task.

- [GHSA-3gc7-fjrx-p6mg](https://github.com/advisories/GHSA-3gc7-fjrx-p6mg) — `bigint-buffer` buffer overflow via `toBigIntLE()` (CVSS 7.5)
  - Transitive via `@solana/buffer-layout-utils` → `@solana/spl-token`
  - Surfaces as 3 high-severity audit entries: `bigint-buffer`, `@solana/buffer-layout-utils`, `@solana/spl-token`

Rules:
- Do **not** add new high or critical vulnerabilities beyond the above.
- Do **not** remove this section without first upgrading `@jup-ag/wallet-adapter` and verifying the audit no longer reports these advisories.
- The audit hook will fire on these — that is expected and documented. Verify the reported vulns match this list before proceeding.

## Pending followups

- **Brand logo SVGs missing from repo.** `src/components/layout/Header.tsx` references `/brand/defi_logo_dark.svg` and `/brand/defi_logo_white.svg`, but `public/brand/` does not exist and those SVGs have never been committed on any branch. At the start of the next local session, remind the user to commit the two brand SVGs to `public/brand/` (or to swap the refs for a text wordmark / alternative asset) and push to `stage` so the top-left logo stops 404-ing in preview/production.
- **Search recents → wallet-scoped server-side storage.** V1 shipped with `localStorage` only (per-device) in `src/lib/hooks/useRecentSearches.ts`. When building the next iteration of the Watchlist feature, add a `search_recents` Supabase table and GET/POST/DELETE endpoints under `/api/search-recents` — same JWT / `getSessionWallet` auth pattern as `/api/watchlist`, same rate-limiting, wallet from JWT not client. On wallet connect, migrate any `localStorage` recents to server once and clear the local copy.

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

- Follow [DESIGN.md](./DESIGN.md) for all UI work — colour tokens (Frost/Hela/Loki), typography (Geist Mono / IBM Plex / Geist Pixel Square), spacing (8px base), components (rounded-sm 2px, 150ms transitions).
- Financial numbers: **Geist Pixel Square** (fallback IBM Plex Mono). Never serif or variable-weight.
- Primary blue on light surfaces: `#19549b` (frost-400). On dark surfaces: `#3B7DDD` (cta-color).
- When a design decision isn't covered by DESIGN.md, stop and ask.

## Testing UI features

- For UI/frontend changes: after edit, start the dev server and exercise the feature in a browser before reporting done.
- If browser testing isn't possible in this session, say so explicitly — do not claim success based on a passing type-check alone.
