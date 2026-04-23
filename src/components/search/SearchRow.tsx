"use client";

import { TokenIcon } from "@/components/ui/TokenIcon";
import { fmtPct, fmtUsd } from "@/lib/format";

export interface SearchRowData {
  address: string;
  symbol: string;
  name: string;
  imageUrl?: string;
  priceUsd?: number;
  priceChange24?: number;
  secondary?: string;
}

interface SearchRowProps {
  row: SearchRowData;
  active: boolean;
  onSelect: () => void;
  onHover?: () => void;
}

export function SearchRow({ row, active, onSelect, onHover }: SearchRowProps) {
  const change = Number(row.priceChange24 ?? 0);
  const up = change >= 0;
  const hasPrice = row.priceUsd != null && Number.isFinite(row.priceUsd);

  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      data-active={active}
      onClick={onSelect}
      onMouseEnter={onHover}
      className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors border-l-2 ${
        active
          ? "bg-[#f1f5f9] border-[#19549b]"
          : "border-transparent hover:bg-[#f8fafc]"
      }`}
    >
      <TokenIcon src={row.imageUrl} symbol={row.symbol} size="md" />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-[#11274d] truncate">
          {row.symbol || "???"}
        </div>
        <div className="text-[10px] text-[#6a7282] truncate">
          {row.name}
          {row.secondary ? ` · ${row.secondary}` : ""}
        </div>
      </div>
      {hasPrice && (
        <div className="text-right shrink-0">
          <div className="font-mono text-xs text-[#11274d]">
            {fmtUsd(row.priceUsd!)}
          </div>
          <div
            className={`font-mono text-[10px] ${
              up ? "text-[#0fa87a]" : "text-[#ef4444]"
            }`}
          >
            {up ? "▲" : "▼"} {fmtPct(Math.abs(change))}
          </div>
        </div>
      )}
    </button>
  );
}
