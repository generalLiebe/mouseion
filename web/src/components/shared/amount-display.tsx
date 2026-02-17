import { formatAmount } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface AmountDisplayProps {
  amount: string | number | bigint;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showSign?: "+" | "-" | null;
}

const sizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl font-semibold",
  xl: "text-3xl font-bold",
};

export function AmountDisplay({
  amount,
  className,
  size = "md",
  showSign = null,
}: AmountDisplayProps) {
  const signClass =
    showSign === "+"
      ? "text-emerald-600 dark:text-emerald-400"
      : showSign === "-"
        ? "text-rose-600 dark:text-rose-400"
        : "";

  return (
    <span
      className={cn(
        "font-mono tabular-nums",
        sizeClasses[size],
        signClass,
        className
      )}
    >
      {showSign === "+" && "+"}
      {showSign === "-" && "-"}
      {formatAmount(amount)}
    </span>
  );
}
