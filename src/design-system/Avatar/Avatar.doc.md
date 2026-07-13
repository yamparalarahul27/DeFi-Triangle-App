# Avatar

Status: stable
Per-person identity disc — a hue-gradient circle with the person's initial.

## Usage

```tsx
import { Avatar } from "@/design-system";

<Avatar name="mira" seed={walletAddress} size="md" />
<Avatar name="you" you size="sm" />  {/* signed-in user: --id-tide */}
```

## Anatomy

```
   ┌─────────┐
   │    M    │  ← glyph: first letter of `name`,
   │ (hue    │    --fg-inverse on the hue gradient,
   │  disc)  │    font-mono 600
   └─────────┘
   radial-gradient(120% 120% at 30% 20%,
     var(--id-<hue>),
     color-mix(in srgb, var(--id-<hue>) 60%, black))
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `name` | `string` | — | First character → glyph; also the `aria-label`. |
| `seed` | `string` | `name` | Value hashed to pick the hue. Pass the wallet address for stable per-person color. |
| `hue` | `IdHue` | — | Explicit override; skips hashing. |
| `size` | `"xs" \| "sm" \| "md" \| "lg"` | `"md"` | xs 20 · sm 28 · md 40 · lg 64 px; glyph scales with the disc. |
| `you` | `boolean` | `false` | Forces the reserved `--id-tide` hue (the signed-in user). |
| `className` | `string` | — | Merged via `cn` (e.g. group ring/overlap). |

## Tokens

- `--id-*` (via `hueGradient`) — the 8 identity hues. Consumed as the fill only.
- `--color-fg-inverse` (`text-fg-inverse`) — the dark glyph color the contrast guard verifies.

## States

Single visual state (identity is not interactive). Press/hover feedback belongs to the wrapping control (link/card), not the Avatar.

## Motion

None. Static identity surface — playfulness is budgeted to feedback, not to identity chrome.

## A11y

- `role="img"` + `aria-label={name}` so AT reads the person, not the letter.
- Glyph contrast: dark `--fg-inverse` on every hue is **7.6–11.5:1** (AA), enforced by `npm run check:contrast`. The gradient's darkest corner is lower but the centered glyph never lands there.
- Decorative-only usage next to a visible handle: pass an empty label at the call site if the name is already announced.
