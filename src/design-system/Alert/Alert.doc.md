# Alert

Status: draft
Version: 0.9.0
Inline callout for conditions — info, success, warning, error — on the tinted state surfaces.

## Usage

```tsx
import { Alert, Button } from "@/design-system";

<Alert tone="warning" title="High price impact">
  This trade moves the pool price by 4.2%.
</Alert>

<Alert tone="error" title="Feed unavailable" action={<Button size="sm" variant="ghost">Retry</Button>}>
  Prices may be stale.
</Alert>
```

Best for: a *condition* the user should read in place — degraded data,
risky input, a success confirmation that must persist. Toast is for
*events* (fire-and-forget); Alert stays in the flow next to what it
describes. One Alert per condition; stacking three banners means the
screen has a different problem.

## Anatomy

```
┌────────────────────────────────┐
│ NOTE Title            [Action] │ ← tone word + title (tone ink)
│ supporting line                │ ← children (fg-muted)
└────────────────────────────────┘ ← tinted state surface, rounded-card
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `tone` | `"info" \| "success" \| "warning" \| "error"` | `"info"` | Picks surface tint + ink + tone word. |
| `title` | `string` | — | Required — the condition, stated plainly. |
| `children` | `ReactNode` | — | Optional supporting line(s). |
| `action` | `ReactNode` | — | Right-aligned affordance (small Button). |
| `className` | `string` | — | cn-merged. |

## Tokens

`--info-surface`/`--info` · `--success-surface`/`--success` ·
`--warning-surface`/`--warning` · `--error-surface`/`--error` ·
`--radius-card`

## States

The four tones are the states. Each pairs a tinted surface with its ink
**and a tone word** (NOTE/OK/WARNING/ERROR) — direction never rides on
color alone (mono theme collapses hue).

## Motion

None. Alerts appear with their content; a condition arriving *after*
render is usually a Toast's job first, then an Alert if it persists.

## A11y

`role="alert"` (assertive) only for `tone="error"`; the rest use
`role="status"` (polite) so screen readers aren't interrupted for
notes. The tone word doubles as a non-color state cue. Keep `title`
meaningful without the body — it's what gets announced first.
