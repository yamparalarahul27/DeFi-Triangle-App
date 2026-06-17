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

export function WhaleTab({ paused, onSelectPair }: TabProps) {
  const [filter, setFilter] = useState<WhaleFilter>("all");
  const { data, loading } = useTabPairs(
    "/api/birdeye?type=trending&limit=20",
    15_000,
    paused
  );

  const filtered = useMemo(() => {
    const sorted = [...data].sort(
      (a, b) => Number(b?.volume?.h24 ?? 0) - Number(a?.volume?.h24 ?? 0)
    );
    if (filter === "gainers") return sorted.filter((p) => Number(p?.priceChange?.h24 ?? 0) >= 0);
    if (filter === "losers") return sorted.filter((p) => Number(p?.priceChange?.h24 ?? 0) < 0);
    return sorted;
  }, [data, filter]);

  const totalVolume = filtered.reduce((sum, p) => sum + Number(p?.volume?.h24 ?? 0), 0);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <FilterChips options={OPTIONS} value={filter} onChange={setFilter} />
        <div className="text-[11px] text-fg-muted">
          Total vol {" "}
          <span className="font-mono text-fg">{fmtUsd(totalVolume, { compact: true })}</span>
        </div>
      </div>

      {loading && filtered.length === 0 ? (
        <TabLoading />
      ) : filtered.length === 0 ? (
        <TabEmpty />
      ) : (
        <div className="bg-surface-container rounded-sm border border-outline-variant overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[760px]">
              <thead className="bg-surface-page text-fg-subtle">
                <tr>
                  <th className="w-10 text-right font-medium px-3 py-3">#</th>
                  <th className="text-left font-medium uppercase tracking-wider px-4 py-3 sticky left-0 bg-surface-page z-10">
                    Token
                  </th>
                  <th className="text-right font-medium uppercase tracking-wider px-4 py-3">24h Volume</th>
                  <th className="text-right font-medium uppercase tracking-wider px-4 py-3">24h Δ</th>
                  <th className="text-right font-medium uppercase tracking-wider px-4 py-3">Price</th>
                  <th className="text-right font-medium uppercase tracking-wider px-4 py-3">Last trade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filtered.map((pair, i) => {
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
                      <td className="px-3 py-3 text-right text-fg-muted font-mono">{i + 1}</td>
                      <td className="px-4 py-3 sticky left-0 bg-surface-container z-10">
                        <div className="flex items-center gap-2 min-w-[200px]">
                          <TokenIcon src={info.imageUrl} symbol={base.symbol} size="sm" />
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-fg truncate">{base.symbol ?? "???"}</div>
                            <div className="text-[10px] text-fg-muted truncate">{base.name ?? ""}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-fg">
                        {fmtUsd(Number(pair?.volume?.h24 ?? 0), { compact: true })}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono ${up ? "text-buy" : "text-sell"}`}>
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
                      <td className="px-4 py-3 text-right font-mono text-fg">{fmtUsd(Number(pair?.priceUsd ?? 0))}</td>
                      <td className="px-4 py-3 text-right text-fg-muted">{fmtAge(Number(pair?.pairCreatedAt ?? 0))} ago</td>
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
