# CommentThread

Status: draft
Comment bottom-sheet: threaded rows + a pinned composer. Built on `Sheet`.

## Anatomy

```
┌ Sheet · "12 comments" ─────────────┐
│ ◐28 @handle time                   │
│     body 14/1.5                    │
│     ♥ 5   reply                    │
│   ↳ ◐28 @handle (reply, indent 36) │ ← one level, border-l
│ …                                  │
├────────────────────────────────────┤
│ [ textarea            ] ( ↑ )      │ ← footer; counter ≤40 left
└──────────────────────────────────────┘
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` / `onOpenChange` | `boolean` / `(b) => void` | — | Controlled, forwarded to `Sheet`. |
| `comments` | `Comment[]` | — | `{ author, time, body, likes, liked?, replies? }`. Replies are one level. |
| `onLike` | `(index, replyIndex?) => void` | — | `replyIndex` set when a reply's ♥ is tapped. |
| `onSubmit` | `(text: string) => void` | — | Composer send (trimmed, non-empty). |

## Tokens

- Inherits `Sheet` tokens.
- `--color-surface-container` composer field · `--color-brand`/`--color-on-brand` send disc.
- `--color-outline-variant` row dividers + reply border · `--color-sell` over-limit counter.
- `.data-sm` like counts.

## States

- **Empty vs N** — title pluralizes.
- **Reply** — indented 36px with a left border, single level.
- **Liked** — ♥ + count in `text-brand`.
- **Composer** — send disabled until non-empty; counter appears at ≤ 40 remaining, turns `sell` if negative (input is hard-capped at 280).

## Motion

Sheet slide + drag-dismiss; ♥ and send buttons press-scale `0.96`.

## A11y

- Title from `Sheet`; ♥ exposes `aria-pressed`; send has `aria-label` + `disabled`.
- Textarea is a real form control; user text is React-escaped on render.
