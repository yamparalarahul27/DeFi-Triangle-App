"use client";

export type TabKey = "trending" | "watchlist";

interface TabDef {
  key: TabKey;
  label: string;
}

const TABS: TabDef[] = [{ key: "trending", label: "All" }];

export function TabsRow({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (key: TabKey) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 sm:gap-2 py-2">
      {TABS.map((t) => {
        const isActive = t.key === active;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={`min-h-[40px] px-4 rounded-sm text-xs sm:text-sm font-medium transition-[background-color,color,box-shadow,transform] duration-150 active:scale-[0.96] ${
              isActive
                ? "bg-brand text-on-brand shadow-[0_1px_2px_rgba(4,17,15,0.40),0_4px_8px_rgba(90,216,196,0.20),0_12px_24px_rgba(90,216,196,0.12)]"
                : "bg-surface-container text-fg/60 border border-outline-variant hover:text-fg/90"
            }`}
            aria-pressed={isActive}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
