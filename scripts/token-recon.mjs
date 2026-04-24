#!/usr/bin/env node
// Throwaway reconnaissance spike: query every integrated API for one token
// and dump raw responses. Used to build the capability matrix — not production.
// Run: node scripts/token-recon.mjs [mint] [symbol]

import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";

process.loadEnvFile(".env.local");

const MINT = process.argv[2] ?? "So11111111111111111111111111111111111111112";
const SYMBOL = process.argv[3] ?? "SOL";
const OUT_DIR = resolve("tmp/recon", SYMBOL.toLowerCase());
mkdirSync(OUT_DIR, { recursive: true });

const {
  JUPITER_API_KEY,
  BIRDEYE_API_KEY,
  TOKENS_XYZ_API_KEY,
  SOLSCAN_API_KEY,
  HELIUS_API_KEY,
} = process.env;

const results = [];

function log(name, status, extra = "") {
  const tag = status === "ok" ? "✓" : status === "skip" ? "·" : "✗";
  console.log(`${tag} ${name.padEnd(42)} ${extra}`);
  results.push({ name, status, extra });
}

function save(name, data) {
  const file = resolve(OUT_DIR, `${name}.json`);
  writeFileSync(file, JSON.stringify(data, null, 2));
  return file;
}

async function hit(name, { url, headers = {}, body, method = "GET" }) {
  try {
    const init = {
      method,
      headers: { accept: "application/json", ...headers },
      cache: "no-store",
    };
    if (body) {
      init.body = typeof body === "string" ? body : JSON.stringify(body);
      init.headers["content-type"] = "application/json";
    }
    const res = await fetch(url, init);
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = { _raw: text };
    }
    const payload = {
      _meta: { name, url, method, status: res.status, ok: res.ok },
      body: json,
    };
    save(name, payload);
    log(name, res.ok ? "ok" : "fail", `HTTP ${res.status}`);
    return payload;
  } catch (e) {
    save(name, { _meta: { name, url, method, error: String(e) } });
    log(name, "fail", `ERR ${e.message ?? e}`);
    return null;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── JUPITER ────────────────────────────────────────────────────────────────
async function jupiter() {
  if (!JUPITER_API_KEY) return log("jupiter (skipped, no key)", "skip");
  const headers = { Authorization: `Bearer ${JUPITER_API_KEY}` };
  await hit("jupiter-search", {
    url: `https://api.jup.ag/tokens/v2/search?query=${SYMBOL}&limit=5`,
    headers,
  });
}

// ─── BIRDEYE ────────────────────────────────────────────────────────────────
async function birdeye() {
  if (!BIRDEYE_API_KEY) return log("birdeye (skipped, no key)", "skip");
  const headers = { "X-API-KEY": BIRDEYE_API_KEY, "x-chain": "solana" };
  await hit("birdeye-token_overview", {
    url: `https://public-api.birdeye.so/defi/token_overview?address=${MINT}`,
    headers,
  });
  await hit("birdeye-token_security", {
    url: `https://public-api.birdeye.so/defi/token_security?address=${MINT}`,
    headers,
  });
  const now = Math.floor(Date.now() / 1000);
  await hit("birdeye-ohlcv_1h_24h", {
    url: `https://public-api.birdeye.so/defi/ohlcv?address=${MINT}&type=1H&time_from=${now - 86400}&time_to=${now}`,
    headers,
  });
  await hit("birdeye-token_creation", {
    url: `https://public-api.birdeye.so/defi/token_creation_info?address=${MINT}`,
    headers,
  });
  await hit("birdeye-token_trade_data", {
    url: `https://public-api.birdeye.so/defi/v3/token/trade-data/single?address=${MINT}`,
    headers,
  });
  await hit("birdeye-token_holder", {
    url: `https://public-api.birdeye.so/defi/v3/token/holder?address=${MINT}&limit=10`,
    headers,
  });
}

// ─── TOKENS.XYZ ─────────────────────────────────────────────────────────────
async function tokensXyz() {
  if (!TOKENS_XYZ_API_KEY) return log("tokens.xyz (skipped, no key)", "skip");
  const headers = { "x-api-key": TOKENS_XYZ_API_KEY };
  await hit("tokensxyz-asset", {
    url: `https://api.tokens.xyz/v1/assets/${MINT}?include=profile,risk,markets`,
    headers,
  });
  const to = Math.floor(Date.now() / 1000);
  await hit("tokensxyz-price_chart", {
    url: `https://api.tokens.xyz/v1/assets/${MINT}/price-chart?interval=1H&from=${to - 86400}&to=${to}`,
    headers,
  });
}

// ─── SOLSCAN PRO (Free L1) ──────────────────────────────────────────────────
async function solscan() {
  if (!SOLSCAN_API_KEY) return log("solscan (skipped, no key)", "skip");
  const headers = { token: SOLSCAN_API_KEY };
  const base = "https://pro-api.solscan.io/v2.0";
  // pace @ 1 req/sec to respect free-tier throttle
  const endpoints = [
    ["solscan-token_meta", `${base}/token/meta?address=${MINT}`],
    ["solscan-token_price", `${base}/token/price?address=${MINT}`],
    ["solscan-token_holders", `${base}/token/holders?address=${MINT}&page=1&page_size=10`],
    ["solscan-token_markets", `${base}/token/markets?token[]=${MINT}&page=1&page_size=5`],
    ["solscan-token_transfer", `${base}/token/transfer?address=${MINT}&page=1&page_size=10`],
    ["solscan-token_defi_activities", `${base}/token/defi/activities?address=${MINT}&page=1&page_size=10`],
  ];
  for (const [name, url] of endpoints) {
    await hit(name, { url, headers });
    await sleep(1100);
  }
}

// ─── HELIUS ─────────────────────────────────────────────────────────────────
async function helius() {
  if (!HELIUS_API_KEY) return log("helius (skipped, no key)", "skip");
  const rpc = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

  const rpcCall = (name, method, params) =>
    hit(name, {
      method: "POST",
      url: rpc,
      body: { jsonrpc: "2.0", id: name, method, params },
    });

  await rpcCall("helius-das-getAsset", "getAsset", {
    id: MINT,
    options: { showFungible: true },
  });
  await sleep(600);

  await rpcCall("helius-rpc-getTokenSupply", "getTokenSupply", [MINT]);
  await sleep(600);

  await rpcCall("helius-rpc-getAccountInfo", "getAccountInfo", [
    MINT,
    { encoding: "jsonParsed" },
  ]);
  await sleep(600);

  await rpcCall("helius-rpc-getTokenLargestAccounts", "getTokenLargestAccounts", [MINT]);
}

// ─── RUN ────────────────────────────────────────────────────────────────────
console.log(`\n▸ Recon for ${SYMBOL} (${MINT})`);
console.log(`▸ Output: ${OUT_DIR}\n`);

await jupiter();
await birdeye();
await tokensXyz();
await solscan();
await helius();

const ok = results.filter((r) => r.status === "ok").length;
const fail = results.filter((r) => r.status === "fail").length;
const skip = results.filter((r) => r.status === "skip").length;

writeFileSync(
  resolve(OUT_DIR, "_summary.json"),
  JSON.stringify({ mint: MINT, symbol: SYMBOL, ok, fail, skip, results }, null, 2)
);

console.log(`\nDone — ok: ${ok}, fail: ${fail}, skip: ${skip}`);
console.log(`Raw responses in: ${OUT_DIR}`);
