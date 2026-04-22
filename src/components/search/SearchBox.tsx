"use client";

import { useEffect, useRef, useState } from "react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { TokenIcon } from "@/components/ui/TokenIcon";
import { fmtPct, fmtUsd } from "@/lib/format";

export interface SearchBoxProps {
  onSelect: (pair: any) => void;
  onResultsChange?: (pairs: any[]) => void;
  query: string;
  setQuery: (q: string) => void;
}

export function SearchBox({
  onSelect,
  onResultsChange,
  query,
  setQuery,
}: SearchBoxProps) {
  const debounced = useDebounce(query.trim(), 500);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!debounced) {
      setResults([]);
      onResultsChange?.([]);
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
        const data: any[] =
          json?.success && Array.isArray(json.data) ? json.data : [];
        if (!cancelled) {
          setResults(data);
          onResultsChange?.(data);
        }
      } catch {
        if (!cancelled) {
          setResults([]);
          onResultsChange?.([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleSelect = (pair: any) => {
    onSelect(pair);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  const showDropdown = open && debounced.length > 0;

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search any Solana token by name, symbol or address…"
        aria-label="Search tokens"
        className="w-full h-10 sm:h-11 px-4 rounded-sm bg-white border border-[#cbd5e1] text-sm text-[#11274d] placeholder-[#6a7282] focus:outline-none focus:border-[#19549b] transition-colors"
      />

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#cbd5e1] rounded-sm shadow-lg z-30 max-h-[60vh] overflow-y-auto">
          {loading && results.length === 0 && (
            <div className="px-3 py-4 text-xs text-[#6a7282] text-center">
              Searching…
            </div>
          )}
          {!loading && results.length === 0 && (
            <div className="px-3 py-4 text-xs text-[#6a7282] text-center">
              No results found.
            </div>
          )}
          {results.map((pair, i) => {
            const base = pair?.baseToken ?? {};
            const quote = pair?.quoteToken ?? {};
            const info = pair?.info ?? {};
            const change = Number(pair?.priceChange?.h24 ?? 0);
            const up = change >= 0;
            return (
              <button
                key={`${pair?.pairAddress ?? i}`}
                type="button"
                onClick={() => handleSelect(pair)}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[#f1f5f9] transition-colors border-b border-[#f1f5f9] last:border-b-0"
              >
                <TokenIcon
                  src={info.imageUrl}
                  symbol={base.symbol}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-[#11274d] truncate">
                    {base.symbol ?? "???"}
                    {quote.symbol && (
                      <span className="text-[#6a7282] font-normal">
                        {" / "}
                        {quote.symbol}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#6a7282] truncate">
                    {base.name ?? ""} · {pair?.dexId ?? ""}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono text-xs text-[#11274d]">
                    {fmtUsd(Number(pair?.priceUsd ?? 0))}
                  </div>
                  <div
                    className={`font-mono text-[10px] ${
                      up ? "text-[#0fa87a]" : "text-[#ef4444]"
                    }`}
                  >
                    {up ? "▲" : "▼"} {fmtPct(Math.abs(change))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
