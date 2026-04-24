"use client";

import { useMemo } from "react";
import { TokenIcon } from "@/components/ui/TokenIcon";
import { fmtNum, fmtUsd } from "@/lib/format";
import { useTabPairs } from "@/lib/hooks/useTabPairs";
import { TabEmpty, TabLoading, type TabProps } from "./TabShell";

export function SmartTab({ paused, onSelectPair }: TabProps) {
  const { data, loading } = useTabPairs(
    "/api/birdeye?type=trending&limit=20",
    30_000,
    paused
  );

  const sorted = useMemo(
    () =>
      [...data].sort(
        (a, b) => Number(b?.volume?.h24 ?? 0) - Number(a?.volume?.h24 ?? 0)
      ),
    [data]
  );

  if (loading && sorted.length === 0) return <TabLoading />;
  if (!loading && sorted.length === 0) return <TabEmpty />;

  return (
    <div className="bg-white rounded-sm border border-[#cbd5e1] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[720px]">
          <thead className="bg-[#f1f5f9] text-[#6B7280]">
            <tr>
              <th className="text-left font-medium uppercase tracking-wider px-4 py-3 sticky left-0 bg-[#f1f5f9] z-10">Token</th>
              <th className="text-right font-medium uppercase tracking-wider px-4 py-3">24h Buys</th>
              <th className="text-right font-medium uppercase tracking-wider px-4 py-3">24h Sells</th>
              <th className="text-right font-medium uppercase tracking-wider px-4 py-3">24h Vol</th>
              <th className="text-right font-medium uppercase tracking-wider px-4 py-3">Price</th>
              <th className="text-right font-medium uppercase tracking-wider px-4 py-3">24h Δ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {sorted.map((pair, i) => {
              const base = pair?.baseToken ?? {};
              const info = pair?.info ?? {};
              const change = Number(pair?.priceChange?.h24 ?? 0);
              const up = change >= 0;
              return (
                <tr
                  key={pair?.pairAddress ?? i}
                  onClick={() => onSelectPair(pair)}
                  className="hover:bg-black/[0.02] cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 sticky left-0 bg-white z-10">
                    <div className="flex items-center gap-2 min-w-[200px]">
                      <TokenIcon src={info.imageUrl} symbol={base.symbol} size="sm" />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#11274d] truncate">{base.symbol ?? "???"}</div>
                        <div className="text-[10px] text-[#6a7282] truncate">{base.name ?? ""}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[#0fa87a]">{fmtNum(Number(pair?.txns?.h24?.buys ?? 0))}</td>
                  <td className="px-4 py-3 text-right font-mono text-[#ef4444]">{fmtNum(Number(pair?.txns?.h24?.sells ?? 0))}</td>
                  <td className="px-4 py-3 text-right font-mono text-[#11274d]">{fmtUsd(Number(pair?.volume?.h24 ?? 0), { compact: true })}</td>
                  <td className="px-4 py-3 text-right font-mono text-[#11274d]">{fmtUsd(Number(pair?.priceUsd ?? 0))}</td>
                  <td className={`px-4 py-3 text-right font-mono ${up ? "text-[#0fa87a]" : "text-[#ef4444]"}`}>
                    <span className="inline-flex items-center justify-end gap-1">
                      <img
                        src={up ? "/app/Up.svg" : "/app/Down.svg"}
                        alt=""
                        aria-hidden="true"
                        className="h-3 w-3 shrink-0"
                      />
                      <span>{Math.abs(change).toFixed(2)}%</span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
