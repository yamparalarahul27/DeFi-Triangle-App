"use client";

import { Sparkles, TrendingDown, TrendingUp, X } from "lucide-react";
import { useEffect, useState } from "react";

export type WatchlistColor = "frost" | "hela" | "loki";

export interface CreateWatchlistDraft {
  name: string;
  color: WatchlistColor;
}

export interface CreateWatchlistModalProps {
  onCancel: () => void;
  onCreate: (draft: CreateWatchlistDraft) => void;
}

const COLOR_TOKENS: Record<
  WatchlistColor,
  { swatch: string; cardBg: string; label: string }
> = {
  frost: { swatch: "#19549b", cardBg: "#19549b", label: "Frost" },
  hela: { swatch: "#4c4c5b", cardBg: "#4c4c5b", label: "Hela" },
  loki: { swatch: "#0fa87a", cardBg: "#0fa87a", label: "Loki" },
};

export function CreateWatchlistModal({
  onCancel,
  onCreate,
}: CreateWatchlistModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState<WatchlistColor>("frost");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const trimmed = name.trim();
  const canCreate = trimmed.length > 0;
  const previewName = trimmed || "New Watchlist";
  const cardBg = COLOR_TOKENS[color].cardBg;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <div
        className="relative w-full max-w-[420px] bg-white rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.25)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 space-y-5">
          {/* Live preview card */}
          <div
            className="rounded-sm p-4 text-white relative overflow-hidden"
            style={{ backgroundColor: cardBg }}
          >
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="h-9 w-9 rounded-sm bg-white/15 inline-flex items-center justify-center"
              >
                <Sparkles className="w-4 h-4" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">
                  {previewName}
                </div>
                <div className="text-[11px] text-white/75 mt-0.5 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />2 up
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" />1 down
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onCancel}
                aria-label="Close"
                className="h-7 w-7 rounded-sm text-white/70 hover:text-white hover:bg-white/10 inline-flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <svg
              viewBox="0 0 200 50"
              className="w-full h-12 mt-3"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M0 30 Q 25 20, 40 22 T 80 18 T 120 28 T 160 32 T 200 30"
                stroke="rgba(255,255,255,0.85)"
                strokeWidth="1.5"
                fill="none"
              />
              <circle cx="200" cy="30" r="3" fill="white" />
            </svg>

            <div className="flex items-center justify-between mt-2">
              <div className="flex -space-x-1.5">
                <span className="h-5 w-5 rounded-full bg-[#f7931a] border border-white/20" />
                <span className="h-5 w-5 rounded-full bg-[#627eea] border border-white/20" />
                <span className="h-5 w-5 rounded-full bg-[#9945ff] border border-white/20" />
              </div>
              <div className="text-[11px] font-mono text-white/85">−1.55%</div>
            </div>
          </div>

          {/* Name input */}
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="h-9 w-9 shrink-0 rounded-sm bg-[#f1f5f9] inline-flex items-center justify-center text-[#11274d]"
            >
              <Sparkles className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 40))}
              placeholder="Watchlist name"
              maxLength={40}
              autoFocus
              className="flex-1 h-9 px-3 rounded-sm border border-[#cbd5e1] text-sm text-[#11274d] placeholder:text-[#6a7282] focus:outline-none focus:border-[#19549b] focus:ring-1 focus:ring-[#19549b]/30"
            />
          </div>

          {/* Color picker */}
          <div className="space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6a7282]">
              Color
            </div>
            <div className="flex items-center gap-3">
              {(Object.keys(COLOR_TOKENS) as WatchlistColor[]).map((key) => {
                const isSelected = color === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setColor(key)}
                    aria-pressed={isSelected}
                    aria-label={COLOR_TOKENS[key].label}
                    className={`h-8 w-8 rounded-full transition-all duration-150 ${
                      isSelected
                        ? "ring-2 ring-offset-2 ring-[#11274d]"
                        : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: COLOR_TOKENS[key].swatch }}
                  />
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              disabled={!canCreate}
              onClick={() => onCreate({ name: trimmed, color })}
              className="w-full h-10 rounded-sm bg-[#19549b] text-white text-sm font-semibold hover:bg-[#143f78] disabled:bg-[#cbd5e1] disabled:cursor-not-allowed transition-colors"
            >
              Create Watchlist
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full h-10 rounded-sm bg-white border border-[#cbd5e1] text-[#11274d] text-sm font-medium hover:bg-[#f1f5f9] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
