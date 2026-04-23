export interface RiskInput {
  address: string;
  symbol: string;
  name: string;

  priceUsd: number;
  priceChange: { m5: number; h1: number; h6: number; h24: number };

  liquidityUsd: number;
  fdv: number;
  marketCap: number;

  volume: { m5: number; h1: number; h6: number; h24: number };

  txns: {
    m5: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h24: { buys: number; sells: number };
  };

  pairCreatedAt: number;

  dexId: string;
  socials: { type: string; url: string }[];
  websites: { url: string }[];
  imageUrl?: string;

  trendingRank?: number;
  holders?: number;
}

export type RiskLabel = "safe" | "caution" | "danger";
export type RiskFormula = "advanced" | "basic";

export interface RiskBucketInfo {
  score: number;
  max: number;
  status: string;
}

export interface RiskBreakdown {
  score: number;
  label: RiskLabel;
  buckets: {
    liquidity: RiskBucketInfo;
    flow: RiskBucketInfo;
    age: RiskBucketInfo;
    social: RiskBucketInfo;
    price: RiskBucketInfo;
    valuation: RiskBucketInfo;
  };
  warnings: string[];
  summary: string;
}

/**
 * IMPORTANT:
 * This is a market-structure / tradability risk score.
 * It is NOT a smart-contract security audit.
 *
 * "safe" here means relatively healthier market profile:
 * - better liquidity
 * - healthier trading flow
 * - less fragile valuation structure
 * - more survival time
 *
 * It does NOT verify:
 * - honeypots
 * - mint/freeze authority
 * - LP locks
 * - top-holder concentration
 * - insider/sniper wallets
 */

const clamp = (n: number, min = 0, max = 100): number =>
  Math.max(min, Math.min(max, n));

const pos = (n: number | undefined | null): number =>
  Number.isFinite(n as number) ? Math.max(0, n as number) : 0;

const safeDiv = (a: number, b: number, fallback = 0): number =>
  b > 0 ? a / b : fallback;

function pushIf(arr: string[], condition: boolean, value: string) {
  if (condition) arr.push(value);
}

const num = (v: unknown, fallback = 0): number => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const parsed = parseFloat(v);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

export function parseRiskFormula(value: unknown): RiskFormula {
  if (typeof value === "string" && value.toLowerCase() === "basic") {
    return "basic";
  }
  return "advanced";
}

function liquidityDepthStatus(liquidityUsd: number): string {
  if (liquidityUsd >= 500_000) return "Deep liquidity";
  if (liquidityUsd >= 100_000) return "Strong liquidity";
  if (liquidityUsd >= 25_000) return "Decent liquidity";
  if (liquidityUsd >= 10_000) return "Low liquidity";
  if (liquidityUsd >= 5_000) return "Thin liquidity";
  return "Very thin liquidity";
}

function liquidityBackingStatus(ratio: number): string {
  if (ratio >= 0.2) return "Strong liquidity backing";
  if (ratio >= 0.1) return "Healthy liquidity backing";
  if (ratio >= 0.05) return "Fair liquidity backing";
  if (ratio >= 0.02) return "Weak liquidity backing";
  return "Fragile liquidity backing";
}

function flowStatus(
  txns1h: number,
  buyShare1h: number,
  volToLiq1h: number,
  volumeAccel: number
): string {
  if (txns1h <= 2) return "Almost no activity";
  if (txns1h < 10) return "Light activity";

  if (buyShare1h < 0.2 || buyShare1h > 0.95) return "Extremely one-sided flow";
  if (buyShare1h < 0.3 || buyShare1h > 0.9) return "One-sided flow";

  if (volToLiq1h > 4) return "Overheated turnover";
  if (volumeAccel > 8) return "Sudden spike risk";
  if (txns1h >= 200) return "Strong activity";
  if (txns1h >= 50) return "Healthy activity";

  return "Building activity";
}

function ageStatus(ageHours: number): string {
  if (ageHours < 1) return "Just launched";
  if (ageHours < 6) return "Very new";
  if (ageHours < 24) return "New";
  if (ageHours < 72) return "Survived first day";
  if (ageHours <= 720) return "Established";
  return "Mature";
}

function socialStatus(
  socialCount: number,
  holders?: number,
  hasImage?: boolean
): string {
  if (socialCount === 0 && !hasImage && holders == null) return "No project signals";
  if (socialCount === 0) return "No project links";
  if (socialCount === 1) return "Minimal presence";
  if (socialCount === 2) return "Basic presence";
  if (socialCount === 3) return "Good presence";
  return "Strong presence";
}

function priceStatus(
  h1: number,
  h24: number,
  volToLiq1h: number,
  volToLiq24h: number,
  buyShare1h: number,
  volumeAccel: number,
  priceAccel: number
): string {
  const absH1 = Math.abs(h1);
  const absH24 = Math.abs(h24);

  if ((absH1 > 40 && volToLiq1h < 0.1) || (absH24 > 100 && volToLiq24h < 0.5)) {
    return "Thin-liquidity spike";
  }

  if ((h1 > 80 || h24 > 300) && (buyShare1h > 0.9 || volumeAccel > 8 || priceAccel > 8)) {
    return "Euphoric move risk";
  }

  if (h1 < -30 || h24 < -70) {
    return "Sharp downside risk";
  }

  if (h1 > -10 && h1 < 25 && h24 > -20 && h24 < 80) {
    return "Orderly price action";
  }

  if (h1 > -20 && h1 < 40 && h24 > -40 && h24 < 150) {
    return "Volatile but plausible";
  }

  return "Unstable price action";
}

function valuationStatus(ratio: number): string {
  if (ratio <= 5) return "Strong valuation support";
  if (ratio <= 10) return "Healthy valuation support";
  if (ratio <= 20) return "Fair valuation support";
  if (ratio <= 50) return "Stretched valuation";
  if (ratio <= 100) return "Very stretched valuation";
  return "Extreme valuation stretch";
}

function buildSummary(label: RiskLabel, warnings: string[], buckets: RiskBreakdown["buckets"]): string {
  if (label === "safe") {
    return `${buckets.liquidity.status}, ${buckets.flow.status}, ${buckets.age.status}.`;
  }
  if (label === "caution") {
    if (warnings.length > 0) {
      return `Mixed signals: ${warnings.slice(0, 2).join(", ")}.`;
    }
    return `Mixed signals across liquidity, flow, or valuation.`;
  }
  if (warnings.length > 0) {
    return `High tradability risk: ${warnings.slice(0, 3).join(", ")}.`;
  }
  return `High tradability risk due to weak market structure.`;
}

function getAdvancedRiskBreakdown(input: RiskInput): RiskBreakdown {
  const now = Date.now();

  const liquidity = pos(input.liquidityUsd);
  const marketCapOrFdv = pos(input.marketCap) > 0 ? pos(input.marketCap) : pos(input.fdv);
  const valuationBase = Math.max(marketCapOrFdv, pos(input.fdv));

  const ageHours =
    input.pairCreatedAt > 0
      ? Math.max(0, (now - input.pairCreatedAt) / 3_600_000)
      : 0;

  const txns5m = pos(input.txns.m5.buys) + pos(input.txns.m5.sells);
  const buys1h = pos(input.txns.h1.buys);
  const sells1h = pos(input.txns.h1.sells);
  const txns1h = buys1h + sells1h;

  const buyShare1h = txns1h > 0 ? buys1h / txns1h : 0.5;

  const vol1h = pos(input.volume.h1);
  const vol24h = pos(input.volume.h24);

  const liquidityToMcap = safeDiv(liquidity, marketCapOrFdv, 0);
  const volToLiq1h = safeDiv(vol1h, Math.max(liquidity, 1), 0);
  const volToLiq24h = safeDiv(vol24h, Math.max(liquidity, 1), 0);
  const volumeAccel = safeDiv(vol1h, Math.max(vol24h / 24, 1), 0);

  const h1 = input.priceChange.h1 ?? 0;
  const h24 = input.priceChange.h24 ?? 0;
  const absH1 = Math.abs(h1);
  const absH24 = Math.abs(h24);
  const priceAccel = safeDiv(absH1, Math.max(absH24 / 24, 0.25), 0);

  const socialCount = (input.socials?.length ?? 0) + (input.websites?.length ?? 0);
  const hasImage = Boolean(input.imageUrl);
  const holders = typeof input.holders === "number" ? input.holders : undefined;

  const valuationToLiquidity = safeDiv(valuationBase, Math.max(liquidity, 1), 999_999);

  // 1) Liquidity & exitability (0..30)
  let liquidityScore = 0;

  if (liquidity >= 500_000) liquidityScore += 18;
  else if (liquidity >= 100_000) liquidityScore += 16;
  else if (liquidity >= 25_000) liquidityScore += 12;
  else if (liquidity >= 10_000) liquidityScore += 8;
  else if (liquidity >= 5_000) liquidityScore += 4;

  if (liquidityToMcap >= 0.2) liquidityScore += 12;
  else if (liquidityToMcap >= 0.1) liquidityScore += 9;
  else if (liquidityToMcap >= 0.05) liquidityScore += 6;
  else if (liquidityToMcap >= 0.02) liquidityScore += 3;

  liquidityScore = clamp(liquidityScore, 0, 30);

  // 2) Trading flow quality (0..20)
  let flowScore = 0;

  if (txns1h >= 200) flowScore += 8;
  else if (txns1h >= 50) flowScore += 6;
  else if (txns1h >= 10) flowScore += 4;
  else if (txns1h >= 3) flowScore += 2;

  if (buyShare1h >= 0.45 && buyShare1h <= 0.75) flowScore += 6;
  else if (
    (buyShare1h >= 0.35 && buyShare1h < 0.45) ||
    (buyShare1h > 0.75 && buyShare1h <= 0.85)
  ) {
    flowScore += 3;
  } else if (txns1h >= 20 && (buyShare1h < 0.2 || buyShare1h > 0.95)) {
    flowScore -= 4;
  } else if (txns1h >= 10 && (buyShare1h < 0.3 || buyShare1h > 0.9)) {
    flowScore -= 2;
  }

  if (volToLiq1h >= 0.1 && volToLiq1h <= 1.5) flowScore += 6;
  else if (volToLiq1h >= 0.02 && volToLiq1h < 0.1) flowScore += 3;
  else if (volToLiq1h > 1.5 && volToLiq1h <= 4.0) flowScore += 2;
  else if (volToLiq1h > 4.0) flowScore -= 4;

  if (volumeAccel >= 0.5 && volumeAccel <= 4.0) flowScore += 3;
  else if (volumeAccel > 8.0) flowScore -= 3;

  if (txns5m >= 10) flowScore += 2;

  flowScore = clamp(flowScore, 0, 20);

  // 3) Age & survival (0..15)
  let ageScore = 0;

  if (ageHours >= 72 && ageHours <= 720) ageScore = 15;
  else if (ageHours >= 24) ageScore = 12;
  else if (ageHours >= 6) ageScore = 8;
  else if (ageHours >= 1) ageScore = 4;
  else ageScore = 1;

  if (ageHours > 720) ageScore = 11;

  // 4) Social / project presence (0..15)
  let socialScore = 0;

  if (socialCount >= 4) socialScore += 8;
  else if (socialCount === 3) socialScore += 6;
  else if (socialCount === 2) socialScore += 4;
  else if (socialCount === 1) socialScore += 2;

  if (hasImage) socialScore += 1;

  if (holders !== undefined) {
    if (holders >= 5_000) socialScore += 6;
    else if (holders >= 1_000) socialScore += 5;
    else if (holders >= 200) socialScore += 3;
    else if (holders >= 50) socialScore += 1;
    else if (ageHours > 6) socialScore -= 2;
  }

  if (typeof input.trendingRank === "number" && input.trendingRank > 0) {
    if (input.trendingRank <= 10 && liquidity >= 25_000 && txns1h >= 50) {
      socialScore += 2;
    } else if (input.trendingRank <= 50 && liquidity >= 10_000 && txns1h >= 20) {
      socialScore += 1;
    }
  }

  socialScore = clamp(socialScore, 0, 15);

  // 5) Price behavior (0..10)
  let priceScore = 0;

  if (h1 > -10 && h1 < 25 && h24 > -20 && h24 < 80) priceScore += 8;
  else if (h1 > -20 && h1 < 40 && h24 > -40 && h24 < 150) priceScore += 5;
  else priceScore += 2;

  if ((absH1 > 40 && volToLiq1h < 0.1) || (absH24 > 100 && volToLiq24h < 0.5)) {
    priceScore -= 4;
  }

  if ((h1 > 80 || h24 > 300) && (buyShare1h > 0.9 || volumeAccel > 8 || priceAccel > 8)) {
    priceScore -= 4;
  }

  if (h1 < -30 || h24 < -70) {
    priceScore -= 4;
  }

  priceScore = clamp(priceScore, 0, 10);

  // 6) Valuation sanity (0..10)
  let valuationScore = 0;

  if (valuationToLiquidity <= 5) valuationScore = 10;
  else if (valuationToLiquidity <= 10) valuationScore = 8;
  else if (valuationToLiquidity <= 20) valuationScore = 6;
  else if (valuationToLiquidity <= 50) valuationScore = 3;
  else if (valuationToLiquidity <= 100) valuationScore = 1;
  else valuationScore = 0;

  let score =
    liquidityScore +
    flowScore +
    ageScore +
    socialScore +
    priceScore +
    valuationScore;

  // Hard caps to stop obviously risky pairs from scoring "safe"
  let cap = 100;

  if (liquidity < 8_500) cap = Math.min(cap, 35);
  if (marketCapOrFdv > 0 && liquidityToMcap < 0.02) cap = Math.min(cap, 39);
  if (buys1h >= 20 && sells1h === 0) cap = Math.min(cap, 25);
  if (ageHours < 1 && socialCount === 0 && liquidity < 25_000) cap = Math.min(cap, 32);
  if (valuationToLiquidity > 100 && liquidity < 25_000) cap = Math.min(cap, 35);

  score = Math.min(score, cap);
  score = clamp(Math.round(score), 0, 100);

  const label: RiskLabel =
    score >= 70 ? "safe" : score >= 40 ? "caution" : "danger";

  const warnings: string[] = [];

  pushIf(warnings, liquidity < 5_000, "Very thin liquidity");
  pushIf(warnings, liquidity >= 5_000 && liquidity < 10_000, "Thin liquidity");
  pushIf(warnings, liquidityToMcap < 0.02, "Fragile liquidity backing");
  pushIf(warnings, txns1h <= 2, "Almost no activity");
  pushIf(warnings, txns1h >= 10 && (buyShare1h < 0.3 || buyShare1h > 0.9), "One-sided flow");
  pushIf(warnings, buys1h >= 20 && sells1h === 0, "No sells in the last hour");
  pushIf(warnings, volToLiq1h > 4, "Overheated turnover");
  pushIf(warnings, volumeAccel > 8, "Sudden volume spike");
  pushIf(warnings, ageHours < 1, "Ultra-fresh launch");
  pushIf(warnings, socialCount === 0, "No project links");
  pushIf(warnings, holders !== undefined && holders < 50 && ageHours > 6, "Weak holder growth");

  if (valuationToLiquidity > 100) {
    warnings.push("Extreme valuation stretch");
  } else if (valuationToLiquidity > 50) {
    warnings.push("Stretched valuation");
  }

  pushIf(warnings, (h1 < -30 || h24 < -70), "Sharp downside risk");
  pushIf(
    warnings,
    ((absH1 > 40 && volToLiq1h < 0.1) || (absH24 > 100 && volToLiq24h < 0.5)),
    "Thin-liquidity spike"
  );
  pushIf(
    warnings,
    ((h1 > 80 || h24 > 300) && (buyShare1h > 0.9 || volumeAccel > 8 || priceAccel > 8)),
    "Euphoric move risk"
  );

  const buckets: RiskBreakdown["buckets"] = {
    liquidity: {
      score: liquidityScore,
      max: 30,
      status: `${liquidityDepthStatus(liquidity)} · ${liquidityBackingStatus(liquidityToMcap)}`,
    },
    flow: {
      score: flowScore,
      max: 20,
      status: flowStatus(txns1h, buyShare1h, volToLiq1h, volumeAccel),
    },
    age: {
      score: ageScore,
      max: 15,
      status: ageStatus(ageHours),
    },
    social: {
      score: socialScore,
      max: 15,
      status: socialStatus(socialCount, holders, hasImage),
    },
    price: {
      score: priceScore,
      max: 10,
      status: priceStatus(h1, h24, volToLiq1h, volToLiq24h, buyShare1h, volumeAccel, priceAccel),
    },
    valuation: {
      score: valuationScore,
      max: 10,
      status: valuationStatus(valuationToLiquidity),
    },
  };

  return {
    score,
    label,
    buckets,
    warnings,
    summary: buildSummary(label, warnings, buckets),
  };
}

function getBasicRiskBreakdown(input: RiskInput): RiskBreakdown {
  let score = 100;

  if (input.liquidityUsd < 10_000) score -= 40;
  else if (input.liquidityUsd < 50_000) score -= 25;
  else if (input.liquidityUsd < 100_000) score -= 10;

  const priceChg = Math.abs(input.priceChange.h24);
  if (priceChg > 1000) score -= 35;
  else if (priceChg > 500) score -= 25;
  else if (priceChg > 200) score -= 15;
  else if (priceChg > 100) score -= 8;
  else if (priceChg > 50) score -= 3;

  const avgHourly = input.volume.h24 / 24;
  const volSpikePct =
    avgHourly > 0
      ? Math.abs((input.volume.h1 / avgHourly - 1) * 100)
      : 0;
  if (volSpikePct > 100_000) score -= 20;
  else if (volSpikePct > 10_000) score -= 12;
  else if (volSpikePct > 1_000) score -= 6;

  const mc = input.marketCap || input.fdv;
  if (mc > 0 && mc < 100_000) score -= 20;
  else if (mc < 500_000) score -= 10;
  else if (mc < 1_000_000) score -= 5;

  score = Math.max(0, Math.min(100, score));
  const label: RiskLabel = score >= 70 ? "safe" : score >= 40 ? "caution" : "danger";

  const warnings: string[] = [];
  pushIf(warnings, input.liquidityUsd < 10_000, "Very thin liquidity");
  pushIf(
    warnings,
    input.liquidityUsd >= 10_000 && input.liquidityUsd < 50_000,
    "Low liquidity"
  );
  pushIf(warnings, priceChg > 200, "High 24h price volatility");
  pushIf(warnings, volSpikePct > 1_000, "Sudden volume spike");
  pushIf(warnings, mc > 0 && mc < 100_000, "Micro-cap fragility");
  pushIf(warnings, mc <= 0, "Unknown valuation");

  const liquidityScore =
    input.liquidityUsd < 10_000
      ? 0
      : input.liquidityUsd < 50_000
        ? 10
        : input.liquidityUsd < 100_000
          ? 20
          : 30;
  const flowScore =
    volSpikePct > 100_000 ? 0 : volSpikePct > 10_000 ? 8 : volSpikePct > 1_000 ? 14 : 20;
  const priceScore =
    priceChg > 1000 ? 0 : priceChg > 500 ? 2 : priceChg > 200 ? 4 : priceChg > 100 ? 6 : priceChg > 50 ? 8 : 10;
  const valuationScore =
    mc > 0 && mc < 100_000 ? 0 : mc < 500_000 ? 5 : mc < 1_000_000 ? 7 : 10;

  const buckets: RiskBreakdown["buckets"] = {
    liquidity: {
      score: liquidityScore,
      max: 30,
      status:
        liquidityScore >= 20 ? "Adequate liquidity (Basic)" : "Liquidity risk (Basic)",
    },
    flow: {
      score: flowScore,
      max: 20,
      status:
        flowScore >= 14
          ? "Stable volume flow (Basic)"
          : "Volume spike risk (Basic)",
    },
    age: {
      score: 8,
      max: 15,
      status: "Not included in Basic formula",
    },
    social: {
      score: 8,
      max: 15,
      status: "Not included in Basic formula",
    },
    price: {
      score: priceScore,
      max: 10,
      status:
        priceScore >= 8
          ? "Orderly 24h move (Basic)"
          : "Volatile 24h move (Basic)",
    },
    valuation: {
      score: valuationScore,
      max: 10,
      status:
        valuationScore >= 7
          ? "Healthy valuation (Basic)"
          : "Valuation caution (Basic)",
    },
  };

  const summary =
    label === "safe"
      ? "Basic formula shows healthier liquidity, volatility, and valuation."
      : label === "caution"
        ? "Basic formula shows mixed liquidity/volatility/valuation signals."
        : "Basic formula flags elevated tradability risk.";

  return {
    score,
    label,
    buckets,
    warnings,
    summary,
  };
}

export function getRiskBreakdown(
  input: RiskInput,
  formula: RiskFormula = "advanced"
): RiskBreakdown {
  return formula === "basic"
    ? getBasicRiskBreakdown(input)
    : getAdvancedRiskBreakdown(input);
}

export function calcRiskScore(
  input: RiskInput,
  formula: RiskFormula = "advanced"
): number {
  return getRiskBreakdown(input, formula).score;
}

export function riskLabel(score: number): RiskLabel {
  const s = clamp(Number.isFinite(score) ? score : 0, 0, 100);
  if (s >= 70) return "safe";
  if (s >= 40) return "caution";
  return "danger";
}

export function scoreWithLabel(
  input: RiskInput,
  formula: RiskFormula = "advanced"
): { score: number; label: RiskLabel } {
  const breakdown = getRiskBreakdown(input, formula);
  return { score: breakdown.score, label: breakdown.label };
}

export function toRiskInputFromDexScreener(pair: any): RiskInput {
  const base = pair?.baseToken ?? {};
  const info = pair?.info ?? {};
  const priceChange = pair?.priceChange ?? {};
  const volume = pair?.volume ?? {};
  const txns = pair?.txns ?? {};
  const liquidity = pair?.liquidity ?? {};

  return {
    address: base.address ?? pair?.pairAddress ?? "",
    symbol: base.symbol ?? "",
    name: base.name ?? "",

    priceUsd: num(pair?.priceUsd),
    priceChange: {
      m5: num(priceChange.m5),
      h1: num(priceChange.h1),
      h6: num(priceChange.h6),
      h24: num(priceChange.h24),
    },

    liquidityUsd: num(liquidity.usd),
    fdv: num(pair?.fdv),
    marketCap: num(pair?.marketCap) || num(pair?.fdv),

    volume: {
      m5: num(volume.m5),
      h1: num(volume.h1),
      h6: num(volume.h6),
      h24: num(volume.h24),
    },

    txns: {
      m5: { buys: num(txns.m5?.buys), sells: num(txns.m5?.sells) },
      h1: { buys: num(txns.h1?.buys), sells: num(txns.h1?.sells) },
      h6: { buys: num(txns.h6?.buys), sells: num(txns.h6?.sells) },
      h24: { buys: num(txns.h24?.buys), sells: num(txns.h24?.sells) },
    },

    pairCreatedAt: num(pair?.pairCreatedAt),

    dexId: pair?.dexId ?? "",
    socials: Array.isArray(info.socials) ? info.socials : [],
    websites: Array.isArray(info.websites) ? info.websites : [],
    imageUrl: info.imageUrl,
  };
}

export function toRiskInputFromBirdeye(token: any): RiskInput {
  const emptyTxn = { buys: 0, sells: 0 };

  return {
    address: token?.address ?? "",
    symbol: token?.symbol ?? "",
    name: token?.name ?? "",

    priceUsd: num(token?.price),
    priceChange: {
      m5: 0,
      h1: 0,
      h6: 0,
      h24: num(token?.price24hChangePercent ?? token?.priceChange24hPercent),
    },

    liquidityUsd: num(token?.liquidity),
    fdv: num(token?.fdv),
    marketCap: num(token?.marketcap ?? token?.marketCap) || num(token?.fdv),

    volume: {
      m5: 0,
      h1: 0,
      h6: 0,
      h24: num(token?.volume24hUSD ?? token?.volume24h),
    },

    txns: { m5: emptyTxn, h1: emptyTxn, h6: emptyTxn, h24: emptyTxn },

    pairCreatedAt: 0,

    dexId: "",
    socials: [],
    websites: [],
    imageUrl: token?.logoURI,

    trendingRank: typeof token?.rank === "number" ? token.rank : undefined,
  };
}
