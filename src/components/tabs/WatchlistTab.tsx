"use client";

import { useCallback, useEffect, useState } from "react";
import { useUnifiedWalletContext } from "@jup-ag/wallet-adapter";
import { DexCard } from "@/components/ui/DexCard";
import { StatusDot } from "@/components/ui/StatusDot";
import { useInterval } from "@/lib/hooks/useInterval";
import type { RiskFormula } from "@/lib/scoring";
import type { WatchlistItem } from "@/lib/hooks/useWatchlist";
import { TabEmpty, TabGrid, TabLoading } from "./TabShell";

export interface WatchlistTabProps {
  paused: boolean;
  riskFormula: RiskFormula;
  authed: boolean;
  wallet: string | null;
  items: WatchlistItem[];
  loaded: boolean;
  onSelectPair: (pair: any) => void;
  onRemove: (tokenAddress: string) => void;
}

function truncate(addr: string): string {
  if (!addr || addr.length <= 9) return addr ?? "";
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

export function WatchlistTab({
  paused,
  riskFormula,
  authed,
  wallet,
  items,
  loaded,
  onSelectPair,
  onRemove,
}: WatchlistTabProps) {
  const { setShowModal } = useUnifiedWalletContext();
  const [liveMap, setLiveMap] = useState<Record<string, any>>({});

  const addresses = items.map((i) => i.token_address).filter(Boolean);
  const addressesKey = addresses.join(",");

  const fetchLive = useCallback(async () => {
    if (addresses.length === 0) {
      setLiveMap({});
      return;
    }
    try {
      const res = await fetch(
        `/api/dexscreener?type=batch&addresses=${addressesKey}&riskFormula=${riskFormula}`,
        { cache: "no-store" }
      );
      const json = res.ok ? await res.json() : null;
      if (json?.success && json.data) setLiveMap(json.data);
    } catch {
      // ignore
    }
  }, [addressesKey, riskFormula]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchLive();
  }, [fetchLive]);

  useInterval(fetchLive, paused || !authed ? null : 30_000);

  if (!authed) {
    return (
      <div className="py-16 flex flex-col items-center gap-4 text-center">
        <div className="text-3xl">☆</div>
        <div className="text-sm text-[#6a7282] max-w-sm">
          Connect your wallet to save tokens to a persistent watchlist tied to
          your address.
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="h-9 px-4 rounded-sm bg-[#19549b] text-white text-xs font-semibold hover:bg-[#143f78] transition-colors"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  if (!loaded) return <TabLoading />;

  if (items.length === 0) {
    return (
      <div className="space-y-3">
        <WatchlistHeader count={0} wallet={wallet} />
        <TabEmpty text="No tokens saved yet. Tap ☆ on any token to save it." />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <WatchlistHeader count={items.length} wallet={wallet} live />
      <TabGrid>
        {items.map((item) => {
          const pair =
            liveMap[item.token_address] ??
            ({
              baseToken: {
                address: item.token_address,
                symbol: item.symbol,
                name: item.name,
              },
              quoteToken: {},
              info: { imageUrl: item.image_url },
              priceChange: {},
              volume: {},
              txns: {},
              liquidity: {},
            } as any);
          return (
            <div key={item.token_address} className="flex flex-col gap-2">
              <DexCard
                pair={pair}
                onClick={() => onSelectPair(pair)}
                starred
                onStarToggle={() => onRemove(item.token_address)}
              />
              <button
                type="button"
                onClick={() => onRemove(item.token_address)}
                className="h-7 rounded-sm bg-white border border-[#cbd5e1] text-xs text-[#6a7282] hover:text-[#b91c1c] hover:border-[#ef4444]/40 transition-colors"
              >
                Remove
              </button>
            </div>
          );
        })}
      </TabGrid>
    </div>
  );
}

function WatchlistHeader({
  count,
  wallet,
  live = false,
}: {
  count: number;
  wallet: string | null;
  live?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
      <div className="text-[#11274d] font-semibold">
        Your Watchlist <span className="text-[#6a7282]">({count})</span>
      </div>
      <div className="flex items-center gap-3 text-[#6a7282]">
        <span className="font-mono">{truncate(wallet ?? "")}</span>
        {live && (
          <span className="flex items-center gap-1.5">
            <StatusDot variant="live" pulse />
            <span className="hidden sm:inline">Live prices</span>
          </span>
        )}
      </div>
    </div>
  );
}
