"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search as SearchIcon, X } from "lucide-react";
import { SearchRow, type SearchRowData } from "./SearchRow";
import { useTokenSearch, type TokenSearchResult } from "@/lib/hooks/useTokenSearch";
import { useRecentSearches } from "@/lib/hooks/useRecentSearches";
import { useRecommendedTokens } from "@/lib/hooks/useRecommendedTokens";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { results, loading } = useTokenSearch(query);
  const { recents, push: pushRecent, clear: clearRecents } = useRecentSearches();
  const { recommended } = useRecommendedTokens(open);

  const trimmed = query.trim();
  const hasQuery = trimmed.length > 0;

  const resultRows = useMemo<SearchRowData[]>(
    () => results.map(toRow),
    [results]
  );
  const recentRows = useMemo<SearchRowData[]>(
    () =>
      recents.map((r) => ({
        address: r.address,
        symbol: r.symbol,
        name: r.name,
        imageUrl: r.imageUrl,
      })),
    [recents]
  );
  const recommendedRows = useMemo<SearchRowData[]>(
    () => recommended.map(toRow),
    [recommended]
  );

  const navigableRows = hasQuery
    ? resultRows
    : [...recentRows, ...recommendedRows];

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveIndex(0);
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [trimmed]);

  const selectRow = useCallback(
    (row: SearchRowData | undefined) => {
      if (!row?.address) return;
      pushRecent({
        address: row.address,
        symbol: row.symbol,
        name: row.name,
        imageUrl: row.imageUrl,
      });
      onOpenChange(false);
      router.push(`/token/${row.address}`);
    },
    [onOpenChange, pushRecent, router]
  );

  const onInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (navigableRows.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % navigableRows.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) =>
          (i - 1 + navigableRows.length) % navigableRows.length
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        selectRow(navigableRows[activeIndex]);
      }
    },
    [activeIndex, navigableRows, selectRow]
  );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
          className="fixed left-0 right-0 bottom-0 z-50 flex flex-col w-full max-h-[85vh] bg-white rounded-t-lg shadow-2xl border border-[#e5e7eb] overflow-hidden sm:left-1/2 sm:right-auto sm:bottom-auto sm:top-[12vh] sm:w-[92vw] sm:max-w-[560px] sm:max-h-none sm:-translate-x-1/2 sm:rounded-sm"
        >
          <Dialog.Title className="sr-only">Search tokens</Dialog.Title>
          <Dialog.Description className="sr-only">
            Type to search tokens by symbol, name or address. Use arrow keys to
            navigate results and enter to open.
          </Dialog.Description>

          <div className="flex items-center gap-2 px-3 h-12 border-b border-[#e5e7eb] shrink-0">
            <SearchIcon className="w-4 h-4 text-[#6a7282] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder="Search tokens, pairs, or paste an address…"
              aria-label="Search tokens"
              aria-autocomplete="list"
              aria-activedescendant={
                navigableRows[activeIndex]?.address
                  ? `search-row-${navigableRows[activeIndex].address}`
                  : undefined
              }
              className="flex-1 bg-transparent text-sm text-[#11274d] placeholder-[#6a7282] focus:outline-none"
            />
            {hasQuery && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="text-[#6a7282] hover:text-[#11274d] transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div
            role="listbox"
            aria-label="Search results"
            className="flex-1 overflow-y-auto sm:flex-initial sm:max-h-[60vh]"
          >
            {hasQuery ? (
              <QueryResults
                loading={loading}
                rows={resultRows}
                activeIndex={activeIndex}
                onHover={setActiveIndex}
                onSelect={selectRow}
              />
            ) : (
              <EmptyStateLists
                recents={recentRows}
                recommended={recommendedRows}
                activeIndex={activeIndex}
                onHover={setActiveIndex}
                onSelect={selectRow}
                onClearRecents={clearRecents}
              />
            )}
          </div>

          <div className="hidden sm:flex items-center justify-between px-3 h-8 text-[10px] text-[#6a7282] border-t border-[#e5e7eb] bg-[#f8fafc] shrink-0">
            <div className="flex items-center gap-3">
              <KeyHint label="↑↓" text="navigate" />
              <KeyHint label="↵" text="open" />
              <KeyHint label="esc" text="close" />
            </div>
            <span>DeFi Triangle</span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function QueryResults({
  loading,
  rows,
  activeIndex,
  onHover,
  onSelect,
}: {
  loading: boolean;
  rows: SearchRowData[];
  activeIndex: number;
  onHover: (i: number) => void;
  onSelect: (row: SearchRowData) => void;
}) {
  if (loading && rows.length === 0) {
    return (
      <div className="px-3 py-8 text-xs text-[#6a7282] text-center">
        Searching…
      </div>
    );
  }
  if (rows.length === 0) {
    return (
      <div className="px-3 py-8 text-xs text-[#6a7282] text-center">
        No tokens matched that query.
      </div>
    );
  }
  return (
    <div className="py-1">
      {rows.map((row, i) => (
        <SearchRow
          key={row.address}
          row={row}
          active={i === activeIndex}
          onSelect={() => onSelect(row)}
          onHover={() => onHover(i)}
        />
      ))}
    </div>
  );
}

function EmptyStateLists({
  recents,
  recommended,
  activeIndex,
  onHover,
  onSelect,
  onClearRecents,
}: {
  recents: SearchRowData[];
  recommended: SearchRowData[];
  activeIndex: number;
  onHover: (i: number) => void;
  onSelect: (row: SearchRowData) => void;
  onClearRecents: () => void;
}) {
  if (recents.length === 0 && recommended.length === 0) {
    return (
      <div className="px-3 py-8 text-xs text-[#6a7282] text-center">
        Start typing to search Solana tokens.
      </div>
    );
  }
  let cursor = 0;
  return (
    <div className="py-1">
      {recents.length > 0 && (
        <Section
          title="Recent"
          action={
            <button
              type="button"
              onClick={onClearRecents}
              className="text-[10px] text-[#6a7282] hover:text-[#11274d] transition-colors"
            >
              Clear
            </button>
          }
        >
          {recents.map((row) => {
            const idx = cursor++;
            return (
              <SearchRow
                key={`recent-${row.address}`}
                row={row}
                active={idx === activeIndex}
                onSelect={() => onSelect(row)}
                onHover={() => onHover(idx)}
              />
            );
          })}
        </Section>
      )}
      {recommended.length > 0 && (
        <Section title="Recommended">
          {recommended.map((row) => {
            const idx = cursor++;
            return (
              <SearchRow
                key={`rec-${row.address}`}
                row={row}
                active={idx === activeIndex}
                onSelect={() => onSelect(row)}
                onHover={() => onHover(idx)}
              />
            );
          })}
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between px-3 py-1.5">
        <div className="text-[10px] uppercase tracking-wider text-[#6a7282]">
          {title}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function KeyHint({ label, text }: { label: string; text: string }) {
  return (
    <span className="flex items-center gap-1">
      <kbd className="px-1 h-4 text-[9px] rounded-sm border border-[#cbd5e1] bg-white text-[#11274d] leading-none flex items-center">
        {label}
      </kbd>
      <span>{text}</span>
    </span>
  );
}

function toRow(pair: TokenSearchResult): SearchRowData {
  const base = pair.baseToken ?? {};
  const info = pair.info ?? {};
  return {
    address: base.address ?? pair.pairAddress ?? "",
    symbol: base.symbol ?? "???",
    name: base.name ?? base.symbol ?? "",
    imageUrl: info.imageUrl,
    priceUsd:
      typeof pair.priceUsd === "number"
        ? pair.priceUsd
        : pair.priceUsd != null
        ? Number(pair.priceUsd)
        : undefined,
    priceChange24:
      typeof pair.priceChange?.h24 === "number"
        ? pair.priceChange.h24
        : pair.priceChange?.h24 != null
        ? Number(pair.priceChange.h24)
        : undefined,
    secondary: pair.dexId,
  };
}
