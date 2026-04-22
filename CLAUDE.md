# CLAUDE.md — DeFi Triangle / Y-Vault

Rules for Claude Code when working in this repo. Read on every session.

---

## Collaboration

- **Stop, propose, suggest** before any non-trivial change (new deps, new files, architecture, security-sensitive code, "cleanup"). Wait for explicit approval.
- Never take autonomous decisions on design, path/folder structure, or dependencies.
- Give 2–3 options with a recommendation — not a single pre-decided path.
- When in doubt, ask.

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
- Dependency additions require: (a) proposal to user, (b) `npm audit` clean after install (enforced by `.claude/hooks/audit-if-deps-changed.sh`).

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
