"use client";

import { Dialog as RadixDialog } from "radix-ui";
import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Side sheet on Radix Dialog — Sheet's desktop sibling (Sheet slides
 * from the bottom for thumbs; Drawer slides from an edge for pointers).
 * Focus trap, Escape + overlay dismiss, focus restore — all Radix.
 * Title is required — a drawer must name itself.
 */
export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  side = "right",
  children,
  footer,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Optional supporting line under the title (wired to aria-describedby). */
  description?: string;
  side?: "right" | "left";
  children?: ReactNode;
  /** Action row — pinned to the bottom edge. */
  footer?: ReactNode;
  /** Merged onto the panel. */
  className?: string;
}) {
  const descId = useId();
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-[var(--z-modal)] bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <RadixDialog.Content
          aria-describedby={description ? descId : ""}
          className={cn(
            "fixed inset-y-0 z-[var(--z-modal)] flex w-[min(88vw,340px)] flex-col bg-surface p-5 shadow-overlay",
            side === "right"
              ? "right-0 border-l border-outline-variant data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right"
              : "left-0 border-r border-outline-variant data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
            className,
          )}
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <RadixDialog.Title className="text-sm font-semibold text-fg">
                {title}
              </RadixDialog.Title>
              {description && (
                <RadixDialog.Description id={descId} className="mt-1 text-xs text-fg-muted">
                  {description}
                </RadixDialog.Description>
              )}
            </div>
            <RadixDialog.Close
              aria-label="Close"
              className="-mr-1 -mt-1 inline-flex h-7 w-7 flex-none items-center justify-center rounded-control text-fg-muted transition-colors hover:bg-surface-container-high hover:text-fg"
            >
              ×
            </RadixDialog.Close>
          </div>
          {children && <div className="min-h-0 flex-1 overflow-y-auto text-sm text-fg">{children}</div>}
          {footer && (
            <div className="mt-4 flex items-center justify-end gap-2 pb-[env(safe-area-inset-bottom)]">
              {footer}
            </div>
          )}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
