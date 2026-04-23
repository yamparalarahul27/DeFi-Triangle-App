"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DexCard } from "@/components/ui/DexCard";
import { TokenIcon } from "@/components/ui/TokenIcon";
import { fmtNum, fmtUsd } from "@/lib/format";
import { useInterval } from "@/lib/hooks/useInterval";
import type { RiskLabel } from "@/lib/scoring";
import {
  FilterChips,
  TabEmpty,
  TabGrid,
  TabLoading,
  type TabProps,
} from "./TabShell";

type SubTab = "risk" | "discover";
type RiskFilter = "all" | "safe" | "caution" | "danger";
type SortKey = "rank" | "score" | "volume" | "change";
type DiscoverMode = "gainers" | "volume" | "txns" | "newest";
type Period = "m5" | "h1" | "h6" | "h24";

const RISK_OPTIONS: { key: RiskFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "safe", label: "Safe" },
  { key: "caution", label: "Caution" },
  { key: "danger", label: "Danger" },
];

const SUB_TABS: { key: SubTab; label: string }[] = [
  { key: "risk", label: "Risk scored · Birdeye" },
  { key: "discover", label: "Gainers · Volume · Txns · Newest" },
];

const DISCOVER_MODES: { key: DiscoverMode; label: string }[] = [
  { key: "gainers", label: "Gainers" },
  { key: "volume", label: "Volume" },
  { key: "txns", label: "Txns" },
  { key: "newest", label: "Newest" },
];

const PERIODS: { key: Period; label: string }[] = [
  { key: "m5", label: "5m" },
  { key: "h1", label: "1h" },
  { key: "h6", label: "6h" },
  { key: "h24", label: "24h" },
];

const TRENDING_RISK_SEARCH_SEEDS = ["pump", "JUP", "WIF", "RAY", "ORCA", "PYTH"] as const;

export function TrendingTab({
  paused,
  riskFormula,
  onSelectPair,
  starredSet,
  onStarToggle,
}: TabProps) {
  const [sub, setSub] = useState<SubTab>("risk");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1">
        {SUB_TABS.map((t) => {
          const active = t.key === sub;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setSub(t.key)}
              className={`min-h-[36px] px-3 rounded-sm text-xs transition-all duration-150 ${
                active
                  ? "bg-[#19549b] text-white shadow-[0_2px_8px_rgba(25,84,155,0.25)]"
                  : "bg-white text-[#11274d]/60 border border-[#cbd5e1] hover:text-[#11274d]/90"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {sub === "risk" ? (
        <RiskScoredView
          paused={paused}
          riskFormula={riskFormula}
          onSelectPair={onSelectPair}
          starredSet={starredSet}
          onStarToggle={onStarToggle}
        />
      ) : (
        <DiscoverView
          paused={paused}
          riskFormula={riskFormula}
          onSelectPair={onSelectPair}
          starredSet={starredSet}
          onStarToggle={onStarToggle}
        />
      )}
    </div>
  );
}

function RiskScoredView({
  paused,
  riskFormula,
  onSelectPair,
  starredSet,
  onStarToggle,
}: TabProps) {
  const [pairs, setPairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("all");
  const [sort, setSort] = useState<SortKey>("score");

  const fetchData = useCallback(async () => {
    try {
      const requests = [
        fetch(`/api/birdeye?type=trending&riskFormula=${riskFormula}`, {
          cache: "no-store",
        }),
        ...TRENDING_RISK_SEARCH_SEEDS.map((seed) =>
          fetch(
            `/api/dexscreener?type=search&q=${encodeURIComponent(seed)}&limit=20&riskFormula=${riskFormula}`,
            { cache: "no-store" }
          )
        ),
      ];
      const [
        birdeyeRes,
        pumpRes,
        jupRes,
        wifRes,
        rayRes,
        orcaRes,
        pythRes,
      ] = await Promise.all(requests);

      const birdeyeJson = birdeyeRes.ok ? await birdeyeRes.json() : null;
      const tokens: any[] =
        birdeyeJson?.success && Array.isArray(birdeyeJson.data)
          ? birdeyeJson.data
          : [];

      const addresses = tokens
        .map((t) => t?.address)
        .filter((a): a is string => typeof a === "string" && a.length > 0);
      if (addresses.length === 0) {
        setPairs([]);
        return;
      }

      const batchRes = await fetch(
        `/api/dexscreener?type=batch&addresses=${addresses.join(",")}&riskFormula=${riskFormula}`,
        { cache: "no-store" }
      );
      const batchJson = batchRes.ok ? await batchRes.json() : null;
      const byAddr: Record<string, any> =
        batchJson?.success && batchJson.data ? batchJson.data : {};

      const enrichedBirdeye = tokens
        .map((t) => {
          const pair = byAddr[t.address];
          if (!pair) return null;
          return {
            ...pair,
            score: typeof t.score === "number" ? t.score : pair.score,
            label: (t.label ?? pair.label) as RiskLabel | undefined,
            trendingRank: t.rank,
          };
        })
        .filter(Boolean);

      const dexSearchResponses = [pumpRes, jupRes, wifRes, rayRes, orcaRes, pythRes];
      const dexSearchJson = await Promise.all(
        dexSearchResponses.map(async (res) => (res.ok ? res.json() : null))
      );
      const allDexPairs: any[] = dexSearchJson.flatMap((json) =>
        json?.success && Array.isArray(json.data) ? json.data : []
      );

      const bestDexByBase = new Map<string, any>();
      for (const pair of allDexPairs) {
        const baseAddr = pair?.baseToken?.address;
        if (!baseAddr) continue;
        const existing = bestDexByBase.get(baseAddr);
        if (
          !existing ||
          Number(pair?.liquidity?.usd ?? 0) > Number(existing?.liquidity?.usd ?? 0)
        ) {
          bestDexByBase.set(baseAddr, pair);
        }
      }

      const enrichedDex = Array.from(bestDexByBase.values())
        .filter((pair) => Number(pair?.liquidity?.usd ?? 0) > 5_000)
        .sort(
          (a, b) => Number(b?.volume?.h24 ?? 0) - Number(a?.volume?.h24 ?? 0)
        )
        .slice(0, 40)
        .map((pair) => ({
          ...pair,
          trendingRank: null,
        }));

      const merged = [...enrichedBirdeye, ...enrichedDex];
      setPairs(merged);
    } catch {
      // keep last-good
    } finally {
      setLoading(false);
    }
  }, [riskFormula]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  useInterval(fetchData, paused ? null : 60_000);

  const counts = useMemo(() => {
    const c = { safe: 0, caution: 0, danger: 0 };
    for (const p of pairs) {
      const label = p?.label as RiskLabel | undefined;
      if (label === "safe") c.safe++;
      else if (label === "caution") c.caution++;
      else if (label === "danger") c.danger++;
    }
    return c;
  }, [pairs]);

  const filtered = useMemo(() => {
    let arr = [...pairs];
    if (riskFilter !== "all") arr = arr.filter((p) => p?.label === riskFilter);
    switch (sort) {
      case "rank":
        arr.sort(
          (a, b) =>
            (Number(a?.trendingRank) || 999) - (Number(b?.trendingRank) || 999)
        );
        break;
      case "score":
        arr.sort((a, b) => (Number(b?.score) || 0) - (Number(a?.score) || 0));
        break;
      case "volume":
        arr.sort(
          (a, b) =>
            Number(b?.volume?.h24 ?? 0) - Number(a?.volume?.h24 ?? 0)
        );
        break;
      case "change":
        arr.sort(
          (a, b) =>
            Number(b?.priceChange?.h24 ?? 0) -
            Number(a?.priceChange?.h24 ?? 0)
        );
        break;
    }
    return arr;
  }, [pairs, riskFilter, sort]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <StatsCard
          label="Safe"
          value={counts.safe}
          color="text-[#0fa87a] bg-[#e5f7f2]"
        />
        <StatsCard
          label="Caution"
          value={counts.caution}
          color="text-[#b45309] bg-[#fffbeb]"
        />
        <StatsCard
          label="Danger"
          value={counts.danger}
          color="text-[#b91c1c] bg-[#fef2f2]"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <FilterChips
          options={RISK_OPTIONS}
          value={riskFilter}
          onChange={setRiskFilter}
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          aria-label="Sort trending"
          className="h-9 px-2 rounded-sm bg-white border border-[#cbd5e1] text-xs text-[#11274d] focus:outline-none focus:border-[#19549b]"
        >
          <option value="score">Sort: Risk score</option>
          <option value="rank">Sort: Rank</option>
          <option value="volume">Sort: 24h volume</option>
          <option value="change">Sort: 24h change</option>
        </select>
      </div>

      {loading && filtered.length === 0 ? (
        <TabLoading />
      ) : filtered.length === 0 ? (
        <TabEmpty text="No tokens match your filters." />
      ) : (
        <TabGrid minCardWidth="300px">
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

function DiscoverView({
  paused,
  riskFormula,
  onSelectPair,
  starredSet,
  onStarToggle,
}: TabProps) {
  const [mode, setMode] = useState<DiscoverMode>("gainers");
  const [period, setPeriod] = useState<Period>("h24");
  const [pairs, setPairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/dexscreener?type=trending_dex&mode=${mode}&period=${period}&riskFormula=${riskFormula}`,
        { cache: "no-store" }
      );
      const json = res.ok ? await res.json() : null;
      setPairs(
        json?.success && Array.isArray(json.data) ? json.data : []
      );
    } catch {
      // keep last
    } finally {
      setLoading(false);
    }
  }, [mode, period, riskFormula]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  useInterval(fetchData, paused ? null : 60_000);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <FilterChips options={DISCOVER_MODES} value={mode} onChange={setMode} />
        <FilterChips options={PERIODS} value={period} onChange={setPeriod} />
      </div>

      {loading && pairs.length === 0 ? (
        <TabLoading />
      ) : pairs.length === 0 ? (
        <TabEmpty />
      ) : mode === "newest" ? (
        <TabGrid minCardWidth="300px">
          {pairs.map((pair, i) => (
            <DexCard
              key={pair?.pairAddress ?? i}
              pair={pair}
              onClick={() => onSelectPair(pair)}
              starred={starredSet.has(pair?.baseToken?.address)}
              onStarToggle={() => onStarToggle(pair)}
            />
          ))}
        </TabGrid>
      ) : (
        <DiscoverTable
          pairs={pairs}
          mode={mode}
          period={period}
          onSelectPair={onSelectPair}
        />
      )}
    </div>
  );
}

function DiscoverTable({
  pairs,
  mode,
  period,
  onSelectPair,
}: {
  pairs: any[];
  mode: DiscoverMode;
  period: Period;
  onSelectPair: (pair: any) => void;
}) {
  const header =
    mode === "gainers"
      ? `${period.toUpperCase()} Δ`
      : mode === "volume"
        ? `${period.toUpperCase()} Vol`
        : `${period.toUpperCase()} Txns`;

  return (
    <div className="bg-white rounded-sm border border-[#cbd5e1] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[700px]">
          <thead className="bg-[#f1f5f9] text-[#6B7280]">
            <tr>
              <th className="w-10 text-right font-medium px-3 py-3">#</th>
              <th className="text-left font-medium uppercase tracking-wider px-4 py-3 sticky left-0 bg-[#f1f5f9] z-10">
                Token
              </th>
              <th className="text-right font-medium uppercase tracking-wider px-4 py-3">
                Price
              </th>
              <th className="text-right font-medium uppercase tracking-wider px-4 py-3">
                {header}
              </th>
              <th className="text-right font-medium uppercase tracking-wider px-4 py-3">
                Liquidity
              </th>
              <th className="text-right font-medium uppercase tracking-wider px-4 py-3">
                Buy/Sell
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {pairs.map((pair, i) => {
              const base = pair?.baseToken ?? {};
              const info = pair?.info ?? {};
              const change = Number(pair?.priceChange?.[period] ?? 0);
              const vol = Number(pair?.volume?.[period] ?? 0);
              const buys = Number(pair?.txns?.[period]?.buys ?? 0);
              const sells = Number(pair?.txns?.[period]?.sells ?? 0);
              const total = buys + sells;
              const buyPct = total > 0 ? Math.round((buys / total) * 100) : 50;
              const up = change >= 0;

              let valueCell: string;
              if (mode === "gainers")
                valueCell = `${up ? "▲" : "▼"} ${Math.abs(change).toFixed(2)}%`;
              else if (mode === "volume")
                valueCell = fmtUsd(vol, { compact: true });
              else valueCell = fmtNum(total);

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
                    {fmtUsd(Number(pair?.priceUsd ?? 0))}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-mono ${
                      mode === "gainers"
                        ? up
                          ? "text-[#0fa87a]"
                          : "text-[#ef4444]"
                        : "text-[#11274d]"
                    }`}
                  >
                    {valueCell}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[#11274d]">
                    {fmtUsd(Number(pair?.liquidity?.usd ?? 0), {
                      compact: true,
                    })}
                  </td>
                  <td className="px-4 py-3 text-right min-w-[140px]">
                    <div className="relative h-1.5 rounded-full bg-[#ef4444]/15 overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-[#0fa87a]"
                        style={{ width: `${buyPct}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-[#6a7282] mt-1 font-mono">
                      {buyPct}% buys
                    </div>
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

function StatsCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className={`rounded-sm px-3 py-2 flex items-baseline justify-between ${color}`}
    >
      <span className="text-[10px] uppercase tracking-wider font-semibold">
        {label}
      </span>
      <span className="font-mono text-lg">{value}</span>
    </div>
  );
}
