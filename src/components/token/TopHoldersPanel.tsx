"use client";

import { useState } from "react";

export interface HolderRow {
  owner: string;
  amount: string;
  decimals: number;
  uiAmount: number;
}

export function TopHoldersPanel({
  holders,
  circulatingSupply,
  symbol,
}: {
  holders: HolderRow[] | null;
  circulatingSupply: number | null;
  symbol: string | null;
}) {
  if (!holders || holders.length === 0) return null;

  return (
    <section className="bg-surface-container rounded-sm border border-outline-variant p-4 sm:p-6 space-y-3">
      <div className="flex items-baseline justify-between">
        <div className="text-[10px] uppercase tracking-wider text-fg-muted">
          Top holders · Birdeye
        </div>
        <div className="text-[10px] text-fg-muted">
          Top {holders.length}
        </div>
      </div>

      <div className="overflow-hidden">
        <div className="grid grid-cols-[2.5rem_1fr_auto_4rem] sm:grid-cols-[2.5rem_1fr_auto_5rem] gap-2 text-[10px] uppercase tracking-wider text-fg-muted pb-2 border-b border-outline-variant">
          <span>#</span>
          <span>Wallet</span>
          <span className="text-right">Amount</span>
          <span className="text-right">% Supply</span>
        </div>
        <ul className="divide-y divide-outline-variant">
          {holders.map((h, idx) => (
            <HolderItem
              key={`${h.owner}-${idx}`}
              rank={idx + 1}
              row={h}
              circulatingSupply={circulatingSupply}
              symbol={symbol}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}

function HolderItem({
  rank,
  row,
  circulatingSupply,
  symbol,
}: {
  rank: number;
  row: HolderRow;
  circulatingSupply: number | null;
  symbol: string | null;
}) {
  const pct =
    circulatingSupply && circulatingSupply > 0
      ? (row.uiAmount / circulatingSupply) * 100
      : null;

  return (
    <li className="grid grid-cols-[2.5rem_1fr_auto_4rem] sm:grid-cols-[2.5rem_1fr_auto_5rem] gap-2 items-center py-2 text-xs">
      <span className="font-mono text-fg-muted tabular-nums">{rank}</span>
      <CopyAddress address={row.owner} />
      <span className="font-mono text-fg text-right tabular-nums">
        {fmtAmount(row.uiAmount)}
        {symbol ? <span className="text-fg-muted ml-1">{symbol}</span> : null}
      </span>
      <span className="font-mono text-fg text-right tabular-nums">
        {pct == null ? "—" : `${pct.toFixed(pct < 0.01 ? 4 : 2)}%`}
      </span>
    </li>
  );
}

function CopyAddress({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  };

  return (
    <span className="flex items-center gap-2 min-w-0">
      <button
        type="button"
        onClick={onCopy}
        title={address}
        className="font-mono text-fg hover:text-brand transition-colors truncate"
      >
        {truncate(address)}
      </button>
      <a
        href={`https://birdeye.so/solana/wallet-analyzer/${address}?tab=portfolio`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[10px] text-fg-muted hover:text-brand transition-colors shrink-0"
        title="Open in Birdeye"
      >
        ↗
      </a>
      <span className="text-[10px] text-fg-muted shrink-0">
        {copied ? "Copied" : ""}
      </span>
    </span>
  );
}

function truncate(addr: string): string {
  if (addr.length <= 10) return addr;
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

function fmtAmount(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "0";
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
  if (value >= 1) return value.toFixed(2);
  return value.toPrecision(3);
}
