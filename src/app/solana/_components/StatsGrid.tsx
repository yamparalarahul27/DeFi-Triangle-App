"use client";

import { fmtNum, fmtUsd } from "@/lib/format";
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
    primary?.market?.liquidity ?? asset.stats?.liquidity ?? 0;
  const vol7d = risk?.marketScoreInput?.volume7dUsd;
  const marketCap = profile?.marketCap ?? asset.stats?.marketCap;
  const volume24 = profile?.volume24h ?? asset.stats?.volume24hUSD;

  const stats: [string, string][] = [
    ["Market cap", fmtUsd(marketCap, { compact: true })],
    ["24h volume", fmtUsd(volume24, { compact: true })],
    ["FDV", fmtUsd(profile?.fdv, { compact: true })],
    [
      "7d volume",
      vol7d != null ? fmtUsd(vol7d, { compact: true }) : "—",
    ],
    [
      "Circ supply",
      profile?.circulatingSupply
        ? fmtNum(profile.circulatingSupply, { compact: true })
        : "—",
    ],
    [
      "Total supply",
      profile?.totalSupply
        ? fmtNum(profile.totalSupply, { compact: true })
        : "—",
    ],
    ["Primary pair liq.", fmtUsd(primaryLiquidity, { compact: true })],
    [
      "All-time high",
      profile?.allTimeHigh ? fmtUsd(profile.allTimeHigh) : "—",
    ],
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
            <div className="font-mono text-sm text-[#11274d] mt-0.5">
              {value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
