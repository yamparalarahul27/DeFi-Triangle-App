"use client";

// Order book — lifted from the Phase-5 canvas demo into a composable
// panel (used by the exchange template AND the canvas Data zone).
// Rows are fixed to the density tokens with tabular numerals: ticks
// change text and depth-bar widths only — zero layout shift.

import { useEffect, useState } from "react";

type BookRow = { px: number; qty: number };

const mkSide = (base: number, dir: 1 | -1): BookRow[] =>
  Array.from({ length: 7 }, (_, i) => ({
    px: +(base + dir * (i + 1) * 0.02).toFixed(2),
    qty: Math.round(40 + Math.random() * 400),
  }));

function BookSide({
  rows,
  tone,
  maxQty,
}: {
  rows: BookRow[];
  tone: "buy" | "sell";
  maxQty: number;
}) {
  return (
    <div className="min-w-0 flex-1">
      {rows.map((r) => (
        <div
          key={r.px}
          className="relative flex items-center justify-between overflow-hidden"
          style={{ height: "var(--row-h)", padding: "0 var(--cell-px)" }}
        >
          <span
            aria-hidden="true"
            className={
              tone === "buy"
                ? "absolute inset-y-1 right-0 bg-buy-surface"
                : "absolute inset-y-1 right-0 bg-sell-surface"
            }
            style={{ width: `${(r.qty / maxQty) * 100}%` }}
          />
          <span
            className={`data-sm relative tabular-nums ${tone === "buy" ? "text-buy" : "text-sell"}`}
          >
            {r.px.toFixed(2)}
          </span>
          <span className="data-sm relative tabular-nums text-fg-muted">{r.qty}</span>
        </div>
      ))}
    </div>
  );
}

export function OrderBookPanel({ base = 184.2 }: { base?: number }) {
  const [bids, setBids] = useState(() => mkSide(base, -1));
  const [asks, setAsks] = useState(() => mkSide(base, 1));
  useEffect(() => {
    const tick = (rows: BookRow[]) =>
      rows.map((r) => ({
        ...r,
        qty: Math.max(20, Math.round(r.qty + (Math.random() - 0.5) * 60)),
      }));
    const id = setInterval(() => {
      setBids(tick);
      setAsks(tick);
    }, 900);
    return () => clearInterval(id);
  }, []);
  const maxQty = Math.max(...bids.map((r) => r.qty), ...asks.map((r) => r.qty));
  const spread = +(asks[0].px - bids[0].px).toFixed(2);

  return (
    <div className="rounded-card border border-outline-variant bg-surface-container">
      <div
        className="flex items-center justify-between border-b border-outline-variant text-[10px] uppercase tracking-wider text-fg-subtle"
        style={{ height: "var(--row-h)", padding: "0 var(--cell-px)" }}
      >
        <span>Bids</span>
        <span className="data-sm normal-case tabular-nums text-fg-muted">
          spread {spread.toFixed(2)}
        </span>
        <span>Asks</span>
      </div>
      <div className="flex divide-x divide-outline-variant">
        <BookSide rows={bids} tone="buy" maxQty={maxQty} />
        <BookSide rows={asks} tone="sell" maxQty={maxQty} />
      </div>
    </div>
  );
}
