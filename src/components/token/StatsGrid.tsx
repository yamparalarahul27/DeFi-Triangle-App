"use client";

import NumberFlow from "@number-flow/react";
import { COMPACT_NUM, COMPACT_USD, USD } from "@/lib/numberFormats";
import type {
  AssetCore,
  AssetProfile,
  RiskData,
  Variant,
} from "@/lib/tokens-xyz-types";

export function StatsGrid({
  asset,
  primary,
  profile,
  risk,
}: {
  asset: AssetCore;
  primary: Variant | null;
  profile?: AssetProfile;
  risk?: RiskData;
}) {
  const primaryLiquidity =
    primary?.market?.liquidity ?? asset.stats?.liquidity ?? null;
  const vol7d = risk?.marketScoreInput?.volume7dUsd ?? null;
  const marketCap = profile?.marketCap ?? asset.stats?.marketCap ?? null;
  const volume24 = profile?.volume24h ?? asset.stats?.volume24hUSD ?? null;
  const fdv = profile?.fdv ?? null;
  const circ = profile?.circulatingSupply ?? null;
  const total = profile?.totalSupply ?? null;
  const ath = profile?.allTimeHigh ?? null;

  const stats: [string, React.ReactNode][] = [
    ["Market cap", money(marketCap, COMPACT_USD)],
    ["24h volume", money(volume24, COMPACT_USD)],
    ["FDV", money(fdv, COMPACT_USD)],
    ["7d volume", money(vol7d, COMPACT_USD)],
    ["Circ supply", count(circ)],
    ["Total supply", count(total)],
    ["Primary pair liq.", money(primaryLiquidity, COMPACT_USD)],
    ["All-time high", money(ath, USD)],
  ];

  return (
    <section className="bg-white rounded-sm border border-[#cbd5e1] p-4 sm:p-6">
      <div className="text-[10px] uppercase tracking-wider text-[#6a7282] mb-3">
        Stats
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-6 text-xs">
        {stats.map(([label, value]) => (
          <div key={label}>
            <div className="text-[10px] uppercase tracking-wider text-[#6a7282]">
              {label}
            </div>
            <div className="font-mono text-sm text-[#11274d] mt-0.5 tabular-nums">
              {value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function money(
  value: number | null | undefined,
  format: typeof COMPACT_USD
): React.ReactNode {
  if (value == null || !Number.isFinite(value) || value <= 0) return "—";
  return <NumberFlow value={value} format={format} />;
}

function count(value: number | null | undefined): React.ReactNode {
  if (value == null || !Number.isFinite(value) || value <= 0) return "—";
  return <NumberFlow value={value} format={COMPACT_NUM} />;
}
