# 03 · Data model — Supabase, APIs, auth, seeding

Everything follows the established patterns in CLAUDE.md §Auth & API:
server-side Supabase via service-role key, wallet **from JWT never
client**, per-wallet rate limits on writes, per-IP on reads, generic
error bodies, minimal response shapes.

## Tables

```
profiles ──┬── follows (edges)
           ├── posts ──── comments
           │      └────── reactions
           ├── comments (on tokens too)
           └── reactions
watchlist (exists) ─▶ watch counts
                      + feed events
```

### `profiles`

| Column | Type | Notes |
|---|---|---|
| `wallet_address` | text **PK** | validated `new PublicKey()` server-side |
| `handle` | citext **unique** | 3–15 chars `[a-z0-9_]`, reserved list (`tide`, `admin`, `design`, …) |
| `display_name` | text | ≤ 32 chars |
| `bio` | text null | ≤ 140 chars |
| `avatar_seed` | smallint | 0–7 → identity hue; default `hash(wallet) % 8` |
| `is_seed` | bool default false | seeded persona flag |
| `created_at` | timestamptz | |

### `follows`

| Column | Type | Notes |
|---|---|---|
| `follower_wallet` | text FK→profiles | from JWT |
| `followee_wallet` | text FK→profiles | |
| `created_at` | timestamptz | |

PK `(follower_wallet, followee_wallet)`; check `follower ≠ followee`.

### `posts`

One table for all feed-authored objects:

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `author_wallet` | text FK→profiles | from JWT |
| `kind` | enum `take \| watch_note` | milestones are **not** rows — derived at read time |
| `body` | text | ≤ 280 chars; plain text only (React-escaped; no HTML ever) |
| `token_address` | text null | validated mint if present |
| `created_at` | timestamptz | |

### `comments`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `author_wallet` | text FK | from JWT |
| `subject_type` | enum `token \| post` | |
| `subject_id` | text | mint address or post uuid |
| `parent_id` | uuid null | single-level replies only (enforced) |
| `body` | text | ≤ 280 chars |
| `created_at` | timestamptz | |

### `reactions`

| Column | Type | Notes |
|---|---|---|
| `author_wallet` | text FK | from JWT |
| `subject_type` | enum `token \| post \| comment` | |
| `subject_id` | text | |
| `emoji` | enum fixed set (`♥ 🔥 👀 🧠 😅 📈`) | not free-form |
| `created_at` | timestamptz | |

PK `(author_wallet, subject_type, subject_id, emoji)` — toggle =
insert/delete.

### `watchlist` (exists) — additive changes only

Add `is_public bool default true` (profile privacy toggle later) and
`note text null ≤140` (the "watch with a note" feed card). Existing
GET/POST/DELETE contract for the current UI must not break.

## Feed generation — v1 is a query, not infrastructure

No fan-out, no queues, no materialized feeds:

```
GET /api/feed?lane=following
  = watchlist adds + posts by followed
    wallets, newest first, cursor-paged
GET /api/feed?lane=everyone
  = same, unscoped (public lane)
milestones = computed at read time
  (watched-token 24h move ≥ threshold,
   via existing price routes, cached)
```

At showcase scale (≤ thousands of users) indexed queries are fine.
The API shape (`{ success, data: { items, nextCursor } }`) is designed
so a fan-out implementation can replace the query later without
touching the client.

## API routes (new)

| Route | Verbs | Auth | Notes |
|---|---|---|---|
| `/api/profile` | GET `?handle=` / POST / PATCH | read public · write JWT | claim + edit; handle-taken errors are specific (username availability is inherently public), all else generic |
| `/api/follows` | GET `?wallet=` / POST / DELETE | read public · write JWT | counts + edge toggle |
| `/api/feed` | GET | public (following-lane needs JWT) | cursor pagination |
| `/api/posts` | POST / DELETE | JWT | delete = own posts only (object-level check) |
| `/api/comments` | GET `?subject=` / POST / DELETE | read public · write JWT | |
| `/api/reactions` | GET `?subject=` / POST | read public · write JWT | POST toggles |
| `/api/social/token/[mint]` | GET | public | watcher count + preview avatars + comment count, one round-trip for the social strip |

All: Upstash sliding-window (existing helper), fail-open;
`cache: "no-store"` on dynamic reads; responses carry only fields the
screens consume.

## Auth & safety notes

- Identity root stays the existing nonce → sign → verify → JWT-cookie
  flow. Zero changes to `/api/auth/*`.
- Deletes (post/comment, unfollow is exempt) get the confirmation-step
  treatment per CLAUDE.md destructive-action rule.
- User text: length-capped server-side, plain text, React-escaped —
  `dangerouslySetInnerHTML` remains banned. Links render as plain text
  in v1 (no unfurl surface, no phishing surface).
- RLS: enabled on all new tables as defense-in-depth (service-role
  bypasses it; a leaked anon key then exposes nothing writable).
- Moderation in v1 = a `hidden_at` column on posts/comments + manual
  flip. Real reporting flows are phase-4 scope with chat.

## Seeding — the app must feel alive on day one

- **~12 personas**, `is_seed = true`, each with a designed identity:
  handle, bio, avatar hue, a coherent "taste" (stables maxi, memecoin
  degen, long-term index-er…) and 5–15 watches + takes referencing
  **real current tokens** so live prices animate their content.
- Seed script = server-side one-shot route or SQL migration
  (pattern exists: `/api/nft/admin/seed`).
- Personas are honest set-dressing: no fake follower counts on real
  users, seeds never comment on real users' content, and they're
  visually indistinguishable by design but flagged in data for later
  cleanup.
- Content is written (curated copy), not generated at runtime.
