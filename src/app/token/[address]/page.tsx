"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { RiskBar } from "@/components/ui/RiskBar";
import { TokenIcon } from "@/components/ui/TokenIcon";
import { fmtAge, fmtNum, fmtPct, fmtUsd } from "@/lib/format";
import {
  getRiskBreakdown,
  toRiskInputFromDexScreener,
  type RiskBreakdown,
} from "@/lib/scoring";

type Candle = {
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  unixTime: number;
};

export default function TokenDetailPage() {
  const params = useParams<{ address: string }>();
  const address = params?.address ?? "";

  const [pair, setPair] = useState<any | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<"addr" | "link" | null>(null);

  useEffect(() => {
    if (!address) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [beRes, ohlcvRes] = await Promise.all([
          fetch(`/api/birdeye?type=trending`, { cache: "no-store" }),
          fetch(
            `/api/birdeye?type=ohlcv&address=${encodeURIComponent(address)}`,
            { cache: "no-store" }
          ),
        ]);
        const beJson = beRes.ok ? await beRes.json() : null;
        const ohJson = ohlcvRes.ok ? await ohlcvRes.json() : null;

        const trending: any[] =
          beJson?.success && Array.isArray(beJson.data) ? beJson.data : [];
        let basePair: any | null = null;

        const beMatch = trending.find((t) => t?.address === address);

        // Hydrate via DexScreener in parallel for full card data.
        const dexRes = await fetch(
          `/api/dexscreener?type=token&address=${encodeURIComponent(address)}`,
          { cache: "no-store" }
        );
        const dexJson = dexRes.ok ? await dexRes.json() : null;
        const dexPair = dexJson?.success ? dexJson.data : null;

        if (dexPair) {
          basePair = {
            ...dexPair,
            score:
              typeof beMatch?.score === "number"
                ? beMatch.score
                : dexPair.score,
            label: beMatch?.label ?? dexPair.label,
            trendingRank: beMatch?.rank,
          };
        } else if (beMatch) {
          basePair = {
            baseToken: {
              address: beMatch.address,
              symbol: beMatch.symbol,
              name: beMatch.name,
            },
            info: { imageUrl: beMatch.logoURI },
            priceUsd: beMatch.price,
            priceChange: { h24: beMatch.price24hChangePercent ?? 0 },
            liquidity: { usd: beMatch.liquidity ?? 0 },
            fdv: beMatch.fdv,
            marketCap: beMatch.marketcap ?? beMatch.marketCap ?? beMatch.fdv,
            volume: { h24: beMatch.volume24hUSD ?? 0 },
            txns: {},
            dexId: "",
            score: beMatch.score,
            label: beMatch.label,
            trendingRank: beMatch.rank,
          };
        }

        if (cancelled) return;
        setPair(basePair);
        setCandles(
          ohJson?.success && Array.isArray(ohJson.data) ? ohJson.data : []
        );
      } catch {
        // keep null
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [address]);

  const breakdown: RiskBreakdown | null = useMemo(
    () => (pair ? getRiskBreakdown(toRiskInputFromDexScreener(pair)) : null),
    [pair]
  );

  const copyAddress = useCallback(async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied("addr");
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // ignore
    }
  }, [address]);

  const copyShare = useCallback(async () => {
    if (!address) return;
    const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
    try {
      await navigator.clipboard.writeText(`${base}/token/${address}`);
      setCopied("link");
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // ignore
    }
  }, [address]);

  const passes = useMemo(() => {
    if (!breakdown) return null;
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

  return (
    <>
      <Header showPauseToggle={false} hasHero={false} />
      <main className="flex-1 max-w-[900px] w-full mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs text-[#6a7282] hover:text-[#11274d] transition-colors"
        >
          ← Back
        </Link>

        {loading ? (
          <div className="py-16 text-center text-sm text-[#6a7282]">
            Loading…
          </div>
        ) : !pair ? (
          <div className="py-16 text-center space-y-3">
            <div className="text-sm text-[#6a7282]">
              Token not found in current trending list or DexScreener
              database.
            </div>
            <Link
              href="/"
              className="inline-block text-xs text-[#19549b] hover:text-[#143f78]"
            >
              ← Back to dashboard
            </Link>
          </div>
        ) : (
          <>
            <DetailHeader pair={pair} />
            <Sparkline candles={candles} />
            {breakdown && passes && (
              <RiskPanel breakdown={breakdown} passes={passes} />
            )}
            <MetricsGrid pair={pair} />
            <ContractPanel
              address={address}
              onCopy={copyAddress}
              onShare={copyShare}
              copied={copied}
            />
          </>
        )}
      </main>
      <Footer />
    </>
  );
}

function DetailHeader({ pair }: { pair: any }) {
  const base = pair?.baseToken ?? {};
  const info = pair?.info ?? {};
  const priceUsd = Number(pair?.priceUsd ?? 0);
  const change24 = Number(pair?.priceChange?.h24 ?? 0);
  const up = change24 >= 0;
  const label = pair?.label;
  const labelColor =
    label === "safe"
      ? "text-[#0fa87a] bg-[#e5f7f2] border-[#0fa87a]/30"
      : label === "caution"
        ? "text-[#b45309] bg-[#fffbeb] border-[#f59e0b]/40"
        : label === "danger"
          ? "text-[#b91c1c] bg-[#fef2f2] border-[#ef4444]/40"
          : "text-[#6a7282] bg-[#f1f5f9] border-[#cbd5e1]";

  return (
    <div className="bg-white rounded-sm border border-[#cbd5e1] p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <TokenIcon src={info.imageUrl} symbol={base.symbol} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-[#11274d]">
              {base.symbol ?? "???"}
            </h1>
            {label && (
              <span
                className={`text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-sm border ${labelColor}`}
              >
                {label}
              </span>
            )}
          </div>
          <div className="text-sm text-[#6a7282] truncate">
            {base.name ?? ""}
          </div>
        </div>
        <div className="sm:text-right">
          <div className="font-mono text-2xl text-[#11274d]">
            {fmtUsd(priceUsd)}
          </div>
          <div
            className={`text-sm flex items-center gap-1 ${up ? "text-[#0fa87a]" : "text-[#ef4444]"} sm:justify-end`}
          >
            <span>{up ? "▲" : "▼"}</span>
            <span className="font-mono">{fmtPct(Math.abs(change24))}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Sparkline({ candles }: { candles: Candle[] }) {
  const closes = candles.map((c) => c.c).filter((n) => Number.isFinite(n));
  if (closes.length < 2) {
    return (
      <div className="bg-white rounded-sm border border-[#cbd5e1] p-4 h-32 flex items-center justify-center text-xs text-[#6a7282]">
        No chart data
      </div>
    );
  }
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;
  const w = 600;
  const h = 120;
  const step = w / (closes.length - 1);
  const points = closes
    .map((c, i) => `${i * step},${h - ((c - min) / range) * h}`)
    .join(" ");
  const first = closes[0];
  const last = closes[closes.length - 1];
  const up = last >= first;
  const color = up ? "#0fa87a" : "#ef4444";
  const minIdx = closes.indexOf(min);
  const maxIdx = closes.indexOf(max);

  return (
    <div className="bg-white rounded-sm border border-[#cbd5e1] p-4">
      <div className="text-[10px] uppercase tracking-wider text-[#6a7282] mb-2">
        24h price history · Birdeye
      </div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="w-full h-[120px]"
        aria-hidden="true"
      >
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" />
        <circle
          cx={maxIdx * step}
          cy={h - ((max - min) / range) * h}
          r="4"
          fill="#0fa87a"
        />
        <circle
          cx={minIdx * step}
          cy={h - ((min - min) / range) * h}
          r="4"
          fill="#ef4444"
        />
      </svg>
    </div>
  );
}

function RiskPanel({
  breakdown,
  passes,
}: {
  breakdown: RiskBreakdown;
  passes: { liquidity: boolean; price: boolean; volume: boolean; marketCap: boolean };
}) {
  return (
    <div className="bg-white rounded-sm border border-[#cbd5e1] p-4 sm:p-6 space-y-4">
      <div>
        <div className="text-[10px] uppercase tracking-wider text-[#6a7282] mb-2">
          Risk score
        </div>
        <RiskBar score={breakdown.score} label={breakdown.label} />
        <div className="text-xs text-[#6a7282] mt-2">{breakdown.summary}</div>
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-wider text-[#6a7282] mb-2">
          Risk breakdown
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Check pass={passes.liquidity} label="Liquidity" />
          <Check pass={passes.price} label="Price action" />
          <Check pass={passes.volume} label="Volume spike" />
          <Check pass={passes.marketCap} label="Market cap" />
        </div>
      </div>

      {breakdown.warnings.length > 0 && (
        <div className="space-y-1">
          {breakdown.warnings.slice(0, 6).map((w, i) => (
            <div
              key={i}
              className="text-[11px] text-[#b45309] bg-[#fffbeb] border border-[#fde68a] rounded-sm px-2 py-1"
            >
              {w}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MetricsGrid({ pair }: { pair: any }) {
  const rows: [string, string][] = [
    ["Liquidity", fmtUsd(Number(pair?.liquidity?.usd ?? 0), { compact: true })],
    ["Volume 24h", fmtUsd(Number(pair?.volume?.h24 ?? 0), { compact: true })],
    [
      "Market cap",
      fmtUsd(Number(pair?.marketCap ?? pair?.fdv ?? 0), { compact: true }),
    ],
    ["FDV", fmtUsd(Number(pair?.fdv ?? 0), { compact: true })],
    ["Buys 24h", fmtNum(Number(pair?.txns?.h24?.buys ?? 0))],
    ["Sells 24h", fmtNum(Number(pair?.txns?.h24?.sells ?? 0))],
    ["Created", `${fmtAge(Number(pair?.pairCreatedAt ?? 0))} ago`],
    ["DEX", pair?.dexId ?? "—"],
    ["Trending rank", pair?.trendingRank ? `#${pair.trendingRank}` : "—"],
  ];

  return (
    <div className="bg-white rounded-sm border border-[#cbd5e1] p-4 sm:p-6">
      <div className="text-[10px] uppercase tracking-wider text-[#6a7282] mb-3">
        Token data
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4 text-xs">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between border-b border-[#f1f5f9] pb-1"
          >
            <span className="text-[#6a7282]">{label}</span>
            <span className="font-mono text-[#11274d]">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContractPanel({
  address,
  onCopy,
  onShare,
  copied,
}: {
  address: string;
  onCopy: () => void;
  onShare: () => void;
  copied: "addr" | "link" | null;
}) {
  return (
    <div className="bg-white rounded-sm border border-[#cbd5e1] p-4 sm:p-6 space-y-3">
      <div>
        <div className="text-[10px] uppercase tracking-wider text-[#6a7282] mb-2">
          Contract address
        </div>
        <code className="block font-mono text-[11px] text-[#11274d] break-all bg-[#f1f5f9] p-2 rounded-sm">
          {address || "—"}
        </code>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onCopy}
          disabled={!address}
          className="h-9 rounded-sm bg-white border border-[#cbd5e1] text-xs text-[#11274d] hover:bg-[#f1f5f9] transition-colors disabled:opacity-40"
        >
          {copied === "addr" ? "Copied ✓" : "Copy address"}
        </button>
        <button
          type="button"
          onClick={onShare}
          disabled={!address}
          className="h-9 rounded-sm bg-white border border-[#cbd5e1] text-xs text-[#11274d] hover:bg-[#f1f5f9] transition-colors disabled:opacity-40"
        >
          {copied === "link" ? "Copied ✓" : "Share link"}
        </button>
        <a
          href={address ? `https://solscan.io/token/${address}` : "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="h-9 rounded-sm bg-white border border-[#cbd5e1] text-xs text-[#11274d] hover:bg-[#f1f5f9] transition-colors inline-flex items-center justify-center"
        >
          Solscan ↗
        </a>
        <a
          href={
            address
              ? `https://birdeye.so/token/${address}?chain=solana`
              : "#"
          }
          target="_blank"
          rel="noopener noreferrer"
          className="h-9 rounded-sm bg-[#19549b] text-white text-xs hover:bg-[#143f78] transition-colors inline-flex items-center justify-center"
        >
          Birdeye ↗
        </a>
      </div>
    </div>
  );
}

function Check({ pass, label }: { pass: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`text-sm leading-none ${pass ? "text-[#0fa87a]" : "text-[#ef4444]"}`}
      >
        {pass ? "✓" : "✗"}
      </span>
      <span className="text-[#11274d]">{label}</span>
    </div>
  );
}
