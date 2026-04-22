"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface SessionValue {
  wallet: string | null;
  loaded: boolean;
  setWallet: (w: string | null) => void;
  refresh: () => Promise<void>;
}

const SessionContext = createContext<SessionValue>({
  wallet: null,
  loaded: false,
  setWallet: () => {},
  refresh: async () => {},
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setWallet(typeof data?.wallet === "string" ? data.wallet : null);
      } else {
        setWallet(null);
      }
    } catch {
      setWallet(null);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <SessionContext.Provider value={{ wallet, loaded, setWallet, refresh }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionValue {
  return useContext(SessionContext);
}
