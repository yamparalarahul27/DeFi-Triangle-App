"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { CANVAS_ITEMS } from "./items";
import { ThemeToggle } from "../ThemeToggle";
import { DEMOS } from "./demos";

type View = { x: number; y: number; s: number };

const MIN_S = 0.1;
const MAX_S = 2.5;
const INITIAL: View = { x: 40, y: 40, s: 0.55 };

const clampS = (s: number) => Math.min(MAX_S, Math.max(MIN_S, s));

export function CanvasApp() {
  const [view, setView] = useState<View>(INITIAL);
  const wrapRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ px: number; py: number } | null>(null);
  const [panning, setPanning] = useState(false);

  // Wheel: plain scroll pans; ctrl/cmd+wheel (and trackpad pinch, which the
  // browser reports as ctrl+wheel) zooms toward the cursor. Needs a
  // non-passive listener to preventDefault, so bound manually.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const rect = el.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        const factor = Math.exp(-e.deltaY * 0.01);
        setView((v) => {
          const s = clampS(v.s * factor);
          const k = s / v.s;
          return { s, x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k };
        });
      } else {
        setView((v) => ({ ...v, x: v.x - e.deltaX, y: v.y - e.deltaY }));
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    // Drag-pan from anywhere except interactive elements inside frames.
    const t = e.target as HTMLElement;
    if (t.closest("button, a, input, textarea, select, [role='dialog']")) return;
    drag.current = { px: e.clientX, py: e.clientY };
    setPanning(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.px;
    const dy = e.clientY - drag.current.py;
    drag.current = { px: e.clientX, py: e.clientY };
    setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
  };
  const onPointerUp = () => {
    drag.current = null;
    setPanning(false);
  };

  const zoomBy = (factor: number) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    const cx = (rect?.width ?? 0) / 2;
    const cy = (rect?.height ?? 0) / 2;
    setView((v) => {
      const s = clampS(v.s * factor);
      const k = s / v.s;
      return { s, x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k };
    });
  };

  return (
    <div
      ref={wrapRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="fixed inset-0 touch-none select-none overflow-hidden bg-surface-dim font-sans"
      style={{
        cursor: panning ? "grabbing" : "grab",
        backgroundImage:
          "radial-gradient(var(--outline-variant) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      {/* world */}
      <div
        className="absolute left-0 top-0"
        style={{
          transform: `translate(${view.x}px, ${view.y}px) scale(${view.s})`,
          transformOrigin: "0 0",
        }}
      >
        {CANVAS_ITEMS.map((item) => {
          if (item.kind === "label") {
            return (
              <div
                key={item.id}
                className="absolute whitespace-nowrap font-mono text-[13px] font-semibold uppercase tracking-[0.14em] text-fg-subtle"
                style={{ left: item.x, top: item.y }}
              >
                {item.title}
              </div>
            );
          }
          if (item.kind === "iframe") {
            return (
              <div key={item.id} className="absolute" style={{ left: item.x, top: item.y }}>
                <div className="mb-1.5 font-mono text-[11px] text-fg-subtle">{item.title}</div>
                <iframe
                  src={item.src}
                  title={item.title}
                  width={item.w}
                  height={item.h}
                  className="pointer-events-none rounded-sm border border-outline-variant bg-surface-page"
                  
                />
              </div>
            );
          }
          const Demo = DEMOS[item.id];
          return (
            <div
              key={item.id}
              className="absolute"
              style={{ left: item.x, top: item.y, width: item.w }}
            >
              <div className="mb-1.5 font-mono text-[11px] text-fg-subtle">{item.title}</div>
              <div className="rounded-sm border border-outline-variant bg-surface-page p-4">
                {Demo ? <Demo /> : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-3">
        <div className="pointer-events-auto flex items-center gap-3 rounded-sm border border-outline bg-surface-page/95 px-3 py-2">
          <span
            className="text-sm font-semibold text-fg"
            style={{ fontFamily: "var(--font-geist-mono), monospace" }}
          >
            cids <span className="text-brand">~</span>{" "}
            <span className="text-fg-subtle">canvas</span>
          </span>
          <a href="/design" className="font-mono text-xs text-fg-muted underline-offset-2 hover:underline">
            gallery
          </a>
          <ThemeToggle />
        </div>
        <div className="pointer-events-auto flex items-center gap-1 rounded-sm border border-outline bg-surface-page/95 p-1">
          <HudButton label="−" onClick={() => zoomBy(1 / 1.25)} />
          <span className="w-12 text-center font-mono text-[11px] text-fg-muted">
            {Math.round(view.s * 100)}%
          </span>
          <HudButton label="+" onClick={() => zoomBy(1.25)} />
          <HudButton label="fit" onClick={() => setView(INITIAL)} wide />
        </div>
      </div>

      {/* desktop-first note (coarse pointers) */}
      <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 hidden -translate-x-1/2 rounded-sm border border-outline bg-surface-page/95 px-3 py-1.5 font-mono text-[11px] text-fg-muted [@media(pointer:coarse)]:block">
        canvas is desktop-first for now — drag to pan · use + / −
      </div>
    </div>
  );
}

function HudButton({
  label,
  onClick,
  wide,
}: {
  label: string;
  onClick: () => void;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center justify-center rounded-sm font-mono text-xs text-fg-muted transition-colors hover:bg-surface-container-high hover:text-fg",
        wide ? "px-3" : "w-8",
      )}
    >
      {label}
    </button>
  );
}
