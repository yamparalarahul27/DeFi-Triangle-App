"use client";

import { useState } from "react";
import { Tooltip } from "@/components/ui/Tooltip";
import { fmtAge } from "@/lib/format";

export type JupiterWindowKey = "5m" | "1h" | "6h" | "24h";

export interface JupiterWindowMetrics {
  numBuys?: number;
  numSells?: number;
  buyVolumeUsd?: number;
  sellVolumeUsd?: number;
  numNetBuyers?: number;
  numOrganicBuyers?: number;
  buyOrganicVolumeUsd?: number;
  sellOrganicVolumeUsd?: number;
  priceChangePct?: number;
}

export type JupiterWindowsByKey = Partial<
  Record<JupiterWindowKey, JupiterWindowMetrics>
>;

export interface JupiterTokenInfo {
  address: string;
  name: string | null;
  symbol: string | null;
  icon: string | null;
  decimals: number | null;
  tokenProgram: string | null;
  organicScore: number | null;
  organicScoreLabel: string | null;
  isVerified: boolean;
  tags: string[];
  firstPool: { createdAt: string | null } | null;
  audit: {
    mintAuthorityDisabled: boolean | null;
    freezeAuthorityDisabled: boolean | null;
  } | null;
  windows: JupiterWindowsByKey | null;
}

export interface MetaStripData {
  jupiter: JupiterTokenInfo | null;
  numberMarkets: number | null;
}

const ORGANIC_SCORE_TOOLTIP =
  "Jupiter's 0–100 estimate of how much trading volume is real-human (vs. bots or wash trading). Higher is healthier.";
const TAGS_TOOLTIP =
  "Categorical labels assigned by Jupiter: verified, lst, community, meme, stablecoin, bridged, wrapped, etc.";

export function MetaStrip({ data }: { data: MetaStripData | null }) {
  if (!data) return null;
  const { jupiter, numberMarkets } = data;

  const tokenProgram = jupiter?.tokenProgram ?? null;
  const organicScore = jupiter?.organicScore ?? null;
  const organicLabel = jupiter?.organicScoreLabel ?? null;
  const isVerified = jupiter?.isVerified === true;
  const tags = jupiter?.tags ?? [];
  const firstPoolMs = parseDateMs(jupiter?.firstPool?.createdAt);

  const cells: { key: string; node: React.ReactNode }[] = [];

  if (tokenProgram) {
    cells.push({
      key: "program",
      node: (
        <Cell label="Token program">
          <CopyAddress address={tokenProgram} />
        </Cell>
      ),
    });
  }

  if (organicScore != null) {
    cells.push({
      key: "organic",
      node: (
        <Cell label="Organic score" labelTooltip={ORGANIC_SCORE_TOOLTIP}>
          <ScoreBadge score={organicScore} label={organicLabel} />
        </Cell>
      ),
    });
  }

  if (isVerified) {
    cells.push({
      key: "verified",
      node: (
        <Cell label="Status">
          <Badge tone="info">✓ Verified</Badge>
        </Cell>
      ),
    });
  }

  if (tags.length > 0) {
    cells.push({
      key: "tags",
      node: (
        <Cell label="Tags" labelTooltip={TAGS_TOOLTIP}>
          <TagPills tags={tags} />
        </Cell>
      ),
    });
  }

  if (firstPoolMs != null) {
    cells.push({
      key: "listed",
      node: (
        <Cell label="Listed">
          <span className="text-[#11274d]">{fmtAge(firstPoolMs)} ago</span>
        </Cell>
      ),
    });
  }

  if (numberMarkets != null && numberMarkets > 0) {
    cells.push({
      key: "markets",
      node: (
        <Cell label="Markets">
          <span className="font-mono text-[#11274d]">
            {numberMarkets.toLocaleString()}
          </span>
        </Cell>
      ),
    });
  }

  if (cells.length === 0) return null;

  return (
    <section className="bg-white rounded-sm border border-[#cbd5e1] p-4 sm:p-6">
      <div className="text-[10px] uppercase tracking-wider text-[#6a7282] mb-3">
        Token meta · Jupiter + Birdeye
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs">
        {cells.map((c) => (
          <div key={c.key}>{c.node}</div>
        ))}
      </div>
    </section>
  );
}

function Cell({
  label,
  labelTooltip,
  children,
}: {
  label: string;
  labelTooltip?: string;
  children: React.ReactNode;
}) {
  const labelEl = (
    <div
      className={`text-[10px] uppercase tracking-wider mb-1 ${
        labelTooltip
          ? "text-[#6a7282] inline-flex items-center gap-1 cursor-help"
          : "text-[#6a7282]"
      }`}
    >
      {label}
      {labelTooltip ? (
        <span
          aria-hidden
          className="inline-flex items-center justify-center w-3 h-3 text-[9px] rounded-full bg-[#cbd5e1] text-[#6a7282]"
        >
          ?
        </span>
      ) : null}
    </div>
  );

  return (
    <div className="min-w-0">
      {labelTooltip ? (
        <Tooltip content={labelTooltip} title={label}>{labelEl}</Tooltip>
      ) : (
        labelEl
      )}
      <div>{children}</div>
    </div>
  );
}

function ScoreBadge({
  score,
  label,
}: {
  score: number;
  label: string | null;
}) {
  const normalized = (label ?? "").toLowerCase();
  const tone: BadgeTone =
    normalized === "high" ? "safe" : normalized === "low" ? "danger" : "warn";
  return (
    <Badge tone={tone}>
      <span className="font-mono">{Math.round(score)}</span>
      {label ? <span className="ml-1 text-[10px]">· {label}</span> : null}
    </Badge>
  );
}

function TagPills({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center px-1.5 py-0.5 rounded-sm bg-[#f1f5f9] text-[10px] text-[#11274d] border border-[#cbd5e1]"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

type BadgeTone = "safe" | "warn" | "danger" | "info";

function Badge({
  tone,
  children,
}: {
  tone: BadgeTone;
  children: React.ReactNode;
}) {
  const cls =
    tone === "safe"
      ? "bg-[#ecfdf5] text-[#0fa87a] border-[#a7f3d0]"
      : tone === "warn"
        ? "bg-[#fffbeb] text-[#b45309] border-[#fde68a]"
        : tone === "danger"
          ? "bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]"
          : "bg-[#f1f5f9] text-[#19549b] border-[#19549b]/30";
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
      className="font-mono text-[#11274d] hover:text-[#19549b] transition-colors"
    >
      {truncate(address)}
      <span className="ml-2 text-[10px] text-[#6a7282]">
        {copied ? "Copied" : "Copy"}
      </span>
    </button>
  );
}

function truncate(addr: string): string {
  if (addr.length <= 10) return addr;
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

function parseDateMs(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : null;
}
