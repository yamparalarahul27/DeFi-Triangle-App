// Identity-hue assignment for the tide social layer.
// Maps a person (wallet address / handle) to one of the 8 --id-* hues
// defined in globals.css. Deterministic and stable — no user picker in v1.
// Consumed by Avatar / AvatarGroup only; never for data or state.

export const ID_HUES = [
  "tide",
  "coral",
  "sand",
  "lilac",
  "sky",
  "moss",
  "rose",
  "slate",
] as const;

export type IdHue = (typeof ID_HUES)[number];

/** Deterministic hash(seed) % 8 → hue. djb2; stable across sessions. */
export function hueFor(seed: string): IdHue {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) + h + seed.charCodeAt(i)) >>> 0;
  }
  return ID_HUES[h % ID_HUES.length];
}

/**
 * Avatar radial-gradient fill for a hue. References the --id-* token and
 * derives the dark end via color-mix — never a hardcoded hex. Mirrors
 * DESIGN.md → Identity hues.
 */
export function hueGradient(hue: IdHue): string {
  const v = `var(--id-${hue})`;
  return `radial-gradient(120% 120% at 30% 20%, ${v}, color-mix(in srgb, ${v} 60%, black))`;
}
