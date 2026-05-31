import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Under maintenance · DeFi Triangle",
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <main className="min-h-dvh flex items-center justify-center bg-[var(--background)] px-6 py-16">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center gap-2 text-[var(--frost-500)] mb-8">
          <span className="font-[family-name:var(--font-geist-mono)] text-sm tracking-tight">
            ◐ DeFi Triangle
          </span>
        </div>

        <h1 className="font-[family-name:var(--font-geist-mono)] text-2xl font-medium text-[var(--ink)] mb-4 text-balance">
          Working on improvements
        </h1>

        <p className="text-[var(--ink)]/70 text-sm leading-relaxed text-pretty">
          Back shortly. Thanks for your patience.
        </p>
      </div>
    </main>
  );
}
