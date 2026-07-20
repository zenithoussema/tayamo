interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  const variants: Record<string, string> = {
    default: "bg-surface-elevated text-text-secondary border border-border-strong",
    success: "bg-[var(--c-success-bg)] text-success border border-success/20",
    warning: "bg-[var(--c-accent-dim)] text-accent border border-border-accent",
    danger: "bg-[var(--c-error-bg)] text-error border border-error/20",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
