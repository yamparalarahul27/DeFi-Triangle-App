export function Footer() {
  return (
    <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-[#cbd5e1]/80 bg-white/70 backdrop-blur-md">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 min-h-10 py-2 flex items-center justify-between gap-3 text-[11px] text-[#6a7282] bg-white/45 backdrop-blur-md">
        <span className="text-[#94a3b8] text-left">
          Design &amp; Engineered by Yamparala Rahul
        </span>
        <div className="flex items-center gap-2 justify-end">
          <LogoChip src="/brand/birdeye.png" alt="Birdeye" />
          <LogoChip src="/brand/Jupiter.jpg" alt="Jupiter" />
          <LogoChip src="/brand/Tokens_xyz.svg" alt="Tokens.xyz" />
        </div>
      </div>
    </footer>
  );
}

function LogoChip({ src, alt }: { src: string; alt: string }) {
  return (
    <span className="inline-flex items-center justify-center h-[24px] w-[24px] rounded-full border border-[#cbd5e1]/70 bg-white overflow-hidden shrink-0">
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </span>
  );
}
