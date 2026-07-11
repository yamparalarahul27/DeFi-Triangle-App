"use client";

import { cn } from "@/lib/utils";
import { Avatar } from "../Avatar";
import { Sheet } from "../Sheet";

export type HandleAvailability = "idle" | "checking" | "available" | "taken";

function shortAddr(addr: string) {
  return addr.length > 10 ? `${addr.slice(0, 4)}…${addr.slice(-4)}` : addr;
}

const AVAILABILITY_COPY: Record<HandleAvailability, { text: string; cls: string } | null> = {
  idle: null,
  checking: { text: "checking…", cls: "text-fg-subtle" },
  available: { text: "✓ available", cls: "text-buy" },
  taken: { text: "taken", cls: "text-sell" },
};

export function Onboarding({
  open,
  onOpenChange,
  walletAddress,
  onConnectWallet,
  handle,
  onHandleChange,
  availability = "idle",
  onJoin,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Connected → the wallet step collapses to a checked row. */
  walletAddress?: string | null;
  onConnectWallet?: () => void;
  handle: string;
  onHandleChange: (value: string) => void;
  availability?: HandleAvailability;
  onJoin: () => void;
}) {
  const connected = Boolean(walletAddress);
  const avail = AVAILABILITY_COPY[availability];
  const canJoin = connected && availability === "available";

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Join the tide">
      <div className="space-y-4 pt-1">
        {/* Step 1 — wallet */}
        {connected ? (
          <div className="flex items-center gap-2 rounded-lg bg-surface-container px-3 py-2.5 text-sm">
            <span className="text-buy" aria-hidden="true">
              ✓
            </span>
            <span className="text-fg">wallet connected</span>
            <span className="ml-auto font-mono text-xs text-fg-subtle">
              {shortAddr(walletAddress!)}
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={onConnectWallet}
            className="w-full rounded-sm border border-outline bg-transparent px-3 py-2.5 text-sm font-semibold text-fg transition-transform active:scale-[0.98]"
          >
            Connect wallet
          </button>
        )}

        {/* Step 2 — handle + live avatar preview */}
        <div className={cn("space-y-2", !connected && "pointer-events-none opacity-40")}>
          <div className="flex items-center gap-3">
            <Avatar name={handle || "?"} seed={handle || "preview"} size={40} />
            <div className="flex min-w-0 flex-1 items-center gap-1 rounded-sm bg-surface-container px-3 py-2.5">
              <span className="font-mono text-sm text-fg-subtle">@</span>
              <input
                value={handle}
                onChange={(e) =>
                  onHandleChange(
                    e.target.value.replace(/[^a-z0-9_]/gi, "").toLowerCase(),
                  )
                }
                placeholder="handle"
                className="min-w-0 flex-1 bg-transparent font-mono text-sm text-fg placeholder:text-fg-subtle focus:outline-none"
              />
              {avail && (
                <span className={cn("flex-none text-[11px]", avail.cls)}>
                  {avail.text}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={onJoin}
          disabled={!canJoin}
          className="w-full rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-on-brand transition-transform active:scale-[0.98] disabled:opacity-40"
        >
          Join the tide
        </button>
      </div>
    </Sheet>
  );
}
