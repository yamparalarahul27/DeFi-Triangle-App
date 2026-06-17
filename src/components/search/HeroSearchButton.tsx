"use client";

import { Command as CommandIcon, Search as SearchIcon } from "lucide-react";
import { useSearchModal } from "./SearchModalProvider";

export function HeroSearchButton() {
  const { open } = useSearchModal();

  return (
    <button
      type="button"
      onClick={open}
      aria-label="Open search"
      className="group w-full h-11 sm:h-12 flex items-center gap-3 px-4 rounded-sm bg-surface-container/80 border border-outline shadow-lg text-left transition-colors hover:bg-surface-container"
    >
      <SearchIcon className="w-4 h-4 text-fg-muted shrink-0" />
      <span className="flex-1 text-sm text-fg-muted truncate">
        Search tokens, pairs, or paste an address…
      </span>
      <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 h-5 text-[10px] rounded-sm border border-outline-variant bg-surface-page text-fg-muted leading-none">
        <CommandIcon className="w-2.5 h-2.5" aria-hidden />
        <span>K</span>
      </kbd>
    </button>
  );
}
