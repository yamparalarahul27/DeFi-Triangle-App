# AvatarGroup

Status: stable
Overlapping row of Avatars with a `+N` overflow disc — "who's here" at a glance.

## Usage

```tsx
import { AvatarGroup } from "@/design-system";

<AvatarGroup
  members={watchers.map((w) => ({ name: w.handle, seed: w.wallet }))}
  max={3}
/>
```

## Anatomy

```
 ◐◐◐ +38          ← up to `max` avatars, then a +N disc
 └┬┘ └┬┘
  │   └ surface-bright disc, fg-muted, "+N"
  └ Avatars, -8px overlap, 2px surface-container ring
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `members` | `AvatarGroupMember[]` | — | `{ name, seed?, hue?, you? }`. Render order is the caller's concern — spec wants followed-by-you first. |
| `max` | `number` | `3` | Avatars shown before collapsing to `+N`. |
| `size` | `20 \| 28` | `20` | Avatar diameter. |
| `className` | `string` | — | Merged via `cn`. |

## Tokens

- Inherits `--id-*` through `Avatar`.
- `--color-surface-container` (`ring-surface-container`) — the 2px separating ring.
- `--color-surface-bright` + `--color-fg-muted` — the `+N` overflow disc.

## States

- **Overflow** — `members.length > max` renders the `+N` disc; otherwise omitted.
- **Single member** — `aria-label` uses "person"; plural otherwise.

## Motion

None — inherits Avatar's static nature.

## A11y

- Group carries an `aria-label` count ("41 people"); the `+N` disc is `aria-hidden` (it's a count glyph, already covered by the label).
- Ring is a `box-shadow` ring (no layout shift), so overlap stays pixel-stable.
