---
title: Trash throw — Mac 1990s delete animation
status: captured
captured: 2026-05-20
---

# Trash throw animation

> When the user deletes something destructive (watchlist item, alert, recent search), the item crumples into a paper ball and arcs into a Mac-90s trash bin icon. The bin lid wiggles. Reversible via Undo for ~5s.

## What it is

A destructive-action animation with three things going on at once:
1. **Skeuomorphic crumple** — the deleted row visually crumples into a paper ball.
2. **Parabolic throw** — the ball arcs across the screen into a trash bin (like the [parabolic add](./anim-parabolic-add.md), but for delete).
3. **Bin reaction** — lid lifts, ball goes in, lid wiggles back down. Bin briefly shows a count badge.

This is heavier than a fade-out, and it's *intentional*. Destructive actions should feel deliberate. The animation gives the user a beat to undo before the action commits.

## Where it lives in the app

Any destructive action:
- Remove from watchlist (token, NFT, venue)
- Dismiss an alert / notification
- Clear a recent search
- Future: remove a wallet, delete a saved view, etc.

## Sketch — the throw sequence

```
  Step 1: USER CONFIRMS DELETE
  ┌─────────────────────────┐
  │ ✕ SOL  delete           │   ← user clicks ✕
  └─────────────────────────┘

  Step 2: CRUMPLE
  ┌─────────────────────────┐
  │  ◜ ╲╱ ◝   crumple        │   ← row scales 1 → 0.4 over 180ms
  │  ◟ ╳╳ ◞    paper ball    │     content disappears, becomes
  └─────────────────────────┘     a small "paper ball" sprite

  Step 3: ARC THROW
        ●                          ← ball at end of step 2
       ╱ ╲                            arcs across to bin
      ╱   ╲   trajectory:
     ╱     ╲   cubic-bezier(.3, .7, .3, 1.1)
    ╱       ╲   slight backspin (rotate 0 → 360deg)
   ╱         ╲
  ●           🗑   ← bin destination

  Step 4: BIN REACTION
   ┌──┐                              ┌──┐
   │  │   ─►  lid lifts 30°   ─►    │  │   ─►  count badge +1
   │ /  \  ball drops in           │ /  \                        bin sits idle
   └────┘                           └────┘

  Step 5: UNDO BAR
  ┌──────────────────────────────────────┐
  │  SOL removed.  ↩ Undo  (5s)          │   ← bottom toast
  └──────────────────────────────────────┘
   ↑
   if user clicks Undo: ball flies BACK out of bin,
                        re-expands into row.
```

## Sketch — total timing budget

```
  crumple        0 ─→ 180ms
  arc-throw       180 ─→ 520ms
  bin-lid-up      460 ─→ 620ms
  ball-falls      500 ─→ 620ms
  bin-lid-down    600 ─→ 760ms
  badge-bump      620 ─→ 720ms

  Total:  760ms feel time + 5000ms undo window
```

## Open questions

- **Where does the trash bin live on-screen?** Floating bottom-right? Fixed in header? Appears only when a deletion is initiated and disappears when undo window closes?
- **Persistent trash bin** — Mac-90s style, always visible, shows total deleted-this-session count? Or ephemeral, only shows during the animation?
- **Reduced-motion behaviour:** users with `prefers-reduced-motion: reduce` get a simple fade + undo toast. Animation is gated and skippable.
- **Failure path:** if the API call to delete fails after the animation completes, ball flies BACK out of bin, row restores, error toast shown. The animation owns the optimistic-UI semantics.
- **Multiple rapid deletes:** queue them or play in parallel? Recommend queue (one at a time) — parallel arcs collide visually.
- **Trash bin asset:** custom-drawn pixel-art bin to fit the [Geist Pixel Square](../../DESIGN.md) typography vibe? Or 3D-style? Pixel-art matches the brand identity better.
- **Sound:** a soft "swoosh" + thud? Defer — sound is more invasive than visuals; only add if user-tested favourably.

## Out of scope (first pass)

- Multi-item bulk delete (selects 5 rows, all crumple into 5 balls). Single item only.
- Ability to *open* the trash and restore old items. Undo is in-flight only; after 5s gone for good.
- Theme variants (dark trash, holiday trash, etc.).

## Prior art / reference

- macOS classic Trash (1984+) — direct inspiration for the bin sprite
- Gmail / Slack "undo send" — the 5s undo toast pattern
- [iOS Mail swipe-to-delete](https://support.apple.com/) — micro-animation when an email row collapses
- This pairs with the [parabolic add](./anim-parabolic-add.md) — same arc primitive, opposite direction.
