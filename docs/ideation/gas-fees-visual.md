---
title: Visual gas-fee tiles (multi-chain)
status: captured
captured: 2026-05-20
---

# Visual gas-fee tiles

> Replace the abstract gwei number with a vehicle-metaphor speed tier — Walking / Speed Bike / Future Car — so users *feel* low vs high gas before they read the number.

## What it is

Inspired by the Proteus dashboard's gas-fee widget: three speed tiers visually represented by a pedestrian, a motorcycle, and a Back-to-the-Future car. Each tier shows current gwei, estimated dollar cost for a standard tx, and time-to-confirmation.

The metaphor compresses three abstract values (gwei, $cost, seconds) into a single visceral "speed" that anyone can read.

> Reference image: user-provided mockup from chat (file not currently in repo; capture in `./assets/gas-fees-ref.png` whenever re-shared).

## Where it lives in the app

Not yet decided. Candidates:

```
(a) Header strip          — always visible, smallest footprint
    ┌──────────────────────────────────────────┐
    │ 🚶 31 │ 🏍 32 │ 🏎 34 gwei                │  ← micro tiles
    └──────────────────────────────────────────┘

(b) Sidebar widget        — persistent reference
    ┌──────────────┐
    │ Gas Fees     │
    │ 🚶 31 Low    │
    │ 🏍 32 Avg    │
    │ 🏎 34 High   │
    └──────────────┘

(c) Inline on Trade Edge  — at point-of-action
    "Place $100 swap" preview shows the chosen tier
    expanded into the full Proteus-style card.

(d) Dedicated /gas page   — full multi-chain comparison view
```

Recommend (c) — point-of-action gas data is what users actually want.

## Sketch — the Proteus-style full card

```
┌─ Gas Fees ────────────────────── Base: 30 │ next in 3s ┐
│                                                         │
│   🚶🚶          🏍                🏎                    │
│   Walking      Speed Bike       Future Car              │
│   Low Speed    Avg Speed        High Speed              │
│   $1.05/30s    $1.05/30s        $1.05/30s               │
│                                                         │
│     ( 31 )       ( 32 )           ( 34 )                │
│      gwei        gwei              gwei                 │
│   ▲ orange       ▲ green          ▲ blue                │
└─────────────────────────────────────────────────────────┘
```

## Sketch — Solana adaptation

```
ETH/EVM has gwei tiers (slow/avg/fast).
Solana has priority fees in microLamports/CU.

  ETH metaphor                Solana metaphor
  ────────────                ───────────────
  🚶 Walking                  🛰  Satellite       ← no priority tip
  🏍 Speed Bike               🚀 Rocket           ← median tip
  🏎 Future Car               🛸 Spaceship        ← top-decile tip

  (Cosmic vocab also pairs nicely with the
   cosmos-canvas idea — consistent universe.)
```

## Open questions

- **Which chains?** Project is Solana-first → Solana priority fees primary, EVM (ETH, Base, Polygon, BSC) as secondary?
- **Solana-only first**, or multi-chain v1?
- **Vehicle vs cosmic metaphor** — vehicles map cleanly to ETH/EVM but feel off-brand if the app is Solana-first with a space/cosmos visual identity.
- **Cost basis** — show current "median tx" cost (USDC swap, NFT mint, simple transfer)? The Proteus reference uses one number; users may want context-specific ($X for swap, $Y for mint).
- **Data sources:**
  - EVM → Blocknative, Etherscan gas tracker, Alchemy
  - Solana → Helius `getRecentPrioritizationFees`, Triton's geyser endpoints
- **Update cadence:** every block (12s ETH, ~400ms Solana)? Polling every 3-5s?
- **Click behaviour:**
  - Copy gwei value to clipboard
  - Open chain-specific detail (volume, congestion graph)
  - Inject this tier into a swap preview (the (c) variant above)

## Out of scope (first pass)

- Historical gas charts. Show now-state only.
- Setting wallet defaults from this widget.
- L2 fees broken out separately from L1 base + priority (most L2s already collapse this into a single "L2 gas").

## Prior art / reference

- [Proteus dashboard](https://proteus.app/) — direct inspiration; vehicle metaphor
- [Etherscan gas tracker](https://etherscan.io/gastracker) — canonical EVM gas view
- [Ethereum.org gas calculator](https://ethereum.org/en/) — simpler educational pattern
- [Helius Solana fee API](https://docs.helius.dev/) — best Solana priority-fee data source
