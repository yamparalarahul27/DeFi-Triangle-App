"use client";

import { Search as SearchIcon } from "lucide-react";
import { useSearchModal } from "./SearchModalProvider";

export function HeroSearchButton() {
  const { open } = useSearchModal();

  return (
    <button
      type="button"
      onClick={open}
      aria-label="Open search"
      className="group w-full h-11 sm:h-12 flex items-center gap-3 px-4 rounded-sm bg-white/95 border border-white/30 shadow-lg text-left transition-colors hover:bg-white"
    >
      <SearchIcon className="w-4 h-4 text-[#6a7282] shrink-0" />
      <span className="flex-1 text-sm text-[#6a7282] truncate">
        Search tokens, pairs, or paste an address…
      </span>
      <kbd className="hidden sm:inline-flex items-center px-1.5 h-5 text-[10px] rounded-sm border border-[#cbd5e1] bg-[#f1f5f9] text-[#6a7282] leading-none">
        ⌘K
      </kbd>
    </button>
  );
}
