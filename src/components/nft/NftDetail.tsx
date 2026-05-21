"use client";

import type {
  AssetDetailPayload,
  NftAssetSummary,
} from "@/lib/hooks/useNftEdge";

interface Props {
  detail: AssetDetailPayload | null;
  detailLoading: boolean;
  otherOwned: { count: number; assets: NftAssetSummary[] } | null;
}

function truncate(addr?: string | null): string {
  if (!addr) return "—";
  if (addr.length <= 9) return addr;
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

function lamportsToSol(lamports: number | null | undefined): string | null {
  if (lamports == null) return null;
  const sol = lamports / 1e9;
  if (sol >= 1000) return `${sol.toFixed(0)} SOL`;
  if (sol >= 1) return `${sol.toFixed(2)} SOL`;
  return `${sol.toFixed(3)} SOL`;
}

export function NftDetail({ detail, detailLoading, otherOwned }: Props) {
  if (!detail) {
    return (
      <div className="rounded-[14px] border border-[#11274d]/10 bg-white p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="text-sm text-[#6a7282] text-center py-20">
          {detailLoading ? "Loading…" : "Select an NFT below"}
        </div>
      </div>
    );
  }

  const { asset, collection, rarity, live } = detail;
  const royaltyPct =
    collection.royalty_bps != null
      ? `${(collection.royalty_bps / 100).toFixed(2)}%`
      : "—";

  return (
    <div className="rounded-[14px] border border-[#11274d]/10 bg-white p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
      <h1 className="text-center font-mono text-2xl sm:text-3xl font-bold text-[#11274d] mb-6 [text-wrap:balance]">
        {asset.name.toUpperCase()}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT — hero image + about */}
        <div className="flex flex-col gap-4">
          <img
            src={asset.image_url}
            alt={asset.name}
            className="block w-[71.4%] mx-auto aspect-square rounded-[10px] border border-[#11274d]/10 object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.background =
                "linear-gradient(135deg,#fbbf24,#ef4444)";
              (e.currentTarget as HTMLImageElement).style.opacity = "0";
            }}
          />
          {(asset.description || collection.description) && (
            <div className="rounded-[10px] border border-[#11274d]/10 bg-white p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6a7282] mb-2">
                About {collection.name ?? "Collection"}
              </div>
              <p className="text-sm text-[#212121] [text-wrap:pretty]">
                {asset.description || collection.description}
              </p>
            </div>
          )}
        </div>

        {/* RIGHT — info panels */}
        <div className="flex flex-col gap-3">
          {/* Owner */}
          <div className="rounded-[10px] border border-[#11274d]/10 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6a7282]">
                Owner Profile
              </div>
              {otherOwned && otherOwned.count > 1 && (
                <div className="text-[10px] font-semibold text-[#6a7282]">
                  +{otherOwned.count - 1} in collection
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full border-2 border-white shrink-0"
                style={{
                  background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
                }}
              />
              <div className="min-w-0">
                <div className="font-mono text-sm text-[#11274d] truncate">
                  {truncate(asset.owner)}
                </div>
                <div className="text-xs text-[#6a7282]">
                  Solana wallet
                </div>
              </div>
            </div>
          </div>

          {/* Traits */}
          <div className="rounded-[10px] border border-[#11274d]/10 bg-white p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6a7282] mb-3 flex items-center gap-2">
              Traits
              <span className="inline-flex items-center justify-center h-[18px] min-w-[18px] px-1.5 rounded-full bg-[#f1f5f9] text-[10px] text-[#11274d]">
                {asset.attributes.length}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {asset.attributes.map((trait, i) => {
                const value =
                  typeof trait.value === "string" ||
                  typeof trait.value === "number"
                    ? String(trait.value)
                    : "—";
                const rarityRow =
                  trait.trait_type && value !== "—"
                    ? rarity[`${trait.trait_type}::${value}`]
                    : null;
                const pct =
                  rarityRow && collection.total_supply
                    ? ((rarityRow.count / collection.total_supply) * 100).toFixed(0)
                    : null;
                return (
                  <div
                    key={i}
                    className="rounded-[8px] border border-[#11274d]/10 bg-[#f1f5f9] p-2.5"
                  >
                    <div className="text-[9px] font-medium uppercase tracking-[0.08em] text-[#6a7282] mb-1.5">
                      {trait.trait_type ?? "—"}
                    </div>
                    <div className="font-mono text-[13px] text-[#11274d] break-words">
                      {value}
                    </div>
                    {rarityRow && (
                      <div className="flex items-center gap-1.5 mt-2 text-[11px] font-mono text-[#6a7282]">
                        {rarityRow.count}
                        {pct && (
                          <span className="inline-flex items-center h-[18px] px-1.5 rounded-full bg-[#e5f7f2] text-[#0fa87a] text-[10px] font-semibold">
                            {pct}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details */}
          <div className="rounded-[10px] border border-[#11274d]/10 bg-white p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6a7282] mb-3">
              Details
            </div>
            <dl className="space-y-2 text-xs">
              <Row label="Asset ID" value={truncate(asset.id)} mono />
              <Row
                label="On-chain Collection"
                value={truncate(collection.id)}
                mono
              />
              <Row label="Royalties" value={royaltyPct} mono />
              {live.floorPrice != null && (
                <Row
                  label="Collection floor"
                  value={lamportsToSol(live.floorPrice) ?? "—"}
                  mono
                />
              )}
              {live.listStatus && (
                <Row
                  label="Listing status"
                  value={
                    live.listStatus === "listed" && live.listPrice
                      ? `${lamportsToSol(live.listPrice)} (listed)`
                      : live.listStatus
                  }
                  mono
                />
              )}
            </dl>
          </div>

          {/* JSON Metadata */}
          <div className="rounded-[10px] border border-[#11274d]/10 bg-white p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6a7282] mb-3">
              JSON Metadata
            </div>
            {asset.metadata_url ? (
              <a
                href={asset.metadata_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-[#19549b] hover:underline truncate block"
              >
                {asset.metadata_url}
              </a>
            ) : (
              <div className="text-xs text-[#6a7282]">none</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-[#6a7282]">{label}</dt>
      <dd className={`text-[#11274d] ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}
