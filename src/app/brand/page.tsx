import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Brand Kit · DeFi Triangle",
  description: "Logos and brand assets for DeFi Triangle.",
};

type LogoVariant = {
  label: string;
  description: string;
  src: string;
  downloadName: string;
  previewBg: string;
};

const VARIANTS: LogoVariant[] = [
  {
    label: "Logo · dark stroke",
    description: "Use on light backgrounds.",
    src: "/brand/defi_logo_dark.svg",
    downloadName: "defi-triangle-logo-dark.svg",
    previewBg: "bg-white",
  },
  {
    label: "Logo · light stroke",
    description: "Use on dark backgrounds.",
    src: "/brand/defi_logo_white.svg",
    downloadName: "defi-triangle-logo-light.svg",
    previewBg: "bg-[#11274d]",
  },
  {
    label: "Logo · filled",
    description: "Solid mark for monochrome contexts.",
    src: "/brand/defi_logo_fill.svg",
    downloadName: "defi-triangle-logo-fill.svg",
    previewBg: "bg-[#f1f5f9]",
  },
  {
    label: "Profile · PNG",
    description:
      "High-res raster of the filled mark for places SVG isn't accepted (Twitter, Discord, app icons).",
    src: "/brand/defi_logo_fill_pf.png",
    downloadName: "defi-triangle-profile.png",
    previewBg: "bg-[#f1f5f9]",
  },
];

export default function BrandPage() {
  return (
    <>
      <Header hasHero={false} />
      <main className="flex-1 max-w-[1100px] w-full mx-auto px-3 sm:px-4 lg:px-6 py-8 sm:py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[#11274d] mb-2">Brand Kit</h1>
          <p className="text-sm text-[#6a7282]">
            Logos and brand assets for DeFi Triangle. Click any Download button
            to save the SVG.
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {VARIANTS.map((variant) => (
            <LogoCard key={variant.src} variant={variant} />
          ))}
        </section>

        <section className="mt-12">
          <h2 className="text-[10px] uppercase tracking-wider text-[#6a7282] mb-3">
            Usage
          </h2>
          <ul className="text-xs text-[#11274d] space-y-1.5 list-disc pl-5">
            <li>Maintain clear space around the mark equal to the height of the apex.</li>
            <li>Don&apos;t recolor, rotate, or distort the triangle.</li>
            <li>SVG preferred for web. Use the filled mark for favicons or social avatars.</li>
            <li>For partner logos, contact the team.</li>
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}

function LogoCard({ variant }: { variant: LogoVariant }) {
  return (
    <article className="bg-white rounded-sm border border-[#cbd5e1] overflow-hidden">
      <div
        className={`flex items-center justify-center ${variant.previewBg} aspect-square`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={variant.src}
          alt={variant.label}
          className="w-1/2 h-1/2 object-contain"
        />
      </div>
      <div className="p-4 space-y-3">
        <div>
          <div className="text-sm font-semibold text-[#11274d]">
            {variant.label}
          </div>
          <div className="text-xs text-[#6a7282]">{variant.description}</div>
        </div>
        <a
          href={variant.src}
          download={variant.downloadName}
          className="inline-flex items-center justify-center w-full h-9 rounded-sm bg-[#19549b] text-white text-xs font-semibold hover:bg-[#143f78] transition-colors"
        >
          Download SVG
        </a>
      </div>
    </article>
  );
}
