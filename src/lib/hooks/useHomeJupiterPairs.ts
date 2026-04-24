"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useInterval } from "@/lib/hooks/useInterval";
import {
  adaptHomeSectionsPayload,
  adaptJupiterPayloadToPairs,
  flattenSections,
} from "@/lib/home/adapters";
import { HOME_JUPITER_ENDPOINTS, type HomeSections, type TokenPair } from "@/lib/home/types";

export function useHomeJupiterPairs(refreshMs: number, paused: boolean) {
  const [data, setData] = useState<TokenPair[]>([]);
  const [sections, setSections] = useState<HomeSections | null>(null);
  const [loading, setLoading] = useState(true);
  const inFlightRef = useRef(false);

  const fetchPairs = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    try {
      let hadOkResponse = false;
      let resolvedPairs: TokenPair[] | null = null;
      let resolvedSections: HomeSections | null = null;

      for (const endpoint of HOME_JUPITER_ENDPOINTS) {
        try {
          const res = await fetch(endpoint, { cache: "no-store" });
          if (!res.ok) continue;
          hadOkResponse = true;

          const json = await res.json().catch(() => null);
          const mappedSections = adaptHomeSectionsPayload(json);
          if (mappedSections) {
            resolvedSections = mappedSections;
          }
          const mapped = adaptJupiterPayloadToPairs(json);
          if (mapped.length > 0 || mappedSections) {
            resolvedPairs = mapped.length > 0 ? mapped : flattenSections(mappedSections);
            break;
          }
        } catch {
          // try the next endpoint shape
        }
      }

      if (resolvedPairs) {
        setData(resolvedPairs);
        setSections(resolvedSections);
      } else if (hadOkResponse) {
        setData([]);
        setSections(null);
      }
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    void fetchPairs();
  }, [fetchPairs]);

  useInterval(() => {
    void fetchPairs();
  }, paused ? null : refreshMs);

  return { data, sections, loading, refetch: fetchPairs };
}
