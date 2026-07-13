# EmptyState

Status: draft
Designed empty -- cold-start is a first-class state.

## Usage

```tsx
import { EmptyState, Button } from "@/design-system";

<EmptyState
  title="No watchers yet"
  hint="Quiet tide. First one in sets the current."
  action={<Button variant="primary">Watch JUP</Button>}
/>
```

## Anatomy

```
+ ~ dashed outline card ~ +
|          @              |
|    No watchers yet      |
|  one playful hint line  |
|      [ action ]         |
+-------------------------+
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `glyph` | `string` | `"@"`-like marker | Decorative, aria-hidden. |
| `title` | `string` | -- | The factual line. |
| `hint` | `string` | -- | One line -- the playful budget lives here. |
| `action` | `ReactNode` | -- | Usually a Button. |
| `className` | `string` | -- | cn-merged. |

## Tokens

- `--surface-container` - `--outline` (dashed) - `--radius-card` - fg ramp

## States

Static composition; the action carries the interactive states.

## Motion

None of its own.

## A11y

- Title is real text; glyph is `aria-hidden`.
- Keep hints human, not hype (voice rules).
