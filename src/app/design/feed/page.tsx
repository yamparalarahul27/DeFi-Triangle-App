import type { Metadata } from "next";
import { FeedScreen } from "./FeedScreen";

export const metadata: Metadata = {
  title: "tide / feed",
  robots: { index: false, follow: false },
};

export default function FeedPage() {
  return <FeedScreen />;
}
