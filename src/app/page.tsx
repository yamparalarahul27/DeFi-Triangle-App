export default function WorkInProgress() {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-6 text-center"
      style={{
        background:
          "linear-gradient(#000003, #000036 37.9%, #143f79 81.7%, #496d93 110%, #8cacc6 152.7%, #b6d0dc 196.7%, #fcffff 285%)",
      }}
    >
      <div>
        <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-white/60 mb-3">
          DeFi Triangle
        </div>
        <h1
          className="text-white font-bold leading-tight tracking-tight"
          style={{
            fontFamily:
              "var(--font-geist-mono), 'IBM Plex Mono', ui-monospace, monospace",
            fontSize: "clamp(1.75rem, 5vw, 3rem)",
          }}
        >
          Work in Progress
        </h1>
        <p className="text-white/70 text-sm sm:text-base mt-3 max-w-md mx-auto">
          We&apos;re building something good. Come back soon.
        </p>
      </div>
    </div>
  );
}
