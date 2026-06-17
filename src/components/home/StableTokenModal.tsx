"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PegLegend } from "@/components/home/StableCard";
import { TokenIcon } from "@/components/ui/TokenIcon";
import { Tooltip } from "@/components/ui/Tooltip";
import { fmtNum, fmtUsd } from "@/lib/format";
import {
  PEG_THRESHOLDS_BPS,
  STABLECOINS,
  TOKEN_2022_PROGRAM_ID,
  type StableLiveData,
  type StablePendingData,
} from "@/lib/home/stablecoins";
import { STABLECOIN_ISSUERS } from "@/lib/home/stablecoinIssuers";

const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const SOL_MINT = "So11111111111111111111111111111111111111112";

export type StableSelection =
  | { kind: "live"; token: StableLiveData }
  | { kind: "pending"; token: StablePendingData };

export function StableTokenModal({
  selected,
  onClose,
}: {
  selected: StableSelection;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const mint = selected.token.mint;

  // Resolve issuer from the curated list rather than the API payload — issuer
  // is editorial metadata, not on-chain truth.
  const entry = useMemo(
    () => STABLECOINS.find((s) => s.mint === mint) ?? null,
    [mint]
  );
  const issuer = entry?.issuerKey
    ? STABLECOIN_ISSUERS[entry.issuerKey] ?? null
    : null;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const copyMint = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(mint);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore — clipboard may be blocked in iframes
    }
  }, [mint]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${selected.token.symbol} details`}
    >
      <div
        className="relative w-full sm:max-w-[480px] max-h-[100vh] sm:max-h-[92vh] overflow-y-auto bg-surface-container sm:rounded-lg sm:m-4"
        style={{ boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <Header
          selection={selected}
          issuerName={issuer?.name}
          issuerUrl={issuer?.url}
          onClose={onClose}
        />

        <div className="p-4 space-y-4">
          {selected.kind === "live" ? (
            <LiveBody token={selected.token} />
          ) : (
            <PendingBody token={selected.token} pitch={issuer?.pitch} />
          )}

          <MintRow mint={mint} copied={copied} onCopy={copyMint} />

          {selected.kind === "live" ? (
            <SwapCta symbol={selected.token.symbol} mint={mint} />
          ) : issuer ? (
            <ExternalCta label={`Learn more at ${issuer.name}`} href={issuer.url} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Header({
  selection,
  issuerName,
  issuerUrl,
  onClose,
}: {
  selection: StableSelection;
  issuerName?: string;
  issuerUrl?: string;
  onClose: () => void;
}) {
  const { symbol, name } = selection.token;
  const iconUrl = selection.kind === "live" ? selection.token.iconUrl : null;

  return (
    <div className="sticky top-0 z-10 bg-surface-container flex items-center justify-between gap-3 p-4 border-b border-outline-variant">
      <div className="flex items-center gap-3 min-w-0">
        {selection.kind === "live" ? (
          <TokenIcon src={iconUrl ?? undefined} symbol={symbol} size="lg" />
        ) : (
          <div
            aria-label={symbol}
            className="w-8 h-8 rounded-full bg-surface-container text-buy flex items-center justify-center font-semibold text-xs shrink-0"
          >
            {symbol.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <div className="text-base font-semibold text-fg truncate">
            {symbol}
          </div>
          <div className="text-xs text-fg-subtle truncate">{name}</div>
          {issuerName && (
            <div className="text-[11px] text-fg-subtle truncate mt-0.5">
              Issued by{" "}
              {issuerUrl ? (
                <a
                  href={issuerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand hover:underline"
                >
                  {issuerName} ↗
                </a>
              ) : (
                issuerName
              )}
            </div>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="text-2xl text-fg-subtle hover:text-fg transition-colors leading-none w-8 h-8 flex items-center justify-center shrink-0"
      >
        ×
      </button>
    </div>
  );
}

function LiveBody({ token }: { token: StableLiveData }) {
  const { tone, label } = pegState(token.pegDeviationBps);
  const deviationPct = token.pegDeviationBps / 100;
  const isToken2022 = token.tokenProgram === TOKEN_2022_PROGRAM_ID;

  return (
    <>
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-fg-subtle">
              Current price
            </div>
            <div className="font-mono text-xl text-fg mt-1">
              {formatStablePrice(token.priceUsd)}
            </div>
          </div>
          <div className={`text-right ${tone.deviationText}`}>
            <Tooltip content={<PegLegend />} title="Peg health" side="bottom">
              <span
                className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded whitespace-nowrap cursor-help ${tone.badgeBg} ${tone.badgeText}`}
              >
                {label}
              </span>
            </Tooltip>
            <div className="font-mono text-xs mt-1">
              {token.priceUsd > 0
                ? `${deviationPct >= 0 ? "+" : ""}${deviationPct.toFixed(2)}% from peg`
                : "— from peg"}
            </div>
          </div>
        </div>
      </div>

      <Section label="Stats">
        <StatRow label="Liquidity" value={fmtUsd(token.liquidityUsd, { compact: true })} />
        <StatRow label="Volume 24h" value={fmtUsd(token.volume24hUsd, { compact: true })} />
        <StatRow label="Market Cap" value={fmtUsd(token.marketCapUsd, { compact: true })} />
        <StatRow
          label="Circulating"
          value={
            token.circulatingSupply > 0
              ? `${fmtNum(token.circulatingSupply, { compact: true })} ${token.symbol}`
              : "—"
          }
        />
      </Section>

      <Section label="Trust">
        <StatRow
          label="Mint Authority"
          value={authorityLabel(token.mintAuthorityDisabled)}
        />
        <StatRow
          label="Freeze Authority"
          value={authorityLabel(token.freezeAuthorityDisabled)}
        />
        <StatRow
          label="Jupiter Verified"
          value={token.jupiterVerified ? "✓ Yes" : "— No"}
        />
        {isToken2022 && <StatRow label="Standard" value="Token-2022" />}
      </Section>
    </>
  );
}

function PendingBody({
  token,
  pitch,
}: {
  token: StablePendingData;
  pitch?: string[];
}) {
  return (
    <>
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-warning-strong/10 text-warning-strong whitespace-nowrap">
          Coming Soon
        </span>
        <span className="text-xs text-fg-muted">Awaiting Solana liquidity</span>
      </div>

      {pitch && pitch.length > 0 && (
        <Section label={`Why ${token.symbol}`}>
          {pitch.map((line) => (
            <div key={line} className="flex items-center gap-2 text-sm text-fg">
              <span className="text-buy">✓</span>
              <span>{line}</span>
            </div>
          ))}
        </Section>
      )}

      <p className="text-xs text-fg-subtle leading-snug">
        Live price, depth, and audit data will appear here once the mint has
        Jupiter-quotable liquidity on Solana.
      </p>
    </>
  );
}

function MintRow({
  mint,
  copied,
  onCopy,
}: {
  mint: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <Section label="Mint">
      <div className="flex items-center justify-between gap-2">
        <code className="font-mono text-[11px] text-fg break-all">
          {truncateMint(mint)}
        </code>
        <button
          type="button"
          onClick={onCopy}
          className="text-[10px] uppercase tracking-wider px-2 py-1 rounded border border-outline-variant bg-surface-container text-fg hover:bg-surface-page transition-colors shrink-0"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </Section>
  );
}

function SwapCta({ symbol, mint }: { symbol: string; mint: string }) {
  // Deep-link to Jupiter's hosted swap with USDC as the SELL side. For USDC
  // itself there's no useful "USDC → stablecoin" swap, so we route to SOL on
  // the BUY side instead. URL contract is /swap/<sellMint>-<buyMint>.
  const isUsdc = mint === USDC_MINT;
  const buyMint = isUsdc ? SOL_MINT : mint;
  const url = `https://jup.ag/swap/${USDC_MINT}-${buyMint}`;
  const buyLabel = isUsdc ? "SOL" : symbol;
  return (
    <ExternalCta label={`Swap USDC → ${buyLabel} on Jupiter ↗`} href={url} />
  );
}

function ExternalCta({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full text-center py-2.5 rounded bg-brand text-on-brand text-sm font-semibold hover:bg-brand-hover transition-colors"
    >
      {label}
    </a>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-fg-subtle mb-2">
        {label}
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-fg-subtle">{label}</span>
      <span className="font-mono text-fg">{value}</span>
    </div>
  );
}

type PegTone = {
  badgeBg: string;
  badgeText: string;
  deviationText: string;
};

const TONE_ON_PEG: PegTone = {
  badgeBg: "bg-buy/10",
  badgeText: "text-buy",
  deviationText: "text-buy",
};
const TONE_DRIFTING: PegTone = {
  badgeBg: "bg-warning-strong/10",
  badgeText: "text-warning-strong",
  deviationText: "text-warning-strong",
};
const TONE_DEPEGGED: PegTone = {
  badgeBg: "bg-sell/10",
  badgeText: "text-sell",
  deviationText: "text-sell",
};

function pegState(deviationBps: number): { tone: PegTone; label: string } {
  // deviationBps is signed (sign = direction); peg health is about magnitude.
  const magnitude = Math.abs(deviationBps);
  if (magnitude <= PEG_THRESHOLDS_BPS.ON_PEG) {
    return { tone: TONE_ON_PEG, label: "On peg" };
  }
  if (magnitude <= PEG_THRESHOLDS_BPS.DRIFTING) {
    return { tone: TONE_DRIFTING, label: "Drifting" };
  }
  return { tone: TONE_DEPEGGED, label: "Depegged" };
}

function formatStablePrice(price: number): string {
  if (!Number.isFinite(price) || price <= 0) return "—";
  return `$${price.toFixed(4)}`;
}

function authorityLabel(disabled: boolean | null): string {
  if (disabled === true) return "✓ Disabled";
  if (disabled === false) return "✗ Active";
  return "—";
}

function truncateMint(mint: string): string {
  if (mint.length <= 16) return mint;
  return `${mint.slice(0, 8)}…${mint.slice(-6)}`;
}
