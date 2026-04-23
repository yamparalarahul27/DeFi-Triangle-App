"use client";

import { useCallback, useEffect, useState } from "react";

// V1: per-device only, localStorage-backed.
// V2 (pending): wallet-scoped server-side storage — see CLAUDE.md § Pending followups.

const STORAGE_KEY = "te.recentSearches";
const MAX_RECENTS = 10;
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

export interface RecentSearch {
  address: string;
  symbol: string;
  name: string;
  imageUrl?: string;
  ts: number;
}

interface UseRecentSearchesState {
  recents: RecentSearch[];
  push: (entry: Omit<RecentSearch, "ts">) => void;
  remove: (address: string) => void;
  clear: () => void;
}

function readStorage(): RecentSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const now = Date.now();
    return parsed.filter(
      (r): r is RecentSearch =>
        !!r &&
        typeof r.address === "string" &&
        typeof r.symbol === "string" &&
        typeof r.name === "string" &&
        typeof r.ts === "number" &&
        now - r.ts < TTL_MS
    );
  } catch {
    return [];
  }
}

function writeStorage(recents: RecentSearch[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recents));
  } catch {
    // quota or disabled storage — fail silently, recents are non-critical
  }
}

export function useRecentSearches(): UseRecentSearchesState {
  const [recents, setRecents] = useState<RecentSearch[]>([]);

  useEffect(() => {
    setRecents(readStorage());
  }, []);

  const push = useCallback((entry: Omit<RecentSearch, "ts">) => {
    setRecents((prev) => {
      const filtered = prev.filter((r) => r.address !== entry.address);
      const next = [{ ...entry, ts: Date.now() }, ...filtered].slice(0, MAX_RECENTS);
      writeStorage(next);
      return next;
    });
  }, []);

  const remove = useCallback((address: string) => {
    setRecents((prev) => {
      const next = prev.filter((r) => r.address !== address);
      writeStorage(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setRecents([]);
    writeStorage([]);
  }, []);

  return { recents, push, remove, clear };
}
