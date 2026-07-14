# Sheet

Status: stable
Version: 1.0.0
Bottom sheet chrome — backdrop, grab handle, drag-to-dismiss, pinned footer. The base for CommentThread / Onboarding.

## Usage

```tsx
import { Sheet } from "@/design-system";

const [open, setOpen] = useState(false);

<Sheet open={open} onOpenChange={setOpen} title="Details"
  footer={<SubmitRow />}>
  <p>Scrolling body…</p>
</Sheet>
```

## Anatomy

```
      (backdrop: black/50 + blur)
┌ surface, rounded-t-12, max-w-430, max-h-85dvh ┐
│           ▭ grab handle (32×4, outline)         │ ← drag region
│ Title                                      ×   │
├────────────────────────────────────────────────┤
│ children (scrolls, min-h-0 flex-1)             │
├────────────────────────────────────────────────┤
│ footer (pinned, border-t, safe-area pad)       │
└──────────────────────────────────────────────────┘
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` | `boolean` | — | Controlled visibility. |
| `onOpenChange` | `(open: boolean) => void` | — | Fired by backdrop tap, Escape, close button, and drag-dismiss. |
| `title` | `ReactNode` | — | Header + accessible `Dialog.Title`. |
| `children` | `ReactNode` | — | Scrolling body. |
| `footer` | `ReactNode` | — | Optional pinned-bottom region. |
| `className` | `string` | — | Extra classes on the panel. |

## Tokens

- `--color-surface` panel · `--color-outline-variant` hairlines · `--color-outline` grab handle.
- `--motion-settle` — drag spring-back transition.
- Enter/exit slide via `tw-animate-css` (`slide-in-from-bottom` / `fade`).
- `--radius-sheet` (`rounded-t-sheet`) — top corners; `--radius-control` close button.

## States

- **Open / closed** — Radix `data-[state]`, slide + fade.
- **Dragging** — panel follows the finger downward (transition disabled).
- **Release** — `> 120px` closes; otherwise springs back on `--motion-settle`.

## Motion

Slide-up on open, slide-down on close; drag follows 1:1 then settles. Reduced-motion: the global reset collapses the slide/settle.

## A11y

- Radix Dialog: focus trap, `Escape`, scroll lock, `role="dialog"`, labelled by `title`.
- Close button is 28px with an `aria-label`; the handle is a redundant affordance, not the only dismiss.
- Centered `max-w-430` so it reads as a phone-width sheet on desktop too.
