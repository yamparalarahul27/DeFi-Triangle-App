import Link from "next/link";

export const metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-6 text-center"
      style={{
        background:
          "linear-gradient(135deg, #467FFF 0%, #5F7CF8 47%, #1847BB 100%)",
      }}
    >
      <div className="max-w-md">
        <div className="mx-auto mb-6 w-20 h-20 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/defi_logo_white.svg"
            alt=""
            aria-hidden="true"
            className="w-full h-full"
          />
        </div>
        <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-white/60 mb-3">
          404 · Not found
        </div>
        <h1
          className="text-white font-bold leading-tight tracking-tight"
          style={{
            fontFamily:
              "var(--font-geist-mono), 'IBM Plex Mono', ui-monospace, monospace",
            fontSize: "clamp(1.75rem, 5vw, 3rem)",
          }}
        >
          This page doesn&apos;t exist
        </h1>
        <p className="text-white/75 text-sm sm:text-base mt-3">
          The address you&apos;re looking for may have been moved, archived,
          or never existed.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 h-10 px-5 rounded-sm bg-white text-[#11274d] text-sm font-semibold hover:bg-white/90 transition-colors"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
