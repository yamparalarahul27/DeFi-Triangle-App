"use client";

import { useEffect, useMemo, useState } from "react";
import { fmtNum, truncateAddr } from "@/lib/format";

const securityCache = new Map<
  string,
  { data: Record<string, unknown> | null; error: string | null }
>();

export type SecuritySignal = { label: string; value: string };

export function useTokenSecurity(address: string): {
  signals: SecuritySignal[];
  loading: boolean;
  error: string | null;
} {
  const [security, setSecurity] = useState<Record<string, unknown> | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setSecurity(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const cached = securityCache.get(address);
    if (cached) {
      setSecurity(cached.data);
      setError(cached.error);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    (async () => {
      try {
        const res = await fetch(
          `/api/birdeye?type=security&address=${encodeURIComponent(address)}`,
          { cache: "no-store" }
        );
        const json = res.ok ? await res.json() : null;

        const data =
          json?.success && json?.data && typeof json.data === "object"
            ? (json.data as Record<string, unknown>)
            : null;

        const normalizedError =
          data === null
            ? normalizeSecurityError(
                typeof json?.error === "string" ? json.error : null
              )
            : null;

        securityCache.set(address, { data, error: normalizedError });
        if (!cancelled) {
          setSecurity(data);
          setError(normalizedError);
        }
      } catch {
        const fallbackError = "Security data unavailable right now.";
        securityCache.set(address, { data: null, error: fallbackError });
        if (!cancelled) {
          setSecurity(null);
          setError(fallbackError);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [address]);

  const signals = useMemo(() => toSecuritySignals(security), [security]);
  return { signals, loading, error };
}

function normalizeSecurityError(raw: string | null): string {
  const msg = (raw ?? "").toLowerCase();
  if (!msg) return "Security data unavailable for this token.";
  if (
    msg.includes("sufficient permissions") ||
    msg.includes("permission") ||
    msg.includes("unauthorized")
  ) {
    return "Security endpoint is not available on the current Birdeye API plan.";
  }
  return raw ?? "Security data unavailable for this token.";
}

function toSecuritySignals(
  security: Record<string, unknown> | null
): SecuritySignal[] {
  if (!security) return [];
  const items: SecuritySignal[] = [];

  pushBooleanSignal(items, security, "Verified", [
    "is_verified",
    "isVerified",
    "verified",
  ]);
  pushBooleanSignal(items, security, "Mintable", [
    "is_mintable",
    "isMintable",
    "mintable",
  ]);
  pushBooleanSignal(items, security, "Freezable", [
    "is_freezable",
    "isFreezable",
    "freezable",
  ]);
  pushBooleanSignal(items, security, "Token 2022", [
    "is_token_2022",
    "isToken2022",
    "token2022",
  ]);
  pushBooleanSignal(items, security, "Transfer Fee", [
    "transfer_fee_enable",
    "transferFeeEnable",
  ]);
  pushBooleanSignal(items, security, "Non-transferable", [
    "non_transferable",
    "nonTransferable",
  ]);
  pushBooleanSignal(items, security, "Honeypot Risk", [
    "is_honeypot",
    "isHoneypot",
  ]);

  pushNumberSignal(items, security, "Top 10 Holders", [
    "top10_holder_rate",
    "top10_holder_percent",
    "top10HolderPercent",
  ]);
  pushNumberSignal(items, security, "Holder Count", [
    "holder",
    "holder_count",
    "holderCount",
  ]);

  const owner = readString(security, ["owner_address", "ownerAddress"]);
  if (owner) items.push({ label: "Owner", value: truncateAddr(owner) });

  const creator = readString(security, ["creator_address", "creatorAddress"]);
  if (creator) items.push({ label: "Creator", value: truncateAddr(creator) });

  return items;
}

function pushBooleanSignal(
  items: SecuritySignal[],
  source: Record<string, unknown>,
  label: string,
  keys: string[]
) {
  const bool = readBoolean(source, keys);
  if (bool !== null) {
    items.push({ label, value: bool ? "Yes" : "No" });
  }
}

function pushNumberSignal(
  items: SecuritySignal[],
  source: Record<string, unknown>,
  label: string,
  keys: string[]
) {
  const n = readNumber(source, keys);
  if (n === null) return;
  if (label === "Top 10 Holders") {
    const asPct = n <= 1 ? n * 100 : n;
    items.push({ label, value: `${asPct.toFixed(2)}%` });
    return;
  }
  items.push({ label, value: fmtNum(n) });
}

function readBoolean(
  source: Record<string, unknown>,
  keys: string[]
): boolean | null {
  const value = readRaw(source, keys);
  if (typeof value === "boolean") return value;
  if (typeof value === "number")
    return value === 1 ? true : value === 0 ? false : null;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") return true;
    if (normalized === "false" || normalized === "0") return false;
  }
  return null;
}

function readNumber(
  source: Record<string, unknown>,
  keys: string[]
): number | null {
  const value = readRaw(source, keys);
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function readString(
  source: Record<string, unknown>,
  keys: string[]
): string | null {
  const value = readRaw(source, keys);
  if (typeof value === "string" && value.trim()) return value;
  return null;
}

function readRaw(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    if (key in source) return source[key];
  }
  return null;
}
