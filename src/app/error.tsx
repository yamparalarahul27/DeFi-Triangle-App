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
        <div className="text-[10px] uppercase tracking-[0.2em] text-[#6a7282] mb-3">
          Something went wrong
        </div>
        <h1 className="text-[#11274d] font-bold text-2xl sm:text-3xl leading-tight mb-3">
          We hit a snag rendering this page.
        </h1>
        <p className="text-[#6a7282] text-sm mb-6">
          This is usually temporary. Try again, or head back to home.
        </p>
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="h-10 px-5 rounded-sm bg-[#19549b] text-white text-sm font-semibold hover:bg-[#143f78] transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="h-10 px-5 rounded-sm bg-white border border-[#cbd5e1] text-[#11274d] text-sm font-semibold hover:bg-[#f1f5f9] transition-colors inline-flex items-center"
          >
            ← Home
          </Link>
        </div>
        {error.digest && (
          <div className="mt-6 text-[10px] font-mono text-[#6a7282]/60">
            ref: {error.digest}
          </div>
        )}
      </div>
    </div>
  );
}
