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

type MemeFilter = "all" | "new" | "hot";

const OPTIONS: { key: MemeFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "new", label: "New (24h)" },
  { key: "hot", label: "Hot (1h)" },
];

export function MemeTab({
  paused,
  onSelectPair,
  starredSet,
  onStarToggle,
}: TabProps) {
  const [filter, setFilter] = useState<MemeFilter>("all");
  const url = useMemo(
    () => `/api/dexscreener?type=meme&filter=${filter}`,
    [filter]
  );
  const { data, loading } = useTabPairs(url, 30_000, paused);

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
