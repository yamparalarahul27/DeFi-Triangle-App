"use client";

import { Dialog as RadixDialog, Tooltip as RadixTooltip } from "radix-ui";
import { useSyncExternalStore, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const COARSE_POINTER_QUERY = "(pointer: coarse)";
const HOVER_NONE_QUERY = "(hover: none)";

function subscribeTouch(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const a = window.matchMedia(COARSE_POINTER_QUERY);
  const b = window.matchMedia(HOVER_NONE_QUERY);
  a.addEventListener("change", callback);
  b.addEventListener("change", callback);
  return () => {
    a.removeEventListener("change", callback);
    b.removeEventListener("change", callback);
  };
}

function readTouch(): boolean {
  if (typeof window === "undefined") return false;
  // Touch coverage on iOS Safari can be flaky on (pointer: coarse) alone —
  // layer in (hover: none) and ontouchstart for robust detection.
  if (window.matchMedia(COARSE_POINTER_QUERY).matches) return true;
  if (window.matchMedia(HOVER_NONE_QUERY).matches) return true;
  if ("ontouchstart" in window) return true;
  return false;
}

function readTouchServer(): boolean {
  return false;
}

function useIsTouchDevice(): boolean {
  return useSyncExternalStore(subscribeTouch, readTouch, readTouchServer);
}

/**
 * Hover tooltip that adapts to input: pointer devices get a Radix Tooltip;
 * touch devices (no hover) get a bottom-sheet Radix Dialog instead, so the
 * content is actually reachable.
 */
export function Tooltip({
  content,
  children,
  side = "top",
  title = "Details",
  className,
}: {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  /** Sheet heading on touch devices (tooltips have no title on pointer). */
  title?: string;
  /** Merged onto the floating content (tooltip bubble / touch sheet). */
  className?: string;
}) {
  const isTouch = useIsTouchDevice();

  if (isTouch) {
    return (
      <RadixDialog.Root>
        <RadixDialog.Trigger asChild>{children}</RadixDialog.Trigger>
        <RadixDialog.Portal>
          <RadixDialog.Overlay className="fixed inset-0 z-[var(--z-modal)] bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
          <RadixDialog.Content
            aria-describedby={undefined}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-[var(--z-modal)] max-h-[80vh] overflow-y-auto rounded-t-sheet bg-surface-container p-5 pb-7 shadow-overlay data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
              className,
            )}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-surface-bright" />
            <RadixDialog.Title className="mb-3 pr-8 text-sm font-semibold text-fg">
              {title}
            </RadixDialog.Title>
            <div className="text-sm leading-relaxed text-fg">{content}</div>
            <RadixDialog.Close
              aria-label="Close"
              className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-control text-fg-muted transition-colors hover:bg-surface-page hover:text-fg"
            >
              ×
            </RadixDialog.Close>
          </RadixDialog.Content>
        </RadixDialog.Portal>
      </RadixDialog.Root>
    );
  }

  return (
    <RadixTooltip.Provider delayDuration={150}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            side={side}
            sideOffset={4}
            className={cn(
              "z-[var(--z-toast)] max-w-[260px] rounded-control bg-surface-bright px-2.5 py-1.5 text-[11px] leading-snug text-fg shadow-raised data-[state=delayed-open]:animate-in data-[state=closed]:animate-out data-[state=delayed-open]:fade-in-0 data-[state=closed]:fade-out-0",
              className,
            )}
          >
            {content}
            <RadixTooltip.Arrow className="fill-surface-bright" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
