"use client";

import { Dialog as RadixDialog } from "radix-ui";
import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Centered modal (Sheet's desktop-centered sibling). Behavior is Radix
 * Dialog: focus trap, Escape + overlay-click dismiss, focus restore.
 * Title is required — a dialog must name itself.
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Optional supporting line under the title (wired to aria-describedby). */
  description?: string;
  children?: ReactNode;
  /** Action row — typically Buttons; pinned under the body. */
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
            "fixed left-1/2 top-1/2 z-[var(--z-modal)] w-[min(92vw,26rem)] -translate-x-1/2 -translate-y-1/2",
            "rounded-sheet border border-outline-variant bg-surface p-5 shadow-overlay",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
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
          {children && <div className="text-sm text-fg">{children}</div>}
          {footer && (
            <div className="mt-5 flex items-center justify-end gap-2">
              {footer}
            </div>
          )}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
