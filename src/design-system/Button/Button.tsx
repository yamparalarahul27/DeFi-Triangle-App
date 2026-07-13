import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

// Heights per the shared scale (sm 28 · md 36 · lg 44). md matches Lane's
// segment; lg is the 44px comfortable tap target.
const SIZE: Record<ButtonSize, string> = {
  sm: "h-7 px-2.5 text-xs",
  md: "h-9 px-3.5 text-sm",
  lg: "h-11 px-5 text-sm",
};

const VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-brand text-on-brand hover:bg-brand-hover",
  secondary:
    "border border-outline-variant bg-surface-container text-fg hover:bg-surface-container-high",
  ghost: "text-fg-muted hover:bg-surface-container hover:text-fg",
  destructive: "bg-sell-strong text-white hover:bg-sell",
};

export function Button({
  variant = "secondary",
  size = "md",
  type = "button",
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  /** sm 28 · md 36 · lg 44 px height (shared scale). */
  size?: ButtonSize;
}) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-control font-medium",
        "transition-[background-color,color,box-shadow,transform] duration-150 active:scale-[0.96]",
        "disabled:pointer-events-none disabled:opacity-40",
        SIZE[size],
        VARIANT[variant],
        className,
      )}
      {...rest}
    />
  );
}
