# PostCard

Status: draft
The feed unit. Composes Avatar + TokenChip + ReactionBar; has a milestone variant.

## Usage

```tsx
import { PostCard } from "@/design-system";

<PostCard
  kind="take"
  author={{ name: "Mira", handle: "mira", seed: wallet }}
  time="4m"
  body="JUP printing a clean higher-low."
  token={{ symbol: "JUP", price: "$0.8123", change24h: 4.2 }}
  reactions={reactions}
  onReact={onReact}
/>

<PostCard kind="milestone" direction="up" time="1h"
  body="BONK ran +12.4% in 24h." />
```

## Anatomy

```
Standard (watched / take)          Milestone
┌ surface-container, r-8, p-16 ┐   ┌ border-l-2 buy/sell ─┐
│ ◐28 @handle [kind]     time  │   │ ▲ system copy 14/1.5 │
│ body 14/1.5                  │   │   time               │
│ [TokenChip]      (optional)  │   └──────────────────────┘
│ ♥12 🔥8  (ReactionBar)       │   no author · leading ▲/▼
└──────────────────────────────┘   in buy/sell · left border
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `kind` | `"watched" \| "take" \| "milestone"` | — | Drives the badge tint; `milestone` switches layout. |
| `author` | `{ name, handle, seed?, you? }` | — | Required for watched/take; omit for milestone. |
| `time` | `string` | — | Preformatted relative time. |
| `body` | `ReactNode` | — | Take/note text, or system copy for milestone. |
| `token` | `{ symbol, iconSrc?, price, change24h }` | — | Optional tagged token → renders a `TokenChip`. |
| `reactions` / `onReact` | `Reaction[]` / `(emoji) => void` | — | Optional; both required to show the `ReactionBar`. |
| `direction` | `"up" \| "down"` | `"up"` | Milestone only — glyph + left-border color. |
| `className` | `string` | — | Merged via `cn`. |

## Tokens

- `--color-surface-container`, `--color-outline-variant` — card surface + hairline.
- Kind badge: `--color-brand` / `--color-fg-muted` / `--color-info` (+ their surfaces).
- `--color-buy` / `--color-sell` — milestone glyph + left border (direction).
- Composes the tokens of `Avatar`, `TokenChip`, `ReactionBar`.

## States

- **watched / take** — author row + badge; optional token + reactions.
- **milestone** — no author; leading ▲/▼ in buy/sell; `border-l-2` same color; body is system copy.
- **With / without token** and **with / without reactions** — each block is conditional.

## Motion

None of its own. Motion lives in the embedded `ReactionBar` (spring-pop). Card-level press `scale(0.98)` is intentionally **not** applied here — the card holds interactive children; wrap in a link at the call site if the whole card should navigate.

## A11y

- Semantic `<article>`; handle is real text, badge is text (not color-only).
- Milestone direction is encoded by glyph **and** color, not color alone.
- `body` accepts `ReactNode`; callers must escape/verify any user content (React escapes strings by default).
