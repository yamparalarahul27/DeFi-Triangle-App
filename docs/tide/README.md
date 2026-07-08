# Tide — plan pack

> **Tide** — a social fintech app on Solana. *Markets move together.*
> This folder is the planning deliverable, agreed in the kickoff interview
> (2026-07-08). Nothing here is code; every doc is a contract for a later
> build phase.

## The two goals

1. **A real B2C app for customers** — social layer over Solana markets:
   profiles, following, feed, comments, reactions, shared watch signals,
   and (later) chat. It showcases B2C fintech/crypto/trade design craft.
2. **A hidden `/design` page** — a living component gallery that showcases
   the design system used to build goal 1.

## Reading order

| Doc | What it locks down |
|---|---|
| [00-product.md](./00-product.md) | Vision, name, audience, core loop, v1 scope & non-goals |
| [01-screens.md](./01-screens.md) | Navigation shape, wireframes, screen → engine-hook seam map |
| [02-design-system.md](./02-design-system.md) | How DESIGN.md evolves for social + the `/design` gallery spec |
| [03-data-model.md](./03-data-model.md) | Supabase tables, API routes, auth, seeding strategy |
| [04-roadmap.md](./04-roadmap.md) | Phases, feature flags, verification gates per phase |
| [05-ux-flows.md](./05-ux-flows.md) | Recommended user journeys, identity gating, state strategy |
| [06-ui-spec.md](./06-ui-spec.md) | Measurements: layout, type, identity hues, component anatomy |
| [07-tech.md](./07-tech.md) | Full blueprint: folders, hooks, SQL DDL, API payloads |

**Visual mocks:** static HTML at `public/Prototypes/tide/` — open
`/Prototypes/tide/` on any Vercel preview (phone-framed, real design
tokens, frozen sample data).

## Decisions already made (interview log)

| Decision | Choice |
|---|---|
| Name | **Tide** |
| Environment | Cloud/mobile sessions (verify: `tsc` + lint; test: Vercel previews) |
| Purpose | Real customer app + hidden `/design` showcase |
| Social scope (vision) | Profiles + following, feed, comments/reactions, shared watch signals, chat |
| Chat | Later phase — designed, not built, in v1 |
| Navigation | 4 tabs: Feed · Markets · Search · Profile |
| Identity | Wallet auth root → one-time @handle + avatar setup |
| Tone | Calm terminal base, playful interaction moments |
| Social data at launch | Real Supabase tables + ~12 seeded personas |
| Design system | Evolve existing dark terminal system (not replace) |
| Build order | **Plan → design system → real coding** |

<sub>Engine reference: [docs/engine-contract.md](../engine-contract.md) — the
14 hooks and API routes every screen plugs into. That doc stays authoritative
for the seam; this pack never redefines hook shapes.</sub>
