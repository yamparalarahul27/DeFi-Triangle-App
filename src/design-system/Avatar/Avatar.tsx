import { cn } from "@/lib/utils";
import { hueFor, hueGradient, type IdHue } from "../identity";

// Shared size scale (CONVENTIONS → Component API contract): string
// unions, never raw numbers. Diameters per DESIGN.md avatar spec —
// xs 20px · sm 28px · md 40px · lg 64px; glyph scales with the disc.
export type AvatarSize = "xs" | "sm" | "md" | "lg";

const SIZE: Record<AvatarSize, string> = {
  xs: "w-5 h-5 text-[9px]",
  sm: "w-7 h-7 text-xs",
  md: "w-10 h-10 text-[17px]",
  lg: "w-16 h-16 text-[26px]",
};

export function Avatar({
  name,
  seed,
  hue,
  size = "md",
  you = false,
  className,
}: {
  /** Handle or display name; its first character becomes the glyph. */
  name: string;
  /** Value hashed to pick a hue. Defaults to `name`; pass the wallet address for stable per-person color. */
  seed?: string;
  /** Explicit hue override; skips hashing. */
  hue?: IdHue;
  /** xs 20px · sm 28px · md 40px · lg 64px. */
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
