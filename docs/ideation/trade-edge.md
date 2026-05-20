---
title: Trade Edge tab
status: captured
captured: 2026-05-20
---

# Trade Edge tab

> A second top-level tab next to Token Edge, listing CEX + DEX side-by-side with comparable execution costs for a fixed-size order across multiple time horizons.

## What it is

Token Edge tells you **what the token is**. Trade Edge tells you **where to trade it cheapest**.

Today the Watchlist concept is scoped only to tokens. Watchlisting whole *trade venues* (a Jupiter route, an Orca pool, a Binance pair) is a strictly bigger surface — and arguably more actionable, because the answer to "where do I get the best fill?" is what users actually have to decide every time they want to move money.

## Where it lives in the app

```
┌─ Y-Vault ────────────────────────────────────┐
│  [Token Edge*] [Trade Edge]                  │  ← top-level tabs
├──────────────────────────────────────────────┤
│ Trade Edge                                   │
│                                              │
│ Pair: SOL/USDC ▾    Order size: $100 ▾       │
│                                              │
│ ┌────────────────────────────────────────┐   │
│ │ Exchange     Type   24h    5d    1mo   │   │
│ │ Jupiter      DEX    $0.30  $1.50  $9   │   │
│ │ Orca SOL/U.  DEX    $0.34  $1.70 $10   │   │
│ │ Binance      CEX    $0.10  $0.50  $3   │   │
│ │ Coinbase     CEX    $0.45  $2.25 $13   │   │
│ │ …                                      │   │
│ └────────────────────────────────────────┘   │
│  Sort: fee↑ ▾ │ Filter: CEX │ DEX │ All      │
└──────────────────────────────────────────────┘
```

Each row is a candidate venue. Each column is "total fee cost if you'd placed this order *once* at the median price during that window" — a normalised, comparable number. Click a row → venue detail (depth, slippage profile, historical fee, fill stats).

## Sketch — fee semantics (the load-bearing decision)

```
"Fee for placing a $100 order over 24h" can mean three things:

  (a) Average fee for ONE $100 swap at the median price            ← simplest
       over the window. Single trade, varying conditions averaged.

  (b) Cumulative fee for placing a $100 swap EVERY DAY              ← worst noise
       across the window. Sums to 24× by 1mo column. Misleading.

  (c) Effective spread + venue fee combined, calculated AT NOW       ← cheapest
       but contextualised by the window's volatility band.            to compute,
                                                                      least honest.

  Recommend (a): one trade, median-conditions cost, three windows
  show how venue costs DRIFTED over time, not summed.
```

## Open questions

- **Which exchanges in v1?** Top-N CEX by Solana volume (Binance, Coinbase, Bybit, OKX, Kraken)? Solana DEXes (Jupiter as router, Orca direct, Raydium direct, Phoenix)?
- **Which pairs?** SOL/USDC default? User-selectable? Watchlist-pair-aware?
- **DEX fee = pool fee only**, or pool fee + expected slippage at $100 size, or pool fee + slippage + priority fee?
- **CEX fee = taker rate** (assumes market order) or maker rate (assumes limit at top of book)?
- **Data source:**
  - CEX → CoinGecko exchange tickers, CCXT.js, Kaiko API
  - DEX → Jupiter quote API (for routed quotes), DexScreener (raw pool fee), Birdeye
- **Update cadence?** Per-second is wasteful; per-minute is probably fine for a comparison view.
- **What does the "watchlist a venue" interaction look like?** Star icon per row? Drag into a sidebar?

## Out of scope (first pass)

- Routing optimization ("split this order across 3 venues"). That's a separate, much harder feature.
- Order placement from inside the app. Trade Edge is **read-only price discovery**, not a trading terminal.
- Historical CEX fee changes (most don't publish historical tier changes).
- L2/cross-chain venues (Arbitrum, Base) — first pass is Solana-only since the app is Solana-first.

## Prior art / reference

- [DefiLlama Yield/Swap dashboards](https://defillama.com/yields) — comparable side-by-side cost rendering
- Jupiter's quote-route UI — shows DEX comparison for a single swap
- CoinGecko's "Markets" tab on each token page — closest existing analog
