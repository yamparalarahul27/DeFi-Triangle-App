"use client";

import { useEffect, useState } from "react";
import type { TokenSearchResult } from "./useTokenSearch";

interface UseRecommendedTokensState {
  recommended: TokenSearchResult[];
  loading: boolean;
}

export function useRecommendedTokens(enabled: boolean): UseRecommendedTokensState {
  const [recommended, setRecommended] = useState<TokenSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    if (recommended.length > 0) return;

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const res = await fetch("/api/jupiter?type=home&limit=40", {
          cache: "no-store",
        });
        const json = res.ok ? await res.json() : null;
        const sectionTokens = Array.isArray(json?.sections?.attraction)
          ? (json.sections.attraction as TokenSearchResult[])
          : [];
        if (!cancelled) setRecommended(sectionTokens.slice(0, 6));
      } catch {
        if (!cancelled) setRecommended([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, recommended.length]);

  return { recommended, loading };
}
