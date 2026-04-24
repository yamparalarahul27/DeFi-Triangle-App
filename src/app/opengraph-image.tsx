import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "DeFi Triangle — Solana token intelligence";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, #467FFF 0%, #5F7CF8 47%, #1847BB 100%)",
          padding: "72px",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            alignItems: "center",
            gap: 56,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 280,
              height: 280,
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              width="280"
              height="280"
              viewBox="0 0 400 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M336.509 314L200.255 78L64 314M336.509 314H64M336.509 314L280.429 280.663M64 314L120.08 280.663M280.429 280.663L200.254 141.797L120.08 280.663M280.429 280.663H120.08M201.214 145.18V82.8732M215.605 168.384V104.587M248.986 280.663L309.901 314M134.796 255.174L78.4257 289.014"
                stroke="white"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flex: 1,
            }}
          >
            <div
              style={{
                fontSize: 28,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.65)",
                marginBottom: 20,
              }}
            >
              DeFi Triangle
            </div>
            <div
              style={{
                fontSize: 88,
                fontWeight: 700,
                letterSpacing: "-0.025em",
                lineHeight: 1,
                marginBottom: 28,
              }}
            >
              Solana token
              <br />
              intelligence.
            </div>
            <div
              style={{
                fontSize: 30,
                lineHeight: 1.35,
                color: "rgba(255,255,255,0.85)",
                maxWidth: 680,
              }}
            >
              Trending markets, variants, risk — scored in real time.
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
