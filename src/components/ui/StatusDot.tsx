type Variant = "live" | "success" | "danger" | "warning";

const COLORS: Record<Variant, string> = {
  live: "bg-buy",
  success: "bg-buy",
  danger: "bg-sell",
  warning: "bg-warning",
};

export function StatusDot({
  variant = "live",
  pulse = false,
  className = "",
}: {
  variant?: Variant;
  pulse?: boolean;
  className?: string;
}) {
  const color = COLORS[variant];
  return (
    <span className={`relative inline-flex ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
      {pulse && (
        <span
          className={`absolute inset-0 w-1.5 h-1.5 rounded-full ${color} animate-ping opacity-75`}
          aria-hidden="true"
        />
      )}
    </span>
  );
}
