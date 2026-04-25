"use client";

import { Sparkles } from "lucide-react";

function abbreviateWallet(addr: string | null): string {
  if (!addr || addr.length < 9) return addr ?? "";
  return `${addr.slice(0, 4)}···${addr.slice(-4)}`;
}

function timeOfDayGreeting(): "morning" | "afternoon" | "evening" {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 18) return "afternoon";
  return "evening";
}

export interface GreetingRowProps {
  wallet: string | null;
}

export function GreetingRow({ wallet }: GreetingRowProps) {
  const greeting = timeOfDayGreeting();
  const display = abbreviateWallet(wallet);

  return (
    <div className="flex items-center gap-2 py-3">
      <Sparkles className="w-4 h-4 text-[#11274d]" />
      <h1 className="text-lg sm:text-xl font-semibold text-[#11274d] tracking-tight">
        Good {greeting}
        {display && (
          <>
            ,{" "}
            <span className="font-mono text-[#11274d]/70">{display}</span>
          </>
        )}
      </h1>
    </div>
  );
}
