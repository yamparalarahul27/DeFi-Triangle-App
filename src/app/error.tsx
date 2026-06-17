"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[route-error]", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 text-center">
      <div className="max-w-md">
        <div className="text-[10px] uppercase tracking-[0.2em] text-fg-muted mb-3">
          Something went wrong
        </div>
        <h1 className="text-fg font-bold text-2xl sm:text-3xl leading-tight mb-3">
          We hit a snag rendering this page.
        </h1>
        <p className="text-fg-muted text-sm mb-6">
          This is usually temporary. Try again, or head back to home.
        </p>
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="h-10 px-5 rounded-sm bg-brand text-on-brand text-sm font-semibold hover:bg-brand-hover transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="h-10 px-5 rounded-sm bg-surface-container border border-outline-variant text-fg text-sm font-semibold hover:bg-surface-page transition-colors inline-flex items-center"
          >
            ← Home
          </Link>
        </div>
        {error.digest && (
          <div className="mt-6 text-[10px] font-mono text-fg-muted/60">
            ref: {error.digest}
          </div>
        )}
      </div>
    </div>
  );
}
