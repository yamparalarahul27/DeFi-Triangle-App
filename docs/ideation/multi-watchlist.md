---
title: Multi-watchlist — named folders per wallet
status: backlogged
captured: 2026-05-20
priority: high (next major Watchlist iteration)
---

# Multi-watchlist

> Multiple named watchlists per wallet — "Memes", "Stables I'm tracking", "Long-term DeFi", etc. — instead of one flat starred-set.

## What it is

V1 (shipping 2026-05-20) gives every wallet **one** watchlist. Every star toggle adds to or removes from that single list.

V2 (this idea) lets a user create, rename, and switch between **multiple named watchlists**. The star action gets a list-picker step: "Add to which list?"

## Why this is the goal

Single-list scales poorly past ~15–20 items. Users save a meme one day, a stablecoin the next, a DeFi protocol the week after — without folders the list becomes an undifferentiated pile and stops being useful. Multi-list maps to how users actually think about their tracking ("things I'm watching FOR these reasons").

This is the **explicit end-goal direction** for the Watchlist feature, captured during the v1 ship review on 2026-05-20.

## Where it lives in the app

Same Watchlist tab, but with a list-switcher rail above the grid.

```
┌─ Watchlist tab ────────────────────────────────────────┐
│                                                        │
│ Your Watchlist                          4Df3...3kFp    │
│                                                        │
│ [All ▾]                                                │
│   ├─ All           (47)    ← default = union           │
│   ├─ Memes         (12)    ◄── selected                │
│   ├─ Stables       (6)                                 │
│   ├─ DeFi          (18)                                │
│   ├─ Long-term     (11)                                │
│   └─ + New list                                        │
│                                                        │
│ ┌──┐ ┌──┐ ┌──┐ ┌──┐                                    │
│ │  │ │  │ │  │ │  │  ← DexCards filtered by selected   │
│ └──┘ └──┘ └──┘ └──┘    list                            │
└────────────────────────────────────────────────────────┘

When user clicks ★ on a token NOT in any list:
  ┌─ Add to list ──────────────┐
  │ ☐ Memes                    │
  │ ☐ Stables                  │
  │ ☐ DeFi                     │
  │ ☐ Long-term                │
  │ + Create new list…         │
  │                            │
  │       [ Cancel ] [ Save ]  │
  └────────────────────────────┘
```

## Sketch — data model migration

```
v1 today (Supabase):
  watchlist_items
    ├ wallet_address  text  (FK to session JWT)
    ├ token_address   text
    ├ symbol / name / image_url
    └ added_at        timestamptz

v2 needed:
  watchlists                 ◄── new table
    ├ id              uuid
    ├ wallet_address  text
    ├ name            text   ("Memes", "Stables", …)
    ├ created_at      timestamptz
    └ ordering        int    (user-set sort order)

  watchlist_items (modified)
    ├ id              uuid
    ├ watchlist_id    uuid   ◄── new FK
    ├ token_address   text
    ├ symbol / name / image_url
    └ added_at        timestamptz

  Migration plan:
    1. Create `watchlists` table
    2. For each existing wallet with items, create a default
       watchlist named "Saved" — populate its id
    3. Backfill watchlist_items.watchlist_id pointing to that default
    4. Drop watchlist_items.wallet_address (no longer needed —
       derived via watchlists.wallet_address)
    5. Migration runs once on first deploy, idempotent
```

## API surface changes

```
v1:
  GET    /api/watchlist              → user's items
  POST   /api/watchlist               → add item
  DELETE /api/watchlist?token=...     → remove item

v2:
  GET    /api/watchlists                       → list of lists
  POST   /api/watchlists                       → create list
  PATCH  /api/watchlists/:id                   → rename / reorder
  DELETE /api/watchlists/:id                   → delete list

  GET    /api/watchlists/:id/items             → items in a list
  POST   /api/watchlists/:id/items             → add token to list
  DELETE /api/watchlists/:id/items?token=...   → remove from list

  Backwards-compat layer:
    /api/watchlist     → proxies to /api/watchlists/<default>/items
                         keeps single-list clients working during
                         the migration window.
```

## Open questions

- **Default behaviour when starring** — open a picker every time? Or default-to-last-used-list with an option to override? Picker every time is more deliberate but adds friction.
- **Drag-and-drop between lists**? Or just multi-select + "Move to…"?
- **Token in multiple lists** — allowed (recommended) or limited to one list each (forces categorisation)? Recommend: allowed, with a small indicator showing "in N lists" on the card.
- **Sharing a list** — share URL like `/watchlist/abc123` (read-only public view of someone's list)? Big new surface — probably v3, not v2.
- **List limit** — cap at 10? Unlimited with a soft warning at 20+? Worth limiting from day one to keep the UI cohesive.
- **Default list name** — "Saved" (neutral) or "My Watchlist" (matches v1 mental model)? Pick once; rename is always available.
- **Migration risk** — if the schema migration fails partway, partial state is bad. Wrap in a transaction; have a rollback path that re-creates the v1 view.

## Out of scope for v2

- Shared lists / collaborative lists (v3)
- List-specific notifications ("alert me when something in 'Memes' drops 20%") — captured separately in [docs/token-details-changelog.md](../token-details-changelog.md) growth-opportunities
- Pinning / archiving lists
- Smart lists (rule-based: "auto-add all tokens with market cap > $1B")

## Prior art / reference

- [Twitter / X Lists](https://help.x.com/en/using-x/x-lists) — named curation of accounts; conceptual model fits 1:1
- [GitHub starred lists](https://docs.github.com/en/get-started/exploring-projects-on-github/saving-repositories-with-stars) — closest crypto-adjacent UI pattern
- [Linear cycle / project switcher](https://linear.app/) — the list-switcher rail interaction we'd mimic
- [iOS Photos albums](https://support.apple.com/) — clean "add to multiple" picker pattern

## Effort estimate

```
Backend:
  - Schema migration                  ~0.5 day
  - New API routes + rate-limit       ~0.5 day
  - Backwards-compat shim layer       ~0.5 day

Frontend:
  - List-switcher rail UI             ~0.5 day
  - "Add to list" picker modal        ~0.5 day
  - CRUD UI (create / rename / delete) ~0.5 day
  - State management refactor in
    useWatchlist hook                 ~0.5 day

Total:  ~3 days of focused work
        + Vercel preview verification
        + migration dry-run on staging
```

## Promotion checklist (when ready to start)

- [ ] Confirm v1 has been live long enough to see usage signals (how many users have >15 items?)
- [ ] Draft migration SQL + dry-run on a Supabase branch
- [ ] Open a `plan/` doc that locks the data model + API shape
- [ ] Cut a feature branch off `stage`
- [ ] Build with `MULTI_WATCHLIST` flag gating the new UI; keep v1 behaviour as fallback
