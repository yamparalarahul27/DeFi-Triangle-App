import type { Metadata } from "next";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { CanvasApp } from "./CanvasApp";

export const metadata: Metadata = {
  title: "cids / canvas",
  robots: { index: false, follow: false },
};

// Read every component's colocated .doc.md AND its .tsx source at render
// time — the inspector shows the real files (the same ones agents read),
// so neither can drift from the source.
function readComponentFiles() {
  const root = join(process.cwd(), "src/design-system");
  const docs: Record<string, string> = {};
  const sources: Record<string, string> = {};
  for (const dir of readdirSync(root, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const doc = join(root, dir.name, `${dir.name}.doc.md`);
    const src = join(root, dir.name, `${dir.name}.tsx`);
    if (existsSync(doc)) docs[dir.name] = readFileSync(doc, "utf8");
    if (existsSync(src)) sources[dir.name] = readFileSync(src, "utf8");
  }
  return { docs, sources };
}

export default function CanvasPage() {
  const { docs, sources } = readComponentFiles();
  return <CanvasApp docs={docs} sources={sources} />;
}
