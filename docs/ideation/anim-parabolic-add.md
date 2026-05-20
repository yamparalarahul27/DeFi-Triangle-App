---
title: Parabolic add — Arc-style add-to-watchlist animation
status: captured
captured: 2026-05-20
---

# Parabolic add animation

> When a user adds a token or trade venue to their watchlist, the item physically *flies* along an arc into the watchlist counter — giving the action weight and confirmation without a modal or toast.

## What it is

Arc browser does this for downloads: clicking download triggers a small ghost of the file that arcs into the sidebar's downloads icon. The action *feels* committed because something moved through space.

We'd apply the same to watchlist add (tokens, NFTs once NFT Edge exists, venues once Trade Edge exists). One pattern, three surfaces.

## Where it lives in the app

Triggered by any "add to watchlist" interaction:
- Star icon on token cards (Token Edge, search results)
- Star icon on NFT detail (NFT Edge — future)
- Star icon on venue rows (Trade Edge — future)

The destination is wherever the watchlist counter lives (header, sidebar, tab badge — depends on final IA).

## Sketch — the flight path

```
   [SOL]                              ┌──────┐
    ●  ← user clicks ★                │ ★ 12 │  ← watchlist counter
     ╲                                └──────┘
      ╲   arc trajectory                  ▲
       ╲   cubic-bezier(.4, 1.4, .6, 1)   │  lands here,
        ╲                                 │  counter bumps
         ╲ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘  to 13 with
          shrinks 1 → 0.4 along the arc      a small bounce
          fades 1 → 0 on landing

   Duration:    420ms
   Easing:      out-back on x, ease-in-out on y
   Particle:    ghost copy of the star icon + token glyph
```

## Sketch — state machine

```
  idle  ──[user clicks ★]──→  ghosting
                                  │
                                  ▼
                              arcing (420ms)
                                  │
                                  ▼
                              landing
                                  │
                                  ├──→ counter bumps (scale 1 → 1.15 → 1)
                                  │    over 200ms
                                  │
                                  └──→ ghost fades, dom-removed
                                       state returns to idle,
                                       star is now solid-filled
```

## Open questions

- **Where exactly is the destination?** Depends on whether watchlist UI is a header counter, a sidebar tab, a bottom-nav badge. Pin down before animating.
- **Multiple rapid adds** — does each fly its own arc, or do they batch into a single "+3" burst? Batching is simpler but loses individuality.
- **Reduced-motion preference:** users with `prefers-reduced-motion: reduce` should just see the star fill instantly + counter bump. Animation gated.
- **Direction reversal — removing from watchlist:**
  - Option A: just unfill the star, no animation.
  - Option B: ghost flies *out* of the counter, lands on the row. Symmetric but doubles the motion design work.
  - The [trash-throw animation](./anim-trash-throw.md) is a separate, heavier "delete" pattern — different from watchlist-remove.
- **Star icon press feedback** during the click — already handled by the [make-interfaces-feel-better polish layer](../../CLAUDE.md#installed-skills) (`scale(0.96)` press). Confirm the polish doesn't fight the parabolic ghost.
- **Performance:** ghost element is a single DOM node animated via Web Animations API or CSS transform. No layout thrash. Should be 60fps everywhere.

## Out of scope (first pass)

- Multi-step trails (motion blur, particle effects). Single ghost only.
- Sound effects.
- Different arcs per item type (token vs NFT vs venue). One arc.

## Prior art / reference

- [Arc browser](https://arc.net/) — direct inspiration; download "flying" into sidebar
- iOS "Add to Photos" / "Save to Files" — single ghost arc + landing bump
- macOS Stacks expand/collapse — arc-style motion conventions
- [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) — recommended implementation surface
