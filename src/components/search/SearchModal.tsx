"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CornerDownLeft,
  Search as SearchIcon,
  X,
} from "lucide-react";
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

  const matchedRecentRows = useMemo<SearchRowData[]>(() => {
    if (!hasQuery) return [];
    const tokens = trimmed.toLowerCase().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return [];
    return recents
      .filter((r) => {
        const haystack = `${r.symbol} ${r.name} ${r.address}`.toLowerCase();
        return tokens.every((t) => haystack.includes(t));
      })
      .map((r) => ({
        address: r.address,
        symbol: r.symbol,
        name: r.name,
        imageUrl: r.imageUrl,
      }));
  }, [hasQuery, recents, trimmed]);

  const dedupedResultRows = useMemo<SearchRowData[]>(() => {
    if (matchedRecentRows.length === 0) return resultRows;
    const seen = new Set(matchedRecentRows.map((r) => r.address));
    return resultRows.filter((r) => !seen.has(r.address));
  }, [matchedRecentRows, resultRows]);

  const navigableRows = hasQuery
    ? [...matchedRecentRows, ...dedupedResultRows]
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
          className="fixed left-1/2 -translate-x-1/2 top-20 z-50 flex flex-col w-[calc(100%-1rem)] max-w-[640px] max-h-[80vh] bg-surface-container rounded-sm shadow-2xl border border-outline-variant overflow-hidden"
        >
          <Dialog.Title className="sr-only">Search tokens</Dialog.Title>
          <Dialog.Description className="sr-only">
            Type to search tokens by symbol, name or address. Use arrow keys to
            navigate results and enter to open.
          </Dialog.Description>

          <div className="flex items-center gap-2 px-3 h-12 border-b border-outline-variant shrink-0">
            <SearchIcon className="w-4 h-4 text-fg-muted shrink-0" />
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
              className="flex-1 bg-transparent text-sm text-fg placeholder-fg-subtle focus:outline-none"
            />
            {hasQuery && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="text-fg-muted hover:text-fg transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div
            role="listbox"
            aria-label="Search results"
            className="flex-1 overflow-y-auto"
          >
            {hasQuery ? (
              <QueryResults
                loading={loading}
                matchedRecents={matchedRecentRows}
                rows={dedupedResultRows}
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

          <div className="hidden sm:flex items-center justify-between px-3 h-8 text-[10px] text-fg-muted border-t border-outline-variant bg-surface shrink-0">
            <div className="flex items-center gap-3">
              <KeyHint
                label={
                  <span className="inline-flex items-center gap-px">
                    <ArrowUp className="w-2 h-2" aria-hidden />
                    <ArrowDown className="w-2 h-2" aria-hidden />
                  </span>
                }
                text="navigate"
              />
              <KeyHint
                label={<CornerDownLeft className="w-2 h-2" aria-hidden />}
                text="open"
              />
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
  matchedRecents,
  rows,
  activeIndex,
  onHover,
  onSelect,
}: {
  loading: boolean;
  matchedRecents: SearchRowData[];
  rows: SearchRowData[];
  activeIndex: number;
  onHover: (i: number) => void;
  onSelect: (row: SearchRowData) => void;
}) {
  if (loading && rows.length === 0 && matchedRecents.length === 0) {
    return (
      <div className="px-3 py-8 text-xs text-fg-muted text-center">
        Searching…
      </div>
    );
  }
  if (rows.length === 0 && matchedRecents.length === 0) {
    return (
      <div className="px-3 py-8 text-xs text-fg-muted text-center">
        No tokens matched that query.
      </div>
    );
  }
  let cursor = 0;
  return (
    <div className="py-1">
      {matchedRecents.length > 0 && (
        <Section title="Recent" count={matchedRecents.length}>
          {matchedRecents.map((row) => {
            const idx = cursor++;
            return (
              <SearchRow
                key={`q-recent-${row.address}`}
                row={row}
                active={idx === activeIndex}
                onSelect={() => onSelect(row)}
                onHover={() => onHover(idx)}
              />
            );
          })}
        </Section>
      )}
      {rows.length > 0 && (
        <Section
          title={matchedRecents.length > 0 ? "Tokens" : undefined}
          count={matchedRecents.length > 0 ? rows.length : undefined}
        >
          {rows.map((row) => {
            const idx = cursor++;
            return (
              <SearchRow
                key={row.address}
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
      <div className="px-3 py-8 text-xs text-fg-muted text-center">
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
          count={recents.length}
          action={
            <button
              type="button"
              onClick={onClearRecents}
              className="text-[10px] text-fg-muted hover:text-fg transition-colors"
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
        <Section title="Recommended" count={recommended.length}>
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
  count,
  action,
  children,
}: {
  title?: string;
  count?: number;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const showHeader = title !== undefined;
  return (
    <div>
      {showHeader && (
        <div className="sticky top-0 z-10 flex items-center justify-between px-3 py-1.5 bg-surface/95 backdrop-blur-sm border-b border-outline-variant">
          <div className="text-[10px] uppercase tracking-wider text-fg-muted">
            {title}
            {typeof count === "number" && (
              <span className="ml-1.5 text-fg-subtle">· {count}</span>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

function KeyHint({
  label,
  text,
}: {
  label: React.ReactNode;
  text: string;
}) {
  return (
    <span className="flex items-center gap-1">
      <kbd className="px-1 h-4 text-[9px] rounded-sm border border-outline-variant bg-surface-container text-fg leading-none flex items-center">
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
