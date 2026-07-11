"use client";

import { Dialog as RadixDialog } from "radix-ui";
import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Sheet({
  open,
  onOpenChange,
  title,
  children,
  footer,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Shown in the header and used as the accessible dialog title. */
  title: ReactNode;
  children: ReactNode;
  /** Optional pinned-bottom region (comment input, CTA…). */
  footer?: ReactNode;
  className?: string;
}) {
  // Drag-to-dismiss on the handle/header. Backdrop-tap, Escape, and the
  // close button are Radix-native and always work; this only adds the
  // downward flick. dragY tracks finger travel; release past the threshold
  // closes, otherwise it springs back.
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef<number | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    startY.current = e.clientY;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (startY.current === null) return;
    const dy = e.clientY - startY.current;
    if (dy > 0) setDragY(dy);
  };
  const endDrag = () => {
    if (dragY > 120) onOpenChange(false);
    setDragY(0);
    setDragging(false);
    startY.current = null;
  };

  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <RadixDialog.Content
          aria-describedby={undefined}
          style={{
            transform: dragY ? `translateY(${dragY}px)` : undefined,
            transition: dragging ? "none" : "transform var(--motion-settle)",
          }}
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[85dvh] max-w-[430px] flex-col rounded-t-xl border border-b-0 border-outline-variant bg-surface shadow-2xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
            className,
          )}
        >
          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            className="flex-none touch-none cursor-grab pt-2.5 active:cursor-grabbing"
          >
            <div className="mx-auto h-1 w-8 rounded-full bg-outline" />
            <div className="flex items-center justify-between px-4 py-3">
              <RadixDialog.Title className="text-sm font-semibold text-fg">
                {title}
              </RadixDialog.Title>
              <RadixDialog.Close
                aria-label="Close"
                className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-fg-muted transition-colors hover:bg-surface-container-high hover:text-fg"
              >
                ×
              </RadixDialog.Close>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">{children}</div>

          {footer && (
            <div
              className="flex-none border-t border-outline-variant p-3"
              style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}
            >
              {footer}
            </div>
          )}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
