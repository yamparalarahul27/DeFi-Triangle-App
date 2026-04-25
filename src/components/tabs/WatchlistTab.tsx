"use client";

import { ArrowBigUp } from "lucide-react";
import { useUnifiedWalletContext } from "@jup-ag/wallet-adapter";
import { DexCard } from "@/components/ui/DexCard";
import type { WatchlistItem } from "@/lib/hooks/useWatchlist";
import { TabGrid, TabLoading } from "./TabShell";

export interface WatchlistTabProps {
  authed: boolean;
  wallet: string | null;
  items: WatchlistItem[];
  loaded: boolean;
  onSelectPair: (pair: any) => void;
  onRemove: (tokenAddress: string) => void;
  onOpenCreateModal: () => void;
}

function truncate(addr: string): string {
  if (!addr || addr.length <= 9) return addr ?? "";
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

export function WatchlistTab({
  authed,
  wallet,
  items,
  loaded,
  onSelectPair,
  onRemove,
  onOpenCreateModal,
}: WatchlistTabProps) {
  const { setShowModal } = useUnifiedWalletContext();

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
    return <WatchlistEmptyState onCreate={onOpenCreateModal} />;
  }

  return (
    <div className="space-y-3">
      <WatchlistHeader count={items.length} wallet={wallet} />
      <TabGrid>
        {items.map((item) => {
          const pair = {
            pairAddress: item.token_address,
            baseToken: {
              address: item.token_address,
              symbol: item.symbol,
              name: item.name,
            },
            quoteToken: { symbol: "USD" },
            info: { imageUrl: item.image_url, socials: [], websites: [] },
            priceChange: { h24: 0 },
            volume: { h24: 0 },
            txns: { h24: { buys: 0, sells: 0 } },
            liquidity: { usd: 0 },
            fdv: 0,
            marketCap: 0,
            pairCreatedAt: 0,
            dexId: "birdeye",
          } as any;

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
}: {
  count: number;
  wallet: string | null;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
      <div className="text-[#11274d] font-semibold">
        Your Watchlist <span className="text-[#6a7282]">({count})</span>
      </div>
      <div className="text-[#6a7282]">
        <span className="font-mono">{truncate(wallet ?? "")}</span>
      </div>
    </div>
  );
}

function WatchlistEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="py-16 sm:py-24 flex flex-col items-center gap-6 text-center">
      <StackedCardsIllustration />
      <div className="space-y-2 max-w-sm">
        <h2 className="text-xl font-semibold text-[#11274d] tracking-tight">
          Build your first watchlist
        </h2>
        <p className="text-sm text-[#6a7282]">
          Add tokens, track the group&apos;s performance and spot trends at a
          glance.
        </p>
      </div>
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={onCreate}
          className="h-10 px-5 rounded-sm bg-[#19549b] text-white text-sm font-semibold hover:bg-[#143f78] transition-colors"
        >
          Create watchlist
        </button>
        <div className="text-[11px] text-[#6a7282] flex items-center gap-1.5">
          <span>or press</span>
          <kbd className="inline-flex items-center justify-center px-1.5 h-5 rounded-sm border border-[#cbd5e1] bg-[#f1f5f9] text-[10px] font-mono text-[#11274d]">
            <ArrowBigUp className="w-3 h-3" />
          </kbd>
          <span>+</span>
          <kbd className="inline-flex items-center justify-center px-1.5 h-5 rounded-sm border border-[#cbd5e1] bg-[#f1f5f9] text-[10px] font-mono text-[#11274d]">
            N
          </kbd>
        </div>
      </div>
    </div>
  );
}

function StackedCardsIllustration() {
  return (
    <div
      aria-hidden="true"
      className="relative h-32 w-44 select-none pointer-events-none"
    >
      <div className="absolute left-1.5 top-3 h-24 w-32 rounded-sm bg-[#f59e0b] rotate-[-8deg] opacity-90" />
      <div className="absolute right-1.5 top-3 h-24 w-32 rounded-sm bg-[#ef4444] rotate-[8deg] opacity-90" />
      <div className="absolute left-1/2 -translate-x-1/2 top-1 h-24 w-32 rounded-sm bg-[#19549b] flex flex-col justify-between p-2.5">
        <div className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-full bg-white/30" />
          <span className="h-1.5 w-12 rounded-sm bg-white/30" />
        </div>
        <svg
          viewBox="0 0 100 30"
          className="w-full h-6"
          preserveAspectRatio="none"
        >
          <path
            d="M0 22 Q 15 12, 30 14 T 60 10 T 100 6"
            stroke="rgba(255,255,255,0.85)"
            strokeWidth="1.2"
            fill="none"
          />
          <circle cx="100" cy="6" r="1.8" fill="white" />
        </svg>
        <div className="flex -space-x-1">
          <span className="h-3 w-3 rounded-full bg-[#f7931a] border border-white/20" />
          <span className="h-3 w-3 rounded-full bg-[#627eea] border border-white/20" />
          <span className="h-3 w-3 rounded-full bg-[#9945ff] border border-white/20" />
        </div>
      </div>
    </div>
  );
}
