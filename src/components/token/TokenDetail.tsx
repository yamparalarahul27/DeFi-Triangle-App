"use client";

import Link from "next/link";
import { useTokenDetails } from "@/lib/hooks/useTokenDetails";
import { useTokenPriceTicker } from "@/lib/hooks/useTokenPriceTicker";
import { useWatchlist } from "@/lib/hooks/useWatchlist";
import { useWalletAuth } from "@/lib/hooks/useWalletAuth";
import { useSession } from "@/components/providers/SessionContext";
import { TokenIcon } from "@/components/ui/TokenIcon";
import { BottomBar } from "@/components/layout/BottomBar";
import { PriceChart } from "./PriceChart";
import { fmtUsd, fmtPctMagnitude, fmtAge, truncateAddr } from "@/lib/format";
import { cn } from "@/lib/utils";

const compactUsd = (n?: number | null) =>
  n == null || !Number.isFinite(n)
    ? "—"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
        maximumFractionDigits: 2,
      }).format(n);

const compactNum = (n?: number | null) =>
  n == null || !Number.isFinite(n)
    ? "—"
    : new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(n);

const TONE_TEXT: Record<string, string> = {
  safe: "text-buy",
  caution: "text-warning",
  danger: "text-sell",
};

export function TokenDetail({ address }: { address: string }) {
  const d = useTokenDetails(address);
  const ticker = useTokenPriceTicker(address);
  const { wallet } = useSession();
  const authed = !!wallet;
  const { starredSet, add, remove } = useWatchlist(authed);
  const { connect } = useWalletAuth();

  const symbol = d.asset?.symbol ?? d.meta?.jupiter?.symbol ?? truncateAddr(address);
  const stats = d.asset?.stats;
  const price = ticker.price ?? stats?.price ?? d.birdeyePrice ?? null;
  const change = ticker.priceChange24h ?? stats?.priceChange24hPercent ?? null;
  const up = (change ?? 0) >= 0;

  const watched = starredSet.has(address);
  const onWatch = () => {
    if (!authed) return connect();
    if (watched) remove(address);
    else
      add({
        token_address: address,
        symbol: d.asset?.symbol,
        name: d.asset?.name,
        image_url: d.asset?.imageUrl,
      });
  };

  // ── error / edge states ──────────────────────────────────────
  if (d.invalidAddress) return <Shell><Empty title="Invalid token address" sub={truncateAddr(address)} /></Shell>;
  if (d.notIndexed && !d.loading) return <Shell><Empty title="Token not indexed yet" sub={symbol} /></Shell>;

  const score = d.risk?.marketScore;
  const riskInput = d.risk?.marketScoreInput;
  const mintDisabled = d.onChain?.accountInfo ? d.onChain.accountInfo.mintAuthority === null : null;
  const freezeDisabled = d.onChain?.accountInfo ? d.onChain.accountInfo.freezeAuthority === null : null;

  return (
    <Shell active="markets">
      {/* header */}
      <header className="sticky top-0 z-20 flex h-12 items-center justify-between border-b border-outline-variant bg-surface-page/90 px-4 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" aria-label="Back" className="-ml-3 grid size-11 place-items-center text-lg text-fg-muted hover:text-fg">
            ‹
          </Link>
          <TokenIcon src={d.asset?.imageUrl} symbol={symbol} className="size-7" />
          <span className="font-mono text-sm font-semibold text-fg">{symbol}</span>
        </div>
        <button
          type="button"
          onClick={onWatch}
          aria-label={watched ? "Remove from watchlist" : "Watch"}
          className={cn(
            "grid size-9 place-items-center rounded-sm transition-colors active:scale-[0.96]",
            watched ? "text-brand" : "text-fg-muted hover:text-fg",
          )}
        >
          {watched ? "★" : "☆"}
        </button>
      </header>

      <main className="flex-1 space-y-4 px-4 pt-4 pb-24">
        {/* price */}
        <section>
          <div className="font-mono text-2xl tabular-nums text-fg">
            {price != null ? fmtUsd(price) : d.statsLoading ? "—" : "—"}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className={cn("font-mono text-sm tabular-nums", up ? "text-buy" : "text-sell")}>
              {change != null ? `${up ? "▲" : "▼"} ${fmtPctMagnitude(change)} · 24h` : "—"}
            </span>
            {ticker.lastUpdatedAt != null && (
              <span className="text-[11px] text-fg-subtle">updated {fmtAge(ticker.lastUpdatedAt)}</span>
            )}
          </div>
          <div className="mt-3">
            <PriceChart candles={d.chartCandles} range={d.chartRange} onRange={d.setChartRange} loading={d.chartLoading} />
          </div>
        </section>

        {/* stats */}
        <Card>
          <SectionLabel>Stats</SectionLabel>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <Stat label="Market cap" value={compactUsd(stats?.marketCap ?? d.profile?.marketCap ?? riskInput?.marketCapUsd)} loading={d.statsLoading} />
            <Stat label="24h volume" value={compactUsd(stats?.volume24hUSD ?? d.profile?.volume24h ?? riskInput?.volume24hUsd)} loading={d.statsLoading} />
            <Stat label="Liquidity" value={compactUsd(stats?.liquidity ?? riskInput?.liquidityUsd)} loading={d.statsLoading} />
            <Stat label="Holders" value={compactNum(riskInput?.holderCount)} loading={d.statsLoading} />
          </div>
        </Card>

        {/* risk grade */}
        <Card>
          <div className="flex items-center justify-between">
            <SectionLabel>Risk grade</SectionLabel>
            <span className={cn("font-mono text-sm tabular-nums", TONE_TEXT[score?.tone ?? ""] ?? "text-fg-muted")}>
              {d.edgeScoreLoading && !score ? "—" : (score?.grade ?? "—")}
            </span>
          </div>
          <div className="mt-3 space-y-2 text-xs">
            <RiskRow label="Mint authority" ok={mintDisabled} okText="disabled ✓" badText="enabled" />
            <RiskRow label="Freeze authority" ok={freezeDisabled} okText="disabled ✓" badText="enabled" />
            <div className="flex justify-between">
              <span className="text-fg-muted">Top-10 hold</span>
              <span className={cn("font-mono tabular-nums", (riskInput?.top10HoldersPercent ?? 0) > 30 ? "text-warning" : "text-fg")}>
                {riskInput?.top10HoldersPercent != null ? `${riskInput.top10HoldersPercent.toFixed(0)}%` : "—"}
              </span>
            </div>
          </div>
        </Card>

        <p className="pt-1 text-center text-[11px] text-fg-subtle">
          holders · trading activity · slippage · markets · on-chain … (more sections coming)
        </p>
      </main>
    </Shell>
  );
}

// ── local building blocks ───────────────────────────────────────
function Shell({ children, active }: { children: React.ReactNode; active?: "feed" | "markets" | "search" | "me" }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-surface-page ring-1 ring-outline-variant">
      {children}
      <BottomBar active={active} />
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <section className="rounded-lg border border-outline-variant bg-surface-container p-4 shadow-[0_1px_3px_rgba(0,0,0,0.4)]">{children}</section>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-fg-subtle">{children}</h2>;
}

function Stat({ label, value, loading }: { label: string; value: string; loading?: boolean }) {
  return (
    <div>
      <div className="text-[11px] text-fg-subtle">{label}</div>
      <div className={cn("mt-0.5 font-mono text-sm tabular-nums text-fg", loading && "opacity-40")}>{value}</div>
    </div>
  );
}

function RiskRow({ label, ok, okText, badText }: { label: string; ok: boolean | null; okText: string; badText: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-fg-muted">{label}</span>
      <span className={cn(ok == null ? "text-fg-subtle" : ok ? "text-buy" : "text-warning")}>
        {ok == null ? "—" : ok ? okText : badText}
      </span>
    </div>
  );
}

function Empty({ title, sub }: { title: string; sub?: string }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-1 px-6 text-center">
      <div className="text-sm font-medium text-fg">{title}</div>
      {sub && <div className="font-mono text-xs text-fg-subtle">{sub}</div>}
      <Link href="/" className="mt-3 text-xs text-brand">← back</Link>
    </main>
  );
}
