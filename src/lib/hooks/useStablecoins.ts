"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useInterval } from "@/lib/hooks/useInterval";
import type { StablecoinsPayload } from "@/lib/home/stablecoins";

const EMPTY_PAYLOAD: StablecoinsPayload = { live: [], pending: [] };

export function useStablecoins(refreshMs: number, paused: boolean) {
  const [data, setData] = useState<StablecoinsPayload>(EMPTY_PAYLOAD);
  const [loading, setLoading] = useState(true);
  const inFlightRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      const res = await fetch("/api/stablecoins", { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json().catch(() => null);
      if (json && json.success && json.data) {
        setData(json.data as StablecoinsPayload);
      }
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    void fetchData();
  }, [fetchData]);

  useInterval(() => {
    void fetchData();
  }, paused ? null : refreshMs);

  return { data, loading, refetch: fetchData };
}
