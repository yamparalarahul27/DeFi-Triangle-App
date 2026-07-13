import { cn } from "@/lib/utils";

export type TxState = "idle" | "signing" | "pending" | "confirmed" | "failed";

// The transaction lifecycle, visible at every step (ethereum.org
// heuristic #1) — the component no reference library ships.
const COPY: Record<TxState, string> = {
  idle: "Ready",
  signing: "Waiting for wallet…",
  pending: "Pending confirmation…",
  confirmed: "Confirmed",
  failed: "Failed",
};

const DOT: Record<TxState, string> = {
  idle: "bg-fg-subtle",
  signing: "bg-warning animate-pulse",
  pending: "bg-info animate-pulse",
  confirmed: "bg-buy",
  failed: "bg-sell",
};

const TEXT: Record<TxState, string> = {
  idle: "text-fg-muted",
  signing: "text-warning",
  pending: "text-info",
  confirmed: "text-buy",
  failed: "text-sell",
};

export function TxStatus({
  state,
  detail,
  className,
}: {
  state: TxState;
  /** Optional line under the label (signature, error hint…). */
  detail?: string;
  className?: string;
}) {
  return (
    // Live region: state changes are announced without stealing focus —
    // the user acts in the wallet while the UI reports (heuristic #2).
    <div role="status" aria-live="polite" className={cn("inline-flex items-start gap-2", className)}>
      <span
        aria-hidden="true"
        className={cn("mt-1 h-2 w-2 flex-none rounded-full", DOT[state])}
      />
      <span className="min-w-0">
        <span className={cn("block text-sm font-medium", TEXT[state])}>
          {state === "confirmed" ? "✓ " : state === "failed" ? "✕ " : ""}
          {COPY[state]}
        </span>
        {detail && (
          <span className="block truncate font-mono text-[11px] text-fg-subtle">
            {detail}
          </span>
        )}
      </span>
    </div>
  );
}
