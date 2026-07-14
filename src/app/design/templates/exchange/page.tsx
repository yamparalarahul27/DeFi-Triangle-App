import type { Metadata } from "next";
import { Exchange } from "./Exchange";

export const metadata: Metadata = {
  title: "exchange · cids template",
  robots: { index: false, follow: false },
};

export default function ExchangeTemplatePage() {
  return <Exchange />;
}
