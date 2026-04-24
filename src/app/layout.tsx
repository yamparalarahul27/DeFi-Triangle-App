import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Agentation } from "agentation";
import { Providers } from "@/components/providers/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "DeFi Triangle — Solana token intelligence",
    template: "%s · DeFi Triangle",
  },
  description:
    "Trending Solana markets, variants, and risk — scored in real time. Backed by Birdeye, Jupiter, and Tokens.xyz.",
  openGraph: {
    title: "DeFi Triangle — Solana token intelligence",
    description:
      "Trending Solana markets, variants, and risk — scored in real time.",
    type: "website",
    siteName: "DeFi Triangle",
  },
  twitter: {
    card: "summary_large_image",
    title: "DeFi Triangle — Solana token intelligence",
    description:
      "Trending Solana markets, variants, and risk — scored in real time.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f1f5f9] text-[#212121] pb-14">
        <Providers>{children}</Providers>
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  );
}
