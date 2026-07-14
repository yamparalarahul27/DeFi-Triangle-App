import type { Metadata } from "next";
import { SimpleDapp } from "./SimpleDapp";

export const metadata: Metadata = {
  title: "simple dapp · cids template",
  robots: { index: false, follow: false },
};

export default function SimpleDappTemplatePage() {
  return <SimpleDapp />;
}
