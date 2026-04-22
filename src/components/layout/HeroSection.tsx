export function HeroSection() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background:
          "linear-gradient(#000003, #000036 37.9%, #143f79 81.7%, #496d93 110%, #8cacc6 152.7%, #b6d0dc 196.7%, #fcffff 285%)",
      }}
    >
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-10 sm:py-16 lg:py-20 text-center">
        <div
          className="animate-fade-up"
          style={{
            animation: "fade-up 400ms ease-out backwards",
          }}
        >
          <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-white/60 mb-3">
            Solana · Institutional · Risk-scored
          </div>
          <h1
            className="text-white font-bold leading-tight tracking-tight"
            style={{
              fontFamily:
                "var(--font-geist-mono), 'IBM Plex Mono', ui-monospace, monospace",
              fontSize: "clamp(1.75rem, 4vw, 3rem)",
            }}
          >
            Token Edge
          </h1>
          <p className="text-white/70 text-sm sm:text-base mt-3 max-w-xl mx-auto">
            Live Solana markets — trending, whales, memes, and DeFi pulse,
            scored for tradability risk in real time.
          </p>
        </div>
      </div>
    </section>
  );
}
