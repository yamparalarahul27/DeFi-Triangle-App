"use client";

import { UnifiedWalletProvider } from "@jup-ag/wallet-adapter";
import type { ReactNode } from "react";
import { SessionProvider } from "./SessionContext";

export function Providers({ children }: { children: ReactNode }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <UnifiedWalletProvider
      wallets={[]}
      config={{
        autoConnect: false,
        env: "mainnet-beta",
        metadata: {
          name: "DeFi Triangle",
          description: "Token Edge",
          url: appUrl,
          iconUrls: [],
        },
        theme: "light",
        lang: "en",
      }}
    >
      <SessionProvider>{children}</SessionProvider>
    </UnifiedWalletProvider>
  );
}
