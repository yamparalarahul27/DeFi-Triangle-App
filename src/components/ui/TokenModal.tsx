"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import { Area, AreaChart, ReferenceDot, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { TokenIcon } from "./TokenIcon";
import type { Candle } from "./PriceChart";
import { fmtAge, fmtNum, fmtPct, fmtUsd, truncateAddr } from "@/lib/format";

type ChartSource =
  | "Birdeye"
  | "Tokens.xyz"
  | "Jupiter (derived)"
  | "Birdeye + Tokens.xyz + Jupiter";
type ChartFetchResult = { candles: Candle[]; source: ChartSource };

const ohlcvCache = new Map<string, ChartFetchResult>();
const securityCache = new Map<
  string,
  { data: Record<string, unknown> | null; error: string | null }
>();

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
  const [candles, setCandles] = useState<Candle[] | null>(null);
  const [loadingChart, setLoadingChart] = useState(true);
  const [security, setSecurity] = useState<Record<string, unknown> | null>(null);
  const [loadingSecurity, setLoadingSecurity] = useState(true);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const address: string = pair?.baseToken?.address ?? "";
  const symbol: string = pair?.baseToken?.symbol ?? "???";
  const name: string = pair?.baseToken?.name ?? "";
  const imageUrl: string | undefined = pair?.info?.imageUrl;
  const priceUsd = Number(pair?.priceUsd ?? 0);
  const priceChange24 = Number(pair?.priceChange?.h24 ?? 0);
  const priceUp = priceChange24 >= 0;
  const trendIconSrc = priceUp ? "/app/Up.svg" : "/app/Down.svg";

  useEffect(() => {
    if (!address) {
      return;
    }

    let cancelled = false;
    if (ohlcvCache.has(address)) {
      const cached = ohlcvCache.get(address) ?? {
        candles: [],
        source: "Birdeye + Tokens.xyz + Jupiter",
      };
      queueMicrotask(() => {
        if (!cancelled) {
          setCandles(cached.candles);
          setLoadingChart(false);
        }
      });
      return () => {
        cancelled = true;
      };
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingChart(true);
    (async () => {
      try {
        const result = await fetchChartWithFallback(address);
        if (!cancelled) {
          ohlcvCache.set(address, result);
          setCandles(result.candles);
        }
      } catch {
        if (!cancelled) {
          setCandles([]);
        }
      } finally {
        if (!cancelled) setLoadingChart(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [address]);

  useEffect(() => {
    if (!address) {
      return;
    }

    let cancelled = false;
    const cached = securityCache.get(address);
    if (cached) {
      queueMicrotask(() => {
        if (!cancelled) {
          setSecurity(cached.data);
          setSecurityError(cached.error);
          setLoadingSecurity(false);
        }
      });
      return () => {
        cancelled = true;
      };
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingSecurity(true);
    (async () => {
      try {
        const res = await fetch(
          `/api/birdeye?type=security&address=${encodeURIComponent(address)}`,
          { cache: "no-store" }
        );
        const json = res.ok ? await res.json() : null;

        const data =
          json?.success && json?.data && typeof json.data === "object"
            ? (json.data as Record<string, unknown>)
            : null;

        const error =
          data === null
            ? normalizeSecurityError(
                typeof json?.error === "string" ? json.error : null
              )
            : null;

        securityCache.set(address, { data, error });
        if (!cancelled) {
          setSecurity(data);
          setSecurityError(error);
        }
      } catch {
        const error = "Security data unavailable right now.";
        securityCache.set(address, { data: null, error });
        if (!cancelled) {
          setSecurity(null);
          setSecurityError(error);
        }
      } finally {
        if (!cancelled) setLoadingSecurity(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [address]);

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
  const securitySignals = useMemo(() => toSecuritySignals(security), [security]);

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
          <div>
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
                <img
                  src={trendIconSrc}
                  alt=""
                  aria-hidden="true"
                  className="h-3 w-3 shrink-0"
                />
                <span className="font-mono">{fmtPct(Math.abs(priceChange24))}</span>
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
                <TokenModalRechartsChart candles={candles} height={80} />
              )}
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#6B7280] mb-2">
              Token data
            </div>
            <div className="grid grid-cols-2 gap-y-1 gap-x-3 text-xs">
              <Stat
                label="Liquidity"
                value={fmtUsd(Number(pair?.liquidity?.usd ?? 0), { compact: true })}
              />
              <Stat
                label="Vol 24h"
                value={fmtUsd(Number(pair?.volume?.h24 ?? 0), { compact: true })}
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
            <div className="text-[10px] uppercase tracking-wider text-[#6B7280] mb-2">
              Security
            </div>
            {loadingSecurity ? (
              <div className="text-xs text-[#6B7280]">Loading security…</div>
            ) : securitySignals.length > 0 ? (
              <div className="grid grid-cols-2 gap-y-1 gap-x-3 text-xs">
                {securitySignals.map((item) => (
                  <Stat key={item.label} label={item.label} value={item.value} />
                ))}
              </div>
            ) : (
              <div className="text-xs text-[#6B7280]">
                {securityError ?? "Security data unavailable for this token."}
              </div>
            )}
          </div>

          {(socials.length > 0 || websites.length > 0) && (
            <div>
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
            </div>
          )}

          <div>
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
          </div>

          {address && (
            <Link
              href={`/token/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center text-sm text-white bg-[#19549b] hover:bg-[#143f78] py-3 rounded-sm transition-colors"
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
      <span className="text-[#6B7280]">{label}</span>
      <span className="font-mono text-[#111827] text-right truncate">{value}</span>
    </div>
  );
}

function TokenModalRechartsChart({
  candles,
  height,
}: {
  candles: Candle[];
  height: number;
}) {
  const gradientId = useId().replace(/:/g, "");

  if (candles.length < 2) {
    return (
      <div
        className="h-20 flex items-center justify-center text-xs text-[#6B7280]"
        style={{ height }}
      >
        No chart data
      </div>
    );
  }

  const data = candles
    .map((candle) => ({
      time: candle.unixTime * 1000,
      price: candle.c,
    }))
    .filter((point) => Number.isFinite(point.time) && Number.isFinite(point.price));

  if (data.length < 2) {
    return (
      <div
        className="h-20 flex items-center justify-center text-xs text-[#6B7280]"
        style={{ height }}
      >
        No chart data
      </div>
    );
  }

  const prices = data.map((point) => point.price);
  const first = prices[0];
  const last = prices[prices.length - 1];
  const up = last >= first;
  const color = up ? "#0fa87a" : "#ef4444";

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const minIndex = prices.indexOf(min);
  const maxIndex = prices.indexOf(max);
  const minPoint = data[minIndex];
  const maxPoint = data[maxIndex];
  const lastPoint = data[data.length - 1];

  const span = max - min || 1;
  const yMin = min - span * 0.05;
  const yMax = max + span * 0.05;

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 6, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" type="number" domain={["dataMin", "dataMax"]} hide />
          <YAxis type="number" domain={[yMin, yMax]} hide />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
            activeDot={false}
          />
          <ReferenceDot
            x={maxPoint.time}
            y={maxPoint.price}
            r={3}
            fill="#0fa87a"
            stroke="none"
          />
          <ReferenceDot
            x={minPoint.time}
            y={minPoint.price}
            r={3}
            fill="#ef4444"
            stroke="none"
          />
          <ReferenceDot
            x={lastPoint.time}
            y={lastPoint.price}
            r={5}
            fill={color}
            stroke="#ffffff"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function normalizeSecurityError(raw: string | null): string {
  const msg = (raw ?? "").toLowerCase();
  if (!msg) return "Security data unavailable for this token.";
  if (
    msg.includes("sufficient permissions") ||
    msg.includes("permission") ||
    msg.includes("unauthorized")
  ) {
    return "Security endpoint is not available on the current Birdeye API plan.";
  }
  return raw ?? "Security data unavailable for this token.";
}

function toSecuritySignals(
  security: Record<string, unknown> | null
): Array<{ label: string; value: string }> {
  if (!security) return [];

  const items: Array<{ label: string; value: string }> = [];

  pushBooleanSignal(items, security, "Verified", [
    "is_verified",
    "isVerified",
    "verified",
  ]);
  pushBooleanSignal(items, security, "Mintable", [
    "is_mintable",
    "isMintable",
    "mintable",
  ]);
  pushBooleanSignal(items, security, "Freezable", [
    "is_freezable",
    "isFreezable",
    "freezable",
  ]);
  pushBooleanSignal(items, security, "Token 2022", [
    "is_token_2022",
    "isToken2022",
    "token2022",
  ]);
  pushBooleanSignal(items, security, "Transfer Fee", [
    "transfer_fee_enable",
    "transferFeeEnable",
  ]);
  pushBooleanSignal(items, security, "Non-transferable", [
    "non_transferable",
    "nonTransferable",
  ]);
  pushBooleanSignal(items, security, "Honeypot Risk", [
    "is_honeypot",
    "isHoneypot",
  ]);

  pushNumberSignal(items, security, "Top 10 Holders", [
    "top10_holder_rate",
    "top10_holder_percent",
    "top10HolderPercent",
  ]);
  pushNumberSignal(items, security, "Holder Count", [
    "holder",
    "holder_count",
    "holderCount",
  ]);

  const owner = readString(security, ["owner_address", "ownerAddress"]);
  if (owner) {
    items.push({ label: "Owner", value: truncateAddr(owner) });
  }

  const creator = readString(security, ["creator_address", "creatorAddress"]);
  if (creator) {
    items.push({ label: "Creator", value: truncateAddr(creator) });
  }

  return items;
}

function pushBooleanSignal(
  items: Array<{ label: string; value: string }>,
  source: Record<string, unknown>,
  label: string,
  keys: string[]
) {
  const bool = readBoolean(source, keys);
  if (bool !== null) {
    items.push({ label, value: bool ? "Yes" : "No" });
  }
}

function pushNumberSignal(
  items: Array<{ label: string; value: string }>,
  source: Record<string, unknown>,
  label: string,
  keys: string[]
) {
  const n = readNumber(source, keys);
  if (n === null) return;
  if (label === "Top 10 Holders") {
    const asPct = n <= 1 ? n * 100 : n;
    items.push({ label, value: `${asPct.toFixed(2)}%` });
    return;
  }
  items.push({ label, value: fmtNum(n) });
}

function readBoolean(
  source: Record<string, unknown>,
  keys: string[]
): boolean | null {
  const value = readRaw(source, keys);
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1 ? true : value === 0 ? false : null;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") return true;
    if (normalized === "false" || normalized === "0") return false;
  }
  return null;
}

function readNumber(
  source: Record<string, unknown>,
  keys: string[]
): number | null {
  const value = readRaw(source, keys);
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function readString(
  source: Record<string, unknown>,
  keys: string[]
): string | null {
  const value = readRaw(source, keys);
  if (typeof value === "string" && value.trim()) return value;
  return null;
}

function readRaw(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    if (key in source) return source[key];
  }
  return null;
}

async function fetchChartWithFallback(address: string): Promise<ChartFetchResult> {
  const birdeye = await fetchBirdeyeCandles(address);
  if (birdeye.length >= 2) {
    return { candles: birdeye, source: "Birdeye" };
  }

  const tokensXyz = await fetchTokensXyzCandles(address);
  if (tokensXyz.length >= 2) {
    return { candles: tokensXyz, source: "Tokens.xyz" };
  }

  const jupiter = await fetchJupiterDerivedCandles(address);
  if (jupiter.length >= 2) {
    return { candles: jupiter, source: "Jupiter (derived)" };
  }

  if (birdeye.length > 0) {
    return { candles: birdeye, source: "Birdeye + Tokens.xyz + Jupiter" };
  }
  if (tokensXyz.length > 0) {
    return { candles: tokensXyz, source: "Birdeye + Tokens.xyz + Jupiter" };
  }
  return { candles: jupiter, source: "Birdeye + Tokens.xyz + Jupiter" };
}

async function fetchBirdeyeCandles(address: string): Promise<Candle[]> {
  try {
    const res = await fetch(
      `/api/birdeye?type=ohlcv&address=${encodeURIComponent(address)}`,
      { cache: "no-store" }
    );
    const json = res.ok ? await res.json() : null;
    const raw: unknown[] = json?.success && Array.isArray(json.data) ? json.data : [];
    return normalizeCandles(raw);
  } catch {
    return [];
  }
}

async function fetchTokensXyzCandles(address: string): Promise<Candle[]> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const from = now - 86_400;
    const res = await fetch(
      `/api/tokens-xyz?type=price-chart&assetId=${encodeURIComponent(
        address
      )}&interval=1H&from=${from}&to=${now}`,
      { cache: "no-store" }
    );
    const json = res.ok ? await res.json() : null;
    const raw = json?.success ? json.data : null;
    return normalizeCandles(raw);
  } catch {
    return [];
  }
}

async function fetchJupiterDerivedCandles(address: string): Promise<Candle[]> {
  try {
    const res = await fetch(
      `/api/jupiter?type=search&q=${encodeURIComponent(address)}&limit=3`,
      { cache: "no-store" }
    );
    const json = res.ok ? await res.json() : null;
    const rows = Array.isArray(json?.data) ? (json.data as unknown[]) : [];
    if (rows.length === 0) return [];

    const exact =
      rows.find((item) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) return false;
        const rec = item as Record<string, unknown>;
        const base = rec.baseToken as Record<string, unknown> | undefined;
        return String(base?.address ?? "").toLowerCase() === address.toLowerCase();
      }) ?? rows[0];

    if (!exact || typeof exact !== "object" || Array.isArray(exact)) return [];
    const rec = exact as Record<string, unknown>;
    const priceUsd = toNumber(rec.priceUsd);
    const priceChange = toNumber(
      (rec.priceChange as Record<string, unknown> | undefined)?.h24
    );
    const volume24 = toNumber(
      (rec.volume as Record<string, unknown> | undefined)?.h24
    );
    if (!Number.isFinite(priceUsd) || priceUsd <= 0) return [];

    const denominator = 1 + priceChange / 100;
    const prevPrice =
      Number.isFinite(denominator) && denominator > 0
        ? priceUsd / denominator
        : priceUsd;

    const now = Math.floor(Date.now() / 1000);
    const start = now - 86_400;
    const high = Math.max(prevPrice, priceUsd);
    const low = Math.min(prevPrice, priceUsd);

    return [
      {
        o: prevPrice,
        h: high,
        l: low,
        c: prevPrice,
        v: Math.max(0, volume24 / 2),
        unixTime: start,
      },
      {
        o: prevPrice,
        h: high,
        l: low,
        c: priceUsd,
        v: Math.max(0, volume24),
        unixTime: now,
      },
    ];
  } catch {
    return [];
  }
}

function normalizeCandles(raw: unknown): Candle[] {
  let rows: unknown[] = [];
  if (Array.isArray(raw)) {
    rows = raw;
  } else if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.candles)) rows = obj.candles as unknown[];
    else if (Array.isArray(obj.data)) rows = obj.data as unknown[];
    else if (Array.isArray(obj.points)) rows = obj.points as unknown[];
    else if (Array.isArray(obj.ohlcv)) rows = obj.ohlcv as unknown[];
    else {
      const nested = obj.data as Record<string, unknown> | undefined;
      if (nested && Array.isArray(nested.candles)) rows = nested.candles as unknown[];
      else if (nested && Array.isArray(nested.points)) rows = nested.points as unknown[];
      else if (nested && Array.isArray(nested.data)) rows = nested.data as unknown[];
      else if (nested && Array.isArray(nested.ohlcv)) rows = nested.ohlcv as unknown[];
    }
  }

  const candles = rows
    .map((item) => {
      const r =
        item && typeof item === "object" && !Array.isArray(item)
          ? (item as Record<string, unknown>)
          : {};
      const rawTime = toNumber(
        r.unixTime ?? r.time ?? r.timestamp ?? r.t ?? r.startTime ?? r.start_time
      );
      const unixTime = rawTime > 1_000_000_000_000 ? Math.floor(rawTime / 1000) : rawTime;

      const close = toNumber(r.c ?? r.close ?? r.value ?? r.price);
      const open = toNumber(r.o ?? r.open, close);
      const high = toNumber(r.h ?? r.high, close);
      const low = toNumber(r.l ?? r.low, close);
      const volume = toNumber(r.v ?? r.volume, 0);

      return {
        o: open,
        h: high,
        l: low,
        c: close,
        v: volume,
        unixTime,
      } satisfies Candle;
    })
    .filter(
      (candle) =>
        Number.isFinite(candle.unixTime) &&
        candle.unixTime > 0 &&
        Number.isFinite(candle.c) &&
        candle.c > 0
    )
    .sort((a, b) => a.unixTime - b.unixTime);

  return candles;
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}
