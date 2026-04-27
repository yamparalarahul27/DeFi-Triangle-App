"use client";

import { TokenIcon } from "@/components/ui/TokenIcon";
import { fmtAge, fmtPct, fmtUsd } from "@/lib/format";
import type {
  AssetCore,
  AssetProfile,
  RiskData,
  Variant,
} from "@/lib/tokens-xyz-types";

export function IdentityStrip({
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
  const price =
    profile?.price ??
    asset.canonicalMarket?.price ??
    asset.stats?.price ??
    primary?.market?.price ??
    0;
  const change =
    profile?.priceChange24h ??
    asset.canonicalMarket?.priceChange24hPercent ??
    asset.stats?.priceChange24hPercent ??
    primary?.market?.priceChange24hPercent ??
    0;
  const up = change >= 0;
  const ath = profile?.allTimeHigh;
  const athDate = profile?.allTimeHighDate;
  const athDeltaPct = ath && price ? ((price - ath) / ath) * 100 : null;
  const grade = risk?.marketScore?.grade;
  const riskLabel = risk?.marketScore?.label;
  const tone = risk?.marketScore?.tone;

  const toneClass =
    tone === "safe"
      ? "text-[#0fa87a] bg-[#e5f7f2] border-[#0fa87a]/30"
      : tone === "caution"
        ? "text-[#b45309] bg-[#fffbeb] border-[#f59e0b]/40"
        : "text-[#b91c1c] bg-[#fef2f2] border-[#ef4444]/40";

  const logoUrl =
    asset.imageUrl || primary?.market?.logoURI || undefined;
  const primaryTier = primary?.trustTier;

  return (
    <section className="bg-white rounded-sm border border-[#cbd5e1] p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <TokenIcon
          src={logoUrl}
          symbol={asset.symbol ?? "SOL"}
          size="lg"
          className="w-14 h-14 sm:w-16 sm:h-16"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-[#11274d]">
              {asset.name ?? "Solana"}
            </h1>
            {primaryTier === "tier1" && (
              <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-sm border text-[#19549b] bg-[#f1f5f9] border-[#19549b]/30">
                ✓ Verified
              </span>
            )}
            {grade && riskLabel && (
              <span
                className={`text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-sm border ${toneClass}`}
              >
                Grade {grade} · {riskLabel}
              </span>
            )}
          </div>
          <div className="text-sm text-[#6a7282] mt-1">
            {asset.symbol ?? "SOL"}
            {primary?.name && primary.symbol !== asset.symbol
              ? ` · Primary variant: ${primary.name}`
              : ""}
          </div>
        </div>
        <div className="sm:text-right">
          <div className="font-mono text-3xl text-[#11274d] leading-none">
            {fmtUsd(price)}
          </div>
          <div
            className={`text-sm flex items-center gap-1 mt-1 ${
              up ? "text-[#0fa87a]" : "text-[#ef4444]"
            } sm:justify-end`}
          >
            <img
              src={up ? "/app/Up.svg" : "/app/Down.svg"}
              alt=""
              aria-hidden="true"
              className="h-3 w-3 shrink-0"
            />
            <span className="font-mono">{fmtPct(Math.abs(change))}</span>
          </div>
          {ath != null && athDeltaPct != null && (
            <div className="text-[11px] text-[#6a7282] mt-2 sm:text-right">
              ATH {fmtUsd(ath)}
              {athDate &&
                ` · ${fmtAge(new Date(athDate).getTime())} ago`}{" "}
              ·{" "}
              <span
                className={
                  athDeltaPct < 0 ? "text-[#ef4444]" : "text-[#0fa87a]"
                }
              >
                {athDeltaPct < 0 ? "down" : "up"}{" "}
                {Math.abs(athDeltaPct).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
