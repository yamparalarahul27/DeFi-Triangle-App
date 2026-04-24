"use client";

import { useMemo, useState } from "react";
import { DexCard } from "@/components/ui/DexCard";
import { useTabPairs } from "@/lib/hooks/useTabPairs";
import {
  FilterChips,
  TabEmpty,
  TabGrid,
  TabLoading,
  type TabProps,
} from "./TabShell";

type DefiFilter = "all" | "gainers" | "losers";

const OPTIONS: { key: DefiFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "gainers", label: "Gainers" },
  { key: "losers", label: "Losers" },
];

export function DefiTab({
  paused,
  onSelectPair,
  starredSet,
  onStarToggle,
}: TabProps) {
  const [filter, setFilter] = useState<DefiFilter>("all");
  const { data, loading } = useTabPairs(
    "/api/birdeye?type=trending&limit=20",
    25_000,
    paused
  );

  const filtered = useMemo(() => {
    const base = data.filter((p) => Number(p?.liquidity?.usd ?? 0) >= 25_000);
    if (filter === "gainers") {
      return base
        .filter((p) => Number(p?.priceChange?.h24 ?? 0) >= 0)
        .sort((a, b) => Number(b?.priceChange?.h24 ?? 0) - Number(a?.priceChange?.h24 ?? 0));
    }
    if (filter === "losers") {
      return base
        .filter((p) => Number(p?.priceChange?.h24 ?? 0) < 0)
        .sort((a, b) => Number(a?.priceChange?.h24 ?? 0) - Number(b?.priceChange?.h24 ?? 0));
    }
    return base;
  }, [data, filter]);

  return (
    <div className="space-y-3">
      <FilterChips options={OPTIONS} value={filter} onChange={setFilter} />
      {loading && filtered.length === 0 ? (
        <TabLoading />
      ) : filtered.length === 0 ? (
        <TabEmpty />
      ) : (
        <TabGrid>
          {filtered.map((pair, i) => (
            <DexCard
              key={pair?.pairAddress ?? i}
              pair={pair}
              onClick={() => onSelectPair(pair)}
              starred={starredSet.has(pair?.baseToken?.address)}
              onStarToggle={() => onStarToggle(pair)}
            />
          ))}
        </TabGrid>
      )}
    </div>
  );
}
