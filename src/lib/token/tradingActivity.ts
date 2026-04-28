import type {
  BirdeyeWindowsByKey,
  BirdeyeWindowKey,
} from "@/lib/token/utils";
import type {
  JupiterWindowsByKey,
  JupiterWindowKey,
} from "@/components/token/MetaStrip";

export type WindowKey =
  | "1m"
  | "5m"
  | "30m"
  | "1h"
  | "2h"
  | "4h"
  | "6h"
  | "8h"
  | "24h";

const ORDERED_KEYS: WindowKey[] = [
  "1m",
  "5m",
  "30m",
  "1h",
  "2h",
  "4h",
  "6h",
  "8h",
  "24h",
];

const WINDOW_LABELS: Record<WindowKey, string> = {
  "1m": "1m",
  "5m": "5m",
  "30m": "30m",
  "1h": "1h",
  "2h": "2h",
  "4h": "4h",
  "6h": "6h",
  "8h": "8h",
  "24h": "24h",
};

export interface WindowMetrics {
  key: WindowKey;
  label: string;
  // Birdeye-sourced
  volumeUsd: number | null;
  buyVolumeUsd: number | null;
  sellVolumeUsd: number | null;
  buys: number | null;
  sells: number | null;
  trades: number | null;
  uniqueWallets: number | null;
  pctChange: number | null;
  // Jupiter-sourced
  jupiterNumBuys: number | null; // Jupiter's own buy count (paired with numOrganicBuyers for ratio)
  numNetBuyers: number | null;
  numOrganicBuyers: number | null;
  organicVolumeUsd: number | null;
}

export interface MultiWindowData {
  windows: WindowMetrics[];
}

export function buildMultiWindowData(
  birdeye: BirdeyeWindowsByKey | undefined,
  jupiter: JupiterWindowsByKey | undefined | null
): MultiWindowData | null {
  const windows: WindowMetrics[] = [];

  for (const key of ORDERED_KEYS) {
    const b = birdeye ? readBirdeye(birdeye, key) : null;
    const j = jupiter ? readJupiter(jupiter, key) : null;

    if (!b && !j) continue;

    const organicBuyVol = j?.buyOrganicVolumeUsd ?? null;
    const organicSellVol = j?.sellOrganicVolumeUsd ?? null;
    const organicVolumeUsd =
      organicBuyVol != null || organicSellVol != null
        ? (organicBuyVol ?? 0) + (organicSellVol ?? 0)
        : null;

    const metrics: WindowMetrics = {
      key,
      label: WINDOW_LABELS[key],
      volumeUsd: b?.volumeUsd ?? null,
      buyVolumeUsd: b?.buyVolumeUsd ?? j?.buyVolumeUsd ?? null,
      sellVolumeUsd: b?.sellVolumeUsd ?? j?.sellVolumeUsd ?? null,
      buys: b?.buys ?? j?.numBuys ?? null,
      sells: b?.sells ?? j?.numSells ?? null,
      trades: b?.trades ?? null,
      uniqueWallets: b?.uniqueWallets ?? null,
      pctChange: b?.priceChangePct ?? j?.priceChangePct ?? null,
      jupiterNumBuys: j?.numBuys ?? null,
      numNetBuyers: j?.numNetBuyers ?? null,
      numOrganicBuyers: j?.numOrganicBuyers ?? null,
      organicVolumeUsd,
    };

    if (hasAnyData(metrics)) windows.push(metrics);
  }

  return windows.length > 0 ? { windows } : null;
}

function readBirdeye(map: BirdeyeWindowsByKey, key: WindowKey) {
  // Birdeye doesn't have a "6h" key.
  if (key === "6h") return null;
  return map[key as BirdeyeWindowKey] ?? null;
}

function readJupiter(map: JupiterWindowsByKey, key: WindowKey) {
  if (key === "5m" || key === "1h" || key === "6h" || key === "24h") {
    return map[key as JupiterWindowKey] ?? null;
  }
  return null;
}

function hasAnyData(m: WindowMetrics): boolean {
  return (
    m.volumeUsd != null ||
    m.buyVolumeUsd != null ||
    m.sellVolumeUsd != null ||
    m.buys != null ||
    m.sells != null ||
    m.trades != null ||
    m.uniqueWallets != null ||
    m.pctChange != null ||
    m.numNetBuyers != null ||
    m.numOrganicBuyers != null ||
    m.organicVolumeUsd != null
  );
}
