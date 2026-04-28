"use client";

import { useCallback, useEffect, useState } from "react";
import { useInterval } from "@/lib/hooks/useInterval";

const TICKER_REFRESH_MS = 1500;

export interface TokenPriceTicker {
  price: number | null;
  priceChange24h: number | null;
  lastUpdatedAt: number | null;
}

export function useTokenPriceTicker(address: string): TokenPriceTicker {
  const [state, setState] = useState<TokenPriceTicker>({
    price: null,
    priceChange24h: null,
    lastUpdatedAt: null,
  });

  const tick = useCallback(async () => {
    if (!address) return;
    try {
      const res = await fetch(
        `https://lite-api.jup.ag/price/v3?ids=${encodeURIComponent(address)}`,
        { cache: "no-store" }
      );
      if (!res.ok) return;
      const json = (await res.json()) as Record<string, unknown> | null;
      if (!json || typeof json !== "object") return;
      const entry = json[address] as Record<string, unknown> | undefined;
      if (!entry) return;
      const price = toNum(entry.usdPrice);
      const change = toNum(entry.priceChange24h);
      setState({
        price,
        priceChange24h: change,
        lastUpdatedAt: Date.now(),
      });
    } catch {
      // transient — keep prior state
    }
  }, [address]);

  useEffect(() => {
    if (!address) return;
    let cancelled = false;
    (async () => {
      await tick();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [address, tick]);

  useInterval(tick, address ? TICKER_REFRESH_MS : null);

  return state;
}

function toNum(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}
