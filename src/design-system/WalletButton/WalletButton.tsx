import { Button } from "../Button";
import { cn } from "@/lib/utils";

export type WalletStatus = "disconnected" | "connecting" | "connected";

const truncate = (addr: string) =>
  addr.length <= 10 ? addr : `${addr.slice(0, 4)}…${addr.slice(-4)}`;

/**
 * The connect-wallet atom (Reown's territory, tokens-native): one
 * button, three states. Presentational — wire `onClick` to your wallet
 * adapter's connect when disconnected, and to your account UI (Drawer,
 * Menu) when connected. Disconnect lives in that account UI, never on
 * this button — accidental disconnects are hostile.
 */
export function WalletButton({
  status,
  address,
  onClick,
  className,
}: {
  status: WalletStatus;
  /** Connected wallet address — required when status="connected". */
  address?: string;
  /** disconnected → connect; connected → open account UI. */
  onClick?: () => void;
  className?: string;
}) {
  if (status === "connected" && address) {
    return (
      <Button
        variant="secondary"
        onClick={onClick}
        aria-label={`Wallet ${address} — open account`}
        className={cn("font-mono", className)}
      >
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-buy" />
        {truncate(address)}
      </Button>
    );
  }
  if (status === "connecting") {
    return (
      <Button variant="secondary" disabled className={className}>
        <span aria-hidden="true" className="h-1.5 w-1.5 animate-pulse rounded-full bg-warning" />
        Connecting…
      </Button>
    );
  }
  return (
    <Button variant="primary" onClick={onClick} className={className}>
      Connect wallet
    </Button>
  );
}
