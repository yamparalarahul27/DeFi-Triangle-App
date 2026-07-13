# Design system — conventions

> The tide design system, shaped after [Astryx](https://github.com/facebook/astryx):
> an **in-repo module** (not an npm monorepo) whose defining trait is that
> **a person and an AI agent build the same way** — because every component
> ships the same predictable doc shape, and tokens are consumed, never invented.
>
> This file is the contract. [DESIGN.md](../../DESIGN.md) is the source of
> truth for tokens and rules; this defines how components under
> `src/design-system/` are authored and documented.

---

## Layer model

```
┌ COMPONENTS  src/design-system/           ┐
│   typed React + colocated .doc.md         │
├ DOCS        Component.doc.md (this shape)  │  ← humans + AI read the same file
├ TOKENS      globals.css @theme (SoT)       │  ← consume only; never define here
├ RULES       DESIGN.md + polish skill       │
└ GUARDS  check:theme · check:polish · check:contrast ┘
```

The design system **consumes** tokens — it never declares color/spacing/motion
values of its own. New foundations (a hue, a motion pair) are added to
`globals.css` + DESIGN.md first, verified by a guard, *then* consumed here.

## Directory shape

```
src/design-system/
  CONVENTIONS.md          ← this file
  <Component>/
    <Component>.tsx        ← the component
    <Component>.doc.md     ← the doc (shape below) — REQUIRED
    index.ts               ← re-export
```

One folder per component. Colocation over nesting: the doc sits next to the
code so neither drifts from the other, and an agent grepping for a component
finds its spec in the same directory.

## The doc shape (every component ships this)

Every `<Component>.doc.md` has these sections **in this order**. Uniformity is
the point — an agent can rely on the layout without re-learning it per file.

```
# <Component>

Status: draft | stable        ← draft = API may change; stable = safe to depend on
One-line purpose.

## Usage
A copy-pasteable tsx snippet: the import + the canonical call(s). This is
what the inspector's doc tab and future registry docs surface first.

## Anatomy
ASCII wireframe lifted from the mock (docs/tide/06-ui-spec.md or the
public/Prototypes/tide/ HTML). The picture is the contract.

## Props
Typed table: prop | type | default | notes. Mirror the .tsx exactly.

## Tokens
Every token this component CONSUMES (--id-*, --motion-*, surface/fg/…).
It must consume only — if a value isn't a token yet, stop and add it to
globals.css + DESIGN.md first (see Layer model).

## States
default / hover / active / disabled / loading / empty / error — whichever
apply. Each says which tokens/classes change.

## Motion
Which --motion-* token, on which property, when. "none" is a valid answer.

## A11y
Hit area (≥ 40×40, tide bars ≥ 44×44), contrast (cite the check:contrast
result if hue-dependent), reduced-motion behavior, keyboard/focus.
```

A component is not done until its `.doc.md` exists and every section is filled
(or explicitly marked N/A). "Docs later" is not allowed — the doc is how the
next human *and* the next agent build against it.

## Component API contract

Uniform prop conventions — every component follows all of these (Phase-2
of the roadmap unified the older ad-hoc APIs; future components must
comply from their first commit):

1. **`className` on every component**, merged with `cn()` (never string
   concatenation — concatenation breaks tailwind-merge dedup). Sheet-based
   components (CommentThread, Onboarding) forward it to the Sheet panel.
2. **`size` is a string union from the shared scale** — a subset of
   `"xs" | "sm" | "md" | "lg" | "xl"`, never raw numbers. Each component
   documents its px mapping in its doc's Props table (Avatar: xs 20 ·
   sm 28 · md 40 · lg 64; TokenIcon: sm 20 · md 24 · lg 32). Components
   without a size prop are fixed-size by design — say so in the doc.
3. **Controlled callbacks are `on<Event>`** (`onChange`, `onReact`,
   `onOpenChange`…) and state is the caller's: components never own the
   domain value, only ephemeral UI state (open pickers, drag offsets).
4. **Behavior comes from Radix** for anything with focus/dismiss/keyboard
   semantics (Sheet → Dialog, ReactionBar picker → Popover). Hand-rolled
   keyboard handling is allowed only for patterns Radix doesn't ship
   (Lane's roving tabindex) and must implement the full WAI-ARIA pattern.
5. **Server-safe by default** — `"use client"` only where state/handlers
   require it; the doc notes which.

## Stability: what `stable` promises

A component is promoted `draft → stable` only when ALL of these hold:

1. **API reviewed & frozen** — after promotion, props are only *added*.
   Renaming, removing, or retyping a prop requires a `CHANGELOG.md` entry
   with a migration note.
2. **Tests pass** — the component's colocated `<Name>.test.tsx` covers
   render, its key interactions, and its accessibility contract
   (`npm test`).
3. **Doc complete** — all seven sections (guard-enforced).
4. **Both themes verified** — renders correctly in `dark` and `mono`.

Promotions and breaking changes are recorded in [`CHANGELOG.md`](../../CHANGELOG.md).
Test files are colocated but NOT part of the vendored folder (excluded
from the portability import whitelist).

## Guards (run before any UI PR)

| Command | Asserts |
|---|---|
| `npm run check:theme` | no hardcoded hex utility classes; token layer intact |
| `npm run check:polish` | concentric radius, targeted transitions, hit areas, text-wrap |
| `npm run check:contrast` | identity hues pass WCAG AA (glyph + accent) |
| `npm run check:portable` | imports whitelist (react · radix-ui · @/lib/utils · self) + every component ships .tsx/.doc.md/index.ts with all doc sections (Usage…A11y) |
| `npm test` | component behavior suite (vitest + testing-library) |
| `npx tsc --noEmit` · `npm run lint` | types + lint |

## Rules of thumb

- **Consume, don't invent.** No hex, no magic durations — reference a token.
- **Stay portable.** A component folder must work copied into any
  Tailwind+React app: import only react, radix-ui, `@/lib/utils`, or the
  design system itself. Never app components/hooks/lib. Enforced by
  `npm run check:portable`.
- **Mock is the contract.** Anatomy comes from the HTML mock; if the mock and
  your build disagree, the mock wins (or you propose changing the mock first).
- **Playfulness is budgeted.** Per DESIGN.md → Identity: spring motion only on
  feedback to human actions, never on static/data surfaces.
- **Stop and propose** before adding a dependency, a new token, or a component
  not already specified in `docs/tide/`.
