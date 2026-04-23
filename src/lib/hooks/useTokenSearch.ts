"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "./useDebounce";

export interface TokenSearchResult {
  pairAddress?: string;
  baseToken?: { address?: string; symbol?: string; name?: string };
  quoteToken?: { symbol?: string; name?: string };
  info?: { imageUrl?: string };
  priceUsd?: number | string;
  priceChange?: { h24?: number | string };
  dexId?: string;
  [key: string]: unknown;
}

interface UseTokenSearchState {
  results: TokenSearchResult[];
  loading: boolean;
}

export function useTokenSearch(query: string): UseTokenSearchState {
  const debounced = useDebounce(query.trim(), 350);
  const [results, setResults] = useState<TokenSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!debounced) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    (async () => {
      try {
        const res = await fetch(
          `/api/dexscreener?type=search&q=${encodeURIComponent(debounced)}&limit=10`,
          { cache: "no-store" }
        );
        const json = res.ok ? await res.json() : null;
        const data: TokenSearchResult[] =
          json?.success && Array.isArray(json.data) ? json.data : [];
        if (!cancelled) setResults(data);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [debounced]);

  return { results, loading };
}
