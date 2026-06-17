"use client";

import NumberFlow, { type Format } from "@number-flow/react";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { TokenIcon } from "./TokenIcon";
import { TokenModalChart } from "./TokenModalChart";
import { fmtAge, fmtNum, fmtUsd } from "@/lib/format";
import { useTokenChart } from "@/lib/hooks/useTokenChart";
import { useTokenPriceTicker } from "@/lib/hooks/useTokenPriceTicker";
import { useTokenSecurity } from "@/lib/hooks/useTokenSecurity";

const SOCIAL_LABELS: Record<string, string> = {
  twitter: "X",
  x: "X",
  telegram: "Telegram",
  discord: "Discord",
};

type TokenPair = {
  baseToken?: { address?: string; symbol?: string; name?: string };
  info?: {
    imageUrl?: string;
    socials?: { type: string; url: string }[];
    websites?: { url: string }[];
  };
  priceUsd?: number | string;
  priceChange?: { h24?: number | string };
  liquidity?: { usd?: number | string };
  volume?: { h24?: number | string };
  marketCap?: number | string;
  fdv?: number | string;
  pairCreatedAt?: number | string;
  dexId?: string;
  txns?: { h24?: { buys?: number | string; sells?: number | string } };
  [key: string]: unknown;
};

export interface TokenModalProps {
  pair: TokenPair;
  onClose: () => void;
}

export function TokenModal({ pair: initialPair, onClose }: TokenModalProps) {
  const [pair, setPair] = useState<TokenPair>(initialPair);
  const [copied, setCopied] = useState(false);

  const address: string = pair?.baseToken?.address ?? "";
  const symbol: string = pair?.baseToken?.symbol ?? "???";
  const name: string = pair?.baseToken?.name ?? "";
  const imageUrl: string | undefined = pair?.info?.imageUrl;

  const ticker = useTokenPriceTicker(address);
  const priceUsd = ticker.price ?? Number(pair?.priceUsd ?? 0);
  const priceChange24 =
    ticker.priceChange24h ?? Number(pair?.priceChange?.h24 ?? 0);
  const priceUp = priceChange24 >= 0;
  const trendIconSrc = priceUp ? "/app/Up.svg" : "/app/Down.svg";

  const { candles, loading: loadingChart } = useTokenChart(address);
  const {
    signals: securitySignals,
    loading: loadingSecurity,
    error: securityError,
  } = useTokenSecurity(address);

  useEffect(() => {
    if (!address) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/birdeye?type=token&address=${encodeURIComponent(address)}`,
          { cache: "no-store" }
        );
        const json = res.ok ? await res.json() : null;
        const hydrated = json?.data;
        if (!cancelled && hydrated) {
          setPair((prev) => ({ ...prev, ...(hydrated as TokenPair) }));
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [address]);

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

  const copyAddress = useCallback(async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }, [address]);

  const socials: { type: string; url: string }[] = Array.isArray(
    pair?.info?.socials
  )
    ? pair.info.socials
    : [];
  const websites: { url: string }[] = Array.isArray(pair?.info?.websites)
    ? pair.info.websites
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${symbol} details`}
    >
      <div
        className="relative w-full sm:max-w-[480px] max-h-[100vh] sm:max-h-[92vh] overflow-y-auto bg-surface-container sm:rounded-lg sm:m-4"
        style={{ boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-surface-container flex items-center justify-between gap-3 p-4 border-b border-outline-variant">
          <div className="flex items-center gap-3 min-w-0">
            <TokenIcon src={imageUrl} symbol={symbol} size="lg" />
            <div className="min-w-0">
              <div className="text-base font-semibold text-fg truncate">
                {symbol}
              </div>
              <div className="text-xs text-fg-subtle truncate">{name}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-2xl text-fg-subtle hover:text-fg transition-colors leading-none w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-fg-subtle">
                  Current price
                </div>
                <div className="font-mono text-xl text-fg mt-1">
                  <NumberFlow
                    value={priceUsd}
                    format={modalPriceFormat(priceUsd)}
                    prefix="$"
                  />
                </div>
              </div>
              <div
                className={`flex items-center gap-1 text-sm ${
                  priceUp ? "text-buy" : "text-sell"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={trendIconSrc}
                  alt=""
                  aria-hidden="true"
                  className="h-3 w-3 shrink-0"
                />
                <span className="font-mono">
                  <NumberFlow
                    value={Math.abs(priceChange24)}
                    format={MODAL_PCT_FORMAT}
                    suffix="%"
                  />
                </span>
              </div>
            </div>
            <div className="mt-3">
              {loadingChart ? (
                <div className="h-20 flex items-center justify-center text-xs text-fg-subtle">
                  Loading chart…
                </div>
              ) : !candles || candles.length < 2 ? (
                <div className="h-20 flex items-center justify-center text-xs text-fg-subtle">
                  No chart data
                </div>
              ) : (
                <TokenModalChart candles={candles} height={80} />
              )}
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-fg-subtle mb-2">
              Token data
            </div>
            <div className="grid grid-cols-2 gap-y-1 gap-x-3 text-xs">
              <Stat
                label="Liquidity"
                value={fmtUsd(Number(pair?.liquidity?.usd ?? 0), {
                  compact: true,
                })}
              />
              <Stat
                label="Vol 24h"
                value={fmtUsd(Number(pair?.volume?.h24 ?? 0), {
                  compact: true,
                })}
              />
              <Stat
                label="Mcap"
                value={fmtUsd(Number(pair?.marketCap ?? pair?.fdv ?? 0), {
                  compact: true,
                })}
              />
              <Stat
                label="FDV"
                value={fmtUsd(Number(pair?.fdv ?? 0), { compact: true })}
              />
              <Stat
                label="Last trade"
                value={`${fmtAge(Number(pair?.pairCreatedAt ?? 0))} ago`}
              />
              <Stat label="Source" value={pair?.dexId ?? "birdeye"} />
              <Stat
                label="Buys 24h"
                value={fmtNum(Number(pair?.txns?.h24?.buys ?? 0))}
              />
              <Stat
                label="Sells 24h"
                value={fmtNum(Number(pair?.txns?.h24?.sells ?? 0))}
              />
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-fg-subtle mb-2">
              Security
            </div>
            {loadingSecurity ? (
              <div className="text-xs text-fg-subtle">Loading security…</div>
            ) : securitySignals.length > 0 ? (
              <div className="grid grid-cols-2 gap-y-1 gap-x-3 text-xs">
                {securitySignals.map((item) => (
                  <Stat key={item.label} label={item.label} value={item.value} />
                ))}
              </div>
            ) : (
              <div className="text-xs text-fg-subtle">
                {securityError ?? "Security data unavailable for this token."}
              </div>
            )}
          </div>

          {(socials.length > 0 || websites.length > 0) && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-fg-subtle mb-2">
                Socials
              </div>
              <div className="flex flex-wrap gap-2">
                {socials.map((s, i) => (
                  <a
                    key={`s-${i}`}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-3 py-1 rounded-sm bg-surface-page text-fg hover:bg-surface-container-high transition-colors"
                  >
                    {SOCIAL_LABELS[(s.type ?? "").toLowerCase()] ?? s.type}
                  </a>
                ))}
                {websites.slice(0, 1).map((w, i) => (
                  <a
                    key={`w-${i}`}
                    href={w.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-3 py-1 rounded-sm bg-surface-page text-fg hover:bg-surface-container-high transition-colors"
                  >
                    Website
                  </a>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="text-[10px] uppercase tracking-wider text-fg-subtle mb-2">
              Contract address
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 font-mono text-[11px] text-fg break-all bg-surface-page p-2 rounded-sm">
                {address || "—"}
              </code>
              <button
                type="button"
                onClick={copyAddress}
                disabled={!address}
                className="text-xs px-3 py-2 rounded-sm bg-brand text-on-brand hover:bg-brand-hover transition-colors disabled:opacity-40"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          {address && (
            <Link
              href={`/token/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center text-sm text-on-brand bg-brand hover:bg-brand-hover py-3 rounded-sm transition-colors"
            >
              View token details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-fg-subtle">{label}</span>
      <span className="font-mono text-fg text-right truncate">
        {value}
      </span>
    </div>
  );
}

const MODAL_PCT_FORMAT: Format = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};

function modalPriceFormat(value: number): Format {
  if (value >= 1) return { minimumFractionDigits: 2, maximumFractionDigits: 2 };
  if (value >= 0.01)
    return { minimumFractionDigits: 4, maximumFractionDigits: 4 };
  return { minimumSignificantDigits: 3, maximumSignificantDigits: 3 };
}
