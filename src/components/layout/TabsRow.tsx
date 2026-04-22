"use client";

export type TabKey =
  | "trending"
  | "live"
  | "whale"
  | "meme"
  | "smart"
  | "defi"
  | "watchlist";

interface TabDef {
  key: TabKey;
  label: string;
}

const TABS: TabDef[] = [
  { key: "trending", label: "Trending" },
  { key: "live", label: "Live feed" },
  { key: "whale", label: "Whale" },
  { key: "meme", label: "Meme" },
  { key: "smart", label: "Smart" },
  { key: "defi", label: "DeFi" },
  { key: "watchlist", label: "☆ Watchlist" },
];

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
            className={`min-h-[36px] px-4 rounded-sm text-xs sm:text-sm font-medium transition-all duration-150 ${
              isActive
                ? "bg-[#19549b] text-white shadow-[0_2px_8px_rgba(25,84,155,0.25)]"
                : "bg-white text-[#11274d]/60 border border-[#cbd5e1] hover:text-[#11274d]/90"
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
