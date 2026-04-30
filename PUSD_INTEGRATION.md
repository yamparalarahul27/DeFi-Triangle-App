# Palm USD (PUSD) — Integration Guide

A complete, copy-pasteable record of what this project ships for **Palm USD (PUSD)**, the non-freezable, non-blacklistable USD-pegged stablecoin. Use this to port the integration into another project.

> **⚠️ Action required from the user**
> The Solana SPL mint for PUSD is **not yet published**. The integration is **fully wired but disabled at runtime** until you supply the Solana mint address.
> Set `PUSD_MINT` in [src/lib/constants.ts](src/lib/constants.ts#L128) (or in env) the moment Palm USD confirms it. The Freedom Swap card auto-renders once that string is non-empty — no other code changes needed.

---

## 1. What "integration" means here

This project does **not** wrap a Palm USD SDK. PUSD is a regular SPL token, so the integration consists of:

1. A **mint constant** that gates the feature.
2. A **Freedom Swap marketing card** that pitches USDC → PUSD ("upgrade your stablecoin").
3. A **deep-link into the existing Jupiter Ultra swap page** — Jupiter handles routing/quotes/execution, so PUSD swap support comes "for free" the second Jupiter indexes the mint.

That's it. There is no custom routing, no custom signing path, no PUSD-specific service. The whole feature is **one constant + one card + one URL**.

---

## 2. Files involved (verbatim file map)

| File | Role |
|---|---|
| [src/lib/constants.ts](src/lib/constants.ts#L124-L128) | Declares `PUSD_MINT`. Single source of truth. Empty string = feature off. |
| [src/components/features/FreedomSwapCard.tsx](src/components/features/FreedomSwapCard.tsx) | The marketing/CTA card. Self-disables when `PUSD_MINT` is empty. |
| [src/components/features/ProjectOverview.tsx](src/components/features/ProjectOverview.tsx#L356-L359) | Mounts `<FreedomSwapCard />` on the cockpit overview page. |
| [src/app/cockpit/swap/page.tsx](src/app/cockpit/swap/page.tsx) | Generic Jupiter Ultra swap page. Reads `?inputMint=&outputMint=` URL params — that is the deep-link the card produces. |
| [src/services/JupiterUltraService.ts](src/services/JupiterUltraService.ts) | Jupiter Ultra API client (order + execute + shield + search). Used by the swap page, not PUSD-specific. |
| [src/app/(public)/log/page.tsx](src/app/%28public%29/log/page.tsx#L15) | Changelog entry noting the card is pending the Solana mint. |
| [LANDING.md](LANDING.md#L533) | Same note in the landing copy. |

---

## 3. The mint constant — the on/off switch

[src/lib/constants.ts:124-128](src/lib/constants.ts#L124-L128):

```ts
// ── Palm USD (PUSD) — non-freezable stablecoin ──────────────────────
// Currently confirmed on Ethereum only (0xfaf0cee6b20e2aaa4b80748a6af4cd89609a3d78).
// Solana SPL mint TBD — awaiting confirmation from Palm USD team.
// Once confirmed, update this value and the Freedom Swap card goes live.
export const PUSD_MINT = '';
```

**Design intent:**

- Empty string is the off state. The card returns `null`. Nothing else in the app references PUSD, so the rest of the UI is unaffected.
- The Ethereum address is documented in the comment as a breadcrumb for whoever later confirms the Solana mint — they can sanity-check it's the same project.
- For another project, you can also wire this through env: `export const PUSD_MINT = process.env.NEXT_PUBLIC_PUSD_MINT ?? '';`

---

## 4. The Freedom Swap card — what the user sees

[src/components/features/FreedomSwapCard.tsx](src/components/features/FreedomSwapCard.tsx) is a small, self-contained "promotional" card. Anatomy:

### 4.1 The kill switch (line 12)

```ts
if (!PUSD_MINT) return null;
```

This is the entire feature flag. No environment branching, no config service — just: mint set → render, mint empty → don't.

### 4.2 The visual (top to bottom)

| Region | Content | Styling notes |
|---|---|---|
| **Header** (dark gradient `#0d2137 → #19549b`) | Shield icon + "Freedom Swap" title; tagline "Upgrade your stablecoins. PUSD cannot be frozen, blacklisted, or paused by anyone." | Right side: "Non-freezable" pill in mint green (`#7ee5c6`), a `ShieldCheck` icon, 9px uppercase tracking-wider text. |
| **Token row** | Two circles side-by-side with `<ArrowRight>` between them. Left: blue circle `$` = USDC ("Freezable"). Right: green circle `P` = PUSD ("Non-freezable"). | The circles are inline divs, **not** the project's `<TokenIcon>`. This sidesteps needing a CDN icon for PUSD before launch. |
| **"Why switch?" panel** | Light grey card with 3 green ✓ bullets: "No freeze authority", "No blacklist", "USD-pegged — same value, sovereign ownership." | Uses `font-ibm-plex-sans` per the project's design system. |
| **CTA button** | `<Link>` wrapping `<Button>` with text "Swap USDC → PUSD". | The link is the deep-link described in §5. |

### 4.3 Hardcoded in the card

```ts
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
```

USDC mainnet mint is hardcoded **only because the card's value proposition is specifically "leave USDC, come to PUSD."** If you want a generic "swap to PUSD from anything" card, drop this line and let the user pick the input on the swap page.

### 4.4 Where it's mounted

[src/components/features/ProjectOverview.tsx:356-359](src/components/features/ProjectOverview.tsx#L356-L359):

```tsx
{/* ── Freedom Swap (Palm USD) ──────────────────────────── */}
<section className="max-w-md">
  <FreedomSwapCard />
</section>
```

It sits between "Your Positions" and "Protocol Stats" on the cockpit overview. `max-w-md` keeps it card-sized rather than full-bleed.

---

## 5. The deep-link — how the card hands off to the swap page

The CTA is just a Next.js `<Link>`:

```tsx
<Link href={`/cockpit/swap?inputMint=${USDC_MINT}&outputMint=${PUSD_MINT}`}>
  <Button className="w-full" size="sm">
    Swap USDC → PUSD
  </Button>
</Link>
```

The contract: **the swap page accepts `inputMint` and `outputMint` URL params and seeds its token pickers from them**. Any feature in the app can drive a pre-filled swap by linking to this URL with the right mints. PUSD just happens to be the first user.

If you reuse the swap page in another project, keep this URL contract — it's the cheapest possible "deep link" mechanism and decouples promotional cards from swap logic.

---

## 6. The swap UI itself — Jupiter Ultra, end-to-end

[src/app/cockpit/swap/page.tsx](src/app/cockpit/swap/page.tsx) is the page the card hands off to. It is **not PUSD-specific** — it's the project's general swap surface — but you'll need it (or an equivalent) in your destination project, so here's how it works.

### 6.1 Why Jupiter Ultra (not the regular Swap API)

This page uses Jupiter's **Ultra** tier. Compared to plain `/swap/v1/quote + /swap/v1/swap`, Ultra:

- Returns a **fully-built, signed-ready transaction** in the order response (`order.transaction`, base64 `VersionedTransaction`). You don't construct the tx yourself.
- **Jupiter broadcasts the transaction** server-side via `/ultra/v1/execute` after you sign it locally (MEV-protected landing).
- Bundles a **Shield** scam-detection lookup (`/ultra/v1/shield`) — flags the output token if it's a known scam/spoof/honeypot.
- Returns a **`requestId`** that correlates the order to the execute call, so Jupiter can match them.

Net effect: client code is shorter, transactions land more reliably, and risky tokens get a visible warning before signature.

### 6.2 Page lifecycle

The page is a client component wrapped in `<Suspense>` (required because it reads `useSearchParams`). The inner component, `SwapPageInner`, runs through these states:

```
mount
  └─ read ?inputMint, ?outputMint from URL (fall back to USDC/SOL)
  └─ hit POST /ultra/v1/search for both mints in parallel → seed pickers

user types amount
  └─ presses "Get Quote"
      └─ POST /ultra/v1/order        (quote + transaction)
      └─ POST /ultra/v1/shield       (scam check on output mint)
      └─ render route, slippage, priority fee, price impact

user reviews and presses "Swap …"
  └─ decode order.transaction (base64 → VersionedTransaction)
  └─ wallet.signTransaction(tx)
  └─ POST /ultra/v1/execute { signedTransaction, requestId }
  └─ render Solscan link with returned signature
  └─ optional: Umbra "Shield output" — privacy-shield the received tokens
  └─ fire-and-forget Torque event (trackSwapEvent) for analytics
```

### 6.3 State management (all `useState`, no library)

```ts
const [inputToken, setInputToken]   = useState<UltraSearchToken | null>(null);
const [outputToken, setOutputToken] = useState<UltraSearchToken | null>(null);
const [amount, setAmount]           = useState('');
const [order, setOrder]             = useState<UltraOrder | null>(null);
const [outputShield, setOutputShield] = useState<ShieldWarning[]>([]);
const [quoting, setQuoting]   = useState(false);
const [swapping, setSwapping] = useState(false);
const [success, setSuccess]   = useState(false);
const [txSignature, setTxSignature] = useState<string | null>(null);
const [error, setError]       = useState<string | null>(null);
```

`resetResult()` (page.tsx:94) zeros everything except the tokens/amount — called whenever inputs change so a stale quote can't be signed.

### 6.4 The three button states (page.tsx:327-364)

The action button at the bottom is a 3-way state machine:

| Condition | Button | Action |
|---|---|---|
| `!connected` | "Connect Wallet" | Opens Jupiter Wallet Adapter modal. |
| `connected && !order` | "Get Quote" | Calls `ultra.getOrder()` + `ultra.getShield()` in parallel. |
| `connected && order` | "Swap X → Y" (or "Blocked by Shield" if `outputShieldSeverity === 'critical'`) | Decodes tx, signs, executes. |

`disabled` flags additionally guard against missing tokens, same-token swaps, in-flight requests, and wallets that can't sign (e.g. read-only sessions).

### 6.5 The actual swap call (page.tsx:137-182)

```ts
const tx     = decodeBase64Transaction(order.transaction);  // base64 → VersionedTransaction
const signed = await signTransaction(tx);                    // Wallet Adapter
const result = await ultra.executeOrder(signed, order.requestId);
setTxSignature(result.signature);
```

`decodeBase64Transaction` is exported from `JupiterUltraService` so the page doesn't import `@solana/web3.js` directly for this. `executeOrder` re-encodes the signed tx as base64 and POSTs `{ signedTransaction, requestId }` to `/ultra/v1/execute`. Jupiter lands it.

### 6.6 Shield (scam detection) UX

`ultra.getShield([outputMint])` is called **alongside** `getOrder` (Promise.all). The response is a `Record<mint, ShieldWarning[]>`. Each warning has:

```ts
{ type: string; message: string; severity: 'info' | 'warning' | 'critical' }
```

`maxShieldSeverity()` reduces an array of warnings to its worst severity. The page:

- Renders a `<ShieldBanner>` above the quote details (info = grey, warning = amber, critical = red).
- Sets `outputBlocked = severity === 'critical'`, which **disables the swap button** and changes its label to "Blocked by Shield". The user literally cannot proceed.

This is the bit that makes the swap page safe to expose to arbitrary mints (including new/unknown ones like a freshly-minted PUSD).

### 6.7 Token search / picker

The two `<TokenSearchCombobox>` instances drive token selection. Each search query hits Jupiter's `/ultra/v1/search` endpoint, which returns `UltraSearchToken[]` with name, symbol, icon, decimals, USD price, mcap, liquidity, holder count, organic score, verification status. No local token list — fully scalable.

`disabledMint` cross-wires the two pickers so users can't accidentally pick the same token on both sides.

### 6.8 Optional integrations on the swap page (not part of the PUSD feature, but useful to know if you're porting)

- **Umbra Privacy** — if `useUmbra()` reports availability, a "Shield output" button appears after a successful swap. One click sends the received tokens into Umbra's privacy-shielded UTXO set. Skip if you don't need this.
- **Torque analytics** — `trackSwapEvent(...)` fires after every successful swap. It's fire-and-forget; failures don't surface to the user. Skip if you're not using Torque.
- **Wallet adapter** — Jupiter Wallet Adapter (`@jup-ag/wallet-adapter`) provides `useWalletConnection()`. Any Solana wallet adapter implementation works; you just need `connected`, `publicKey`, `signTransaction`, and a way to open a connect modal.

---

## 7. Porting checklist — minimum viable PUSD integration in another project

If your destination project already has any Solana swap UI that accepts `?inputMint=&outputMint=` URL params, you only need steps 1–3:

1. **Add the constant.** Drop into your config file:
   ```ts
   export const PUSD_MINT = process.env.NEXT_PUBLIC_PUSD_MINT ?? '';
   ```
2. **Copy [src/components/features/FreedomSwapCard.tsx](src/components/features/FreedomSwapCard.tsx)** into your components folder. Adjust:
   - The import paths (`@/components/ui/Card`, `@/components/ui/Button`, `@/lib/constants`).
   - The `<Link href={...}>` to point at *your* swap route's URL contract.
3. **Mount it** somewhere prominent (dashboard, sidebar, modal). Remember `max-w-md` if you want it card-sized.
4. **(Once Palm USD confirms)** set `NEXT_PUBLIC_PUSD_MINT=<solana-spl-mint>` in env. The card lights up.

If your destination project has **no swap UI**, you also need:

5. **Copy `JupiterUltraService.ts`** ([src/services/JupiterUltraService.ts](src/services/JupiterUltraService.ts)) and the Ultra endpoint constants it imports from `lib/constants.ts` (`JUPITER_ULTRA_ORDER_API`, `_EXECUTE_API`, `_SHIELD_API`, `_HOLDINGS_API`, `_SEARCH_API`, `jupiterHeaders`).
6. **Copy `swap/page.tsx`** ([src/app/cockpit/swap/page.tsx](src/app/cockpit/swap/page.tsx)). Strip the Umbra and Torque blocks if you don't use them — they're additive, not load-bearing.
7. **Copy `TokenSearchCombobox`** (the picker the swap page uses).
8. **Wire a Solana wallet adapter.** Jupiter Wallet Adapter is the easiest match because the page expects `signTransaction` to return a signed `VersionedTransaction`.

---

## 8. Why this design (worth preserving when you port it)

- **Single boolean (mint set?) gates the entire feature.** No feature flag service, no remote config, no admin toggle. One string.
- **The card is dumb.** It does no quoting, no signing, no balance checks. It links. Logic lives on the swap page where it belongs.
- **PUSD-specific code surface is tiny** (one constant + one card ≈ 90 lines). Swap infra is reused, not forked. When PUSD adds features (rebases, governance, whatever), you don't have a parallel codebase to update.
- **Jupiter does the heavy lifting.** Routing, MEV protection, transaction landing, scam screening — all Jupiter Ultra. Your project doesn't take on protocol risk for swap mechanics.

---

## 9. Open items / what to do when the Solana mint lands

1. Set `PUSD_MINT` (env or constant). Verify the card renders.
2. Test the deep-link end-to-end: click "Swap USDC → PUSD" → confirm the swap page loads with both pickers pre-filled.
3. Run a small swap on mainnet with real USDC. Confirm Shield doesn't flag PUSD critical (it shouldn't — it's a verified mint — but a fresh listing may surface "low liquidity" warnings; those are info/warning, not critical, and won't block).
4. Optionally: add a PUSD icon to wherever your `getTokenIcon(mint)` helper resolves icons. The card itself doesn't need this (it draws its own circle), but the swap page picker will use it.
5. Update the changelog ([src/app/(public)/log/page.tsx:15](src/app/%28public%29/log/page.tsx#L15)) and [LANDING.md:533](LANDING.md#L533) — both currently say "(pending Solana mint)".

---

## Appendix A — Status in Y-Vault (2026-04-25)

The §2 file map above describes the **source project** (a separate cockpit-style dApp). None of those paths exist in Y-Vault yet. Snapshot of what is and isn't here:

**Already in this repo:**
- `src/lib/jupiter/` — internal helpers (`adapters.ts`, `builders.ts`, `scoring.ts`, `types.ts`, `upstream.ts`, `utils.ts`). These are for token-research / scoring, **not** Jupiter Ultra swap.
- Jupiter Wallet Adapter is on the dependency tree (per [CLAUDE.md](CLAUDE.md) accepted-vulns section).
- App routes: `src/app/page.tsx`, `src/app/token/`, `src/app/api/{auth,birdeye,jupiter,tokens-xyz,watchlist}/`. No `cockpit/` segment, no `swap/` page.

**Missing — needs porting before PUSD integration can ship in Y-Vault:**
- `src/lib/constants.ts` — does **not** exist. `PUSD_MINT` has no current home. Closest existing file is [src/lib/featureFlags.ts](src/lib/featureFlags.ts); decide whether to create `constants.ts` or fold the mint into the feature-flags module.
- `src/components/features/FreedomSwapCard.tsx` — does not exist. There is no `features/` subfolder under [src/components/](src/components/) (current siblings: `agent-elements/`, `home/`, `layout/`, `providers/`, `search/`, `tabs/`, `ui/`, `wallet/`, `watchlist/`). Pick a home before porting.
- `src/components/features/ProjectOverview.tsx` — does not exist. There is no equivalent "cockpit overview" surface. The card needs a different mount point in Y-Vault (homepage? a wallet-connected dashboard? TBD with user).
- `src/services/JupiterUltraService.ts` — does not exist. There is no `src/services/` folder. This is the largest gap: porting the swap UI requires the Ultra client.
- `src/app/cockpit/swap/page.tsx` — does not exist. Y-Vault has no swap surface at all.
- `TokenSearchCombobox` — does not exist (Y-Vault has [src/components/search/](src/components/search/) for token research, not for swap-pair selection).
- `src/app/(public)/log/page.tsx` and `LANDING.md` — do not exist in Y-Vault.

**Implication.** The "minimum viable" port (steps 1–3 of §7) is **not viable here** because Y-Vault has no swap UI. We're in the §7-steps-5-through-8 path: porting the entire swap surface. That is a large, multi-file change and per [CLAUDE.md](CLAUDE.md) needs explicit user approval before any of it begins.

---

## Appendix B — Jupiter readiness check (2026-04-25)

The Solana SPL mint provided by the user is `CZzgUBvxaMLwMhVSLgqJn3npmxoTo6nzMNQPAnwtHF3s`. Verified live against Jupiter and DexScreener on 2026-04-25:

**On-chain truth (good):**
- Mint exists and is indexed by Jupiter's `/ultra/v1/search`.
- `freezeAuthorityDisabled: true` — the "non-freezable" claim is real on-chain.
- Decimals: 6.

**Blockers (cannot swap today):**

1. **No metadata.** Jupiter returns `"name": "", "symbol": ""`. Searching "PUSD" or "Palm USD" in any swap UI returns nothing — only pasting the full 44-char mint surfaces it. Palm USD team must publish on-chain metadata (Token-2022 metadata extension or Metaplex).
2. **Zero liquidity pools anywhere.** DexScreener `tokens/<mint>` returns `"pairs": null`. Jupiter `/ultra/v1/order` (USDC → PUSD, 1 USDC) returns `{ "error": "Failed to get quotes" }`. Without a pool on Raydium / Orca / Meteora / etc., **no DEX can route a swap**, Jupiter included.
3. **Token-2022 + "unknown" tag.** `tokenProgram = TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb` (Token-2022, not classic SPL). Jupiter tags it `["unknown", "token-2022"]` with `organicScore: 0` ("low"). Even with metadata + a pool, Jupiter's UI hides "unknown" tokens by default until the mint earns trust signals or is whitelisted.

**Other observed state (informational):**
- `mintAuthority: Gz87Mjd2dAaYtCsUWAkHrn3UQe6Haj1odthoPEDQarKo` (still active — supply can grow).
- Circulating / total supply: 2,895,000.
- Holder count: 6.
- Created: 2026-01-22.

**What Palm USD team must do before this integration goes live (not us):**

1. Publish on-chain metadata (name = "Palm USD", symbol = "PUSD", logo URI).
2. Seed a USDC/PUSD pool on at least one major Solana DEX (Raydium / Orca / Meteora) or contract a market maker.
3. Apply for inclusion in Jupiter's verified token list once liquidity is live, so the "unknown" tag drops.

**Implication for setting `PUSD_MINT` today.** If we set the mint now, the Freedom Swap card would render and the deep-link would land on the swap page — but every "Get Quote" attempt would return `"Failed to get quotes"`. The card would look broken. **Recommendation: hold `PUSD_MINT` empty** until either DexScreener shows ≥1 USDC/PUSD pool or Jupiter `/ultra/v1/order` returns a successful quote.
