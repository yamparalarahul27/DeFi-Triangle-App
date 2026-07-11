import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FEATURES } from "@/lib/featureFlags";
import { FeedScreen } from "./FeedScreen";

export const metadata: Metadata = {
  title: "tide / feed",
  robots: { index: false, follow: false },
};

export default function FeedPage() {
  if (!FEATURES.DESIGN_GALLERY) notFound();
  return <FeedScreen />;
}
