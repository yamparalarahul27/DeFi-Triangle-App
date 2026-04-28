// Slippage at size — quote $1k / $10k / $100k SELL of the token into USDC
// via the public Jupiter Quote API (proxied through /api/jupiter?type=quote).
// Surfaces the realised price impact for traders sizing positions.

const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export const SLIPPAGE_SIZES_USD = [1_000, 10_000, 100_000] as const;
export type SlippageSizeUsd = (typeof SLIPPAGE_SIZES_USD)[number];

export interface SlippageEntry {
  sizeUsd: SlippageSizeUsd;
  inputAmountUi: number;       // human-readable token amount (size / price)
  outAmountUsd: number | null; // expected USDC out (USDC has 6 decimals)
  priceImpactPct: number | null;
  hasData: boolean;
}

export interface SlippageResult {
  sizes: SlippageEntry[];
  fetchedAt: number;
}

interface QuoteApiResponse {
  success: boolean;
  data?: {
    outAmount: string | null;
    priceImpactPct: number | null;
  } | null;
}

const USDC_DECIMALS = 6;

export async function fetchSlippageAtSizes(
  tokenMint: string,
  tokenPriceUsd: number,
  tokenDecimals: number
): Promise<SlippageResult | null> {
  if (
    !tokenMint ||
    !Number.isFinite(tokenPriceUsd) ||
    tokenPriceUsd <= 0 ||
    !Number.isInteger(tokenDecimals) ||
    tokenDecimals < 0 ||
    tokenDecimals > 30
  ) {
    return null;
  }
  // Skip if the token IS USDC — degenerate case.
  if (tokenMint === USDC_MINT) return null;

  const sizes = await Promise.all(
    SLIPPAGE_SIZES_USD.map((sizeUsd) =>
      fetchOneSize(tokenMint, tokenPriceUsd, tokenDecimals, sizeUsd)
    )
  );

  const anyOk = sizes.some((s) => s.hasData);
  if (!anyOk) return null;

  return { sizes, fetchedAt: Date.now() };
}

async function fetchOneSize(
  tokenMint: string,
  tokenPriceUsd: number,
  tokenDecimals: number,
  sizeUsd: SlippageSizeUsd
): Promise<SlippageEntry> {
  const inputAmountUi = sizeUsd / tokenPriceUsd;
  // Round to nearest base unit. Jupiter expects raw integer string.
  const inputAmountBase = Math.max(
    1,
    Math.round(inputAmountUi * Math.pow(10, tokenDecimals))
  );

  const empty: SlippageEntry = {
    sizeUsd,
    inputAmountUi,
    outAmountUsd: null,
    priceImpactPct: null,
    hasData: false,
  };

  try {
    const res = await fetch(
      `/api/jupiter?type=quote&inputMint=${encodeURIComponent(
        tokenMint
      )}&outputMint=${encodeURIComponent(USDC_MINT)}&amount=${inputAmountBase}`,
      { cache: "no-store" }
    );
    if (!res.ok) return empty;
    const json = (await res.json()) as QuoteApiResponse;
    if (!json?.success || !json.data) return empty;

    const outRaw = json.data.outAmount;
    const outAmountUsd =
      outRaw && /^[0-9]+$/.test(outRaw)
        ? Number(outRaw) / Math.pow(10, USDC_DECIMALS)
        : null;
    const priceImpactPct = json.data.priceImpactPct;

    return {
      sizeUsd,
      inputAmountUi,
      outAmountUsd: outAmountUsd != null && Number.isFinite(outAmountUsd) ? outAmountUsd : null,
      priceImpactPct:
        typeof priceImpactPct === "number" && Number.isFinite(priceImpactPct)
          ? priceImpactPct
          : null,
      hasData: outAmountUsd != null || priceImpactPct != null,
    };
  } catch {
    return empty;
  }
}
