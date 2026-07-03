/* Tailwind Play CDN config — redefines the same semantic tokens the
   real app exposes via @theme in globals.css, so className strings copied
   verbatim from the React components resolve identically here.
   Loaded synchronously right after the CDN script in every page head. */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#101115",
          dim: "#030405",
          page: "#090a0d",
          container: "#17191e",
          "container-high": "#202228",
          bright: "#2a2d34",
        },
        outline: { DEFAULT: "#383b43", variant: "#23262d" },
        fg: {
          DEFAULT: "#f4f4f5",
          muted: "#a7abb3",
          subtle: "#868b95",
          inverse: "#07080a",
        },
        brand: {
          DEFAULT: "#5ad8c4",
          hover: "#78e8d7",
          bright: "#a7fff0",
          subtle: "#c9fbf2",
        },
        "on-brand": "#04110f",
        buy: { DEFAULT: "#34d399", strong: "#10b981", surface: "#0f1f1a" },
        sell: { DEFAULT: "#f87171", strong: "#ef4444", surface: "#211214" },
        warning: { DEFAULT: "#f4d35e", strong: "#f59e0b", surface: "#211d10" },
        info: { DEFAULT: "#75a7ff", strong: "#3b82f6", surface: "#111827" },
        error: { DEFAULT: "#fb7185", strong: "#f43f5e" },
        success: { DEFAULT: "#34d399", strong: "#10b981" },
      },
      fontFamily: {
        sans: [
          "Geist",
          "IBM Plex Sans",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "Geist Mono",
          "IBM Plex Mono",
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },
    },
  },
};
