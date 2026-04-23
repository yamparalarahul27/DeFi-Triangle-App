"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { TokenIcon } from "./TokenIcon";
import { RiskBar } from "./RiskBar";
import { PriceChart, type Candle } from "./PriceChart";
import { fmtAge, fmtNum, fmtPct, fmtUsd } from "@/lib/format";
import {
  getRiskBreakdown,
  toRiskInputFromDexScreener,
  type RiskFormula,
  type RiskBreakdown,
} from "@/lib/scoring";

const ohlcvCache = new Map<string, Candle[]>();

const SOCIAL_LABELS: Record<string, string> = {
  twitter: "X",
  x: "X",
  telegram: "Telegram",
  discord: "Discord",
};

export interface TokenModalProps {
  pair: any;
  riskFormula: RiskFormula;
  onClose: () => void;
}

export function TokenModal({
  pair: initialPair,
  riskFormula,
  onClose,
}: TokenModalProps) {
  const [pair, setPair] = useState<any>(initialPair);
  const [candles, setCandles] = useState<Candle[] | null>(null);
  const [loadingChart, setLoadingChart] = useState(true);
  const [copied, setCopied] = useState(false);

  const address: string = pair?.baseToken?.address ?? "";
  const symbol: string = pair?.baseToken?.symbol ?? "???";
  const name: string = pair?.baseToken?.name ?? "";
  const imageUrl: string | undefined = pair?.info?.imageUrl;
  const priceUsd = Number(pair?.priceUsd ?? 0);
  const priceChange24 = Number(pair?.priceChange?.h24 ?? 0);
  const priceUp = priceChange24 >= 0;

  useEffect(() => {
    if (!address) {
      setCandles([]);
      setLoadingChart(false);
      return;
    }
    if (ohlcvCache.has(address)) {
      setCandles(ohlcvCache.get(address) ?? []);
      setLoadingChart(false);
      return;
    }
    let cancelled = false;
    setLoadingChart(true);
    (async () => {
      try {
        const res = await fetch(
          `/api/birdeye?type=ohlcv&address=${encodeURIComponent(address)}`,
          { cache: "no-store" }
        );
        const json = res.ok ? await res.json() : null;
        const data: Candle[] =
          json?.success && Array.isArray(json.data) ? json.data : [];
        if (!cancelled) {
          ohlcvCache.set(address, data);
          setCandles(data);
        }
      } catch {
        if (!cancelled) setCandles([]);
      } finally {
        if (!cancelled) setLoadingChart(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [address]);

  useEffect(() => {
    if (!address) return;
    const hasMeta =
      pair?.liquidity?.usd != null &&
      pair?.volume?.h24 != null &&
      pair?.pairCreatedAt != null;
    if (hasMeta) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/dexscreener?type=token&address=${encodeURIComponent(address)}&riskFormula=${riskFormula}`,
          { cache: "no-store" }
        );
        const json = res.ok ? await res.json() : null;
        const hydrated = json?.data;
        if (!cancelled && hydrated) {
          setPair((prev: any) => ({ ...prev, ...hydrated }));
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, riskFormula]);

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

  const breakdown: RiskBreakdown = useMemo(
    () => getRiskBreakdown(toRiskInputFromDexScreener(pair), riskFormula),
    [pair, riskFormula]
  );

  const passes = useMemo(() => {
    const overheated = breakdown.warnings.some(
      (w) => w === "Overheated turnover" || w === "Sudden volume spike"
    );
    return {
      liquidity: breakdown.buckets.liquidity.score >= 20,
      price: breakdown.buckets.price.score >= 7,
      volume: !overheated,
      marketCap: breakdown.buckets.valuation.score >= 6,
    };
  }, [breakdown]);

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
        className="relative w-full sm:max-w-[480px] max-h-[100vh] sm:max-h-[92vh] overflow-y-auto bg-white sm:rounded-lg sm:m-4"
        style={{ boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-white flex items-center justify-between gap-3 p-4 border-b border-[#e5e7eb]">
          <div className="flex items-center gap-3 min-w-0">
            <TokenIcon src={imageUrl} symbol={symbol} size="lg" />
            <div className="min-w-0">
              <div className="text-base font-semibold text-[#111827] truncate">
                {symbol}
              </div>
              <div className="text-xs text-[#6B7280] truncate">{name}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-2xl text-[#6B7280] hover:text-[#111827] transition-colors leading-none w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        <div className="p-4 space-y-4">
          <section>
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[#6B7280]">
                  Current price
                </div>
                <div className="font-mono text-xl text-[#111827] mt-1">
                  {fmtUsd(priceUsd)}
                </div>
              </div>
              <div
                className={`flex items-center gap-1 text-sm ${
                  priceUp ? "text-[#0fa87a]" : "text-[#ef4444]"
                }`}
              >
                <span>{priceUp ? "▲" : "▼"}</span>
                <span className="font-mono">
                  {fmtPct(Math.abs(priceChange24))}
                </span>
              </div>
            </div>
            <div className="mt-3">
              {loadingChart ? (
                <div className="h-20 flex items-center justify-center text-xs text-[#6B7280]">
                  Loading chart…
                </div>
              ) : !candles || candles.length < 2 ? (
                <div className="h-20 flex items-center justify-center text-xs text-[#6B7280]">
                  No chart data
                </div>
              ) : (
                <PriceChart
                  candles={candles}
                  height={80}
                  showTooltip={false}
                  showAxes={false}
                />
              )}
              <div className="text-center text-[10px] text-[#6B7280] mt-1">
                24h price history · Birdeye
              </div>
            </div>
          </section>

          <section>
            <div className="text-[10px] uppercase tracking-wider text-[#6B7280] mb-2">
              Risk score
            </div>
            <RiskBar score={breakdown.score} label={breakdown.label} />
            <div className="text-xs text-[#6B7280] mt-2">
              {breakdown.summary}
            </div>
          </section>

          <section>
            <div className="text-[10px] uppercase tracking-wider text-[#6B7280] mb-2">
              Risk breakdown
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <CheckRow pass={passes.liquidity} label="Liquidity" />
              <CheckRow pass={passes.price} label="Price action" />
              <CheckRow pass={passes.volume} label="Volume spike" />
              <CheckRow pass={passes.marketCap} label="Market cap" />
            </div>
            {breakdown.warnings.length > 0 && (
              <div className="mt-3 space-y-1">
                {breakdown.warnings.slice(0, 4).map((w, i) => (
                  <div
                    key={i}
                    className="text-[11px] text-[#b45309] bg-[#fffbeb] border border-[#fde68a] rounded-sm px-2 py-1"
                  >
                    {w}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="text-[10px] uppercase tracking-wider text-[#6B7280] mb-2">
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
                value={fmtUsd(
                  Number(pair?.marketCap ?? pair?.fdv ?? 0),
                  { compact: true }
                )}
              />
              <Stat
                label="FDV"
                value={fmtUsd(Number(pair?.fdv ?? 0), { compact: true })}
              />
              <Stat
                label="Created"
                value={`${fmtAge(Number(pair?.pairCreatedAt ?? 0))} ago`}
              />
              <Stat label="DEX" value={pair?.dexId ?? "—"} />
              <Stat
                label="Buys 24h"
                value={fmtNum(Number(pair?.txns?.h24?.buys ?? 0))}
              />
              <Stat
                label="Sells 24h"
                value={fmtNum(Number(pair?.txns?.h24?.sells ?? 0))}
              />
            </div>
          </section>

          {(socials.length > 0 || websites.length > 0) && (
            <section>
              <div className="text-[10px] uppercase tracking-wider text-[#6B7280] mb-2">
                Socials
              </div>
              <div className="flex flex-wrap gap-2">
                {socials.map((s, i) => (
                  <a
                    key={`s-${i}`}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-3 py-1 rounded-sm bg-[#f1f5f9] text-[#11274d] hover:bg-[#e2e8f0] transition-colors"
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
                    className="text-xs px-3 py-1 rounded-sm bg-[#f1f5f9] text-[#11274d] hover:bg-[#e2e8f0] transition-colors"
                  >
                    Website
                  </a>
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="text-[10px] uppercase tracking-wider text-[#6B7280] mb-2">
              Contract address
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 font-mono text-[11px] text-[#111827] break-all bg-[#f1f5f9] p-2 rounded-sm">
                {address || "—"}
              </code>
              <button
                type="button"
                onClick={copyAddress}
                disabled={!address}
                className="text-xs px-3 py-2 rounded-sm bg-[#19549b] text-white hover:bg-[#143f78] transition-colors disabled:opacity-40"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </section>

          {address && (
            <a
              href={`https://birdeye.so/token/${address}?chain=solana`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center text-sm text-white bg-[#19549b] hover:bg-[#143f78] py-3 rounded-sm transition-colors"
            >
              View on Birdeye ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function CheckRow({ pass, label }: { pass: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`text-sm leading-none ${
          pass ? "text-[#0fa87a]" : "text-[#ef4444]"
        }`}
      >
        {pass ? "✓" : "✗"}
      </span>
      <span className="text-[#111827]">{label}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[#6B7280]">{label}</span>
      <span className="font-mono text-[#111827] text-right truncate">
        {value}
      </span>
    </div>
  );
}
