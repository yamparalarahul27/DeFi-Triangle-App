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

## Guards (run before any UI PR)

| Command | Asserts |
|---|---|
| `npm run check:theme` | no hardcoded hex utility classes; token layer intact |
| `npm run check:polish` | concentric radius, targeted transitions, hit areas, text-wrap |
| `npm run check:contrast` | identity hues pass WCAG AA (glyph + accent) |
| `npx tsc --noEmit` · `npm run lint` | types + lint |

## Rules of thumb

- **Consume, don't invent.** No hex, no magic durations — reference a token.
- **Mock is the contract.** Anatomy comes from the HTML mock; if the mock and
  your build disagree, the mock wins (or you propose changing the mock first).
- **Playfulness is budgeted.** Per DESIGN.md → Identity: spring motion only on
  feedback to human actions, never on static/data surfaces.
- **Stop and propose** before adding a dependency, a new token, or a component
  not already specified in `docs/tide/`.
