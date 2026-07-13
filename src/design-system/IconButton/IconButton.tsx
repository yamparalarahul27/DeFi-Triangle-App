import { cn } from "@/lib/utils";
import type { ButtonVariant } from "../Button/Button";

export type IconButtonSize = "sm" | "md" | "lg";

// Square hit areas: sm 28 (dense rows only) · md 36 · lg 44. Icon-only
// controls at ≥40px are the DESIGN.md touch-target rule — prefer lg on
// primary surfaces.
const SIZE: Record<IconButtonSize, string> = {
  sm: "h-7 w-7 text-sm",
  md: "h-9 w-9 text-base",
  lg: "h-11 w-11 text-lg",
};

const VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-brand text-on-brand hover:bg-brand-hover",
  secondary:
    "border border-outline-variant bg-surface-container text-fg hover:bg-surface-container-high",
  ghost: "text-fg-muted hover:bg-surface-container hover:text-fg",
  destructive: "bg-sell-strong text-white hover:bg-sell",
};

export function IconButton({
  "aria-label": ariaLabel,
  variant = "ghost",
  size = "md",
  type = "button",
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Required — icon-only controls must name themselves. */
  "aria-label": string;
  variant?: ButtonVariant;
  /** sm 28 · md 36 · lg 44 px square (shared scale). */
  size?: IconButtonSize;
}) {
  return (
    <button
      type={type}
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center justify-center rounded-control",
        "transition-[background-color,color,transform] duration-150 active:scale-[0.96]",
        "disabled:pointer-events-none disabled:opacity-40",
        SIZE[size],
        VARIANT[variant],
        className,
      )}
      {...rest}
    />
  );
}
