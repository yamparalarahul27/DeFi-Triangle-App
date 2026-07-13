"use client";

import { Toast as RadixToast } from "radix-ui";
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export type ToastTone = "neutral" | "buy" | "sell" | "warning";

type ToastInput = { title: string; description?: string; tone?: ToastTone };
type ToastRecord = ToastInput & { id: number };

const ToastContext = createContext<((t: ToastInput) => void) | null>(null);

/** Imperative toast trigger — must be used under <ToastProvider>. */
export function useToast() {
  const push = useContext(ToastContext);
  if (!push) throw new Error("useToast must be used within <ToastProvider>");
  return push;
}

const TONE_BAR: Record<ToastTone, string> = {
  neutral: "bg-fg-subtle",
  buy: "bg-buy",
  sell: "bg-sell",
  warning: "bg-warning",
};

/**
 * App-level provider + viewport (bottom-center, --z-toast). Behavior is
 * Radix Toast: auto-dismiss (5s), swipe-down to dismiss, F8 hotkey to
 * reach the viewport, polite announcements.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  const push = useCallback((t: ToastInput) => {
    setToasts((all) => [...all, { ...t, id: Date.now() + Math.random() }]);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      <RadixToast.Provider swipeDirection="down" duration={5000}>
        {children}
        {toasts.map((t) => (
          <RadixToast.Root
            key={t.id}
            onOpenChange={(open) => {
              if (!open) setToasts((all) => all.filter((x) => x.id !== t.id));
            }}
            className={cn(
              "flex items-start gap-3 rounded-card border border-outline-variant bg-surface-bright p-3 shadow-raised",
              "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-2",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
              "data-[swipe=end]:animate-out data-[swipe=end]:fade-out-0",
            )}
          >
            <span
              aria-hidden="true"
              className={cn("mt-0.5 h-8 w-0.5 flex-none rounded-full", TONE_BAR[t.tone ?? "neutral"])}
            />
            <div className="min-w-0">
              <RadixToast.Title className="text-sm font-medium text-fg">
                {t.title}
              </RadixToast.Title>
              {t.description && (
                <RadixToast.Description className="mt-0.5 text-xs text-fg-muted">
                  {t.description}
                </RadixToast.Description>
              )}
            </div>
            <RadixToast.Close
              aria-label="Dismiss"
              className="ml-auto inline-flex h-6 w-6 flex-none items-center justify-center rounded-control text-fg-muted hover:text-fg"
            >
              ×
            </RadixToast.Close>
          </RadixToast.Root>
        ))}
        <RadixToast.Viewport className="fixed bottom-4 left-1/2 z-[var(--z-toast)] flex w-[min(92vw,22rem)] -translate-x-1/2 flex-col gap-2 outline-none" />
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
}
