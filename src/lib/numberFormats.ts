import type { Format } from "@number-flow/react";

export const COMPACT_USD: Format = {
  notation: "compact",
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
};

export const USD: Format = {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};

export const COMPACT_NUM: Format = {
  notation: "compact",
  maximumFractionDigits: 2,
};

export const PCT_2DP: Format = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};

export const PCT_4DP: Format = {
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
};

export const SCORE: Format = {
  maximumFractionDigits: 0,
};
