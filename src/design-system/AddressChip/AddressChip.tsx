"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const truncate = (addr: string) =>
  addr.length <= 10 ? addr : `${addr.slice(0, 4)}…${addr.slice(-4)}`;

/**
 * Wallet/mint address: truncated mono display, one-tap copy with
 * confirmation, optional explorer link. The full address is always the
 * accessible name — truncation is visual only.
 */
export function AddressChip({
  address,
  href,
  className,
}: {
  address: string;
  /** Explorer URL — renders a ↗ link when present. */
  href?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-chip border border-outline-variant bg-surface-container px-1.5 py-0.5",
        className,
      )}
    >
      <span className="font-mono text-xs text-fg" aria-label={address}>
        {truncate(address)}
      </span>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : `Copy address ${address}`}
        className={cn(
          "inline-flex h-6 w-6 items-center justify-center rounded-control text-xs transition-colors duration-150",
          copied ? "text-buy" : "text-fg-muted hover:text-fg",
        )}
      >
        {copied ? "✓" : "⧉"}
      </button>
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label="View on explorer"
          className="inline-flex h-6 w-6 items-center justify-center rounded-control text-xs text-fg-muted transition-colors duration-150 hover:text-fg"
        >
          ↗
        </a>
      )}
    </span>
  );
}
