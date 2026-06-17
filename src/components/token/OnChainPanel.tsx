"use client";

import { useState } from "react";

export interface OnChainAccountInfo {
  mintAuthority: string | null;
  freezeAuthority: string | null;
}

export interface OnChainAsset {
  mutable: boolean;
  burnt: boolean;
  royalty: { percent: number; target: string | null } | null;
}

export interface OnChainData {
  accountInfo: OnChainAccountInfo | null;
  asset: OnChainAsset | null;
  /** Price reported by Helius DAS getAsset.token_info.price_info.price_per_token.
   * Not rendered in this panel — exposed for the price-divergence flag (D2). */
  dasPrice: number | null;
}

export function OnChainPanel({ data }: { data: OnChainData | null }) {
  if (!data || (!data.accountInfo && !data.asset)) return null;

  const { accountInfo, asset } = data;
  const showBurnt = asset?.burnt === true;
  const royalty = asset?.royalty && asset.royalty.percent > 0 ? asset.royalty : null;

  return (
    <section className="bg-surface-container rounded-sm border border-outline-variant p-4 sm:p-6 space-y-3">
      <div className="text-[10px] uppercase tracking-wider text-fg-muted">
        On-chain · Helius
      </div>

      <dl className="space-y-2 text-xs">
        {accountInfo && (
          <>
            <AuthorityRow label="Mint authority" value={accountInfo.mintAuthority} />
            <AuthorityRow label="Freeze authority" value={accountInfo.freezeAuthority} />
          </>
        )}
        {asset && (
          <BoolRow
            label="Mutable"
            value={asset.mutable}
            valueLabel={asset.mutable ? "Yes" : "No"}
            tone={asset.mutable ? "warn" : "safe"}
          />
        )}
        {showBurnt && (
          <BoolRow label="Burnt" value={true} valueLabel="Yes" tone="warn" />
        )}
        {royalty && (
          <div className="flex items-baseline gap-3">
            <dt className="text-fg-muted w-44 shrink-0">Royalty</dt>
            <dd className="font-mono text-fg flex-1 break-all">
              {royalty.percent}%
              {royalty.target ? (
                <span className="text-fg-muted"> → {truncate(royalty.target)}</span>
              ) : null}
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}

function AuthorityRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-baseline gap-3">
      <dt className="text-fg-muted w-44 shrink-0">{label}</dt>
      <dd className="flex-1 min-w-0">
        {value === null ? (
          <Badge tone="safe">Renounced ✓</Badge>
        ) : (
          <CopyAddress address={value} />
        )}
      </dd>
    </div>
  );
}

function BoolRow({
  label,
  valueLabel,
  tone,
}: {
  label: string;
  value: boolean;
  valueLabel: string;
  tone: "safe" | "warn";
}) {
  return (
    <div className="flex items-baseline gap-3">
      <dt className="text-fg-muted w-44 shrink-0">{label}</dt>
      <dd className="flex-1">
        <Badge tone={tone}>{valueLabel}</Badge>
      </dd>
    </div>
  );
}

function Badge({
  tone,
  children,
}: {
  tone: "safe" | "warn";
  children: React.ReactNode;
}) {
  const cls =
    tone === "safe"
      ? "bg-buy-surface text-buy border-buy"
      : "bg-warning-surface text-warning-strong border-warning";
  return (
    <span
      className={`inline-flex items-center text-[11px] px-2 py-0.5 rounded-sm border ${cls}`}
    >
      {children}
    </span>
  );
}

function CopyAddress({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      title={address}
      className="font-mono text-fg hover:text-brand transition-colors"
    >
      {truncate(address)}
      <span className="ml-2 text-[10px] text-fg-muted">
        {copied ? "Copied" : "Copy"}
      </span>
    </button>
  );
}

function truncate(addr: string): string {
  if (addr.length <= 10) return addr;
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}
