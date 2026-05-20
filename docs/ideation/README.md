<!--
  This folder holds *captured ideas* — things we've talked about but
  haven't scoped, planned, or scheduled. Treat each file as a postcard
  from a brainstorm: enough detail to remember why the idea mattered,
  not enough to start building.

  Promotion path:
    captured (here)  →  scoped (gets a plan doc + roadmap entry)
                    →  in-flight (gets a feature branch)
                    →  shipped (rolls into CHANGELOG.md)
-->

# Ideation

Captured product ideas, not yet scoped. Each file follows the same shape so they stay scannable.

## Current captures

| # | Idea | Surface | Status |
|---|---|---|---|
| 1 | [Multi-watchlist — named folders per wallet](./multi-watchlist.md) | data + UI | **backlogged — next iteration of Watchlist** |
| 2 | [Trade Edge — tab + CEX/DEX fee comparison](./trade-edge.md) | new tab | captured |
| 3 | [NFT Edge — iOS-style horizontal NFT browser](./nft-edge.md) | new tab | captured |
| 4 | [Cosmos canvas — infinite zoom token universe](./cosmos-canvas.md) | new view | captured |
| 5 | [Gas fees — vehicle-metaphor visual tiles](./gas-fees-visual.md) | widget | captured |
| 6 | [Parabolic add — Arc-style add-to-watchlist](./anim-parabolic-add.md) | interaction | captured |
| 7 | [Trash throw — Mac-1990s delete animation](./anim-trash-throw.md) | interaction | captured |

> **Statuses:** `captured` = idea recorded, no commitment to build. `backlogged` = committed direction, next-up after the related v1 ships. `scoped` = has a plan doc + roadmap entry. `in-flight` = on a feature branch.

## Template

Each ideation file uses this structure:

<details>
<summary>Show template</summary>

```markdown
---
title: <Idea name>
status: captured | scoped | in-flight | shipped
captured: YYYY-MM-DD
---

# <Idea name>

> One-line essence.

## What it is
Short paragraph: what is it, what user need does it serve.

## Where it lives in the app
Which surface, when triggered, how it relates to existing features.

## Sketch
ASCII wireframe.

## Open questions
- Question 1
- Question 2

## Out of scope (first pass)
- Thing to defer

## Prior art / reference
- Inspiration source(s)
```

</details>

## Reference images

`./assets/` holds tracked reference screenshots. User-provided mockups go here, kebab-case names, committed alongside the doc that references them.

> **Asset rule reminder.** Per [CLAUDE.md asset-tracking rule](../../CLAUDE.md#6-asset-tracking-local-existence--deployment), any image referenced from these docs must be `git add`'d — local existence is not deployment.
