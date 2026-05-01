export function fmtUsd(
  n: number | null | undefined,
  opts: { compact?: boolean } = {}
): string {
  if (n == null || !Number.isFinite(n)) return "—";
  if (opts.compact) {
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  }
  if (n >= 1) return `$${n.toFixed(2)}`;
  if (n >= 0.01) return `$${n.toFixed(4)}`;
  if (n > 0) return `$${n.toPrecision(3)}`;
  return "$0";
}

export function fmtPct(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

/**
 * Unsigned magnitude — for sites where the direction is conveyed by an icon
 * or color, and the text should show only the magnitude (no "+" / "-").
 * Use this instead of fmtPct(Math.abs(x)), which paradoxically prefixes "+"
 * since the abs value is positive — making negative changes display as
 * "+2.03%" in red. See DexCard / SearchRow.
 */
export function fmtPctMagnitude(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${Math.abs(n).toFixed(2)}%`;
}

export function fmtNum(
  n: number | null | undefined,
  opts: { compact?: boolean } = {}
): string {
  if (n == null || !Number.isFinite(n)) return "—";
  if (opts.compact) {
    if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  }
  return n.toLocaleString();
}

export function fmtAge(msSinceEpoch: number | null | undefined): string {
  if (!msSinceEpoch || !Number.isFinite(msSinceEpoch)) return "—";
  const diff = Date.now() - msSinceEpoch;
  if (diff < 0) return "—";
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "<1m";
  if (min < 60) return `${min}m`;
  const hr = Math.floor(diff / 3_600_000);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(diff / 86_400_000);
  if (day < 30) return `${day}d`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo`;
  return `${Math.floor(day / 365)}y`;
}

export function truncateAddr(addr: string | null | undefined): string {
  if (!addr) return "—";
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}
