/**
 * Minimal shell — UI revamp in progress.
 *
 * The previous presentation layer was removed in the clean-shell pass; the engine
 * (API routes, hooks, lib) is intact. Screens are being rebuilt one by one against
 * the contract in docs/engine-contract.md. This placeholder keeps the app
 * compiling and runnable until the first new screen lands.
 */
export default function Home() {
  return (
    <main className="min-h-dvh bg-surface-page text-fg flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-sm font-semibold tracking-tight text-brand">
          ◐ DeFi Triangle
        </div>
        <h1 className="mt-3 text-balance text-lg font-semibold text-fg">
          Rebuilding the interface
        </h1>
        <p className="mt-2 text-sm text-fg-muted">
          The engine is live; screens are coming back one by one.
        </p>
      </div>
    </main>
  );
}
