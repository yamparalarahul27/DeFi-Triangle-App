"use client";

import { Tooltip as RadixTooltip } from "radix-ui";
import type { ReactNode } from "react";

export function Tooltip({
  content,
  children,
  side = "top",
}: {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
}) {
  return (
    <RadixTooltip.Provider delayDuration={150}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            side={side}
            sideOffset={4}
            className="z-50 max-w-[260px] rounded-sm bg-[#11274d] px-2.5 py-1.5 text-[11px] leading-snug text-white shadow-md data-[state=delayed-open]:animate-in data-[state=closed]:animate-out data-[state=delayed-open]:fade-in-0 data-[state=closed]:fade-out-0"
          >
            {content}
            <RadixTooltip.Arrow className="fill-[#11274d]" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
