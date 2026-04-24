"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          textAlign: "center",
          background:
            "linear-gradient(135deg, #467FFF 0%, #5F7CF8 47%, #1847BB 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ maxWidth: 440 }}>
          <div
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "rgba(255,255,255,0.6)",
              marginBottom: 12,
            }}
          >
            Application error
          </div>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 700,
              lineHeight: 1.15,
              margin: "0 0 12px",
            }}
          >
            Something broke at the root.
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.8)",
              margin: "0 0 24px",
            }}
          >
            This is rare. Try again — if it keeps happening, refresh the page.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              height: 40,
              padding: "0 20px",
              borderRadius: 2,
              background: "white",
              color: "#11274d",
              fontSize: 14,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          {error.digest && (
            <div
              style={{
                marginTop: 24,
                fontSize: 11,
                fontFamily: "ui-monospace, monospace",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              ref: {error.digest}
            </div>
          )}
        </div>
      </body>
    </html>
  );
}
