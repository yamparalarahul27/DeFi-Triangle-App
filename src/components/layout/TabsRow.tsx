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
                ? "bg-[#19549b] text-white shadow-[0_1px_2px_rgba(17,39,77,0.06),0_4px_8px_rgba(25,84,155,0.18),0_12px_24px_rgba(25,84,155,0.10)]"
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
