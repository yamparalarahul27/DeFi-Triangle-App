"use client";

// Template: the exchange terminal (cids-roadmap Phase 6 / handoff 6b).
// Built ONLY from design-system exports + the OrderBookPanel composable.
// Runs at COMPACT density by default (scoped via data-density on the
// root — the density axis is element-scoped, not global).

import { useEffect, useState } from "react";
import {
  AmountInput,
  Button,
  DataTable,
  PriceChange,
  RollingNumber,
  Select,
  Sparkline,
  StatCell,
  ToastProvider,
  TokenIcon,
  useToast,
  type Column,
} from "@/design-system";
import { OrderBookPanel } from "./OrderBookPanel";

type MarketRow = { sym: string; px: number; ch: number; vol: string; trend: number[] };
const ROWS: MarketRow[] = [
  { sym: "SOL", px: 184.26, ch: 3.6, vol: "$3.18B", trend: [3, 4, 3, 5, 6, 7] },
  { sym: "JUP", px: 0.8123, ch: -1.7, vol: "$142.6M", trend: [5, 4, 4, 3, 3, 2] },
  { sym: "BONK", px: 0.00002314, ch: 6.9, vol: "$318.4M", trend: [2, 2, 3, 4, 4, 6] },
  { sym: "JTO", px: 2.448, ch: -2.1, vol: "$38.2M", trend: [5, 5, 4, 4, 3, 3] },
  { sym: "WIF", px: 1.852, ch: 4.1, vol: "$210.9M", trend: [3, 3, 4, 5, 5, 6] },
];
const COLS: Column<MarketRow>[] = [
  {
    key: "tok",
    header: "Token",
    sortable: true,
    sortValue: (r) => r.sym,
    cell: (r) => (
      <span className="flex items-center gap-2">
        <TokenIcon symbol={r.sym} size="sm" />
        <span className="font-medium">{r.sym}</span>
      </span>
    ),
  },
  { key: "px", header: "Price", align: "right", sortable: true, cell: (r) => `$${r.px}`, sortValue: (r) => r.px },
  { key: "ch", header: "24h", align: "right", sortable: true, cell: (r) => <PriceChange value={r.ch} />, sortValue: (r) => r.ch },
  { key: "vol", header: "Volume", align: "right", cell: (r) => r.vol },
  { key: "tr", header: "7d", align: "right", cell: (r) => <Sparkline data={r.trend} width={56} height={18} /> },
];

function TradeForm() {
  const toast = useToast();
  const [pay, setPay] = useState("1");
  const [recv, setRecv] = useState("184.26");
  const [venue, setVenue] = useState<string | undefined>("jup");
  return (
    <div className="space-y-2 rounded-card border border-outline-variant bg-surface-container p-3">
      <div className="text-[10px] uppercase tracking-wider text-fg-subtle">Trade</div>
      <AmountInput value={pay} onValueChange={setPay} symbol="SOL" onMax={() => setPay("12.4821")} />
      <AmountInput value={recv} onValueChange={setRecv} symbol="USDC" />
      <Select
        aria-label="Route"
        value={venue}
        onValueChange={setVenue}
        options={[
          { value: "jup", label: "Jupiter (best route)" },
          { value: "ray", label: "Raydium" },
          { value: "orca", label: "Orca" },
        ]}
      />
      <Button
        variant="primary"
        className="w-full"
        onClick={() => toast({ title: "Swap submitted", description: `${pay} SOL → USDC`, tone: "buy" })}
      >
        Swap
      </Button>
    </div>
  );
}

function Header() {
  const [px, setPx] = useState(184.26);
  useEffect(() => {
    const id = setInterval(
      () => setPx((v) => +(v + (Math.random() - 0.5) * 0.3).toFixed(2)),
      1500,
    );
    return () => clearInterval(id);
  }, []);
  return (
    <div className="grid grid-cols-2 divide-x divide-outline-variant rounded-card border border-outline-variant bg-surface-container sm:grid-cols-4">
      <StatCell label="SOL / USDC" value={<RollingNumber value={`$${px.toFixed(2)}`} />} change={<PriceChange value={+(px - 184.26).toFixed(2)} suffix="" />} />
      <StatCell label="24h volume" value="$3.18B" change={<PriceChange value={12.4} />} />
      <StatCell label="24h high" value="$187.10" />
      <StatCell label="24h low" value="$179.44" />
    </div>
  );
}

export function Exchange() {
  return (
    <ToastProvider>
      {/* compact density, scoped to the template */}
      <div data-density="compact" className="min-h-dvh bg-surface-page p-4 text-fg">
        <div className="mx-auto max-w-5xl space-y-4">
          <header className="flex items-baseline justify-between">
            <h1 className="font-mono text-sm font-semibold">
              exchange <span className="text-brand">~</span>{" "}
              <span className="font-normal text-fg-subtle">template · compact density · DS components only</span>
            </h1>
            <a href="/design/canvas" className="font-mono text-xs text-fg-muted underline-offset-2 hover:underline">
              canvas
            </a>
          </header>
          <Header />
          <div className="grid gap-4 lg:grid-cols-[1fr_minmax(280px,340px)]">
            <DataTable columns={COLS} rows={ROWS} rowKey={(r) => r.sym} caption="Markets" />
            <div className="space-y-4">
              <OrderBookPanel />
              <TradeForm />
            </div>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}
