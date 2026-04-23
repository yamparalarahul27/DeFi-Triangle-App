"use client";

import { TokenIcon } from "@/components/ui/TokenIcon";
import { fmtUsd } from "@/lib/format";
import type { MarketVenue } from "@/lib/tokens-xyz-types";

export function MarketsSection({ markets }: { markets: MarketVenue[] }) {
  return (
    <section className="bg-white rounded-sm border border-[#cbd5e1] overflow-hidden">
      <div className="px-4 sm:px-6 pt-4 text-[10px] uppercase tracking-wider text-[#6a7282]">
        Top markets
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
            {markets.map((m) => (
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
                    {m.trade24h}
                  </span>
                  <span
                    className={`text-[10px] ml-1 ${
                      m.trade24hChangePercent >= 0
                        ? "text-[#0fa87a]"
                        : "text-[#ef4444]"
                    }`}
                  >
                    ({m.trade24hChangePercent >= 0 ? "+" : ""}
                    {m.trade24hChangePercent.toFixed(0)}%)
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono text-[#11274d]">
                  {m.uniqueWallet24h}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
