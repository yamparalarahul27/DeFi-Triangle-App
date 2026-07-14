import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Avatar,
  AvatarGroup,
  TokenChip,
  SocialProofChip,
  PostCard,
  ID_HUES,
} from "@/design-system";
import { InteractiveDemos } from "./InteractiveDemos";
import { ThemeToggle } from "./ThemeToggle";

export const metadata: Metadata = {
  title: "tide / design",
  robots: { index: false, follow: false },
};

// Section label matching DESIGN.md .label-section (uppercase, tracked, subtle).
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-fg-subtle">
      {children}
    </h2>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3">{children}</div>;
}

const SURFACES = [
  ["dim", "bg-surface-dim"],
  ["page", "bg-surface-page"],
  ["surface", "bg-surface"],
  ["container", "bg-surface-container"],
  ["high", "bg-surface-container-high"],
  ["bright", "bg-surface-bright"],
] as const;

const WATCHERS = [
  { name: "mira", seed: "wallet-mira" },
  { name: "kip", seed: "wallet-kip" },
  { name: "nova", seed: "wallet-nova" },
  { name: "aria", seed: "wallet-aria" },
  { name: "sol", seed: "wallet-sol" },
];

export default function DesignGalleryPage() {

  return (
    <main className="mx-auto min-h-dvh max-w-[430px] bg-surface-page px-4 pb-24 pt-6 text-fg">
      <header className="mb-8">
        <h1
          className="text-xl font-bold text-fg"
          style={{ fontFamily: "var(--font-geist-mono), monospace" }}
        >
          tide <span className="text-brand">~</span>{" "}
          <span className="text-fg-subtle">/ design</span>
        </h1>
        <p className="mt-2 text-pretty text-sm text-fg-muted">
          Live gallery of <code>src/design-system/</code>. Numbers are the hero;
          identity hues carry people, never data.
        </p>
        <div className="mt-3"><ThemeToggle /></div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/design/feed"
            className="inline-flex items-center gap-1 rounded-sm border border-outline bg-surface-container px-3 py-1.5 text-xs font-semibold text-fg"
          >
            See it as a screen → /design/feed
          </Link>
          <Link
            href="/design/canvas"
            className="inline-flex items-center gap-1 rounded-sm border border-outline bg-surface-container px-3 py-1.5 text-xs font-semibold text-fg"
          >
            Open canvas → /design/canvas <span className="text-fg-subtle">(desktop)</span>
          </Link>
        </div>
      </header>

      <div className="space-y-9">
        {/* ── Foundations ─────────────────────────────────────── */}
        <section>
          <SectionLabel>Foundations · surfaces</SectionLabel>
          <div className="grid grid-cols-3 gap-2">
            {SURFACES.map(([label, cls]) => (
              <div key={label}>
                <div
                  className={`h-12 rounded-lg border border-outline-variant ${cls}`}
                />
                <div className="mt-1 text-[10px] text-fg-subtle">{label}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionLabel>Foundations · identity hues</SectionLabel>
          <Row>
            {ID_HUES.map((hue) => (
              <div key={hue} className="text-center">
                <Avatar name={hue} hue={hue} size="md" />
                <div className="mt-1 text-[10px] text-fg-subtle">{hue}</div>
              </div>
            ))}
          </Row>
          <p className="mt-2 text-[11px] text-fg-subtle">
            hash(wallet) % 8 · tide reserved for you · AA-verified
          </p>
        </section>

        {/* ── Components ──────────────────────────────────────── */}
        <section>
          <SectionLabel>Avatar · sizes</SectionLabel>
          <Row>
            <Avatar name="Mira" seed="wallet-mira" size="xs" />
            <Avatar name="Mira" seed="wallet-mira" size="sm" />
            <Avatar name="Mira" seed="wallet-mira" size="md" />
            <Avatar name="Mira" seed="wallet-mira" size="lg" />
            <Avatar name="You" you size="md" />
          </Row>
          <p className="mt-2 text-[11px] text-fg-subtle">
            20 · 28 · 40 · 64 · you (tide)
          </p>
        </section>

        <section>
          <SectionLabel>AvatarGroup</SectionLabel>
          <div className="space-y-3">
            <AvatarGroup members={WATCHERS} />
            <AvatarGroup members={WATCHERS} max={5} size="sm" />
          </div>
          <p className="mt-2 text-[11px] text-fg-subtle">
            −8px overlap · +N overflow · 2px ring
          </p>
        </section>

        <section>
          <SectionLabel>TokenChip · both directions</SectionLabel>
          <div className="flex flex-col items-start gap-3">
            <TokenChip symbol="JUP" price="$0.8123" change24h={4.2} />
            <TokenChip symbol="BONK" price="$0.0000213" change24h={-1.31} />
            <TokenChip symbol="SOL" price="$182.40" change24h={0} />
          </div>
          <p className="mt-2 text-[11px] text-fg-subtle">
            direction from sign (▲ buy / ▼ sell) · number from magnitude
          </p>
        </section>

        <section>
          <SectionLabel>SocialProofChip</SectionLabel>
          <Row>
            <SocialProofChip count={41} />
            <SocialProofChip count={41} compact />
            <SocialProofChip count={7} label="holding" />
          </Row>
        </section>

        <section>
          <SectionLabel>PostCard · milestone</SectionLabel>
          <div className="space-y-3">
            <PostCard
              kind="milestone"
              direction="up"
              time="1h"
              body="@kip's JUP watch crossed +25% since they flagged it."
            />
            <PostCard
              kind="milestone"
              direction="down"
              time="3h"
              body="BONK broke below its 24h floor — watchers notified."
            />
          </div>
        </section>

        <section>
          <SectionLabel>Motion + PostCard · interactive</SectionLabel>
          <InteractiveDemos />
          <p className="mt-2 text-[11px] text-fg-subtle">
            tap ♥ = spring-pop · Follow morphs 200ms · Lane fill = state
          </p>
        </section>

        <section>
          <SectionLabel>All components — pages</SectionLabel>
          <div className="flex flex-wrap gap-x-3 gap-y-1.5">
            {componentNames().map((n) => (
              <Link
                key={n}
                href={`/design/${n}`}
                className="font-mono text-xs text-fg-muted underline-offset-2 hover:text-fg hover:underline"
              >
                {n}
              </Link>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-fg-subtle">
            one page per component — live demo · doc · source, rendered
            from the same files as the canvas inspector
          </p>
        </section>
      </div>
    </main>
  );
}

function componentNames(): string[] {
  return readdirSync(join(process.cwd(), "src/design-system"))
    .filter((n) => {
      try {
        return statSync(join(process.cwd(), "src/design-system", n, `${n}.doc.md`)).isFile();
      } catch {
        return false;
      }
    })
    .sort();
}
