"use client";

import Link from "next/link";
import { useState } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { StatusDot } from "@/components/ui/StatusDot";

export default function ArchivePage() {
  const [paused, setPaused] = useState(false);

  return (
    <>
      <Header hasHero={false} />
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-3 sm:px-4 lg:px-6 py-6 space-y-4">
        <section className="bg-white rounded-sm border border-[#cbd5e1] p-5 sm:p-6">
          <div className="text-[10px] uppercase tracking-wider text-[#6a7282] mb-2">
            Archive
          </div>
          <h1 className="text-lg sm:text-xl font-semibold text-[#11274d]">
            Archive Workspace
          </h1>
          <p className="text-sm text-[#6a7282] mt-2 max-w-2xl">
            This page hosts archive-oriented controls.
          </p>
          <ArchiveLiveControl
            paused={paused}
            onToggle={() => setPaused((v) => !v)}
          />
          <Link
            href="/"
            className="inline-flex mt-4 text-xs text-[#19549b] hover:text-[#143f78] transition-colors"
          >
            ← Back to dashboard
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}

function ArchiveLiveControl({
  paused,
  onToggle,
}: {
  paused: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="mt-4 inline-flex items-center gap-3 rounded-sm border border-[#cbd5e1] bg-[#f8fafc] px-3 py-2">
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={!paused}
        aria-label={paused ? "Resume live updates" : "Pause live updates"}
        className="h-7 px-2 rounded-sm text-xs bg-white border border-[#cbd5e1] text-[#11274d] hover:bg-[#e2e8f0] transition-colors inline-flex items-center gap-1.5"
      >
        <StatusDot
          variant={paused ? "warning" : "live"}
          pulse={!paused}
        />
        <span>{paused ? "Paused" : "Live"}</span>
      </button>
      <span className="text-xs text-[#6a7282]">
        Live updates control (archive-only)
      </span>
    </div>
  );
}
