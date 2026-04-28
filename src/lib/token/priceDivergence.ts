// Price-source divergence — checks whether the prices we pull from
// independent sources agree. Healthy when they agree closely; flagged
// when they spread (data quality issue, arbitrage, or stale cache).

export interface PriceSource {
  name: string;
  price: number | null | undefined;
}

export interface DivergenceSource {
  name: string;
  price: number;
}

export interface DivergenceResult {
  sources: DivergenceSource[];
  spreadPct: number; // (max - min) / median * 100
  median: number;
  min: number;
  max: number;
  healthy: boolean;
  tone: "safe" | "caution" | "risk";
  label: string;
}

/** A spread up to this much is treated as "healthy". Tunable. */
export const DEFAULT_HEALTHY_THRESHOLD_PCT = 1;
/** Above this we consider it materially divergent. */
export const DEFAULT_RISK_THRESHOLD_PCT = 3;
const MIN_SOURCES = 2;

export function computeDivergence(
  inputs: PriceSource[],
  options?: { healthyThresholdPct?: number; riskThresholdPct?: number }
): DivergenceResult | null {
  const sources: DivergenceSource[] = [];
  for (const s of inputs) {
    if (typeof s.price === "number" && Number.isFinite(s.price) && s.price > 0) {
      sources.push({ name: s.name, price: s.price });
    }
  }
  if (sources.length < MIN_SOURCES) return null;

  const prices = sources.map((s) => s.price).sort((a, b) => a - b);
  const min = prices[0];
  const max = prices[prices.length - 1];
  const median =
    prices.length % 2 === 1
      ? prices[(prices.length - 1) / 2]
      : (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2;

  const spreadPct = median > 0 ? ((max - min) / median) * 100 : 0;

  const healthyThreshold =
    options?.healthyThresholdPct ?? DEFAULT_HEALTHY_THRESHOLD_PCT;
  const riskThreshold =
    options?.riskThresholdPct ?? DEFAULT_RISK_THRESHOLD_PCT;

  let tone: "safe" | "caution" | "risk";
  let label: string;
  if (spreadPct <= healthyThreshold) {
    tone = "safe";
    label = `${sources.length} sources within ${spreadPct.toFixed(2)}%`;
  } else if (spreadPct <= riskThreshold) {
    tone = "caution";
    label = `${sources.length} sources · spread ${spreadPct.toFixed(2)}%`;
  } else {
    tone = "risk";
    label = `${sources.length} sources · spread ${spreadPct.toFixed(2)}%`;
  }

  return {
    sources,
    spreadPct,
    median,
    min,
    max,
    healthy: tone === "safe",
    tone,
    label,
  };
}
