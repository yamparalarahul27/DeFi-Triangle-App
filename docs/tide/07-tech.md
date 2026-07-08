# 07 · Tech blueprint — architecture, hooks, SQL, payloads

Full engineering blueprint so phases 1–3 are execution, not design.
Engine rules from [engine-contract.md](../engine-contract.md) and
CLAUDE.md (auth, rate-limit, secrets, 700-LOC cap) apply throughout and
are not restated.

## Folder structure (new/changed only)

```
src/
├ app/
│ ├ page.tsx            ← tab shell (Feed·Markets·Me)
│ ├ token/[address]/    ← pushed route (rebuilt)
│ ├ u/[handle]/page.tsx ← public profile
│ ├ design/             ← gallery
│ │ ├ page.tsx
│ │ └ registry.tsx      ← specimen data
│ └ api/
│   ├ profile/route.ts
│   ├ follows/route.ts
│   ├ feed/route.ts
│   ├ posts/route.ts
│   ├ comments/route.ts
│   ├ reactions/route.ts
│   └ social/token/[mint]/route.ts
├ components/
│ ├ social/   ← the kit (Avatar, PostCard,
│ │             ReactionBar, CommentThread…)
│ ├ feed/     ← FeedList, LaneToggle, Composer
│ ├ markets/  ← rails (re-skin)
│ ├ token/    ← detail sections (re-skin)
│ ├ profile/
│ ├ layout/   ← BottomBar, Header, Sheet
│ └ ui/       ← existing primitives (kept)
└ lib/
  ├ social/
  │ ├ types.ts          ← all social domain types
  │ ├ validate.ts       ← handle/body/mint guards
  │ └ identityHue.ts    ← hash(wallet) % 8
  └ hooks/              ← new hooks join the 14
```

## Data fetching — the recommendation

**Adopt TanStack Query (React Query) v5 for the *new social* hooks
only.** Existing 14 engine hooks stay hand-rolled and untouched.

Why Query over SWR / more hand-rolling:
- Social UX is mutation-heavy (follow, react, watch-note, post,
  comment) and every one is optimistic. `useMutation` with
  `onMutate`/rollback is exactly this shape; hand-rolling 6 optimistic
  flows is where bugs live. SWR's mutate API can do it but with more
  ceremony per call site.
- Cursor pagination (`useInfiniteQuery`) for feed + comments for free.
- Cache-key invalidation gives cross-screen consistency (follow on a
  profile updates the feed's follow state) without a state library.

This also resolves half of the CLAUDE.md pending
`set-state-in-effect` decision: new data code never triggers the rule;
the existing hooks migrate (or the rule gets scoped) in the already
planned separate task — **no piecemeal fixes**, per the backlog note.

Cost: +~12–13 kB gz, well-audited dep. Requires the standard dependency
proposal + `npm audit` gate at phase-2 start. `QueryClientProvider`
joins the existing `Providers.tsx` stack.

State beyond server-cache: none added. Tab/lane/sheet state is local +
URL params; session stays in `SessionContext`.

## New hooks (contract-style signatures)

Documented in engine-contract.md in the same PR that ships each.

```ts
useProfile(handleOrWallet?: string)
→ { profile: Profile | null, isSelf: boolean,
    loading, claim(input: ClaimInput): Promise<ClaimResult>,
    update(patch: ProfilePatch): Promise<void> }

useFollows(wallet: string)
→ { followers: number, following: number,
    isFollowing: boolean, loading,
    follow(): void, unfollow(): void }      // optimistic

useFeed(lane: "following" | "everyone")
→ { items: FeedItem[], loading, fetchingMore,
    hasMore, loadMore(): void, refresh(): Promise<void>,
    newCount: number }                       // for the "new tides" pill

useComments(subject: SubjectRef)            // {type:"token"|"post", id}
→ { comments: Comment[], count: number, loading,
    hasMore, loadMore(): void,
    add(body: string, parentId?: string): void,   // optimistic
    remove(id: string): void }

useReactions(subject: SubjectRef)
→ { counts: Record<Emoji, number>,
    mine: Set<Emoji>, toggle(e: Emoji): void }    // optimistic

useTokenSocial(mint: string)                 // social strip, 1 fetch
→ { watchers: number, previewProfiles: ProfileLite[],
    commentCount: number, loading, failed: boolean }

usePosts()                                   // composer
→ { post(input: { body: string; tokenAddress?: string }): void,
    remove(id: string): void }               // optimistic insert/rollback
```

Core types (`src/lib/social/types.ts`):

```ts
type Profile = { wallet: string; handle: string;
  displayName: string; bio: string | null;
  avatarSeed: number; createdAt: string;
  followers: number; following: number }
type ProfileLite = Pick<Profile,
  "wallet" | "handle" | "avatarSeed">
type FeedItem =
  | { kind: "take";  id: string; author: ProfileLite;
      body: string; token?: TokenRef; createdAt: string;
      reactions: ReactionSummary; commentCount: number }
  | { kind: "watch"; id: string; author: ProfileLite;
      token: TokenRef; note: string | null; createdAt: string;
      reactions: ReactionSummary; commentCount: number }
  | { kind: "milestone"; id: string; token: TokenRef;
      move24hPct: number; watchedByFollowed: ProfileLite[] }
type TokenRef = { address: string; symbol: string;
  imageUrl: string | null }   // price fetched live client-side
```

## SQL DDL (Supabase migration, phase 2–3)

```sql
create extension if not exists citext;

create table profiles (
  wallet_address text primary key,
  handle citext not null unique,
  display_name text not null,
  bio text,
  avatar_seed smallint not null default 0,
  is_seed boolean not null default false,
  created_at timestamptz not null default now(),
  constraint handle_format check (handle ~ '^[a-z0-9_]{3,15}$'),
  constraint bio_len check (char_length(bio) <= 140),
  constraint name_len check (char_length(display_name) <= 32)
);

create table follows (
  follower_wallet text not null references profiles on delete cascade,
  followee_wallet text not null references profiles on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_wallet, followee_wallet),
  constraint no_self check (follower_wallet <> followee_wallet)
);
create index follows_followee on follows (followee_wallet);

create type post_kind as enum ('take', 'watch_note');

create table posts (
  id uuid primary key default gen_random_uuid(),
  author_wallet text not null references profiles on delete cascade,
  kind post_kind not null,
  body text not null,
  token_address text,
  hidden_at timestamptz,
  created_at timestamptz not null default now(),
  constraint body_len check (char_length(body) <= 280)
);
create index posts_author_time on posts (author_wallet, created_at desc);
create index posts_time on posts (created_at desc) where hidden_at is null;

create table comments (
  id uuid primary key default gen_random_uuid(),
  author_wallet text not null references profiles on delete cascade,
  subject_type text not null check (subject_type in ('token','post')),
  subject_id text not null,
  parent_id uuid references comments on delete cascade,
  body text not null,
  hidden_at timestamptz,
  created_at timestamptz not null default now(),
  constraint body_len check (char_length(body) <= 280)
);
create index comments_subject on comments (subject_type, subject_id, created_at desc);

create table reactions (
  author_wallet text not null references profiles on delete cascade,
  subject_type text not null check (subject_type in ('token','post','comment')),
  subject_id text not null,
  emoji text not null check (emoji in ('heart','fire','eyes','brain','sweat','chart')),
  created_at timestamptz not null default now(),
  primary key (author_wallet, subject_type, subject_id, emoji)
);
create index reactions_subject on reactions (subject_type, subject_id);

alter table watchlist add column is_public boolean not null default true;
alter table watchlist add column note text check (char_length(note) <= 140);

-- Defense-in-depth: service role bypasses RLS; enabling it means a
-- leaked anon key can neither read nor write these tables.
alter table profiles  enable row level security;
alter table follows   enable row level security;
alter table posts     enable row level security;
alter table comments  enable row level security;
alter table reactions enable row level security;
-- single-level replies enforced in the route handler
-- (reject when parent has non-null parent_id), not by trigger.
```

Reactions store emoji as **names** not glyphs; the UI maps name→glyph.
Single-level threading is a handler check to keep the schema dumb.

## API payloads (request → response)

All responses `{ success: boolean, data?, error? }`, generic error
strings, existing `rateLimit` helper (reads per-IP, writes per-wallet),
wallet always from `getSessionWallet(req)`.

<details><summary><b>/api/profile</b></summary>

```
GET ?handle=mira | ?wallet=7xKt…
→ { success, data: Profile }            // public fields only

POST { handle, displayName?, bio? }      // claim (JWT)
→ 201 { success, data: Profile }
→ 409 { success: false, error: "handle_taken" }   // the one specific error
→ 422 { success: false, error: "invalid" }

PATCH { displayName?, bio?, avatarSeed? } // edit self (JWT)
→ { success, data: Profile }             // handle immutable in v1
```
Reserved handles (`tide`, `admin`, `design`, `api`, `token`, `u`, …)
live in `lib/social/validate.ts`.
</details>

<details><summary><b>/api/follows</b></summary>

```
GET ?wallet=…            // counts + viewer state
→ { success, data: { followers, following, isFollowing } }
GET ?wallet=…&list=followers&cursor=…
→ { success, data: { items: ProfileLite[], nextCursor } }

POST   { followee }  (JWT) → { success }   // idempotent upsert
DELETE { followee }  (JWT) → { success }
```
</details>

<details><summary><b>/api/feed</b></summary>

```
GET ?lane=following|everyone&cursor=<ts_uuid>&limit=20
→ { success, data: { items: FeedItem[], nextCursor: string | null } }
```
Following lane requires JWT (401 otherwise). Server unions
`posts` + noted watches for followed wallets (`in` list from follows;
capped at 1000 follows in v1), orders by `created_at desc`, keyset
cursor `(created_at, id)`. Milestones: computed per request from the
viewer's followed watch-set vs. 24h moves (existing price routes),
cached 5 min in-memory per token — never stored.
</details>

<details><summary><b>/api/posts · /api/comments · /api/reactions</b></summary>

```
POST /api/posts    { body, tokenAddress? }        (JWT)
→ 201 { success, data: FeedItem }                 // echo for cache insert
DELETE /api/posts  { id }                          (JWT, own row only)

GET  /api/comments ?type=token&id=<mint>&cursor=&limit=25
→ { success, data: { items: Comment[], count, nextCursor } }
POST /api/comments { subjectType, subjectId, body, parentId? } (JWT)
→ 201 { success, data: Comment }
DELETE /api/comments { id }                        (JWT, own row only)

GET  /api/reactions ?type=post&id=…               // batched: ids=a,b,c
→ { success, data: { [id]: { counts, mine } } }
POST /api/reactions { subjectType, subjectId, emoji } (JWT, toggles)
→ { success, data: { added: boolean } }
```
Feed/comment reads embed reaction summaries server-side (one join) —
the GET /reactions batch route exists only for revalidation.
</details>

<details><summary><b>/api/social/token/[mint]</b></summary>

```
GET → { success, data: {
  watchers: number,
  previewProfiles: ProfileLite[],   // ≤3, followed-by-viewer first (JWT optional)
  commentCount: number } }
```
One round-trip for the social strip. `s-maxage=30` — counts may lag
30s, acceptable.
</details>

Write-path validation order (every handler): rate-limit → JWT →
`PublicKey` / uuid / enum / length checks (`validate.ts`) → object-level
ownership → single insert/delete. No handler exceeds one write.

## Client data conventions

- Query keys: `['profile', handle]`, `['feed', lane]`,
  `['comments', type, id]`, `['reactions', type, id]`,
  `['tokenSocial', mint]`, `['follows', wallet]`.
- Optimistic mutations snapshot + rollback (`onMutate`/`onError`),
  invalidate on settle. Feed post-insert uses the echoed `FeedItem`.
- Feed: `useInfiniteQuery`, page size 20, `staleTime` 30s;
  `refetchInterval` off (pull-to-refresh + new-count head poll 60s).
- Live prices in chips reuse the existing ticker/jupiter routes with a
  module-level de-dupe so 20 cards referencing JUP = 1 request.

## Seeding

`supabase/seed/tide-personas.sql` (checked in, reviewed like code):
12 profile rows (`is_seed=true`, reserved wallet-format IDs that can
never collide with real keys), follows among themselves, ~40 watches
with notes + ~25 takes referencing real mints. Applied by a one-shot
guarded admin route (pattern: `/api/nft/admin/seed`) or SQL editor.
Idempotent (`on conflict do nothing`).

## Verification per phase (beyond the standing gates)

| Phase | Added checks |
|---|---|
| 0 | contrast ratios documented for the 8 hues; gallery renders every kit component in every state |
| 1 | scroll-restoration acceptance test on token→back; Lighthouse mobile pass on Markets |
| 2 | route-handler tests: claim (taken/invalid/reserved), follow idempotency, IDOR attempts (wallet in payload ignored) |
| 3 | feed cursor stability under concurrent inserts; optimistic rollback paths (kill network mid-mutation); seed idempotency |

Test cases still get proposed per-PR for approval (CLAUDE.md policy) —
this table is the floor, not the ceiling.

## Explicitly deferred

- Realtime (chat, live comment streams) — phase 4; nothing in 0–3 may
  assume a socket exists.
- People search in the search overlay (needs `pg_trgm` index on
  handle/display_name — trivial to add later, noted here so the search
  overlay component keeps a results-section abstraction).
- Notifications (schema unaffected: all social objects carry
  `created_at` + author, a notifications table can derive later).
- Avatar uploads (generated-only avoids moderation + storage surface).
