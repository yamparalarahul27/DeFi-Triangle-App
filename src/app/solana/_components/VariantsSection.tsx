"use client";

import { useState } from "react";
import { TokenIcon } from "@/components/ui/TokenIcon";
import { fmtUsd } from "@/lib/format";
import type { Variant, VariantKind } from "@/lib/tokens-xyz-types";
import { KIND_LABELS, type VariantsByKind } from "../_utils";

export function VariantsSection({
  variants,
}: {
  variants?: VariantsByKind | null;
}) {
  if (!variants || typeof variants !== "object") return null;
  const entries = (
    Object.entries(variants) as [VariantKind, Variant[] | undefined][]
  ).filter(([, list]) => Array.isArray(list) && list.length > 0);

  const [activeKind, setActiveKind] = useState<VariantKind | "">(
    entries[0]?.[0] ?? ""
  );

  if (entries.length === 0) return null;

  const activeList = activeKind
    ? ((variants[activeKind] ?? []) as Variant[])
    : [];

  return (
    <section className="bg-white rounded-sm border border-[#cbd5e1] p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="text-[10px] uppercase tracking-wider text-[#6a7282]">
          Variants
        </div>
        <div className="flex flex-wrap gap-1">
          {entries.map(([kind, list]) => {
            const active = kind === activeKind;
            const label = KIND_LABELS[kind] ?? kind;
            return (
              <button
                key={kind}
                type="button"
                onClick={() => setActiveKind(kind)}
                className={`h-7 px-3 rounded-sm text-xs transition-all duration-150 ${
                  active
                    ? "bg-[#19549b] text-white shadow-[0_2px_8px_rgba(25,84,155,0.25)]"
                    : "bg-white text-[#11274d]/60 border border-[#cbd5e1] hover:text-[#11274d]"
                }`}
              >
                {label} ({list!.length})
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns:
            "repeat(auto-fill, minmax(min(100%, 200px), 1fr))",
        }}
      >
        {activeList.map((v) => (
          <VariantCard key={v.variantId} variant={v} />
        ))}
      </div>
    </section>
  );
}

function VariantCard({ variant }: { variant: Variant }) {
  const change = variant.market.priceChange24hPercent;
  const up = change >= 0;
  const tier =
    variant.trustTier === "tier1"
      ? "bg-[#e5f7f2] text-[#0fa87a] border-[#0fa87a]/30"
      : variant.trustTier === "tier2"
        ? "bg-[#fffbeb] text-[#b45309] border-[#f59e0b]/30"
        : "bg-[#f1f5f9] text-[#6a7282] border-[#cbd5e1]";

  return (
    <div className="bg-white border border-[#11274d]/10 rounded-sm p-3 hover:border-[#11274d]/20 transition-colors">
      <div className="flex items-start gap-2 mb-2">
        <TokenIcon
          src={variant.market.logoURI}
          symbol={variant.symbol}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-[#11274d] truncate">
            {variant.symbol}
          </div>
          <div className="text-[10px] text-[#6a7282] truncate">
            {variant.name}
          </div>
        </div>
        <span
          className={`text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-sm border ${tier}`}
        >
          {variant.trustTier.replace("tier", "T")}
        </span>
      </div>
      <div className="font-mono text-xs text-[#11274d]">
        {fmtUsd(variant.market.price)}
      </div>
      <div
        className={`font-mono text-[10px] ${
          up ? "text-[#0fa87a]" : "text-[#ef4444]"
        }`}
      >
        {up ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
      </div>
    </div>
  );
}
