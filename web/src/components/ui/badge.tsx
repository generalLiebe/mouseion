import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100",
        pending:
          "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        finalized:
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        cancelled:
          "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
        frozen:
          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        recovered:
          "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-500",
        outline:
          "border border-[--color-border] dark:border-[--color-dark-border]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
