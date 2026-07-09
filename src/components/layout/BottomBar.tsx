"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type Tab = "feed" | "markets" | "search" | "me";

const TABS: { key: Tab; label: string; icon: string; href: string }[] = [
  { key: "feed", label: "Feed", icon: "~", href: "/" },
  { key: "markets", label: "Markets", icon: "◍", href: "/" },
  { key: "search", label: "Search", icon: "⌕", href: "/" },
  { key: "me", label: "Me", icon: "◐", href: "/" },
];

/**
 * Tide bottom navigation (Feed · Markets · Search · Me).
 * Feed/Markets/Profile screens land in later phases; for now non-active
 * tabs route to the shell. Active tab gets the brand dot underline.
 */
export function BottomBar({ active }: { active?: Tab }) {
  return (
    <nav className="sticky bottom-0 z-30 grid grid-cols-4 h-16 border-t border-outline-variant bg-surface-page/85 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      {TABS.map((t) => {
        const on = t.key === active;
        return (
          <Link
            key={t.key}
            href={t.href}
            className={cn(
              "flex flex-col items-center justify-center gap-[3px] text-[10px] font-medium transition-colors",
              on ? "text-fg" : "text-fg-subtle hover:text-fg-muted",
            )}
          >
            <span className="text-xl leading-none">{t.icon}</span>
            {t.label}
            {on && <span className="mt-px size-[3px] rounded-full bg-brand" />}
          </Link>
        );
      })}
    </nav>
  );
}
