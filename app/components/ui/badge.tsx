import { cn } from "~/lib/cn";

type BadgeVariant = "default" | "secondary" | "outline" | "success" | "warning" | "destructive" | "brand";

const VARIANTS: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-700",
  secondary: "bg-secondary text-secondary-foreground",
  outline: "border border-border text-slate-600",
  success: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-700",
  destructive: "bg-red-100 text-red-700",
  brand: "bg-brand-50 text-brand-700",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        VARIANTS[variant],
        className
      )}
      {...props}
    />
  );
}
