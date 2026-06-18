/* ──────────────────────────────────────────────────────────────
   Frozen snapshot data for the static prototype. No network, no APIs.
   Shapes mirror the live app's TokenPair / StableLiveData / NFT types
   so the render functions in app.js can reuse the real markup 1:1.
   imageUrl is intentionally omitted on tokens so TokenIcon's initials
   fallback renders — keeps the prototype fully offline (no CDN calls).
   ────────────────────────────────────────────────────────────── */
(function () {
  function pair(o) {
    return {
      pairAddress: o.pairAddress,
      baseToken: { address: o.address, symbol: o.symbol, name: o.name },
      quoteToken: { symbol: o.quote || "SOL" },
      info: { imageUrl: undefined, socials: o.socials || [], websites: o.websites || [] },
      priceUsd: o.price,
      priceChange: { h24: o.change },
      liquidity: { usd: o.liq },
      fdv: o.fdv,
      marketCap: o.mcap || o.fdv,
      volume: { h24: o.vol },
      txns: { h24: { buys: o.buys, sells: o.sells } },
      isStrict: !!o.strict,
      isVerified: o.verified !== false,
      dexId: o.dex || "Raydium",
      pairCreatedAt: o.created,
    };
  }

  const D = (window.PROTO_DATA = {});

  D.sections = {
    attraction: [
      pair({ pairAddress: "p1", address: "JUPy...mint", symbol: "JUP", name: "Jupiter", price: 0.8421, change: 12.4, liq: 4_200_000, fdv: 1_140_000_000, vol: 38_200_000, buys: 18420, sells: 12110, strict: true, dex: "Meteora" }),
      pair({ pairAddress: "p2", address: "JTOq...mint", symbol: "JTO", name: "Jito", price: 2.913, change: 7.8, liq: 2_800_000, fdv: 320_000_000, vol: 14_500_000, buys: 9200, sells: 7400, strict: true }),
      pair({ pairAddress: "p3", address: "PYTH...mint", symbol: "PYTH", name: "Pyth Network", price: 0.371, change: 4.2, liq: 1_900_000, fdv: 640_000_000, vol: 9_100_000, buys: 6100, sells: 5800, strict: true }),
      pair({ pairAddress: "p4", address: "RAYx...mint", symbol: "RAY", name: "Raydium", price: 4.62, change: 18.9, liq: 3_100_000, fdv: 1_240_000_000, vol: 22_400_000, buys: 14300, sells: 9100, strict: true }),
      pair({ pairAddress: "p5", address: "DRFT...mint", symbol: "DRIFT", name: "Drift Protocol", price: 0.912, change: 9.1, liq: 1_400_000, fdv: 410_000_000, vol: 6_700_000, buys: 5200, sells: 4600 }),
      pair({ pairAddress: "p6", address: "KMNO...mint", symbol: "KMNO", name: "Kamino", price: 0.0684, change: 5.6, liq: 1_050_000, fdv: 210_000_000, vol: 4_300_000, buys: 4100, sells: 3700 }),
    ],
    longTerm: [
      pair({ pairAddress: "l1", address: "So111...112", symbol: "SOL", name: "Solana", quote: "USDC", price: 168.42, change: 1.8, liq: 22_400_000, fdv: 96_000_000_000, mcap: 80_000_000_000, vol: 1_240_000_000, buys: 142000, sells: 138000, strict: true, dex: "Orca" }),
      pair({ pairAddress: "l2", address: "mSoL...mint", symbol: "mSOL", name: "Marinade Staked SOL", quote: "USDC", price: 204.11, change: 1.6, liq: 8_900_000, fdv: 1_900_000_000, vol: 41_000_000, buys: 18200, sells: 17800, strict: true }),
      pair({ pairAddress: "l3", address: "JitoS...mint", symbol: "JitoSOL", name: "Jito Staked SOL", quote: "USDC", price: 196.74, change: 1.9, liq: 7_100_000, fdv: 2_400_000_000, vol: 33_500_000, buys: 15100, sells: 14600, strict: true }),
      pair({ pairAddress: "l4", address: "ORCAx...mint", symbol: "ORCA", name: "Orca", price: 3.84, change: -2.1, liq: 2_600_000, fdv: 380_000_000, vol: 11_900_000, buys: 7800, sells: 8200, strict: true }),
      pair({ pairAddress: "l5", address: "RNDR...mint", symbol: "RENDER", name: "Render", quote: "USDC", price: 7.41, change: 3.4, liq: 5_200_000, fdv: 3_800_000_000, vol: 54_000_000, buys: 21000, sells: 20100, strict: true }),
      pair({ pairAddress: "l6", address: "HNTx...mint", symbol: "HNT", name: "Helium", quote: "USDC", price: 6.12, change: -0.8, liq: 3_300_000, fdv: 1_050_000_000, vol: 18_400_000, buys: 9400, sells: 9600, strict: true }),
    ],
    highRisk: [
      pair({ pairAddress: "h1", address: "BONK...mint", symbol: "BONK", name: "Bonk", price: 0.00002841, change: 32.6, liq: 6_800_000, fdv: 2_100_000_000, vol: 94_000_000, buys: 58200, sells: 41100, dex: "Raydium" }),
      pair({ pairAddress: "h2", address: "WIFx...mint", symbol: "WIF", name: "dogwifhat", price: 2.41, change: 41.2, liq: 4_900_000, fdv: 2_400_000_000, vol: 121_000_000, buys: 71000, sells: 52000 }),
      pair({ pairAddress: "h3", address: "POPCT...mint", symbol: "POPCAT", name: "Popcat", price: 1.18, change: 67.4, liq: 2_200_000, fdv: 1_160_000_000, vol: 48_000_000, buys: 33400, sells: 19800 }),
      pair({ pairAddress: "h4", address: "MEWx...mint", symbol: "MEW", name: "cat in a dogs world", price: 0.00921, change: 23.1, liq: 1_700_000, fdv: 820_000_000, vol: 27_000_000, buys: 18900, sells: 14200 }),
      pair({ pairAddress: "h5", address: "GIGAx...mint", symbol: "GIGA", name: "Gigachad", price: 0.0412, change: 88.9, liq: 980_000, fdv: 390_000_000, vol: 19_400_000, buys: 21100, sells: 9800 }),
      pair({ pairAddress: "h6", address: "PNUTx...mint", symbol: "PNUT", name: "Peanut the Squirrel", price: 0.681, change: 14.7, liq: 1_300_000, fdv: 680_000_000, vol: 33_900_000, buys: 24600, sells: 20300 }),
    ],
  };

  D.recommended = [
    { address: "So111...112", symbol: "SOL", name: "Solana", priceUsd: 168.42, priceChange24: 1.8, secondary: "Orca" },
    { address: "JUPy...mint", symbol: "JUP", name: "Jupiter", priceUsd: 0.8421, priceChange24: 12.4, secondary: "Meteora" },
    { address: "BONK...mint", symbol: "BONK", name: "Bonk", priceUsd: 0.00002841, priceChange24: 32.6, secondary: "Raydium" },
    { address: "WIFx...mint", symbol: "WIF", name: "dogwifhat", priceUsd: 2.41, priceChange24: 41.2, secondary: "Raydium" },
    { address: "RAYx...mint", symbol: "RAY", name: "Raydium", priceUsd: 4.62, priceChange24: 18.9, secondary: "Raydium" },
  ];

  D.recents = [
    { address: "JTOq...mint", symbol: "JTO", name: "Jito", priceUsd: 2.913, priceChange24: 7.8, secondary: "Meteora" },
    { address: "PYTH...mint", symbol: "PYTH", name: "Pyth Network", priceUsd: 0.371, priceChange24: 4.2, secondary: "Raydium" },
  ];

  // ── Stablecoins (Park Your Money rail) ─────────────────────────
  D.stablecoins = {
    pending: [
      {
        mint: "PUSDmint000000000000000000000000000000000000",
        symbol: "PUSD",
        name: "PayPal USD (pending)",
        iconUrl: "/stablecoin/pusd.png",
        featured: true,
        learnMoreUrl: "https://www.paypal.com",
        tagline: "A fully-backed USD stablecoin headed to Solana — peg, depth, and audits coming soon.",
      },
    ],
    live: [
      {
        mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        symbol: "USDC",
        name: "USD Coin",
        iconUrl: undefined,
        priceUsd: 1.0001,
        pegDeviationBps: 1,
        liquidityUsd: 184_000_000,
        volume24hUsd: 2_410_000_000,
        marketCapUsd: 34_000_000_000,
        circulatingSupply: 34_000_000_000,
        mintAuthorityDisabled: false,
        freezeAuthorityDisabled: false,
        jupiterVerified: true,
        tokenProgram: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
      },
      {
        mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
        symbol: "USDT",
        name: "Tether USD",
        iconUrl: undefined,
        priceUsd: 0.9997,
        pegDeviationBps: -3,
        liquidityUsd: 96_000_000,
        volume24hUsd: 1_180_000_000,
        marketCapUsd: 21_000_000_000,
        circulatingSupply: 21_000_000_000,
        mintAuthorityDisabled: false,
        freezeAuthorityDisabled: false,
        jupiterVerified: true,
        tokenProgram: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
      },
      {
        mint: "2u1tszSeqZ3qBWF3uNGPFc8TzMk2tdiwknnRMWGWjGWH",
        symbol: "PYUSD",
        name: "PayPal USD",
        iconUrl: undefined,
        priceUsd: 0.9986,
        pegDeviationBps: -14,
        liquidityUsd: 12_400_000,
        volume24hUsd: 41_000_000,
        marketCapUsd: 640_000_000,
        circulatingSupply: 640_000_000,
        mintAuthorityDisabled: true,
        freezeAuthorityDisabled: false,
        jupiterVerified: true,
        tokenProgram: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
      },
      {
        mint: "USDSwr9ApdHk5bvJKMjzff41FfuX8bSxdKcR81vTwcA",
        symbol: "USDS",
        name: "USDS",
        iconUrl: undefined,
        priceUsd: 1.0042,
        pegDeviationBps: 42,
        liquidityUsd: 8_900_000,
        volume24hUsd: 18_000_000,
        marketCapUsd: 290_000_000,
        circulatingSupply: 290_000_000,
        mintAuthorityDisabled: false,
        freezeAuthorityDisabled: true,
        jupiterVerified: true,
        tokenProgram: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
      },
    ],
  };

  // ── NFT Edge (IslandDAO-style collection) ──────────────────────
  var traits = [
    ["Background", ["Mint", "Dusk", "Coral", "Slate"]],
    ["Body", ["Classic", "Frost", "Ember", "Tidal"]],
    ["Eyes", ["Focused", "Sleepy", "Laser", "Wide"]],
    ["Hat", ["None", "Captain", "Crown", "Beanie"]],
  ];
  var owners = [
    "7xKW...9fQa", "3mNp...kL2v", "9aBc...Xy71", "Ff2d...88Zq",
    "Hk9r...pT4m", "2vYu...Qw0e", "Bn5t...Lr3x", "8sJd...Mc6n",
  ];
  D.nft = {
    collection: {
      id: "ISLandDAO0000000000000000000000000000000000",
      name: "IslandDAO Perks",
      description:
        "A membership collection granting access to IslandDAO perks, events, and governance on Solana.",
      total_supply: 2222,
      royalty_bps: 500,
    },
    assets: Array.from({ length: 12 }).map(function (_, i) {
      var attrs = traits.map(function (t) {
        return { trait_type: t[0], value: t[1][i % t[1].length] };
      });
      return {
        id: "Asset" + (1000 + i) + "00000000000000000000000000000",
        name: "Islander #" + (101 + i),
        owner: owners[i % owners.length],
        description:
          "Islander #" + (101 + i) + " — a tenured member of the IslandDAO collective.",
        attributes: attrs,
        metadata_url: "https://arweave.net/islander-" + (101 + i) + ".json",
        floorPrice: 1_420_000_000, // lamports (~1.42 SOL)
        listStatus: i % 4 === 0 ? "listed" : "unlisted",
        listPrice: i % 4 === 0 ? 1_690_000_000 : null,
      };
    }),
    // rarity counts keyed by "trait_type::value"
    rarity: (function () {
      var r = {};
      traits.forEach(function (t) {
        t[1].forEach(function (v, idx) {
          r[t[0] + "::" + v] = { count: [820, 560, 410, 432][idx] || 200 };
        });
      });
      return r;
    })(),
  };
})();
