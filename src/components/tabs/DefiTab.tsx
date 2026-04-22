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
  const url = useMemo(
    () => `/api/dexscreener?type=defi&filter=${filter}`,
    [filter]
  );
  const { data, loading } = useTabPairs(url, 25_000, paused);

  return (
    <div className="space-y-3">
      <FilterChips options={OPTIONS} value={filter} onChange={setFilter} />
      {loading && data.length === 0 ? (
        <TabLoading />
      ) : data.length === 0 ? (
        <TabEmpty />
      ) : (
        <TabGrid>
          {data.map((pair, i) => (
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
