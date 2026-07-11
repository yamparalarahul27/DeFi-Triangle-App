import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { FEATURES } from "@/lib/featureFlags";
import { CanvasApp } from "./CanvasApp";

export const metadata: Metadata = {
  title: "cids / canvas",
  robots: { index: false, follow: false },
};

// Read every component's colocated .doc.md at render time — the inspector
// shows the real file (the same one agents read), so it can never drift
// from the source.
function readDocs(): Record<string, string> {
  const root = join(process.cwd(), "src/design-system");
  const docs: Record<string, string> = {};
  for (const dir of readdirSync(root, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const p = join(root, dir.name, `${dir.name}.doc.md`);
    if (existsSync(p)) docs[dir.name] = readFileSync(p, "utf8");
  }
  return docs;
}

export default function CanvasPage() {
  if (!FEATURES.DESIGN_GALLERY) notFound();
  return <CanvasApp docs={readDocs()} />;
}
