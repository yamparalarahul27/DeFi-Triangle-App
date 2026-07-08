# 05 · UX flows — recommended journeys, gates, states

Every flow below is the **recommended** path (chosen over alternatives,
with the rejection reason noted). Static mocks of the key screens live
at `/Prototypes/tide/` on any Vercel preview.

## The gating matrix (who can do what)

Three identity states — the whole UX hangs on these:

| Action | Visitor (no wallet) | Connected (no handle) | Member (handle claimed) |
|---|---|---|---|
| Browse Markets / token pages | ✔ | ✔ | ✔ |
| Read feed (Everyone lane) | ✔ | ✔ | ✔ |
| Read feed (Following lane) | — prompt | — prompt | ✔ |
| View profiles / comments | ✔ | ✔ | ✔ |
| Watch a token | gate → connect | gate → handle | ✔ |
| Follow / react / comment / post | gate → connect | gate → handle | ✔ |
| `/design` | ✔ | ✔ | ✔ |

**Rule: never gate reading, always gate acting.** The gate is a single
bottom sheet that resolves *both* missing steps in one pass (connect →
claim), then returns you to the exact act you attempted — the act
completes, you don't re-tap.

## Flow A — first visit (recommended entry)

```
land "/" (visitor)
  │  default tab = Markets
  ▼  (data-rich first paint;
┌ Markets ┐  feed of strangers
│ rails   │  means nothing yet)
└────┬────┘
     │ tap token card
     ▼
┌ Token detail ┐
│ price·chart  │
│ ◔ 41 watching│ ← social proof =
└────┬─────────┘   curiosity hook
     │ tap "41 watching"
     ▼
watchers sheet → tap @mira
     ▼
┌ Profile @mira ┐
│ her watchlist │ → follow → GATE
└───────────────┘
```

*Rejected alternative:* landing visitors on the Everyone feed — social
content from strangers before market context underdelivers, and an
empty-wallet feed is the weakest first screen. Members land on Feed
(remembered via cookie), visitors on Markets.

## Flow B — identity gate (connect → claim), the one funnel

Triggered by any gated act. One bottom sheet, three steps max:

```
[tap Follow]
   ▼
╔ sheet: "Join Tide" ═════╗
║ 1 Connect wallet        ║ ← Jupiter adapter,
║   [Phantom] [Solflare]… ║   existing nonce/
╟─────────────────────────╢   verify flow
║ 2 sign message          ║ ← auto-prompts
╟─────────────────────────╢
║ 3 Claim your handle     ║
║   @[____________]       ║ ← live availability
║   ◐ avatar (from hue)   ║   check, debounced
║   [Join the tide]       ║
╚═══════╤═════════════════╝
        ▼
sheet closes → original act
completes (Follow turns
"Following" with the morph)
+ one-time toast:
"You're in. Follow 3 people
 to fill your feed →"
```

Details that matter:
- Step 3 pre-fills a suggestion (`@` + wallet-derived adjective-noun,
  e.g. `@coral_otter`) — editable, so the fast path is one tap.
- Display name defaults to the handle; bio skippable. Editing lives in
  Profile, not the gate — the gate stays ≤ 15 seconds.
- Handle taken → inline error under the field, field keeps focus.
  This is the *only* specific auth-adjacent error copy in the app.
- Dismissing the sheet at any step = no-op, you're back where you were,
  nothing half-created (profile row is only written at "Join").

## Flow C — watch with a note (the atomic social act)

```
token page / card
   │ tap [♥ Watch]
   ▼ (optimistic: icon draws
      in + mint shimmer NOW)
╔ toast-sheet (non-modal) ══╗
║ Watching PYUSD ✓          ║
║ [add a note… (optional)]  ║ ← 140 chars
║           [Skip] [Post]   ║
╚═══════════════════════════╝
  Post → feed card "watch
  + note"; Skip/ignore →
  silent watch (no feed spam
  unless noted)  ← key call
```

**Recommended call:** *silent watches don't post to the feed* — only
watches-with-notes do. Watch counts still tick everywhere. This keeps
the feed human (things people chose to say) instead of an activity log.
*Rejected:* auto-posting every watch — feeds fill with low-intent noise
and people stop watching to avoid broadcasting.

Unwatch: tap again → instant, no confirm (recoverable, low stakes). The
note dies with it.

## Flow D — posting a take

Entry points: composer button on Feed (floating, above the bar) and
"Share a take" on token pages (pre-tags the token).

```
╔ composer sheet ═══════════╗
║ ◐ @you                    ║
║ [what's the tide?______]  ║ ← 280 chars,
║ [$ tag token ▾]  231 left ║   counter at <40
║                 [Post]    ║
╚═══════════════════════════╝
Post → optimistic insert at
feed top w/ slide-fade; fail
→ card flips to retry state,
text never lost
```

Token tagging opens the existing search overlay in picker mode; the tag
renders as a live TokenChip on the posted card.

## Flow E — react & comment

- **React:** single tap on the ReactionBar emoji → optimistic toggle +
  spring-pop. Long-press (or tap `+`) opens the 6-emoji picker. One of
  each emoji per person per subject; tap again to remove.
- **Comment:** tap the count → bottom sheet thread (85dvh, drag to
  dismiss). Input pinned at sheet bottom. Reply = single level; tapping
  reply on a reply targets the parent (flat thread, Instagram model).
- Delete own comment: swipe/⋯ → confirm dialog (destructive-action
  rule) → tombstone "comment removed" only if it has replies, else
  removed outright.

## Flow F — follow & the feed settling in

Follow from: profile header, watcher sheets, feed card handles
(long-press peek → follow without navigating).

New-member cold start (first session after Flow B):

```
Feed (Following) w/ <3 follows:
┌──────────────────────────┐
│ designed empty state:    │
│ "Your tide is quiet."    │
│ + 3 suggested profiles   │ ← seeded personas,
│   [◐ @mira  Follow]      │   diverse tastes,
│   [◑ @kesh  Follow]      │   1-tap follow
│   [◒ @noor  Follow]      │
│ + [browse Everyone →]    │
└──────────────────────────┘
```

Everyone lane is always one tap away — the app never feels empty even
with zero follows.

## Flow G — token social strip → thread

On `/token/[address]`, the strip sits between header/chart and stats
(mock: `token.html`). Taps: count → watchers sheet; avatars → that
profile; comments row → thread sheet. The strip renders from one
`GET /api/social/token/[mint]` round-trip and skeletons independently —
market data never waits for social data. **If social fetch fails, the
strip collapses to just the Watch button** — a token page must never
look broken because the social layer hiccuped.

## Loading, empty, error — the recommended state strategy

| State | Treatment |
|---|---|
| Loading | Skeletons matching final geometry (existing `Skeleton` component), per-section — never full-page spinners. Feed: 3 skeleton cards. |
| Refresh | Background revalidate; last-good data stays visible (engine convention). New feed items: quiet "· new tides ·" pill at top, tap to reveal — no content jumps under the thumb. |
| Empty | Every list has a *designed* empty (copy + one action). The playful copy budget lives here. |
| Write fails | Optimistic UI rolls back + inline retry on the artifact itself. Toasts only for acts with no visible artifact. |
| Read fails | Section-level "couldn't load · retry" row, generic copy. |
| Rate-limited | Same generic failure — never expose limiter details. |
| Offline | Banner pill under the header; acts queue nothing (disabled), reads show last-good. |

## Recommended micro-decisions (locked unless you veto)

1. Feed default lane = **Following** for members, **Everyone** for
   visitors; the toggle remembers per-user.
2. Timestamps: relative under 24h ("2m", "18m"), then date. Tap
   nothing — no tooltip dance on mobile.
3. Pull-to-refresh on Feed and Markets (native gesture, no custom
   spinner art).
4. Back behavior: token pages and profiles are pushed routes — system
   back always returns to the exact scroll position (scroll restoration
   is a phase-1 acceptance criterion, not a nice-to-have).
5. No infinite scroll on comments — "show more" pages of 25 (bottom
   sheets + infinite scroll fight the drag-to-dismiss gesture).
