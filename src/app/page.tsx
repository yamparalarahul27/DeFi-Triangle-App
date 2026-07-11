import type { Metadata } from "next";
import { ID_HUES } from "@/design-system";

export const metadata: Metadata = {
  title: "cids — crypto interface design system",
  description:
    "Live components, tokens, and patterns for crypto UIs — inspect them on an infinite canvas.",
};

const LINKS = [
  {
    href: "/design/canvas",
    label: "Open canvas",
    note: "desktop",
    primary: true,
  },
  { href: "/design", label: "Component gallery", note: "mobile-friendly", primary: false },
  { href: "/design/feed", label: "Live demo screen", note: "the system as an app", primary: false },
] as const;

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-surface-page px-6 text-fg">
      <div className="w-full max-w-md">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-geist-mono), monospace" }}
        >
          cids <span className="text-brand">~</span>
        </h1>
        <p className="mt-1 font-mono text-xs uppercase tracking-[0.14em] text-fg-subtle">
          crypto interface design system
        </p>
        <p className="mt-4 text-pretty text-sm leading-relaxed text-fg-muted">
          Live React components, semantic tokens, and the patterns crypto UIs
          rebuild badly every time — signed price direction, wallet-hashed
          identity, peg status, social proof. Browse them on an infinite
          canvas, inspect the doc a human and an AI agent both build from,
          and flip themes live.
        </p>

        {/* identity hues as the one decorative touch */}
        <div className="mt-5 flex gap-1.5" aria-hidden="true">
          {ID_HUES.map((hue) => (
            <span
              key={hue}
              className="h-2 w-2 rounded-full"
              style={{ background: `var(--id-${hue})` }}
            />
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-2">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={
                l.primary
                  ? "flex items-baseline justify-between rounded-sm bg-brand px-4 py-3 text-sm font-semibold text-on-brand transition-transform active:scale-[0.98]"
                  : "flex items-baseline justify-between rounded-sm border border-outline bg-surface-container px-4 py-3 text-sm font-semibold text-fg transition-transform active:scale-[0.98]"
              }
            >
              {l.label}
              <span
                className={
                  l.primary
                    ? "font-mono text-[10px] font-normal opacity-70"
                    : "font-mono text-[10px] font-normal text-fg-subtle"
                }
              >
                {l.note}
              </span>
            </a>
          ))}
        </div>

        <p className="mt-8 font-mono text-[10px] text-fg-subtle">
          themes: dark · mono — 11 components, every one ships its .doc.md
        </p>
      </div>
    </main>
  );
}
