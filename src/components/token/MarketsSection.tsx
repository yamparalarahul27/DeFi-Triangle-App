"use client";

import { useMemo } from "react";
import { TokenIcon } from "@/components/ui/TokenIcon";
import { fmtUsd } from "@/lib/format";
import type { MarketVenue } from "@/lib/tokens-xyz-types";

export function MarketsSection({ markets }: { markets: MarketVenue[] }) {
  const sortedMarkets = useMemo(
    () =>
      [...markets].sort(
        (a, b) =>
          (Number.isFinite(b.liquidity) ? b.liquidity : 0) -
          (Number.isFinite(a.liquidity) ? a.liquidity : 0)
      ),
    [markets]
  );
  const count = sortedMarkets.length;

  return (
    <section className="bg-white rounded-sm border border-[#cbd5e1] overflow-hidden">
      <div className="px-4 sm:px-6 pt-4 flex flex-wrap items-baseline justify-between gap-2">
        <div className="text-[10px] uppercase tracking-wider text-[#6a7282]">
          All markets · Tokens.xyz
        </div>
        <div className="text-[10px] text-[#6a7282]">
          {count} {count === 1 ? "pool" : "pools"} · sorted by liquidity
        </div>
      </div>
      <div className="overflow-x-auto mt-3">
        <table className="w-full text-xs min-w-[720px]">
          <thead className="bg-[#f1f5f9] text-[#6B7280]">
            <tr>
              <th className="text-left font-medium uppercase tracking-wider px-4 py-3 sticky left-0 bg-[#f1f5f9] z-10">
                Pool
              </th>
              <th className="text-left font-medium uppercase tracking-wider px-4 py-3">
                Source
              </th>
              <th className="text-right font-medium uppercase tracking-wider px-4 py-3">
                Liquidity
              </th>
              <th className="text-right font-medium uppercase tracking-wider px-4 py-3">
                24h Vol
              </th>
              <th className="text-right font-medium uppercase tracking-wider px-4 py-3">
                Trades 24h
              </th>
              <th className="text-right font-medium uppercase tracking-wider px-4 py-3">
                Wallets 24h
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {sortedMarkets.map((m) => {
              const changePct = Number.isFinite(m.trade24hChangePercent)
                ? m.trade24hChangePercent
                : 0;
              const hasChange = Number.isFinite(m.trade24hChangePercent);
              return (
                <tr
                  key={m.address}
                  className="hover:bg-black/[0.02] transition-colors"
                >
                  <td className="px-4 py-3 sticky left-0 bg-white z-10">
                    <div className="flex items-center gap-2 min-w-[160px]">
                      {m.base.icon && (
                        <TokenIcon
                          src={m.base.icon}
                          symbol={m.base.symbol}
                          size="sm"
                        />
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#11274d] truncate">
                          {m.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#6a7282]">{m.source}</td>
                  <td className="px-4 py-3 text-right font-mono text-[#11274d]">
                    {fmtUsd(m.liquidity, { compact: true })}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[#11274d]">
                    {fmtUsd(m.volume24h, { compact: true })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono text-[#11274d]">
                      {m.trade24h ?? "—"}
                    </span>
                    {hasChange && (
                      <span
                        className={`text-[10px] ml-1 ${
                          changePct >= 0 ? "text-[#0fa87a]" : "text-[#ef4444]"
                        }`}
                      >
                        ({changePct >= 0 ? "+" : ""}
                        {changePct.toFixed(0)}%)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[#11274d]">
                    {m.uniqueWallet24h ?? "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
