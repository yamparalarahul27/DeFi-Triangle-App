import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FEATURES } from "@/lib/featureFlags";
import { CanvasApp } from "./CanvasApp";

export const metadata: Metadata = {
  title: "cids / canvas",
  robots: { index: false, follow: false },
};

export default function CanvasPage() {
  if (!FEATURES.DESIGN_GALLERY) notFound();
  return <CanvasApp />;
}
