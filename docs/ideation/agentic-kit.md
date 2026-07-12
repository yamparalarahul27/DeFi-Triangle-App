# Agentic kit — AI-native patterns for crypto UIs

> Captured 2026-07-12 after the CIDS pivot discussion. Reference points:
> Razorpay's RazorSense (a design language built *for an agentic
> environment*) and their Agent Studio (dispute/recovery/forecast agents).
> The web3 equivalent of that category is unclaimed. This doc parks the
> vision until Phase E component work reaches it — build AFTER the
> crypto-20 basics, on top of the stability program.

## Thesis

AI is entering crypto UIs in two shapes: **assistants that explain**
(what does this transaction actually do?) and **agents that act**
(delegated wallets executing intents). Both need UI patterns that don't
exist in generic design systems — and in crypto the stakes are
irreversible signatures, so these patterns are safety surfaces, not
chrome.

**The CIDS stance — trust discipline.** The sign-discipline rule
generalizes: *never let AI output look more certain, more human, or more
final than it is.* Confidence, provenance, and the AI-generated marker
are first-class visual primitives (like buy/sell), not footnotes.

## The five pattern families

```
1 INTENT INPUT      NL in → STRUCTURED plan out
                    never NL → sign directly
2 EXPLANATION       AI reads the raw tx, renders
  (pre-sign)        what it does + risk flags —
                    the anti-drainer pattern
3 AGENT ACTIVITY    delegated powers: scope cards,
  & PERMISSION      action feeds, kill switch
4 PROACTIVE         pushed insights ("peg risk
  INSIGHT           rising", "gas window ~2h")
5 TRUST PRIMITIVES  confidence · provenance ·
                    AI-generated marker
```

## Component shortlist (build order TBD)

| Component | Family | Sketch |
|---|---|---|
| `AiMarker` | 5 | The "AI-generated" chip every other piece embeds. Token-driven, never removable by styling. |
| `ConfidenceMeter` | 5 | Discrete bands (low/med/high), text + shape, never color-only. |
| `ProvenanceRow` | 5 | "based on simulation + 3 sources ▸" expandable. |
| `IntentBar` | 1 | Input affordance; emits parsed intent to the caller. |
| `PlanPreview` | 1 | Steps, route, est. out, slippage → simulate/sign actions. |
| `SignExplainer` | 2 | Plain-language tx summary + risk flags list; severity via warning/sell tokens. |
| `AgentScopeCard` | 3 | "can spend ≤ $50/day on DEX swaps" + revoke. |
| `AgentActionCard` | 3 | A PostCard-kind sibling: agent did X at T, outcome, undo-if-possible. |
| `InsightCard` | 4 | Proactive card: claim + Confidence + Provenance + one action. |
| `StreamingText` | all | Calm streaming (no typewriter theatrics; settle motion). |

## Token implications

- New accent family: `--agent` (+ `-surface`, `on-agent`) so agent
  surfaces are visually distinct from both brand (product voice) and
  info (system voice). Verified per theme by `check:contrast` like
  everything else.
- Motion: agent activity uses `--motion-settle` only. An agent moving
  money never gets `--motion-spring` — playfulness stays budgeted to
  human actions (DESIGN.md tone rule extends naturally).

## Non-goals (v1)

- No chat UI. CIDS ships the *primitives* products compose into chat if
  they want; a chat screen is a demo, not a component.
- No model/inference opinions — components take strings/structures;
  where they come from is the app's business.

## Sequencing

After the crypto-20 basics (WalletButton, AddressChip, TxStatus,
ChainBadge, AmountInput, SlippageControl…) — those are prerequisites:
`PlanPreview` composes AmountInput/TokenChip; `SignExplainer` composes
AddressChip/TxStatus. Trust primitives (`AiMarker`, `ConfidenceMeter`,
`ProvenanceRow`) can come first — they're small, dependency-free, and
set the visual language everything else inherits.
