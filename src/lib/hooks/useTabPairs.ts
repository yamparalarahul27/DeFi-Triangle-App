"use client";

import { useCallback, useEffect, useState } from "react";
import { useInterval } from "./useInterval";

export interface TabPairsResult<TExtra = Record<string, unknown>> {
  data: any[];
  loading: boolean;
  extra: TExtra;
  refetch: () => Promise<void>;
}

export function useTabPairs<TExtra = Record<string, unknown>>(
  url: string,
  refreshMs: number,
  paused: boolean
): TabPairsResult<TExtra> {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [extra, setExtra] = useState<TExtra>({} as TExtra);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(url, { cache: "no-store" });
      const json = res.ok ? await res.json() : null;
      if (json?.success) {
        setData(Array.isArray(json.data) ? json.data : []);
        const rest = { ...json } as Record<string, unknown>;
        delete rest.success;
        delete rest.data;
        setExtra(rest as TExtra);
      }
    } catch {
      // keep last-good state on error
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  useInterval(fetchData, paused ? null : refreshMs);

  return { data, loading, extra, refetch: fetchData };
}
