"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { useUnifiedWalletContext } from "@jup-ag/wallet-adapter";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/layout/HeroSection";
import { HeroSearchButton } from "@/components/search/HeroSearchButton";
import { DexCard } from "@/components/ui/DexCard";
import { TokenModal } from "@/components/ui/TokenModal";
import { TabEmpty } from "@/components/tabs/TabShell";
import { SpiralLoader } from "@/components/agent-elements/spiral-loader";
import { WatchlistTab } from "@/components/tabs/WatchlistTab";
import { useSession } from "@/components/providers/SessionContext";
import { useInterval } from "@/lib/hooks/useInterval";
import { useWatchlist } from "@/lib/hooks/useWatchlist";

type HomeTab = "home" | "watchlist";

type TokenPair = {
  pairAddress?: string;
  baseToken?: { address?: string; symbol?: string; name?: string };
  quoteToken?: { symbol?: string; name?: string };
  info?: {
    imageUrl?: string;
    socials?: { type: string; url: string }[];
    websites?: { url: string }[];
  };
  priceUsd?: number | string;
  priceChange?: { h24?: number | string };
  volume?: { h24?: number | string };
  liquidity?: { usd?: number | string };
  marketCap?: number | string;
  fdv?: number | string;
  holder?: number | string;
  pairCreatedAt?: number | string;
  txns?: { h24?: { buys?: number | string; sells?: number | string } };
  isVerified?: boolean;
  isStrict?: boolean;
  jupiterVerified?: boolean;
  tokensXyzVerified?: boolean;
  [key: string]: unknown;
};

interface HomeSections {
  attraction: TokenPair[];
  longTerm: TokenPair[];
  highRisk: TokenPair[];
}

const HOME_JUPITER_ENDPOINTS = [
  "/api/jupiter?type=home&limit=140",
  "/api/jupiter?type=tokens&limit=140",
  "/api/jupiter?type=list&limit=200",
  "/api/jupiter?limit=140",
  "/api/jupiter",
  "/api/jupiter/tokens?limit=140",
] as const;

export default function Dashboard() {
  const { wallet, loaded: sessionLoaded } = useSession();
  const { setShowModal } = useUnifiedWalletContext();
  const authed = !!wallet;
  const watchlist = useWatchlist(authed);

  const [tab, setTab] = useState<HomeTab>("home");
  const paused = false;
  const [selectedPair, setSelectedPair] = useState<TokenPair | null>(null);

  const openWatchlist = useCallback(() => {
    setTab((prev) => (prev === "watchlist" ? "home" : "watchlist"));
  }, []);

  const handleStarToggle = useCallback(
    async (pair: TokenPair) => {
      const addr = pair?.baseToken?.address;
      if (!addr) return;
      if (!authed) {
        setShowModal(true);
        return;
      }
      if (watchlist.starredSet.has(addr)) {
        await watchlist.remove(addr);
      } else {
        await watchlist.add({
          token_address: addr,
          symbol: pair?.baseToken?.symbol,
          name: pair?.baseToken?.name,
          image_url: pair?.info?.imageUrl,
        });
      }
    },
    [authed, setShowModal, watchlist]
  );

  return (
    <>
      <Header
        showWatchlistButton
        watchlistActive={tab === "watchlist"}
        onOpenWatchlist={openWatchlist}
        showSearchButton={false}
      />
      <HeroSection searchSlot={<HeroSearchButton />} />

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4">
        <section>
          {tab === "watchlist" ? (
            <WatchlistTab
              authed={authed}
              wallet={wallet}
              items={watchlist.items}
              loaded={sessionLoaded && watchlist.loaded}
              onSelectPair={setSelectedPair}
              onRemove={watchlist.remove}
            />
          ) : (
            <HomeSectionsView
              paused={paused}
              onSelectPair={setSelectedPair}
              starredSet={watchlist.starredSet}
              onStarToggle={handleStarToggle}
            />
          )}
        </section>
      </main>

      <Footer />

      {selectedPair && (
        <TokenModal
          pair={selectedPair}
          onClose={() => setSelectedPair(null)}
        />
      )}
    </>
  );
}

function HomeSectionsView({
  paused,
  onSelectPair,
  starredSet,
  onStarToggle,
}: {
  paused: boolean;
  onSelectPair: (pair: TokenPair) => void;
  starredSet: Set<string>;
  onStarToggle: (pair: TokenPair) => void;
}) {
  const { data, sections: serverSections, loading } = useHomeJupiterPairs(
    120_000,
    paused
  );

  const universe = useMemo(
    () =>
      (Array.isArray(data) ? data : []).filter(
        (pair: unknown): pair is TokenPair =>
          !!pair && typeof pair === "object" && !!(pair as TokenPair).baseToken
      ),
    [data]
  );

  const sections = useMemo(
    () => serverSections ?? buildHomeSections(universe),
    [serverSections, universe]
  );
  const totalVisible =
    sections.attraction.length + sections.longTerm.length + sections.highRisk.length;

  if (loading && universe.length === 0) {
    return (
      <div className="py-16 flex items-center justify-center gap-2 text-sm text-[#6a7282]">
        <SpiralLoader size={18} />
        <span>Loading token rails…</span>
      </div>
    );
  }

  if (totalVisible === 0) {
    return <TabEmpty text="No tokens available right now." />;
  }

  return (
    <div className="space-y-5">
      <TokenRail
        title="Tokens Gaining Attraction"
        subtitle="Strong momentum with minimum liquidity and activity checks"
        tokens={sections.attraction}
        onSelectPair={onSelectPair}
        starredSet={starredSet}
        onStarToggle={onStarToggle}
      />

      <TokenRail
        title="Tokens for Long-Term Wealth"
        subtitle="Higher depth, holder base, and older market footprint"
        tokens={sections.longTerm}
        onSelectPair={onSelectPair}
        starredSet={starredSet}
        onStarToggle={onStarToggle}
      />

      <TokenRail
        title="High Risk, High Reward"
        subtitle="Higher upside setups with more volatility and lower maturity"
        tokens={sections.highRisk}
        onSelectPair={onSelectPair}
        starredSet={starredSet}
        onStarToggle={onStarToggle}
      />
    </div>
  );
}

function TokenRail({
  title,
  subtitle,
  tokens,
  onSelectPair,
  starredSet,
  onStarToggle,
}: {
  title: string;
  subtitle: string;
  tokens: TokenPair[];
  onSelectPair: (pair: TokenPair) => void;
  starredSet: Set<string>;
  onStarToggle: (pair: TokenPair) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const node = scrollerRef.current;
    if (!node) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const left = node.scrollLeft > 2;
    const right = node.scrollLeft + node.clientWidth < node.scrollWidth - 2;
    setCanScrollLeft(left);
    setCanScrollRight(right);
  }, []);

  const scrollByCards = useCallback((direction: "left" | "right") => {
    const node = scrollerRef.current;
    if (!node) return;
    const amount = Math.max(280, Math.floor(node.clientWidth * 0.75));
    node.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    updateScrollState();
    node.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      node.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [tokens.length, updateScrollState]);

  return (
    <section className="space-y-2">
      <div className="flex items-end justify-between gap-2">
        <div>
          <h2 className="text-sm sm:text-base font-semibold text-[#11274d]">{title}</h2>
          <p className="text-xs text-[#6a7282] mt-0.5">{subtitle}</p>
        </div>
        <div className="hidden sm:flex items-center gap-1">
          <button
            type="button"
            disabled={!canScrollLeft}
            onClick={() => scrollByCards("left")}
            className="h-8 w-8 rounded-full border border-[#cbd5e1] bg-white text-[#11274d] inline-flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f1f5f9]"
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={!canScrollRight}
            onClick={() => scrollByCards("right")}
            className="h-8 w-8 rounded-full border border-[#cbd5e1] bg-white text-[#11274d] inline-flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f1f5f9]"
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {tokens.length === 0 ? (
        <div className="py-6 text-xs text-[#6a7282]">No tokens in this section right now.</div>
      ) : (
        <div className="relative">
          <div ref={scrollerRef} className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 pb-1 px-[6px]">
              {tokens.map((pair, i) => (
                <div key={pair?.pairAddress ?? `${pair?.baseToken?.address ?? "na"}-${i}`} className="w-[300px] shrink-0">
                  <DexCard
                    pair={pair}
                    onClick={() => onSelectPair(pair)}
                    starred={starredSet.has(pair?.baseToken?.address ?? "")}
                    onStarToggle={() => onStarToggle(pair)}
                  />
                </div>
              ))}
            </div>
          </div>
          {(canScrollLeft || canScrollRight) && (
            <>
              {canScrollLeft && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#f1f5f9] via-[#f1f5f9]/85 to-transparent backdrop-blur-[1px]"
                />
              )}
              {canScrollRight && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#f1f5f9] via-[#f1f5f9]/85 to-transparent backdrop-blur-[1px]"
                />
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}

function useHomeJupiterPairs(refreshMs: number, paused: boolean) {
  const [data, setData] = useState<TokenPair[]>([]);
  const [sections, setSections] = useState<HomeSections | null>(null);
  const [loading, setLoading] = useState(true);
  const inFlightRef = useRef(false);

  const fetchPairs = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    try {
      let hadOkResponse = false;
      let resolvedPairs: TokenPair[] | null = null;
      let resolvedSections: HomeSections | null = null;

      for (const endpoint of HOME_JUPITER_ENDPOINTS) {
        try {
          const res = await fetch(endpoint, { cache: "no-store" });
          if (!res.ok) continue;
          hadOkResponse = true;

          const json = await res.json().catch(() => null);
          const mappedSections = adaptHomeSectionsPayload(json);
          if (mappedSections) {
            resolvedSections = mappedSections;
          }
          const mapped = adaptJupiterPayloadToPairs(json);
          if (mapped.length > 0 || mappedSections) {
            resolvedPairs = mapped.length > 0 ? mapped : flattenSections(mappedSections);
            break;
          }
        } catch {
          // try the next endpoint shape
        }
      }

      if (resolvedPairs) {
        setData(resolvedPairs);
        setSections(resolvedSections);
      } else if (hadOkResponse) {
        setData([]);
        setSections(null);
      }
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    void fetchPairs();
  }, [fetchPairs]);

  useInterval(() => {
    void fetchPairs();
  }, paused ? null : refreshMs);

  return { data, sections, loading, refetch: fetchPairs };
}

function flattenSections(sections: HomeSections | null): TokenPair[] {
  if (!sections) return [];
  return [...sections.attraction, ...sections.longTerm, ...sections.highRisk];
}

function adaptHomeSectionsPayload(payload: unknown): HomeSections | null {
  const root = asRecord(payload);
  if (!root) return null;

  const sections = asRecord(root.sections);
  if (!sections) return null;

  const attraction = adaptTokenArray(sections.attraction);
  const longTerm = adaptTokenArray(sections.longTerm);
  const highRisk = adaptTokenArray(sections.highRisk);

  if (attraction.length + longTerm.length + highRisk.length === 0) {
    return null;
  }

  return { attraction, longTerm, highRisk };
}

function adaptTokenArray(input: unknown): TokenPair[] {
  if (!Array.isArray(input)) return [];
  const out: TokenPair[] = [];
  const unique = new Set<string>();

  for (const row of input) {
    const pair = adaptTokenLikeToPair(row);
    if (!pair) continue;
    const key = tokenKey(pair);
    if (!key || unique.has(key)) continue;
    unique.add(key);
    out.push(pair);
  }

  return out;
}

function adaptJupiterPayloadToPairs(payload: unknown): TokenPair[] {
  const rows = extractTokenRows(payload);
  if (rows.length === 0) return [];

  const unique = new Set<string>();
  const out: TokenPair[] = [];

  for (let i = 0; i < rows.length; i += 1) {
    const pair = adaptTokenLikeToPair(rows[i]);
    if (!pair) continue;
    const key = tokenKey(pair);
    if (!key || unique.has(key)) continue;
    unique.add(key);
    out.push(pair);
  }

  return out;
}

function extractTokenRows(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;

  const queue: unknown[] = [payload];
  const seen = new Set<unknown>();
  const candidateKeys = [
    "data",
    "tokens",
    "items",
    "results",
    "pairs",
    "assets",
    "list",
    "rows",
  ] as const;

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || typeof current !== "object" || seen.has(current)) continue;
    seen.add(current);

    const record = current as Record<string, unknown>;

    for (const key of candidateKeys) {
      const candidate = record[key];
      if (Array.isArray(candidate) && looksLikeTokenArray(candidate)) {
        return candidate;
      }
    }

    for (const value of Object.values(record)) {
      if (Array.isArray(value) && looksLikeTokenArray(value)) {
        return value;
      }
    }

    for (const value of Object.values(record)) {
      if (value && typeof value === "object") {
        queue.push(value);
      }
    }
  }

  return [];
}

function looksLikeTokenArray(value: unknown[]): boolean {
  if (value.length === 0) return true;
  return value.some((item) => !!item && typeof item === "object" && !Array.isArray(item));
}

function adaptTokenLikeToPair(value: unknown): TokenPair | null {
  const rec = asRecord(value);
  if (!rec) return null;

  const address = pickString(rec, [
    ["baseToken", "address"],
    ["base", "address"],
    ["token", "address"],
    ["address"],
    ["tokenAddress"],
    ["token_address"],
    ["mint"],
    ["id"],
    ["contractAddress"],
    ["contract_address"],
    ["tokenMint"],
    ["token_mint"],
    ["assetId"],
  ]);
  if (!address) return null;

  const symbol =
    pickString(rec, [
      ["baseToken", "symbol"],
      ["token", "symbol"],
      ["symbol"],
      ["ticker"],
      ["tokenSymbol"],
      ["token_symbol"],
    ]) || "???";

  const name =
    pickString(rec, [
      ["baseToken", "name"],
      ["token", "name"],
      ["name"],
      ["tokenName"],
      ["token_name"],
    ]) || symbol;

  const quoteSymbol =
    pickString(rec, [
      ["quoteToken", "symbol"],
      ["quote", "symbol"],
      ["quoteSymbol"],
      ["quote_symbol"],
    ]) || "USD";

  const imageUrl = pickString(rec, [
    ["info", "imageUrl"],
    ["logoURI"],
    ["logo_uri"],
    ["logoUrl"],
    ["logo_url"],
    ["imageUrl"],
    ["image_url"],
    ["icon"],
    ["iconUrl"],
  ]);

  const buys24 = pickNumber(rec, [
    ["txns", "h24", "buys"],
    ["transactions", "h24", "buys"],
    ["buys24h"],
    ["buy24h"],
    ["buy_24h"],
    ["buys"],
  ]);
  const sells24 = pickNumber(rec, [
    ["txns", "h24", "sells"],
    ["transactions", "h24", "sells"],
    ["sells24h"],
    ["sell24h"],
    ["sell_24h"],
    ["sells"],
  ]);
  const trade24 = pickNumber(rec, [
    ["trade24h"],
    ["trade_24h"],
    ["txns", "h24", "total"],
    ["transactions", "h24", "total"],
    ["swaps24h"],
  ]);

  const fallbackBuys =
    buys24 > 0 || sells24 > 0 ? buys24 : Math.round(Math.max(0, trade24) / 2);
  const fallbackSells =
    buys24 > 0 || sells24 > 0 ? sells24 : Math.max(0, trade24 - fallbackBuys);

  const marketCap = pickNumber(rec, [
    ["marketCap"],
    ["marketcap"],
    ["market_cap"],
    ["stats", "marketCap"],
    ["stats", "market_cap"],
    ["market", "marketCap"],
  ]);

  const fdv = pickNumber(rec, [
    ["fdv"],
    ["fullyDilutedValuation"],
    ["fully_diluted_valuation"],
  ]);

  const rawTags = getPath(rec, ["tags"]);
  const tags = Array.isArray(rawTags)
    ? rawTags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean)
    : [];
  const strictFromTags = tags.includes("strict") || tags.includes("jupiter-strict");
  const verifiedFromTags =
    tags.includes("verified") || tags.includes("moonshot-verified");
  const isStrict =
    pickBoolean(rec, [["isStrict"], ["strict"], ["jupiter", "isStrict"]]) ||
    strictFromTags;
  const jupiterVerified =
    pickBoolean(rec, [["isVerified"], ["verified"], ["jupiter", "isVerified"]]) ||
    verifiedFromTags ||
    isStrict;
  const tokensXyzVerifiedFromFlag = pickBoolean(rec, [
    ["tokensXyzVerified"],
    ["tokenXyz", "isVerified"],
    ["tokenXyz", "verified"],
    ["profile", "isVerified"],
    ["profile", "verified"],
  ]);
  const riskGrade = pickString(rec, [["tokenXyz", "riskGrade"], ["risk", "marketScore", "grade"]]).toUpperCase();
  const riskLabel = pickString(rec, [["tokenXyz", "riskLabel"], ["risk", "marketScore", "label"]]).toLowerCase();
  const tokensXyzVerified =
    tokensXyzVerifiedFromFlag ||
    riskGrade === "A" ||
    riskLabel === "established";
  const isVerified = tokensXyzVerified;

  return {
    pairAddress:
      pickString(rec, [["pairAddress"], ["pair_address"], ["address"]]) || address,
    baseToken: { address, symbol, name },
    quoteToken: { symbol: quoteSymbol, name: quoteSymbol },
    info: {
      imageUrl: imageUrl || undefined,
      socials: extractSocials(rec),
      websites: extractWebsites(rec),
    },
    priceUsd: pickNumber(rec, [
      ["priceUsd"],
      ["price_usd"],
      ["price"],
      ["usdPrice"],
      ["usd_price"],
      ["stats", "price"],
      ["market", "price"],
    ]),
    priceChange: {
      h24: pickNumber(rec, [
        ["priceChange", "h24"],
        ["priceChange24h"],
        ["price_change_24h"],
        ["priceChange24hPercent"],
        ["price24hChangePercent"],
        ["price_change_24h_percent"],
        ["stats", "priceChange24hPercent"],
        ["market", "priceChange24hPercent"],
      ]),
    },
    volume: {
      h24: pickNumber(rec, [
        ["volume", "h24"],
        ["volume24hUSD"],
        ["volume24h"],
        ["volume_24h"],
        ["volume_24h_usd"],
        ["stats", "volume24hUSD"],
        ["market", "volume24hUSD"],
      ]),
    },
    liquidity: {
      usd: pickNumber(rec, [
        ["liquidity", "usd"],
        ["liquidityUsd"],
        ["liquidity_usd"],
        ["liquidity"],
        ["stats", "liquidity"],
        ["market", "liquidity"],
      ]),
    },
    marketCap: marketCap || fdv,
    fdv,
    holder: pickNumber(rec, [
      ["holder"],
      ["holders"],
      ["holderCount"],
      ["holdersCount"],
      ["holders_count"],
    ]),
    pairCreatedAt: pickTimestamp(rec, [
      ["pairCreatedAt"],
      ["pair_created_at"],
      ["createdAt"],
      ["created_at"],
      ["launchTime"],
      ["launch_time"],
      ["lastTradeUnixTime"],
      ["last_trade_unix_time"],
    ]),
    txns: {
      h24: { buys: fallbackBuys, sells: fallbackSells },
    },
    isVerified,
    isStrict,
    jupiterVerified,
    tokensXyzVerified,
    dexId:
      pickString(rec, [["dexId"], ["dex"], ["source"], ["provider"]]) || "jupiter",
  };
}

function extractSocials(rec: Record<string, unknown>) {
  const out: { type: string; url: string }[] = [];
  const seen = new Set<string>();

  const push = (type: string, url: string) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    out.push({ type, url });
  };

  const appendFromArray = (value: unknown, fallbackType = "link") => {
    if (!Array.isArray(value)) return;
    for (const entry of value) {
      if (typeof entry === "string") {
        push(fallbackType, entry);
        continue;
      }
      const item = asRecord(entry);
      if (!item) continue;
      const url = pickString(item, [["url"], ["href"], ["link"], ["value"]]);
      if (!url) continue;
      const type = pickString(item, [["type"], ["name"], ["platform"]]) || fallbackType;
      push(type, url);
    }
  };

  appendFromArray(getPath(rec, ["info", "socials"]));
  appendFromArray(rec["socials"]);

  const links = asRecord(rec["links"]);
  if (links) {
    push("twitter", pickString(links, [["twitter"], ["x"]]));
    push("telegram", pickString(links, [["telegram"]]));
    push("discord", pickString(links, [["discord"]]));
  }

  const extensions = asRecord(rec["extensions"]);
  if (extensions) {
    push("twitter", pickString(extensions, [["twitter"], ["x"]]));
    push("telegram", pickString(extensions, [["telegram"]]));
    push("discord", pickString(extensions, [["discord"]]));
  }

  return out;
}

function extractWebsites(rec: Record<string, unknown>) {
  const out: { url: string }[] = [];
  const seen = new Set<string>();

  const push = (url: string) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    out.push({ url });
  };

  const appendFromArray = (value: unknown) => {
    if (!Array.isArray(value)) return;
    for (const entry of value) {
      if (typeof entry === "string") {
        push(entry);
        continue;
      }
      const item = asRecord(entry);
      if (!item) continue;
      const url = pickString(item, [["url"], ["href"], ["link"], ["value"]]);
      push(url);
    }
  };

  appendFromArray(getPath(rec, ["info", "websites"]));
  appendFromArray(rec["websites"]);

  const links = asRecord(rec["links"]);
  if (links) {
    push(pickString(links, [["website"], ["homepage"], ["site"]]));
  }

  const extensions = asRecord(rec["extensions"]);
  if (extensions) {
    push(pickString(extensions, [["website"], ["homepage"], ["site"]]));
  }

  return out;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function getPath(record: Record<string, unknown>, path: readonly string[]): unknown {
  let current: unknown = record;
  for (const key of path) {
    if (!current || typeof current !== "object" || Array.isArray(current)) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

function pickString(
  record: Record<string, unknown>,
  paths: readonly (readonly string[])[]
): string {
  for (const path of paths) {
    const value = getPath(record, path);
    if (typeof value === "string") {
      const normalized = value.trim();
      if (normalized) return normalized;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }
  return "";
}

function pickNumber(
  record: Record<string, unknown>,
  paths: readonly (readonly string[])[]
): number {
  for (const path of paths) {
    const parsed = toNumber(getPath(record, path));
    if (parsed !== null) return parsed;
  }
  return 0;
}

function pickBoolean(
  record: Record<string, unknown>,
  paths: readonly (readonly string[])[]
): boolean {
  for (const path of paths) {
    const parsed = toBoolean(getPath(record, path));
    if (parsed !== null) return parsed;
  }
  return false;
}

function pickTimestamp(
  record: Record<string, unknown>,
  paths: readonly (readonly string[])[]
): number {
  for (const path of paths) {
    const parsed = toTimestamp(getPath(record, path));
    if (parsed > 0) return parsed;
  }
  return 0;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const normalized = value.replace(/[$,%\s,]/g, "");
    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function toBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1" || normalized === "yes") {
      return true;
    }
    if (normalized === "false" || normalized === "0" || normalized === "no") {
      return false;
    }
  }
  return null;
}

function toTimestamp(value: unknown): number {
  const numeric = toNumber(value);
  if (numeric !== null && numeric > 0) {
    return numeric > 1e11 ? numeric : numeric * 1000;
  }
  if (typeof value === "string") {
    const parsedDate = Date.parse(value);
    if (Number.isFinite(parsedDate) && parsedDate > 0) {
      return parsedDate;
    }
  }
  return 0;
}

function buildHomeSections(tokens: TokenPair[]): HomeSections {
  const byAttraction = tokens
    .filter((t) => {
      const change = n(t?.priceChange?.h24);
      return (
        change >= 2 &&
        change <= 300 &&
        n(t?.volume?.h24) >= 100_000 &&
        n(t?.liquidity?.usd) >= 100_000 &&
        n(t?.holder) >= 200
      );
    })
    .sort((a, b) => attractionScore(b) - attractionScore(a));

  const byLongTerm = tokens
    .filter((t) => {
      const age = ageDays(t);
      return (
        n(t?.liquidity?.usd) >= 500_000 &&
        n(t?.marketCap ?? t?.fdv) >= 50_000_000 &&
        n(t?.holder) >= 1_000 &&
        age >= 60 &&
        Math.abs(n(t?.priceChange?.h24)) <= 35
      );
    })
    .sort((a, b) => longTermScore(b) - longTermScore(a));

  const byHighRisk = tokens
    .filter((t) => {
      const mcap = n(t?.marketCap ?? t?.fdv);
      const change = n(t?.priceChange?.h24);
      return (
        mcap >= 1_000_000 &&
        mcap <= 250_000_000 &&
        change >= 8 &&
        change <= 500 &&
        n(t?.volume?.h24) >= 150_000 &&
        n(t?.liquidity?.usd) >= 35_000 &&
        n(t?.holder) >= 80
      );
    })
    .sort((a, b) => highRiskScore(b) - highRiskScore(a));

  const fallbackAttraction = tokens
    .filter(
      (t) =>
        n(t?.priceChange?.h24) > 0 &&
        n(t?.volume?.h24) >= 50_000 &&
        n(t?.liquidity?.usd) >= 50_000
    )
    .sort((a, b) => attractionScore(b) - attractionScore(a));

  const fallbackLongTerm = tokens
    .filter(
      (t) =>
        n(t?.marketCap ?? t?.fdv) >= 20_000_000 &&
        n(t?.liquidity?.usd) >= 250_000 &&
        n(t?.holder) >= 500
    )
    .sort((a, b) => longTermScore(b) - longTermScore(a));

  const fallbackHighRisk = tokens
    .filter(
      (t) =>
        n(t?.priceChange?.h24) >= 5 &&
        n(t?.marketCap ?? t?.fdv) <= 300_000_000 &&
        n(t?.liquidity?.usd) >= 25_000
    )
    .sort((a, b) => highRiskScore(b) - highRiskScore(a));

  const used = new Set<string>();
  return {
    attraction: pickUnique(byAttraction, fallbackAttraction, used, 6),
    longTerm: pickUnique(byLongTerm, fallbackLongTerm, used, 6),
    highRisk: pickUnique(byHighRisk, fallbackHighRisk, used, 6),
  };
}

function pickUnique(
  primary: TokenPair[],
  fallback: TokenPair[],
  used: Set<string>,
  limit: number
): TokenPair[] {
  const out: TokenPair[] = [];

  const tryAdd = (pair: TokenPair) => {
    const key = tokenKey(pair);
    if (!key || used.has(key)) return;
    used.add(key);
    out.push(pair);
  };

  for (const pair of primary) {
    if (out.length >= limit) break;
    tryAdd(pair);
  }

  if (out.length < limit) {
    for (const pair of fallback) {
      if (out.length >= limit) break;
      tryAdd(pair);
    }
  }

  return out;
}

function tokenKey(pair: TokenPair): string {
  return pair?.baseToken?.address ?? pair?.pairAddress ?? "";
}

function attractionScore(pair: TokenPair): number {
  const change = n(pair?.priceChange?.h24);
  const volume = n(pair?.volume?.h24);
  const liquidity = n(pair?.liquidity?.usd);
  const holders = n(pair?.holder);
  return (
    Math.min(change, 140) * 0.6 +
    Math.log10(volume + 1) * 8 +
    Math.log10(liquidity + 1) * 6 +
    Math.min(holders / 1200, 10)
  );
}

function longTermScore(pair: TokenPair): number {
  const liquidity = n(pair?.liquidity?.usd);
  const mcap = n(pair?.marketCap ?? pair?.fdv);
  const holders = n(pair?.holder);
  const age = ageDays(pair);
  const volatilityPenalty = Math.abs(n(pair?.priceChange?.h24)) * 0.45;
  return (
    Math.log10(liquidity + 1) * 12 +
    Math.log10(mcap + 1) * 12 +
    Math.log10(holders + 1) * 10 +
    Math.min(age / 30, 24) * 1.4 -
    volatilityPenalty
  );
}

function highRiskScore(pair: TokenPair): number {
  const mcap = n(pair?.marketCap ?? pair?.fdv);
  const change = n(pair?.priceChange?.h24);
  const volume = n(pair?.volume?.h24);
  const age = ageDays(pair);
  const microCapBoost = Math.max(0, 180 - mcap / 1_000_000) * 0.35;
  const freshnessBoost = age > 0 ? Math.max(0, 90 - age) * 0.18 : 0;
  return change * 0.65 + Math.log10(volume + 1) * 8 + microCapBoost + freshnessBoost;
}

function ageDays(pair: TokenPair): number {
  const createdAtMs = n(pair?.pairCreatedAt);
  if (createdAtMs <= 0) return 0;
  return Math.max(0, (Date.now() - createdAtMs) / 86_400_000);
}

function n(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}
