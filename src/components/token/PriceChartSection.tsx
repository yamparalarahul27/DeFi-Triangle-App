"use client";

import { SpiralLoader } from "@/components/agent-elements/spiral-loader";
import type { Candle } from "@/components/ui/PriceChart";
import { CHART_RANGES } from "@/lib/token/utils";
import { RechartsPriceChart } from "@/components/token/RechartsPriceChart";

export function PriceChartSection({
  rangeLabel,
  onRangeChange,
  candles,
  loading,
}: {
  rangeLabel: string;
  onRangeChange: (v: string) => void;
  candles: Candle[];
  loading: boolean;
}) {
  const refetching = loading && candles.length > 0;
  const initialLoading = loading && candles.length === 0;

  return (
    <section className="bg-white rounded-sm border border-[#cbd5e1] p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="text-[10px] uppercase tracking-wider text-[#6a7282]">
          Price chart · Tokens.xyz
        </div>
        <div className="flex items-center gap-2">
          {refetching && <SpiralLoader size={14} />}
          <div className="flex items-center gap-1">
            {CHART_RANGES.map((r) => {
              const active = r.label === rangeLabel;
              return (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => onRangeChange(r.label)}
                  className={`h-7 px-3 rounded-sm text-xs transition-all duration-150 ${
                    active
                      ? "bg-[#19549b] text-white shadow-[0_2px_8px_rgba(25,84,155,0.25)]"
                      : "bg-white text-[#11274d]/60 border border-[#cbd5e1] hover:text-[#11274d]"
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {initialLoading ? (
        <div
          className="flex items-center justify-center gap-2 text-xs text-[#6B7280]"
          style={{ height: 240 }}
        >
          <SpiralLoader size={18} />
          <span>Loading chart…</span>
        </div>
      ) : (
        <RechartsPriceChart
          candles={candles}
          height={240}
          rangeLabel={rangeLabel}
        />
      )}
    </section>
  );
}
