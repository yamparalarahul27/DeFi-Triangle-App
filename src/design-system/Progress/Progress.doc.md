# Progress

Status: draft
Version: 0.9.0
Progress bar on Radix Progress — determinate (0–100) or indeterminate shimmer.

## Usage

```tsx
import { Progress } from "@/design-system";

<Progress aria-label="Upload progress" value={64} />
<Progress aria-label="Syncing" />  {/* no value → indeterminate */}
```

Best for: an operation with a lifecycle the user is waiting on —
uploads, sync, multi-step submission. Loading *content*? Use Skeleton
(placeholder shapes). Tracking a *transaction*? Use TxStatus (discrete
stages beat a percentage for chain confirmations).

## Anatomy

```
━━━━━━━━━━━━░░░░░░░░  ← track: surface-bright, h-1.5, pill
└─ indicator: brand fill, width = value%
   (indeterminate: ⅓-width segment sliding on loop)
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `value` | `number` | — | 0–100, clamped. **Omit for indeterminate.** |
| `aria-label` | `string` | — | Required — names the bar for screen readers. |
| `className` | `string` | — | cn-merged onto the track (e.g. `h-2`, width). |

## Tokens

`--surface-bright` (track) · `--brand` (indicator) · `--ease-settle`

## States

- **Determinate**: indicator width tracks `value`; `aria-valuenow` set.
- **Indeterminate**: no `value` — shimmer loop, `aria-valuenow` absent
  (announced as busy, not a percentage).
- Progress has no error state — a failed operation is an Alert or
  Toast, not a red bar.

## Motion

Determinate width eases 300ms per update (values arrive in steps; the
ease smooths them). Indeterminate is the system's one sanctioned
looping animation — 1.2s slide, settle curve, quiet by design. Both
neutralized by `prefers-reduced-motion`.

## A11y

Radix renders `role="progressbar"` with `aria-valuemin/max/now` wired
(`aria-valuenow` omitted when indeterminate). `aria-label` is a required
prop — an unnamed progress bar announces as "progress bar, 64%" of
nothing. Never convey completion by color alone; pair with text
("64%" or "Uploading…") when the number matters.
