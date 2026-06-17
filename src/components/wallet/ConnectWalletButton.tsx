"use client";

import {
  useUnifiedWallet,
  useUnifiedWalletContext,
} from "@jup-ag/wallet-adapter";
import bs58 from "bs58";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "@/components/providers/SessionContext";

type Phase = "idle" | "signing";

function truncate(address: string): string {
  if (address.length <= 9) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function ConnectWalletButton() {
  const { connected, publicKey, signMessage, disconnect } = useUnifiedWallet();
  const { setShowModal } = useUnifiedWalletContext();
  const { wallet: authedWallet, setWallet } = useSession();

  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const flowStartedRef = useRef(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!connected || !publicKey || authedWallet) return;
    if (flowStartedRef.current) return;
    flowStartedRef.current = true;

    (async () => {
      try {
        if (!signMessage) throw new Error("wallet does not support signMessage");
        setPhase("signing");
        setError(null);

        const walletAddr = publicKey.toBase58();

        const nonceRes = await fetch("/api/auth/nonce", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ wallet: walletAddr }),
        });
        if (!nonceRes.ok) throw new Error("nonce request failed");
        const { nonce, message } = (await nonceRes.json()) as {
          nonce: string;
          message: string;
        };

        const sigBytes = await signMessage(new TextEncoder().encode(message));
        const signature = bs58.encode(sigBytes);

        const verifyRes = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ wallet: walletAddr, signature, nonce }),
        });
        if (!verifyRes.ok) throw new Error("verify failed");
        const { wallet: verified } = (await verifyRes.json()) as {
          wallet: string;
        };

        setWallet(verified);
      } catch (e) {
        console.error("[sign-in] failed:", e);
        setError("Sign-in failed, please try again.");
        try {
          await disconnect();
        } catch {
          // ignore
        }
      } finally {
        setPhase("idle");
        flowStartedRef.current = false;
      }
    })();
  }, [connected, publicKey, authedWallet, signMessage, disconnect, setWallet]);

  useEffect(() => {
    if (!menuOpen) return;
    function onDocClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const handleConnect = useCallback(() => {
    setError(null);
    setShowModal(true);
  }, [setShowModal]);

  const handleLogout = useCallback(async () => {
    setMenuOpen(false);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    try {
      await disconnect();
    } catch {
      // ignore
    }
    setWallet(null);
  }, [disconnect, setWallet]);

  if (authedWallet) {
    return (
      <div className="relative inline-block" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="h-7 px-3 rounded-sm bg-surface-container border border-outline-variant text-fg text-xs font-mono hover:bg-surface-container-high transition-colors inline-flex items-center gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-buy" />
          <span>{truncate(authedWallet)}</span>
          <span
            className={`text-[10px] transition-transform ${menuOpen ? "rotate-180" : ""}`}
          >
            ▾
          </span>
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-8 z-30 bg-surface-container border border-outline-variant rounded-sm min-w-[240px] py-1 shadow-md">
            <div className="px-3 py-2 border-b border-outline-variant">
              <div className="text-[10px] uppercase tracking-wider text-fg-muted">
                Connected
              </div>
              <div className="font-mono text-[11px] text-fg break-all mt-1">
                {authedWallet}
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-xs text-fg hover:bg-surface-page transition-colors"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="inline-block">
      <button
        type="button"
        disabled={phase === "signing"}
        onClick={handleConnect}
        className="h-7 px-3 rounded-sm bg-surface-container border border-outline-variant text-fg text-xs hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {phase === "signing" ? "Signing…" : "Connect Wallet"}
      </button>
      {error && (
        <div className="text-[11px] text-sell mt-1">{error}</div>
      )}
    </div>
  );
}
