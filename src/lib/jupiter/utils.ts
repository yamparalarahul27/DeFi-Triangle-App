import type { JsonRecord } from "./types";

export function num(v: unknown, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const parsed = Number(v);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

export function str(v: unknown): string {
  if (typeof v === "string") {
    return v.trim();
  }
  if (typeof v === "number" && Number.isFinite(v)) {
    return String(v);
  }
  return "";
}

export function asBool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") {
    const normalized = v.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  }
  return false;
}

export function rec(v: unknown): JsonRecord {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as JsonRecord)
    : {};
}

export function arr<T = unknown>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

export function toTimestampMs(value: unknown): number {
  const numeric = num(value, -1);
  if (numeric > 0) {
    return numeric > 1e11 ? numeric : numeric * 1000;
  }
  const parsed = Date.parse(str(value));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function pickUrl(raw: unknown): string {
  const candidate = str(raw);
  if (!candidate) return "";
  if (candidate.startsWith("http://") || candidate.startsWith("https://")) {
    return candidate;
  }
  return "";
}

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.floor(value)));
}

export async function mapWithConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>
): Promise<void> {
  const queue = [...items];
  const workers = Array.from(
    { length: Math.max(1, concurrency) },
    async () => {
      while (queue.length > 0) {
        const next = queue.shift();
        if (typeof next === "undefined") return;
        await worker(next);
      }
    }
  );
  await Promise.all(workers);
}

export function jupiterHeaders(): HeadersInit {
  const apiKey = process.env.JUPITER_API_KEY;
  if (!apiKey) throw new Error("JUPITER_API_KEY missing");
  return {
    Authorization: `Bearer ${apiKey}`,
    accept: "application/json",
  };
}

export function birdeyeHeaders(): HeadersInit {
  const apiKey = process.env.BIRDEYE_API_KEY;
  if (!apiKey) throw new Error("BIRDEYE_API_KEY missing");
  return {
    "X-API-KEY": apiKey,
    "x-chain": "solana",
    accept: "application/json",
  };
}

export function tokensXyzHeaders(): HeadersInit {
  const apiKey = process.env.TOKENS_XYZ_API_KEY;
  if (!apiKey) throw new Error("TOKENS_XYZ_API_KEY missing");
  return {
    "x-api-key": apiKey,
    accept: "application/json",
  };
}
