# ReactionBar

Status: draft
Row of emoji-reaction pills with counts, plus a `+` picker. Tap = spring-pop.

## Usage

```tsx
import { ReactionBar, type Reaction } from "@/design-system";

const [reactions, setReactions] = useState<Reaction[]>([
  { emoji: "♥", count: 12, mine: true },
]);

<ReactionBar
  reactions={reactions}
  onReact={(emoji) => toggleAndPersist(emoji)}  // counts are yours to update
/>
```

## Anatomy

```
 ♥12  🔥8  🧠4   +          ← pills h-44 hit area
 └┬┘              └ opens picker popover
  └ mine: bg-brand/10, count text-brand
                  ┌ ♥ 🔥 👀 🧠 😅 📈 ┐  ← picker, surface-bright
                  └──────────────────┘
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `reactions` | `Reaction[]` | — | `{ emoji, count, mine? }`. Counts/mine are owned by the caller. |
| `onReact` | `(emoji: string) => void` | — | Fired on pill tap or picker choice. |
| `pickerEmojis` | `string[]` | `♥ 🔥 👀 🧠 😅 📈` | Emoji offered by the `+` picker. |
| `className` | `string` | — | Merged via `cn`. |

## Tokens

- `--color-brand` (via `bg-brand/10` + `text-brand`) — own-reaction state.
- `--color-fg-muted` — counts / `+`.
- `--color-surface-bright`, `--color-outline-variant` — picker popover.
- `--motion-spring` (via `.animate-pop`) — the tap bounce; `--motion-fast` — press scale.
- `.data-sm` — the count numerals.

## States

- **Default** — transparent pill, `fg-muted` count.
- **Mine** (`mine=true`) — `bg-brand/10`, count in `text-brand`.
- **Popping** — the tapped emoji plays `.animate-pop` once (re-armed each tap).
- **Picker open** — `+` toggles the popover; choosing closes it.

## Motion

`--motion-spring` (250ms, overshoot) scales the emoji `1 → 1.3 → 1` on tap — the budgeted-playfulness moment (DESIGN.md → Identity). Cleared on `animationend` so repeated taps replay. Reduced-motion: the global reset collapses the animation.

## A11y

- Pills expose `aria-pressed` (own-reaction); `+` exposes `aria-label` + `aria-expanded`.
- Pill hit area 44px; picker items 40px; `+` is 44×44.
- Picker is `role="menu"` / `role="menuitem"`.
