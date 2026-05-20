---
title: Cosmos canvas — infinite token universe
status: captured
captured: 2026-05-20
---

# Cosmos canvas

> An infinite, pannable, zoomable canvas where every token is a glowing celestial body. Hover reveals name + 24h delta. A more visceral way to browse "the market" than ranked tables.

## What it is

Trade Edge and Token Edge are *list views*. Cosmos canvas is the **opposite** — a spatial view, where size, glow, and clustering carry information that lists can't. Users pan around like a star map; tokens that *matter to them* (watchlist, top market cap, trending) are bigger and brighter.

The user-provided reference: a glowing Bitcoin/WBTC orb with concentric orbital rings, a small side label revealing the ticker and price delta on cursor hover (Uniswap-tooltip-style).

> Reference image: user-provided mockup from chat (file not currently in repo; capture in `./assets/cosmos-canvas-ref.png` whenever re-shared).

## Where it lives in the app

A dedicated view, not a tab inside Token Edge. Possibly its own top-level entry point — "Explore" or "Universe" — separate from Token Edge / Trade Edge / NFT Edge.

## Sketch

```
       ◌    ○                              ⊙
                  ○            ◌
   ○        ┌──────────────────┐
            │  ╭─ ─ ─ ─ ─ ─╮    │   ← outer orbit ring
            │  │ ╭─ ─ ─ ─╮ │    │
   ◌        │  │ │  ╱──╲ │ │    │   ●  WBTC
            │  │ │ ( ₿ ) │ │    │      ▼ 1.43%   ← hover tooltip
            │  │ │  ╲──╱ │ │    │         (side-anchored, like Uniswap)
            │  │ ╰─ ─ ─ ─╯ │    │
            │  ╰─ ─ ─ ─ ─ ─╯    │
            └──────────────────┘
                    ↑
              size ∝ market cap (?)
              glow ∝ 24h volume (?)
              ring count ∝ age / longevity (?)
   ◌                                          ○
              ⊙                ◌
                                              ○

   ← pan │ scroll = zoom │ click = open token detail →
```

## Sketch — interaction states

```
  HOVER STATE                  PRESS / CLICK
  ┌─────────────────────────┐  ┌─────────────────────────┐
  │                         │  │   ← zooms toward orb,   │
  │   ( ₿ )  ●  WBTC        │  │     orb grows to fill   │
  │           ▼ 1.43%       │  │     viewport,           │
  │                         │  │     opens token detail  │
  │   ↳ side label appears  │  │     overlay             │
  │     glow intensifies    │  │                         │
  └─────────────────────────┘  └─────────────────────────┘
```

## Open questions

- **What drives size?** Market cap | 24h volume | watchlist priority | a blend? Pick ONE for v1 or risk the visual becoming noisy.
- **What drives glow / pulse?** 24h volume? Volatility? Peg-deviation (for stables)?
- **What drives spatial layout?**
  - Random scatter (simple, looks like stars)
  - Clustered by category (stables / L1s / memes / DeFi) — easy to grasp
  - Force-directed by price-correlation — physically meaningful but hard to read
- **Performance ceiling:**
  - Canvas2D: ~500-1000 animated nodes before frame drops
  - WebGL (regl / pixi.js / three.js): ~10k+ nodes, but harder to maintain
  - Pick based on how many tokens we'd show in v1 (50? 500?)
- **Hover label** — fixed-side (always right, like ref) or follow-cursor? Mobile has no hover → tap reveals.
- **Mobile gesture set:** pinch = zoom, two-finger drag = pan, single tap = label, double tap = open. Reference Apple's Maps or Photos for conventions.
- **What's the entry "default zoom level"?** Showing all 500 tokens at once is overwhelming; default to "top 50 by your watchlist or top market cap" zoomed-in, with "zoom out to see more" hinted.

## Out of scope (first pass)

- 3D camera angles. 2D pan/zoom only.
- Real-time orbital animation (orbs literally orbiting each other) — visually expensive, low information value.
- User-customizable layouts ("save my map").
- Multi-touch fancy gestures beyond pinch + drag.

## Prior art / reference

- [Uniswap swap hover tooltips](https://app.uniswap.org/swap) — the side-anchored label pattern
- [Arkham Intelligence address graph](https://www.arkhamintelligence.com/) — spatial wallet/entity map
- [Map of the Internet](https://internet-map.net/) — clustered orb visualization
- [Bubble chart treemaps on CoinMarketCap](https://coinmarketcap.com/charts/) — closest existing crypto-finance analog
