"use client";

import { useMemo } from "react";
import { DexCard } from "@/components/ui/DexCard";
import { useTabPairs } from "@/lib/hooks/useTabPairs";
import { TabEmpty, TabGrid, TabLoading, type TabProps } from "./TabShell";

export function TrendingTab({
  paused,
  onSelectPair,
  starredSet,
  onStarToggle,
}: TabProps) {
  const { data, loading } = useTabPairs(
    "/api/birdeye?type=list_v3&limit=100&offset=0&profile=quality",
    120_000,
    paused
  );

  const tokens = useMemo(
    () =>
      [...data].sort(
        (a, b) =>
          Number(b?.liquidity?.usd ?? 0) - Number(a?.liquidity?.usd ?? 0)
      ),
    [data]
  );

  return (
    <div className="space-y-3">
      <div className="text-xs text-[#6B7280]">
        Showing {tokens.length} quality tokens from Birdeye V3 list
      </div>

      {loading && tokens.length === 0 ? (
        <TabLoading />
      ) : tokens.length === 0 ? (
        <TabEmpty text="No tokens available right now." />
      ) : (
        <TabGrid minCardWidth="300px">
          {tokens.map((pair, i) => (
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
