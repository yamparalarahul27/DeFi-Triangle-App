"use client";

import NumberFlow, { type Format } from "@number-flow/react";
import { useMemo } from "react";
import { DexCexSpread } from "@/components/token/DexCexSpread";
import { PriceDivergenceChip } from "@/components/token/PriceDivergenceChip";
import { TokenIcon } from "@/components/ui/TokenIcon";
import { fmtAge, fmtUsd } from "@/lib/format";
import { useTokenPriceTicker } from "@/lib/hooks/useTokenPriceTicker";
import { computeDivergence } from "@/lib/token/priceDivergence";
import type {
  AssetCore,
  AssetProfile,
  RiskData,
  Variant,
} from "@/lib/tokens-xyz-types";

export function IdentityStrip({
  address,
  asset,
  primary,
  profile,
  risk,
  birdeyePrice,
  dasPrice,
}: {
  address: string;
  asset: AssetCore;
  primary: Variant | null;
  profile?: AssetProfile;
  risk?: RiskData;
  birdeyePrice?: number | null;
  dasPrice?: number | null;
}) {
  const ticker = useTokenPriceTicker(address);

  const divergence = useMemo(
    () =>
      computeDivergence([
        { name: "Jupiter (live)", price: ticker.price },
        { name: "Birdeye", price: birdeyePrice ?? null },
        { name: "Tokens.xyz", price: asset.stats?.price ?? null },
        { name: "CoinGecko", price: asset.canonicalMarket?.price ?? null },
        { name: "Helius DAS", price: dasPrice ?? null },
      ]),
    [
      ticker.price,
      birdeyePrice,
      asset.stats?.price,
      asset.canonicalMarket?.price,
      dasPrice,
    ]
  );

  const fallbackPrice =
    profile?.price ??
    asset.canonicalMarket?.price ??
    asset.stats?.price ??
    primary?.market?.price ??
    0;
  const fallbackChange =
    profile?.priceChange24h ??
    asset.canonicalMarket?.priceChange24hPercent ??
    asset.stats?.priceChange24hPercent ??
    primary?.market?.priceChange24hPercent ??
    0;

  const price = ticker.price ?? fallbackPrice;
  const change = ticker.priceChange24h ?? fallbackChange;
  const up = change >= 0;
  const ath = profile?.allTimeHigh;
  const athDate = profile?.allTimeHighDate;
  const athDeltaPct = ath && price ? ((price - ath) / ath) * 100 : null;
  const grade = risk?.marketScore?.grade;
  const riskLabel = risk?.marketScore?.label;
  const tone = risk?.marketScore?.tone;

  const toneClass =
    tone === "safe"
      ? "text-buy bg-buy-surface border-buy/30"
      : tone === "caution"
        ? "text-warning-strong bg-warning-surface border-warning/40"
        : "text-sell-strong bg-sell-surface border-sell/40";

  const logoUrl =
    asset.imageUrl || primary?.market?.logoURI || undefined;
  const primaryTier = primary?.trustTier;

  return (
    <section className="bg-surface-container rounded-sm border border-outline-variant p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <TokenIcon
          src={logoUrl}
          symbol={asset.symbol ?? "SOL"}
          size="lg"
          className="w-14 h-14 sm:w-16 sm:h-16"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-fg">
              {asset.name ?? "Solana"}
            </h1>
            {primaryTier === "tier1" && (
              <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-sm border text-brand bg-surface-page border-brand/30">
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
          <div className="text-sm text-fg-muted mt-1">
            {asset.symbol ?? "SOL"}
            {primary?.name && primary.symbol !== asset.symbol
              ? ` · Primary variant: ${primary.name}`
              : ""}
          </div>
        </div>
        <div className="sm:text-right">
          <div className="font-mono text-3xl text-fg leading-none">
            <NumberFlow value={price} format={priceFormat(price)} prefix="$" />
          </div>
          <div
            className={`text-sm flex items-center gap-1 mt-1 ${
              up ? "text-buy" : "text-sell"
            } sm:justify-end`}
          >
            <img
              src={up ? "/app/Up.svg" : "/app/Down.svg"}
              alt=""
              aria-hidden="true"
              className="h-3 w-3 shrink-0"
            />
            <span className="font-mono">
              <NumberFlow
                value={Math.abs(change)}
                format={PCT_FORMAT}
                suffix="%"
              />
            </span>
          </div>
          {divergence && (
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 sm:justify-end">
              <PriceDivergenceChip result={divergence} />
              <DexCexSpread
                dexPrice={birdeyePrice ?? null}
                cexPrice={asset.canonicalMarket?.price ?? null}
              />
            </div>
          )}
          {ath != null && athDeltaPct != null && (
            <div className="text-[11px] text-fg-muted mt-2 sm:text-right">
              ATH {fmtUsd(ath)}
              {athDate &&
                ` · ${fmtAge(new Date(athDate).getTime())} ago`}{" "}
              ·{" "}
              <span
                className={
                  athDeltaPct < 0 ? "text-sell" : "text-buy"
                }
              >
                {athDeltaPct < 0 ? "down" : "up"}{" "}
                <NumberFlow
                  value={Math.abs(athDeltaPct)}
                  format={ATH_PCT_FORMAT}
                  suffix="%"
                />
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

const PCT_FORMAT: Format = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};

const ATH_PCT_FORMAT: Format = {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
};

function priceFormat(value: number): Format {
  if (value >= 1) return { minimumFractionDigits: 2, maximumFractionDigits: 2 };
  if (value >= 0.01)
    return { minimumFractionDigits: 4, maximumFractionDigits: 4 };
  return { minimumSignificantDigits: 3, maximumSignificantDigits: 3 };
}
