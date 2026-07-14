import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ComponentPage } from "./ComponentPage";

// /design/<Component> — one page per component (roadmap §6), statically
// generated from the design-system folders. The doc + source are read
// from disk at build time — the same files the canvas Inspector renders,
// so the page cannot drift from the code it documents.

const DS = join(process.cwd(), "src/design-system");

function componentNames(): string[] {
  return readdirSync(DS)
    .filter((n) => {
      try {
        return (
          statSync(join(DS, n)).isDirectory() &&
          statSync(join(DS, n, `${n}.doc.md`)).isFile()
        );
      } catch {
        return false;
      }
    })
    .sort();
}

export function generateStaticParams() {
  return componentNames().map((component) => ({ component }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ component: string }>;
}): Promise<Metadata> {
  const { component } = await params;
  return {
    title: `${component} · cids`,
    robots: { index: false, follow: false },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ component: string }>;
}) {
  const { component } = await params;
  const names = componentNames();
  const idx = names.indexOf(component);
  if (idx === -1) notFound();

  const doc = readFileSync(join(DS, component, `${component}.doc.md`), "utf8");
  const source = readFileSync(join(DS, component, `${component}.tsx`), "utf8");
  const status = doc.match(/^Status: (\w+)$/m)?.[1] ?? "draft";
  const version = doc.match(/^Version: ([\d.]+)$/m)?.[1] ?? "0.0.0";
  const prev = names[(idx - 1 + names.length) % names.length];
  const next = names[(idx + 1) % names.length];

  return (
    <ComponentPage
      name={component}
      doc={doc}
      source={source}
      status={status}
      version={version}
      prev={prev}
      next={next}
    />
  );
}
