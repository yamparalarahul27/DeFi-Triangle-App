import { cn } from "@/lib/utils";

/**
 * Token amount entry: decimal-only string value (never floats — the
 * caller parses with the mint's decimals), symbol anchored right,
 * optional fiat echo + Max. The fiat ⇄ token display pattern nobody
 * documents, componentized.
 */
export function AmountInput({
  value,
  onValueChange,
  symbol,
  fiatValue,
  onMax,
  invalid = false,
  disabled,
  "aria-label": ariaLabel,
  className,
}: {
  /** Decimal string ("1.25"); sanitized to [0-9.] with a single dot. */
  value: string;
  onValueChange: (value: string) => void;
  /** Token symbol shown at the right edge. */
  symbol: string;
  /** Pre-formatted fiat echo ("≈ $231.40"). */
  fiatValue?: string;
  /** Renders a Max affordance when provided. */
  onMax?: () => void;
  invalid?: boolean;
  disabled?: boolean;
  "aria-label"?: string;
  className?: string;
}) {
  const sanitize = (raw: string) => {
    const cleaned = raw.replace(/[^0-9.]/g, "");
    const [head, ...rest] = cleaned.split(".");
    return rest.length ? `${head}.${rest.join("")}` : cleaned;
  };

  return (
    <div className={cn("min-w-0", className)}>
      <div
        className={cn(
          "flex items-center gap-2 rounded-control border bg-surface-container px-3",
          "transition-[border-color] duration-150",
          invalid ? "border-sell" : "border-outline-variant focus-within:border-outline",
          disabled && "pointer-events-none opacity-40",
        )}
      >
        <input
          value={value}
          onChange={(e) => onValueChange(sanitize(e.target.value))}
          inputMode="decimal"
          placeholder="0"
          disabled={disabled}
          aria-label={ariaLabel ?? `Amount in ${symbol}`}
          aria-invalid={invalid || undefined}
          className="data-md h-11 w-full min-w-0 bg-transparent text-fg placeholder:text-fg-subtle focus:outline-none"
        />
        {onMax && (
          <button
            type="button"
            onClick={onMax}
            className="rounded-control px-1.5 py-0.5 text-[11px] font-semibold text-brand transition-colors duration-150 hover:bg-surface-container-high"
          >
            Max
          </button>
        )}
        <span className="font-mono text-sm text-fg-muted">{symbol}</span>
      </div>
      {fiatValue && (
        <div className="data-sm mt-1 px-3 text-fg-subtle">{fiatValue}</div>
      )}
    </div>
  );
}
