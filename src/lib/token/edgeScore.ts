// Edge Score — fully attributed composite safety score.
// Fuses three independent sources:
//   - Helius (chain-truth):     authoritative on-chain mint/freeze authority + mutability
//   - Jupiter (audit):          cross-verification of mint/freeze authority status
//   - Tokens.xyz (risk inputs): liquidity, volume, mint time, market cap
//
// Each signal contributes 0..weight. Final score = sum / sum(weights of available
// signals) * 100, so a token with fewer available signals isn't artificially
// penalized for missing data — it just has fewer dimensions of evidence.
//
// Burnt is treated as an instant disqualifier (score = 0).

export type EdgeSource = "Helius" | "Jupiter" | "Tokens.xyz";

export interface ChainTruth {
  mintAuthorityRenounced: boolean | null;
  freezeAuthorityRenounced: boolean | null;
  mutable: boolean | null;
  burnt: boolean | null;
}

export interface JupiterAudit {
  mintAuthorityDisabled: boolean | null;
  freezeAuthorityDisabled: boolean | null;
}

export interface TokensXyzRiskInputs {
  liquidityUsd: number | null;
  marketCapUsd: number | null;
  volume24hUsd: number | null;
  volume7dUsd: number | null;
  tokenMintTimeMs: number | null;
}

export interface EdgeScoreInputs {
  chainTruth: ChainTruth | null;
  audit: JupiterAudit | null;
  riskInputs: TokensXyzRiskInputs | null;
}

export interface BreakdownEntry {
  name: string;
  source: EdgeSource;
  value: string;
  contribution: number;
  weight: number;
  hasData: boolean;
}

export type EdgeGrade = "A" | "B" | "C" | "D" | "F";

export interface EdgeScoreResult {
  score: number;
  grade: EdgeGrade;
  label: string;
  tone: "safe" | "caution" | "risk";
  breakdown: BreakdownEntry[];
  signalCount: number;
  hasEnoughSignals: boolean;
}

const WEIGHTS = {
  mintAuthority: 25,
  freezeAuthority: 20,
  immutability: 5,
  liquidity: 15,
  volume24h: 10,
  volume7d: 5,
  age: 15,
  marketCap: 5,
} as const;

const MIN_SIGNALS = 3;

export function computeEdgeScore(inputs: EdgeScoreInputs): EdgeScoreResult | null {
  if (!inputs.chainTruth && !inputs.audit && !inputs.riskInputs) return null;

  const breakdown: BreakdownEntry[] = [];

  // Burnt — instant disqualifier
  const burnt = inputs.chainTruth?.burnt === true;
  if (burnt) {
    breakdown.push({
      name: "Token burnt",
      source: "Helius",
      value: "Yes",
      contribution: 0,
      weight: 0,
      hasData: true,
    });
  }

  // Mint authority — prefer chain-truth, fall back to Jupiter audit
  pushAuthority(
    breakdown,
    "Mint authority renounced",
    WEIGHTS.mintAuthority,
    inputs.chainTruth?.mintAuthorityRenounced ?? null,
    inputs.audit?.mintAuthorityDisabled ?? null
  );

  // Freeze authority — same pattern
  pushAuthority(
    breakdown,
    "Freeze authority renounced",
    WEIGHTS.freezeAuthority,
    inputs.chainTruth?.freezeAuthorityRenounced ?? null,
    inputs.audit?.freezeAuthorityDisabled ?? null
  );

  // Immutability
  pushImmutability(breakdown, inputs.chainTruth?.mutable ?? null);

  // Liquidity (log scale 0..1, peak at $10M+)
  pushContinuous(
    breakdown,
    "Liquidity (USD)",
    "Tokens.xyz",
    WEIGHTS.liquidity,
    inputs.riskInputs?.liquidityUsd ?? null,
    1_000_000_000,
    1_000,
    formatUsdCompact
  );

  // 24h volume
  pushContinuous(
    breakdown,
    "Volume (24h)",
    "Tokens.xyz",
    WEIGHTS.volume24h,
    inputs.riskInputs?.volume24hUsd ?? null,
    100_000_000,
    100,
    formatUsdCompact
  );

  // 7d volume
  pushContinuous(
    breakdown,
    "Volume (7d)",
    "Tokens.xyz",
    WEIGHTS.volume7d,
    inputs.riskInputs?.volume7dUsd ?? null,
    1_000_000_000,
    1_000,
    formatUsdCompact
  );

  // Token age
  const ageDays = computeAgeDays(inputs.riskInputs?.tokenMintTimeMs ?? null);
  pushContinuous(
    breakdown,
    "Token age",
    "Tokens.xyz",
    WEIGHTS.age,
    ageDays,
    365,
    1,
    (d) => `${Math.round(d)}d`
  );

  // Market cap
  pushContinuous(
    breakdown,
    "Market cap (USD)",
    "Tokens.xyz",
    WEIGHTS.marketCap,
    inputs.riskInputs?.marketCapUsd ?? null,
    1_000_000_000,
    1_000_000,
    formatUsdCompact
  );

  const withData = breakdown.filter((e) => e.hasData && e.weight > 0);
  const signalCount = withData.length;
  const hasEnoughSignals = signalCount >= MIN_SIGNALS;

  let score: number;
  if (burnt) {
    score = 0;
  } else if (!hasEnoughSignals) {
    score = 0;
  } else {
    const totalContribution = withData.reduce((sum, e) => sum + e.contribution, 0);
    const totalWeight = withData.reduce((sum, e) => sum + e.weight, 0);
    score = totalWeight > 0 ? Math.round((totalContribution / totalWeight) * 100) : 0;
  }

  const { grade, label, tone } = mapScore(score, hasEnoughSignals, burnt);

  return { score, grade, label, tone, breakdown, signalCount, hasEnoughSignals };
}

function pushAuthority(
  breakdown: BreakdownEntry[],
  name: string,
  weight: number,
  chain: boolean | null,
  audit: boolean | null
) {
  let value: string;
  let contribution = 0;
  let hasData = false;
  let source: EdgeSource = "Helius";

  if (chain !== null) {
    hasData = true;
    source = "Helius";
    if (chain) {
      value = "Yes (chain-truth)";
      contribution = weight;
    } else {
      value = "No — authority active";
      contribution = 0;
    }
  } else if (audit !== null) {
    hasData = true;
    source = "Jupiter";
    if (audit) {
      value = "Yes (per Jupiter audit)";
      contribution = weight;
    } else {
      value = "No — authority active";
      contribution = 0;
    }
  } else {
    value = "No data";
    source = "Helius";
  }

  breakdown.push({ name, source, value, contribution, weight, hasData });
}

function pushImmutability(breakdown: BreakdownEntry[], mutable: boolean | null) {
  const weight = WEIGHTS.immutability;
  if (mutable === null) {
    breakdown.push({
      name: "Metaplex metadata locked",
      source: "Helius",
      value: "No data",
      contribution: 0,
      weight,
      hasData: false,
    });
    return;
  }
  breakdown.push({
    name: "Metaplex metadata locked",
    source: "Helius",
    value: mutable ? "No (still mutable)" : "Yes (immutable)",
    contribution: mutable ? 0 : weight,
    weight,
    hasData: true,
  });
}

function pushContinuous(
  breakdown: BreakdownEntry[],
  name: string,
  source: EdgeSource,
  weight: number,
  raw: number | null,
  topAnchor: number,
  bottomAnchor: number,
  fmt: (n: number) => string
) {
  if (raw == null || !Number.isFinite(raw) || raw <= 0) {
    breakdown.push({
      name,
      source,
      value: "No data",
      contribution: 0,
      weight,
      hasData: false,
    });
    return;
  }
  const normalized = normalizeLog(raw, bottomAnchor, topAnchor);
  breakdown.push({
    name,
    source,
    value: fmt(raw),
    contribution: normalized * weight,
    weight,
    hasData: true,
  });
}

function normalizeLog(value: number, bottom: number, top: number): number {
  if (value <= bottom) return 0;
  if (value >= top) return 1;
  const lv = Math.log10(value);
  const lb = Math.log10(bottom);
  const lt = Math.log10(top);
  return (lv - lb) / (lt - lb);
}

function computeAgeDays(mintTimeMs: number | null): number | null {
  if (mintTimeMs == null || mintTimeMs <= 0) return null;
  const ms = Date.now() - mintTimeMs;
  if (ms <= 0) return 0;
  return ms / (1000 * 60 * 60 * 24);
}

function formatUsdCompact(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function mapScore(
  score: number,
  hasEnoughSignals: boolean,
  burnt: boolean
): { grade: EdgeGrade; label: string; tone: "safe" | "caution" | "risk" } {
  if (burnt) return { grade: "F", label: "Burnt token", tone: "risk" };
  if (!hasEnoughSignals)
    return { grade: "F", label: "Insufficient signals", tone: "risk" };
  if (score >= 90) return { grade: "A", label: "Healthy", tone: "safe" };
  if (score >= 75) return { grade: "B", label: "Solid", tone: "safe" };
  if (score >= 60) return { grade: "C", label: "Mixed", tone: "caution" };
  if (score >= 40) return { grade: "D", label: "Risky", tone: "caution" };
  return { grade: "F", label: "Hazardous", tone: "risk" };
}
