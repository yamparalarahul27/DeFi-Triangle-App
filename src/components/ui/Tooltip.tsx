"use client";

import { Dialog as RadixDialog, Tooltip as RadixTooltip } from "radix-ui";
import { useSyncExternalStore, type ReactNode } from "react";

const COARSE_POINTER_QUERY = "(pointer: coarse)";

function subscribeCoarsePointer(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const mql = window.matchMedia(COARSE_POINTER_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function readCoarsePointer(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(COARSE_POINTER_QUERY).matches;
}

function readCoarsePointerServer(): boolean {
  return false;
}

function useCoarsePointer(): boolean {
  return useSyncExternalStore(
    subscribeCoarsePointer,
    readCoarsePointer,
    readCoarsePointerServer
  );
}

export function Tooltip({
  content,
  children,
  side = "top",
  title = "Details",
}: {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  title?: string;
}) {
  const isTouch = useCoarsePointer();

  if (isTouch) {
    return (
      <RadixDialog.Root>
        <RadixDialog.Trigger asChild>{children}</RadixDialog.Trigger>
        <RadixDialog.Portal>
          <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
          <RadixDialog.Content
            aria-describedby={undefined}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-lg bg-white p-5 pb-7 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#cbd5e1]" />
            <RadixDialog.Title className="mb-3 pr-8 text-sm font-semibold text-[#11274d]">
              {title}
            </RadixDialog.Title>
            <div className="text-sm leading-relaxed text-[#11274d]">
              {content}
            </div>
            <RadixDialog.Close
              aria-label="Close"
              className="absolute top-3 right-3 inline-flex h-7 w-7 items-center justify-center rounded-sm text-[#6a7282] hover:bg-[#f1f5f9] hover:text-[#11274d] transition-colors"
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
            className="z-50 max-w-[260px] rounded-sm bg-[#11274d] px-2.5 py-1.5 text-[11px] leading-snug text-white shadow-md data-[state=delayed-open]:animate-in data-[state=closed]:animate-out data-[state=delayed-open]:fade-in-0 data-[state=closed]:fade-out-0"
          >
            {content}
            <RadixTooltip.Arrow className="fill-[#11274d]" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
