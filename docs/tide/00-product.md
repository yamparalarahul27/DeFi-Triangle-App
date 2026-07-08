# 00 · Product — what Tide is

## One-liner

**Tide is where you watch the market with people, not alone.**
A social layer over live Solana market data: you follow humans, see what
they watch, react to their calls, and read the market through your circle.

## Why "Tide"

- Markets move together — a tide is the shared movement, not one wave.
- Ocean/teal imagery fits the existing mint-teal (`--brand #5ad8c4`)
  identity without a redesign.
- Short, calm, premium — matches the system's mood words
  (*calm authority, precise, cinematic*), and gives natural product
  vocabulary: *the tide today*, *tide is turning*, *high tide*.

Wordmark direction: lowercase `tide` in the existing display stack with a
mint accent glyph (`~` wave or the current `◐` rotated). Decided in the
design-system phase, not here.

## Audience

| Who | What they need | What Tide gives |
|---|---|---|
| **Customers** — crypto-curious social traders on mobile | Market info that doesn't feel lonely or terminal-cold | A feed of people + live data, zero-friction browsing |
| **Design evaluators** — clients/recruiters assessing B2C craft | Proof of real product design, not dribbble shots | A polished working app + `/design` system gallery |

The second audience never dilutes the first: `/design` is unlisted, and the
app is designed for customers — evaluators judge exactly that.

## The core loop

```
 discover ──▶ watch ──▶ follow
 (Markets)   (signal)  (people)
     ▲                    │
     │                    ▼
   react ◀──── feed ◀── activity
 (comments,   (Home)
  emoji)
```

1. **Discover** a token in Markets (engine rails: attraction / long-term /
   high-risk / stablecoins).
2. **Watch** it — the existing watchlist becomes a *public signal*
   ("47 people watch PYUSD · 12 added today").
3. **Follow** the people whose watches/takes keep being right.
4. **Feed** shows what your circle is watching, saying, reacting to.
5. **React/comment** — the social pulse feeds back into discovery.

Watching is the atomic social act. It already exists in the engine
(`useWatchlist`), it's low-stakes (not financial advice), and aggregating it
creates the social-proof rails that make the feed interesting on day one.

## v1 scope

**In:**
- 4-tab shell: Feed · Markets · Search · Profile
- Wallet auth → one-time @handle + avatar profile setup
- Profiles (own + others), follow/unfollow
- Feed: watches, takes (short text posts, optionally token-tagged),
  milestones from people you follow + a "everyone" discovery lane
- Comments + emoji reactions on tokens and takes
- Watch signals on token cards ("N watching")
- Token detail page (re-skin of the 13 engine sections + social strip)
- `/design` living component gallery (hidden URL)
- ~12 seeded personas so the app is alive at launch

**Out (designed for, not built) — see 04-roadmap.md:**
- Chat (token rooms / DMs) — phase 4
- Notifications/push
- Leaderboards, streaks-as-mechanics (only visual flair in v1)
- Trading execution of any kind — Tide never touches funds
- NFT Edge tab (engine kept; surface deferred)

## Product principles

1. **Numbers are the hero; people are the plot.** Data density stays —
   the social layer explains *why you care*, it never hides the number.
2. **Watching ≠ advising.** All social objects are observations
   (watch, take, reaction). No "buy" buttons, no PnL bragging mechanics
   in v1. Keeps trust, tone, and legal surface calm.
3. **Readable logged-out, social logged-in.** The whole app browses
   without a wallet. Identity is requested at the first social act
   (follow/comment/react/watch), never at the door.
4. **Calm base, playful moments.** The terminal stays premium and quiet;
   the *interactions* are alive (reaction pops, tasteful celebration when
   a watched token runs). Fun is spent sparingly, like the brand color.
5. **The engine is the floor.** Every market surface plugs into the
   existing hooks per engine-contract.md — no new market-data plumbing
   in v1.
