import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type AlertTone = "info" | "success" | "warning" | "error";

// Inline callout on the tinted-surface pairs — the states-catalog
// pattern's hand-rolled error row / offline strip, made canonical.
// Word + tint together (never color alone); in-flow, next to what it
// describes — Toast is for events, Alert is for conditions.
const TONE = {
  info: { box: "bg-info-surface", text: "text-info", word: "note" },
  success: { box: "bg-success-surface", text: "text-success", word: "ok" },
  warning: { box: "bg-warning-surface", text: "text-warning", word: "warning" },
  error: { box: "bg-error-surface", text: "text-error", word: "error" },
} as const;

export function Alert({
  tone = "info",
  title,
  children,
  action,
  className,
}: {
  tone?: AlertTone;
  title: string;
  /** Supporting line(s). */
  children?: ReactNode;
  /** Right-aligned affordance — typically a small Button (e.g. Retry). */
  action?: ReactNode;
  className?: string;
}) {
  const t = TONE[tone];
  return (
    <div
      // Conditions the user is looking at: assertive only for errors.
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start justify-between gap-3 rounded-card p-3",
        t.box,
        className,
      )}
    >
      <div className="min-w-0">
        <p className={cn("text-sm font-medium", t.text)}>
          <span className="mr-1.5 font-mono text-[10px] uppercase tracking-wider opacity-70">
            {t.word}
          </span>
          {title}
        </p>
        {children && <div className="mt-1 text-xs text-fg-muted">{children}</div>}
      </div>
      {action && <div className="flex-none">{action}</div>}
    </div>
  );
}
