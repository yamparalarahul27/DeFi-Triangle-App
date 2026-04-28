// Real-human activity score — filters wash-trading bots from genuine user
// activity. Two normalized signals combined:
//   - uniqueWallets: log-scaled (more distinct wallets = harder to fake; each
//     bot needs separate funding)
//   - organic ratio: Jupiter's own classification of "organic" buyers as a
//     fraction of total Jupiter-counted buys; high ratio = real users, not
//     pump bots
//
// Score = unique * 0.6 + organic * 0.4 → 0..100. Tuned weights at top.
// Hide entirely if neither input has data.

const UNIQUE_WEIGHT = 0.6;
const ORGANIC_WEIGHT = 0.4;

// log-scale anchors for unique wallets in a single window
const UNIQUE_BOTTOM = 10;
const UNIQUE_TOP = 100_000;

// Organic ratio target — Jupiter classifies a small slice of trades as
// "organic" (filters out MMs / bots / arbs). Major tokens like SOL hover
// around 1–2% even in healthy conditions because automated trading dominates
// volume. Treat 2% as full credit so major tokens score fairly while
// wash-traded tokens (near-0%) still score low.
const ORGANIC_FULL_CREDIT_RATIO = 0.02;

export interface HumanActivityInputs {
  uniqueWallets: number | null;
  jupiterNumBuys: number | null;
  numOrganicBuyers: number | null;
}

export type HumanGrade = "A" | "B" | "C" | "D" | "F";

export interface HumanActivityResult {
  score: number;            // 0-100
  grade: HumanGrade;
  label: string;
  tone: "safe" | "caution" | "risk";
  uniqueNorm: number;       // 0..1
  organicNorm: number;      // 0..1
  uniqueWallets: number | null;
  organicPct: number | null;
  hasUnique: boolean;
  hasOrganic: boolean;
}

export function computeHumanActivityScore(
  inputs: HumanActivityInputs
): HumanActivityResult | null {
  const hasUnique =
    inputs.uniqueWallets != null &&
    Number.isFinite(inputs.uniqueWallets) &&
    inputs.uniqueWallets > 0;
  const hasOrganic =
    inputs.numOrganicBuyers != null &&
    inputs.jupiterNumBuys != null &&
    inputs.jupiterNumBuys > 0;

  if (!hasUnique && !hasOrganic) return null;

  const uniqueNorm = hasUnique
    ? clamp01(
        (Math.log10(inputs.uniqueWallets!) - Math.log10(UNIQUE_BOTTOM)) /
          (Math.log10(UNIQUE_TOP) - Math.log10(UNIQUE_BOTTOM))
      )
    : 0;
  const organicPct = hasOrganic
    ? clamp01(inputs.numOrganicBuyers! / inputs.jupiterNumBuys!)
    : null;
  const organicNorm = hasOrganic
    ? clamp01(organicPct! / ORGANIC_FULL_CREDIT_RATIO)
    : 0;

  // If only one signal is available, scale it to 0..100 directly
  let scoreFloat: number;
  if (hasUnique && hasOrganic) {
    scoreFloat =
      (uniqueNorm * UNIQUE_WEIGHT + organicNorm * ORGANIC_WEIGHT) * 100;
  } else if (hasUnique) {
    scoreFloat = uniqueNorm * 100;
  } else {
    scoreFloat = organicNorm * 100;
  }
  const score = Math.round(scoreFloat);

  const { grade, label, tone } = mapScore(score, hasUnique && hasOrganic);

  return {
    score,
    grade,
    label,
    tone,
    uniqueNorm,
    organicNorm,
    uniqueWallets: hasUnique ? inputs.uniqueWallets! : null,
    organicPct: organicPct,
    hasUnique,
    hasOrganic,
  };
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function mapScore(
  score: number,
  bothSignals: boolean
): { grade: HumanGrade; label: string; tone: "safe" | "caution" | "risk" } {
  if (!bothSignals && score >= 60) {
    return { grade: "B", label: "Likely real (partial data)", tone: "caution" };
  }
  if (!bothSignals) {
    return { grade: "C", label: "Limited signal", tone: "caution" };
  }
  if (score >= 80) return { grade: "A", label: "Highly organic", tone: "safe" };
  if (score >= 60) return { grade: "B", label: "Mostly real", tone: "safe" };
  if (score >= 40) return { grade: "C", label: "Mixed", tone: "caution" };
  if (score >= 20) return { grade: "D", label: "Bot-heavy", tone: "risk" };
  return { grade: "F", label: "Wash-trading risk", tone: "risk" };
}
