"use client";

// Template: the simple dApp (cids-roadmap Phase 6 / handoff 6b) — the
// consumer end of the range claim. Mobile-first, comfortable density,
// built ONLY from design-system exports. Mock data, mock wallet.

import { useEffect, useRef, useState } from "react";
import {
  AddressChip,
  AmountInput,
  Button,
  Dialog,
  EmptyState,
  NetworkBadge,
  PriceChange,
  StatCell,
  ToastProvider,
  TxStatus,
  useToast,
  type TxState,
} from "@/design-system";

const WALLET = "7xKtF3aB9cD2eF4gH6jK8mN1pQ5rS7tU9vW2xY4z9fQ2";

function Dapp() {
  const toast = useToast();
  const [connected, setConnected] = useState(false);
  const [amt, setAmt] = useState("");
  const [review, setReview] = useState(false);
  const [tx, setTx] = useState<TxState>("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const sign = () => {
    setReview(false);
    setTx("signing");
    timers.current.push(
      setTimeout(() => setTx("pending"), 1400),
      setTimeout(() => {
        setTx("confirmed");
        toast({ title: "Send confirmed", description: `${amt} SOL`, tone: "buy" });
      }, 3200),
    );
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col gap-4 bg-surface-page p-4 text-fg">
      {/* header: connect is a session, not a signature — verb table */}
      <header className="flex items-center justify-between">
        <span className="font-mono text-sm font-semibold">
          simple dapp <span className="text-brand">~</span>
        </span>
        {connected ? (
          <span className="flex items-center gap-2">
            <NetworkBadge name="Solana" />
            <AddressChip address={WALLET} />
          </span>
        ) : (
          <Button variant="primary" size="sm" onClick={() => setConnected(true)}>
            Connect
          </Button>
        )}
      </header>

      {!connected ? (
        <EmptyState
          className="flex-1"
          title="Nothing here yet"
          hint="Connect to see your balances — reading is free."
          action={
            <Button variant="primary" onClick={() => setConnected(true)}>
              Connect
            </Button>
          }
        />
      ) : (
        <>
          {/* balances */}
          <div className="grid grid-cols-2 divide-x divide-outline-variant rounded-card border border-outline-variant bg-surface-container">
            <StatCell label="SOL" value="12.4821" change={<PriceChange value={3.6} />} />
            <StatCell label="USDC" value="1,204.10" change={<PriceChange value={0.0} />} />
          </div>

          {/* send card */}
          <div className="space-y-3 rounded-card border border-outline-variant bg-surface-container p-4">
            <div className="text-[10px] uppercase tracking-wider text-fg-subtle">Send</div>
            <AmountInput
              value={amt}
              onValueChange={setAmt}
              symbol="SOL"
              fiatValue={amt ? `≈ $${(Number(amt) * 184.26).toFixed(2)}` : undefined}
              onMax={() => setAmt("12.4821")}
              disabled={tx === "signing" || tx === "pending"}
            />
            <div className="flex items-center justify-between gap-3">
              <TxStatus state={tx} detail={tx === "pending" ? "5D3k…Wq signature" : undefined} />
              {tx === "confirmed" || tx === "failed" ? (
                <Button size="sm" onClick={() => setTx("idle")}>Reset</Button>
              ) : (
                <Button
                  size="sm"
                  variant="primary"
                  disabled={!Number(amt) || tx === "signing" || tx === "pending"}
                  onClick={() => setReview(true)}
                >
                  Send
                </Button>
              )}
            </div>
          </div>

          <Dialog
            open={review}
            onOpenChange={(o) => !o && setReview(false)}
            title="Review send"
            description="You'll confirm this in your wallet."
            footer={
              <>
                <Button onClick={() => setReview(false)}>Cancel</Button>
                <Button variant="primary" onClick={sign}>Confirm</Button>
              </>
            }
          >
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="data-md text-fg">{amt} SOL</span>
              <span className="text-fg-subtle">→</span>
              <AddressChip address={WALLET} />
            </div>
          </Dialog>
        </>
      )}

      <footer className="mt-auto pt-2 text-center font-mono text-[10px] text-fg-subtle">
        cids template · DS components only ·{" "}
        <a href="/design/canvas" className="underline-offset-2 hover:underline">canvas</a>
      </footer>
    </div>
  );
}

export function SimpleDapp() {
  return (
    <ToastProvider>
      <Dapp />
    </ToastProvider>
  );
}
