"use client";

import { useMemo, useState } from "react";
import { TokenIcon } from "@/components/ui/TokenIcon";
import { fmtAge, fmtUsd } from "@/lib/format";
import { useTabPairs } from "@/lib/hooks/useTabPairs";
import {
  FilterChips,
  TabEmpty,
  TabLoading,
  type TabProps,
} from "./TabShell";

type WhaleFilter = "all" | "gainers" | "losers";

const OPTIONS: { key: WhaleFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "gainers", label: "Gainers" },
  { key: "losers", label: "Losers" },
];

interface WhaleExtra {
  totalVolume?: number;
  totalTxns?: number;
}

export function WhaleTab({ paused, riskFormula, onSelectPair }: TabProps) {
  const [filter, setFilter] = useState<WhaleFilter>("all");
  const url = useMemo(
    () => `/api/dexscreener?type=whale&filter=${filter}&riskFormula=${riskFormula}`,
    [filter, riskFormula]
  );
  const { data, loading, extra } = useTabPairs<WhaleExtra>(url, 15_000, paused);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <FilterChips options={OPTIONS} value={filter} onChange={setFilter} />
        {(extra.totalVolume != null || extra.totalTxns != null) && (
          <div className="flex items-center gap-4 text-[11px] text-[#6a7282]">
            {extra.totalVolume != null && (
              <span>
                Total vol{" "}
                <span className="font-mono text-[#11274d]">
                  {fmtUsd(extra.totalVolume, { compact: true })}
                </span>
              </span>
            )}
            {extra.totalTxns != null && (
              <span>
                Total txns{" "}
                <span className="font-mono text-[#11274d]">
                  {extra.totalTxns.toLocaleString()}
                </span>
              </span>
            )}
          </div>
        )}
      </div>

      {loading && data.length === 0 ? (
        <TabLoading />
      ) : data.length === 0 ? (
        <TabEmpty />
      ) : (
        <div className="bg-white rounded-sm border border-[#cbd5e1] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[760px]">
              <thead className="bg-[#f1f5f9] text-[#6B7280]">
                <tr>
                  <th className="w-10 text-right font-medium px-3 py-3">#</th>
                  <th className="text-left font-medium uppercase tracking-wider px-4 py-3 sticky left-0 bg-[#f1f5f9] z-10">
                    Token
                  </th>
                  <th className="text-right font-medium uppercase tracking-wider px-4 py-3">
                    24h Volume
                  </th>
                  <th className="text-right font-medium uppercase tracking-wider px-4 py-3">
                    24h Δ
                  </th>
                  <th className="text-right font-medium uppercase tracking-wider px-4 py-3">
                    Price
                  </th>
                  <th className="text-right font-medium uppercase tracking-wider px-4 py-3">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {data.map((pair, i) => {
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
                      <td className="px-3 py-3 text-right text-[#6a7282] font-mono">
                        {i + 1}
                      </td>
                      <td className="px-4 py-3 sticky left-0 bg-white z-10">
                        <div className="flex items-center gap-2 min-w-[200px]">
                          <TokenIcon
                            src={info.imageUrl}
                            symbol={base.symbol}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-[#11274d] truncate">
                              {base.symbol ?? "???"}
                            </div>
                            <div className="text-[10px] text-[#6a7282] truncate">
                              {base.name ?? ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-[#11274d]">
                        {fmtUsd(Number(pair?.volume?.h24 ?? 0), {
                          compact: true,
                        })}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-mono ${
                          up ? "text-[#0fa87a]" : "text-[#ef4444]"
                        }`}
                      >
                        {up ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-[#11274d]">
                        {fmtUsd(Number(pair?.priceUsd ?? 0))}
                      </td>
                      <td className="px-4 py-3 text-right text-[#6a7282]">
                        {fmtAge(Number(pair?.pairCreatedAt ?? 0))} ago
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
