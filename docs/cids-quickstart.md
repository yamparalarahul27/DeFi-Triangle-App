# CIDS quickstart — themed component in under 5 minutes

> The adopter path (cids-roadmap Phase 7). CIDS distributes **copy-in**,
> shadcn-style: the code lands in *your* repo, you own it. Requirements:
> a Next.js (or any React) app with **Tailwind v4** and the shadcn CLI
> conventions (`@/lib/utils` cn helper).

## 1 · Point the CLI at the CIDS registry

In your app's `components.json`, add the namespace (create the file
with `npx shadcn init` if you don't have one):

```json
{
  "registries": {
    "@cids": "https://<your-cids-deployment>/r/{name}.json"
  }
}
```

## 2 · Install the tokens (once)

```bash
npx shadcn add @cids/tokens
```

This writes `app/cids-tokens.css` — the full token layer: surfaces,
semantic colors, identity hues, spacing/z/elevation/motion, the
financial type ramp, **four themes** (dark · mono · light · violet) and
the **compact density axis**. Import it from your root layout (it
includes `@import "tailwindcss"`, so it replaces a default globals):

```tsx
import "./cids-tokens.css";
```

## 3 · Add components

```bash
npx shadcn add @cids/button
npx shadcn add @cids/data-table @cids/price-change
npx shadcn add @cids/tx-status @cids/amount-input   # the crypto layer
```

Cross-dependencies resolve automatically (`@cids/post-card` pulls
avatar, token-chip, reaction-bar). Every component lands in
`components/cids/<Name>/` **with its `.doc.md` beside the code** —
the spec travels with the source.

```tsx
import { Button } from "@/components/cids/Button/Button";

<Button variant="primary">Confirm</Button>
```

## 4 · Theme it (zero component changes)

```tsx
<html data-theme="light">          // or mono · violet · your own
<div data-density="compact">        // terminal density, scopeable
```

Author your own theme in minutes: one `[data-theme]` block — the
4-step recipe is in [DESIGN.md → Adding a theme](../DESIGN.md), and the
canvas **Theme Studio** exports a paste-ready block from live knobs.

## What you're depending on

- **Behavior:** `radix-ui` (declared per item) — focus, keyboard, ARIA.
- **Styling:** Tailwind utilities over the CIDS tokens; no other deps.
- **Guarantees:** every component shipped `Status: stable` passed the
  axe × 4-themes matrix, keyboard tests, and the sign-discipline guards
  in CI. Drafts are marked in the item description.
- **Freshness:** the registry is generated from source and CI fails if
  it drifts (`check:registry`) — what you install is what the canvas
  shows.

<sub>Patterns (states catalog, tx flow, form row, market list) are
documented in `src/design-system/PATTERNS.md` and live on the canvas —
copy the Code blocks; they compose the components you just installed.</sub>
