"use client";

import { useCallback, useEffect, useState } from "react";

export interface WatchlistItem {
  id: string;
  token_address: string;
  symbol: string | null;
  name: string | null;
  image_url: string | null;
  added_at: string;
}

export interface WatchlistState {
  items: WatchlistItem[];
  loaded: boolean;
  starredSet: Set<string>;
  refresh: () => Promise<void>;
  add: (payload: {
    token_address: string;
    symbol?: string;
    name?: string;
    image_url?: string;
  }) => Promise<void>;
  remove: (tokenAddress: string) => Promise<void>;
}

export function useWatchlist(authed: boolean): WatchlistState {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    if (!authed) {
      setItems([]);
      setLoaded(true);
      return;
    }
    try {
      const res = await fetch("/api/watchlist", { cache: "no-store" });
      if (!res.ok) {
        setItems([]);
        setLoaded(true);
        return;
      }
      const json = await res.json();
      setItems(
        json?.success && Array.isArray(json.data) ? json.data : []
      );
    } catch {
      setItems([]);
    } finally {
      setLoaded(true);
    }
  }, [authed]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback(
    async (payload: {
      token_address: string;
      symbol?: string;
      name?: string;
      image_url?: string;
    }) => {
      if (!authed) return;
      const optimistic: WatchlistItem = {
        id: `optimistic-${payload.token_address}`,
        token_address: payload.token_address,
        symbol: payload.symbol ?? null,
        name: payload.name ?? null,
        image_url: payload.image_url ?? null,
        added_at: new Date().toISOString(),
      };
      setItems((prev) =>
        prev.some((i) => i.token_address === payload.token_address)
          ? prev
          : [optimistic, ...prev]
      );
      try {
        const res = await fetch("/api/watchlist", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("add failed");
        await refresh();
      } catch {
        setItems((prev) =>
          prev.filter((i) => i.token_address !== payload.token_address)
        );
      }
    },
    [authed, refresh]
  );

  const remove = useCallback(
    async (tokenAddress: string) => {
      if (!authed) return;
      const snapshot = items;
      setItems((prev) =>
        prev.filter((i) => i.token_address !== tokenAddress)
      );
      try {
        const res = await fetch(
          `/api/watchlist?token=${encodeURIComponent(tokenAddress)}`,
          { method: "DELETE" }
        );
        if (!res.ok) throw new Error("remove failed");
      } catch {
        setItems(snapshot);
      }
    },
    [authed, items]
  );

  const starredSet = new Set(items.map((i) => i.token_address));

  return { items, loaded, starredSet, refresh, add, remove };
}
