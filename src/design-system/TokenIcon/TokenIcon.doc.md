# TokenIcon

Status: draft
Token logo disc with a graceful initials fallback — the base identity mark for assets (as Avatar is for people).

## Anatomy

```
 ┌────┐          ┌────┐
 │ ◍  │   or     │ JU │
 └────┘          └────┘
  img,            fallback disc:
  rounded-full,   surface-bright,
  object-cover    first 2 letters
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `src` | `string?` | — | Logo URL. Missing or failing → initials disc. An icon-CDN default (resolve by symbol) is a planned follow-up; today the caller supplies the URL. |
| `symbol` | `string?` | `"?"` | First 2 chars uppercase → fallback initials; also the `alt`/`aria-label`. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | 20 / 24 / 32 px. |
| `className` | `string` | — | Appended (e.g. ring, border). |

## Tokens

- `--color-surface-bright` — fallback disc fill.
- `--color-fg` — fallback initials.

## States

- **Loaded** — the image, round, `object-cover`.
- **Fallback** — no `src`, or the image errored (`onError` resets per-`src`): initials disc.

## Motion

None.

## A11y

- `alt`/`aria-label` from `symbol`; fallback disc keeps the label so AT reads the asset either way.
- Purely decorative next to a visible symbol? Pass context at the call site — the component always labels itself.
