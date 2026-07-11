# FollowButton

Status: draft
Follow / Following toggle. Fill→outline morph; unfollow needs no confirm.

## Usage

```tsx
import { FollowButton } from "@/design-system";

const [following, setFollowing] = useState(false);

<FollowButton
  following={following}
  onToggle={() => setFollowing((v) => !v)}  // flip optimistically; roll back on error
/>
```

## Anatomy

```
  Follow        →  tap  →   Following
┌──────────┐             ┌──────────────┐
│ bg-brand │             │ transparent  │
│ on-brand │             │ outline·muted│
└──────────┘             └──────────────┘
  filled                   morphs 200ms
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `following` | `boolean` | — | Controlled state. Flip optimistically at the call site; roll back on failure. |
| `onToggle` | `() => void` | — | Fired on tap. |
| `className` | `string` | — | Merged via `cn`. |

## Tokens

- `--color-brand`, `--color-on-brand` — the Follow (filled) state.
- `--color-outline`, `--color-fg-muted` — the Following (outline) state.
- `--motion-settle` — the fill→outline morph; `--motion-fast` — press scale.

## States

- **Follow** (`following=false`) — filled brand, dark on-brand text.
- **Following** (`following=true`) — transparent, outline border, muted text.
- **Press** — `scale(0.96)`.
- **Optimistic/pending** — caller's concern: set `following` immediately, revert on error.

## Motion

`--motion-settle` (200ms) morphs background / border / color between the two states. Label swaps at the state change (no separate crossfade in v1). Reduced-motion: neutralized globally.

## A11y

- `aria-pressed={following}` communicates toggle state to AT.
- Height 28px per the tide sm-button spec; pair with adequate spacing in dense rows.
