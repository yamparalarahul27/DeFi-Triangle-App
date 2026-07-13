"use client";

import { useEffect, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

const THEMES = ["dark", "mono", "light", "violet"] as const;
type Theme = (typeof THEMES)[number];
const STORAGE_KEY = "cids-theme";

// localStorage is the theme store (same-tab changes via a local emitter,
// cross-tab via the storage event) — mirrors Tooltip.tsx's
// useSyncExternalStore house pattern.
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
};
const getSnapshot = (): Theme => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return (THEMES as readonly string[]).includes(stored ?? "")
    ? (stored as Theme)
    : "dark";
};
const getServerSnapshot = (): Theme => "dark";

const setStoredTheme = (t: Theme) => {
  localStorage.setItem(STORAGE_KEY, t);
  emit();
};

/** Segmented theme switch (all [data-theme] value-sets). Stamps <html data-theme> and persists. */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Sync the DOM (external system) from React state.
  useEffect(() => {
    if (theme === "dark") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn(
        "inline-flex gap-0.5 rounded-sm border border-outline-variant bg-surface-container p-0.5",
        className,
      )}
    >
      {THEMES.map((t) => (
        <button
          key={t}
          type="button"
          role="radio"
          aria-checked={theme === t}
          onClick={() => setStoredTheme(t)}
          className={cn(
            "inline-flex h-7 items-center rounded-sm px-2.5 font-mono text-[11px]",
            theme === t ? "bg-brand text-on-brand" : "text-fg-muted",
          )}
          style={{ transition: "background-color var(--motion-fast), color var(--motion-fast)" }}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
