import { cn } from "@/lib/utils";
import { hueFor, hueGradient, type IdHue } from "../identity";

export type AvatarSize = 20 | 28 | 40 | 64;

// Diameter + glyph size per DESIGN.md avatar spec. Font size scales with the disc.
const SIZE: Record<AvatarSize, string> = {
  20: "w-5 h-5 text-[9px]",
  28: "w-7 h-7 text-xs",
  40: "w-10 h-10 text-[17px]",
  64: "w-16 h-16 text-[26px]",
};

export function Avatar({
  name,
  seed,
  hue,
  size = 40,
  you = false,
  className,
}: {
  /** Handle or display name; its first character becomes the glyph. */
  name: string;
  /** Value hashed to pick a hue. Defaults to `name`; pass the wallet address for stable per-person color. */
  seed?: string;
  /** Explicit hue override; skips hashing. */
  hue?: IdHue;
  /** Diameter in px. */
  size?: AvatarSize;
  /** Signed-in user — forces the reserved --id-tide hue. */
  you?: boolean;
  className?: string;
}) {
  const resolved: IdHue = you ? "tide" : (hue ?? hueFor(seed ?? name));
  const glyph = (name.trim()[0] ?? "?").toUpperCase();

  return (
    <span
      role="img"
      aria-label={name}
      className={cn(
        "inline-flex flex-none items-center justify-center rounded-full font-mono font-semibold text-fg-inverse antialiased",
        SIZE[size],
        className,
      )}
      style={{ backgroundImage: hueGradient(resolved) }}
    >
      {glyph}
    </span>
  );
}
