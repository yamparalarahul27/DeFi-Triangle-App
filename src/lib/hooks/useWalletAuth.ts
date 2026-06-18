"use client";

import {
  useUnifiedWallet,
  useUnifiedWalletContext,
} from "@jup-ag/wallet-adapter";
import bs58 from "bs58";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "@/components/providers/SessionContext";

/**
 * Wallet sign-in orchestration: nonce → signMessage → verify → session.
 *
 * Extracted from the old ConnectWalletButton during the UI-revamp clean-shell so
 * the auth flow lives in the engine, not in presentation. The rebuilt Connect
 * button consumes this hook and only renders. See docs/engine-contract.md §5.
 */
export type WalletAuthPhase = "idle" | "signing";

export interface WalletAuthState {
  /** Verified wallet address from the session, or null if not signed in. */
  authedWallet: string | null;
  phase: WalletAuthPhase;
  error: string | null;
  /** Open the wallet-adapter modal to begin connecting. */
  connect: () => void;
  /** Disconnect the wallet and clear the server session. */
  logout: () => Promise<void>;
}

export function useWalletAuth(): WalletAuthState {
  const { connected, publicKey, signMessage, disconnect } = useUnifiedWallet();
  const { setShowModal } = useUnifiedWalletContext();
  const { wallet: authedWallet, setWallet } = useSession();

  const [phase, setPhase] = useState<WalletAuthPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const flowStartedRef = useRef(false);

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

  const connect = useCallback(() => {
    setError(null);
    setShowModal(true);
  }, [setShowModal]);

  const logout = useCallback(async () => {
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

  return { authedWallet, phase, error, connect, logout };
}
