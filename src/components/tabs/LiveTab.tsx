"use client";

import { DexCard } from "@/components/ui/DexCard";
import { useTabPairs } from "@/lib/hooks/useTabPairs";
import { TabEmpty, TabGrid, TabLoading, type TabProps } from "./TabShell";

export function LiveTab({
  paused,
  onSelectPair,
  starredSet,
  onStarToggle,
}: TabProps) {
  const { data, loading } = useTabPairs(
    "/api/dexscreener?type=live",
    10_000,
    paused
  );

  if (loading && data.length === 0) return <TabLoading />;
  if (!loading && data.length === 0) return <TabEmpty />;

  return (
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
  );
}
