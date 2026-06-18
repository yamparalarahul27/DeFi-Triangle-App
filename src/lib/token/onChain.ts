import type { OnChainData } from "@/lib/token/types";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
}

interface AccountInfoPayload {
  value: {
    data: {
      parsed: {
        info: {
          mintAuthority: string | null;
          freezeAuthority: string | null;
        };
      };
    };
  } | null;
}

interface AssetPayload {
  mutable?: boolean;
  burnt?: boolean;
  royalty?: {
    percent?: number;
    target?: string | null;
    basis_points?: number;
  } | null;
  token_info?: {
    price_info?: {
      price_per_token?: number;
      currency?: string;
    } | null;
  } | null;
}

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const json = (await res.json()) as ApiResponse<T>;
    return json?.success && json.data ? json.data : null;
  } catch {
    return null;
  }
}

export async function fetchOnChainData(address: string): Promise<OnChainData | null> {
  if (!address) return null;
  const enc = encodeURIComponent(address);

  const [accountInfo, asset] = await Promise.all([
    getJson<AccountInfoPayload>(`/api/helius?type=getAccountInfo&address=${enc}`),
    getJson<AssetPayload>(`/api/helius?type=getAsset&address=${enc}`),
  ]);

  const parsed = accountInfo?.value?.data?.parsed?.info;
  const accountSection = parsed
    ? {
        mintAuthority: parsed.mintAuthority ?? null,
        freezeAuthority: parsed.freezeAuthority ?? null,
      }
    : null;

  const assetSection = asset
    ? {
        mutable: asset.mutable === true,
        burnt: asset.burnt === true,
        royalty:
          asset.royalty && typeof asset.royalty.percent === "number"
            ? {
                percent: asset.royalty.percent,
                target: asset.royalty.target ?? null,
              }
            : null,
      }
    : null;

  const rawDasPrice = asset?.token_info?.price_info?.price_per_token;
  const dasPrice =
    typeof rawDasPrice === "number" && rawDasPrice > 0 ? rawDasPrice : null;

  if (!accountSection && !assetSection && dasPrice == null) return null;

  return { accountInfo: accountSection, asset: assetSection, dasPrice };
}
