# Patterns — composition recipes

> The layer above components (cids-roadmap Phase 6). A **pattern** is a
> documented way to compose production components into a screen-sized
> behavior — the difference between owning components and shipping an
> exchange. References: Carbon Patterns, HIG Patterns, shadcn Blocks.
>
> **Contract:** every pattern here ships a live frame on the canvas
> **Patterns zone**, composed ONLY from `src/design-system/` exports
> (guards run on pattern code like any other). Shape per entry:
> Problem · Composition · States · Do / Don't · Code.

---

## P1 · States catalog

**Problem.** Every data surface has four lives — loading, empty, error,
offline — and defaulting any of them (spinner-only pages, blank divs,
alert() errors) is where products feel broken first. Cold-start is a
first-class state.

**Composition.** `SectionSkeleton` (loading) · `EmptyState` (+ `Button`
action) · error row = `Badge tone="sell"` + message + `Button` retry ·
offline = `Badge tone="warning"` strip above the surface.

**States.** loading → loaded | empty | error (+retry) | offline overlay.
Loading skeletons match the loaded card's `height` — zero shift on
resolve.

**Do / Don't.**
- ✓ Do give every empty one factual line + one hint line (the playful
  budget) + one action.
- ✗ Don't show a spinner with no skeleton shape — layout jumps when
  content lands.
- ✓ Do keep the retry next to the error message.
- ✗ Don't toast an error for a surface the user is looking at.

**Code.**

```tsx
{loading ? (
  <SectionSkeleton height={160} label="Stats" />
) : error ? (
  <div className="flex items-center justify-between rounded-card border border-outline-variant p-4">
    <span className="flex items-center gap-2 text-sm text-fg-muted">
      <Badge tone="sell">error</Badge> Couldn't load stats.
    </span>
    <Button size="sm" onClick={retry}>Retry</Button>
  </div>
) : rows.length === 0 ? (
  <EmptyState title="No watchers yet" hint="Quiet tide." action={<Button variant="primary">Watch JUP</Button>} />
) : (
  <StatsCard rows={rows} />
)}
```

## P2 · Transaction flow

**Problem.** Web3's core interaction crosses two surfaces: the user acts
in the UI but confirms in the wallet (ethereum.org heuristic #2), and
the chain answers later (heuristic #1). The status must be visible at
every step, and the words must be exact.

**Composition.** `AmountInput` (entry) · `Dialog` (review — the explicit
confirm step for anything that moves funds) · `TxStatus` (idle → signing
→ pending → confirmed/failed, visible throughout) · `Toast` (terminal
announcement) · `AddressChip` + `NetworkBadge` in the review body.

**States.** entering → reviewing → signing (wallet has focus — the UI
waits, visibly) → pending → confirmed | failed (+ retry path back to
review).

**Do / Don't.**
- ✓ Do keep `TxStatus` mounted through the whole flow — never blank
  between steps.
- ✗ Don't declare success at submission; "Confirmed" waits for the
  chain.
- ✓ Do disable the confirm while signing (visible + disabled), with the
  reason next to it.
- ✗ Don't hide the button — layouts that reshuffle mid-flow read as
  errors.

**Code.**

```tsx
<Dialog open={step === "review"} onOpenChange={backToEntry}
  title="Review send" description="Confirm in your wallet after this step."
  footer={<>
    <Button onClick={backToEntry}>Cancel</Button>
    <Button variant="primary" onClick={sign}>Confirm</Button>
  </>}>
  <AddressChip address={to} /> <NetworkBadge name="Solana" />
</Dialog>
<TxStatus state={txState} detail={signature} />
```

## P3 · Form row

**Problem.** Errors that appear far from their field (toasts, page-top
summaries) make forms guesswork; unlabeled controls make them
inaccessible.

**Composition.** `<label htmlFor>` + `Input`/`Select`/`AmountInput` +
inline error line linked via `aria-describedby`.

**States.** rest · focus · invalid (message present + `aria-invalid`) ·
disabled.

**Do / Don't.**
- ✓ Do put the message directly under the field and link it with
  `aria-describedby`.
- ✗ Don't rely on border color alone — say what's wrong.
- ✗ Don't block paste, ever (CLAUDE.md rule; `AmountInput` filters
  instead).

**Code.**

```tsx
<label htmlFor="handle" className="text-xs text-fg-muted">Handle</label>
<Input id="handle" invalid={taken} aria-describedby="handle-err" />
{taken && <p id="handle-err" className="text-xs text-sell">That handle is taken.</p>}
```

## P4 · Market list

**Problem.** Dense financial lists fail in predictable ways: proportional
digits that jitter, direction carried by color alone, rows that animate
on every tick.

**Composition.** `DataTable` (density-token rows) · `TokenIcon` +
symbol · `PriceChange` (sign discipline) · `Sparkline` (trend) ·
`AddressChip` (identity). Compact density via `data-density="compact"`.

**States.** sorted (aria-sort) · streaming ticks (text changes only —
zero layout shift) · row hover · comfortable/compact.

**Do / Don't.**
- ✓ Do right-align numerals in the tabular pixel ramp.
- ✗ Don't let color carry direction — `PriceChange` pairs ▲/▼ + sign
  with the tone.
- ✗ Don't animate rows on data ticks; the order book moves numbers,
  not boxes.

**Code.**

```tsx
const cols: Column<Row>[] = [
  { key: "tok", header: "Token", cell: (r) => <span className="flex items-center gap-2"><TokenIcon symbol={r.sym} size="sm" />{r.sym}</span>, sortable: true, sortValue: (r) => r.sym },
  { key: "px", header: "Price", align: "right", cell: (r) => fmt(r.px), sortable: true, sortValue: (r) => r.px },
  { key: "ch", header: "24h", align: "right", cell: (r) => <PriceChange value={r.ch} /> , sortValue: (r) => r.ch, sortable: true },
];
<DataTable columns={cols} rows={rows} rowKey={(r) => r.sym} caption="Markets" />
```

---

## Content guidelines — the action verbs

In crypto, wording is a **security surface** (Polaris-style exactness,
Reown/wallet conventions). One verb per meaning, never mixed:

| Verb | Means | Never use for |
|---|---|---|
| **Connect** | open a wallet session (read-only identity) | anything that signs |
| **Sign** | sign a message — proves identity, moves nothing | transactions |
| **Approve** | grant a token allowance (spending permission) | generic "OK" buttons |
| **Confirm** | submit the transaction in the wallet | soft acknowledgments |
| **Send / Swap / Watch** | the domain action itself — label buttons with it | — |
| **Cancel** | user backs out of the UI flow | **Reject** (that's the wallet's word) |

Voice: sentence case; verbs over nouns ("Watch", not "Add to
watchlist"); numbers stay unrounded where the terminal DNA demands;
empty-state hints get the one playful line.
