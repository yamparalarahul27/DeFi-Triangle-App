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
  { key: "new", label: "Low mcap" },
  { key: "hot", label: "Hot volume" },
];

export function MemeTab({
  paused,
  onSelectPair,
  starredSet,
  onStarToggle,
}: TabProps) {
  const [filter, setFilter] = useState<MemeFilter>("all");
  const { data, loading } = useTabPairs(
    "/api/birdeye?type=trending&limit=20",
    30_000,
    paused
  );

  const filtered = useMemo(() => {
    let arr = [...data];
    if (filter === "new") {
      arr = arr
        .filter((p) => Number(p?.marketCap ?? p?.fdv ?? 0) > 0)
        .sort((a, b) => Number(a?.marketCap ?? a?.fdv ?? 0) - Number(b?.marketCap ?? b?.fdv ?? 0));
    } else if (filter === "hot") {
      arr = arr.sort((a, b) => Number(b?.volume?.h24 ?? 0) - Number(a?.volume?.h24 ?? 0));
    }
    return arr;
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
