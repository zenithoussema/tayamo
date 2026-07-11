interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  PENDING: { bg: "bg-[var(--admin-warning)]/10", text: "text-[var(--admin-warning)]", dot: "bg-[var(--admin-warning)]", label: "En attente" },
  CONFIRMED: { bg: "bg-[var(--admin-success)]/10", text: "text-[var(--admin-success)]", dot: "bg-[var(--admin-success)]", label: "Confirmé" },
  CANCELLED: { bg: "bg-[var(--admin-danger)]/10", text: "text-[var(--admin-danger)]", dot: "bg-[var(--admin-danger)]", label: "Annulé" },
  active: { bg: "bg-[var(--admin-success)]/10", text: "text-[var(--admin-success)]", dot: "bg-[var(--admin-success)]", label: "Actif" },
  expired: { bg: "bg-[var(--admin-danger)]/10", text: "text-[var(--admin-danger)]", dot: "bg-[var(--admin-danger)]", label: "Expiré" },
  expiring: { bg: "bg-[var(--admin-warning)]/10", text: "text-[var(--admin-warning)]", dot: "bg-[var(--admin-warning)]", label: "Expire bientôt" },
  unread: { bg: "bg-[var(--admin-info)]/10", text: "text-[var(--admin-info)]", dot: "bg-[var(--admin-info)]", label: "Non lu" },
  read: { bg: "bg-[var(--admin-text-dim)]/10", text: "text-[var(--admin-text-muted)]", dot: "bg-[var(--admin-text-muted)]", label: "Lu" },
  true: { bg: "bg-[var(--admin-success)]/10", text: "text-[var(--admin-success)]", dot: "bg-[var(--admin-success)]", label: "Oui" },
  false: { bg: "bg-[var(--admin-text-dim)]/10", text: "text-[var(--admin-text-muted)]", dot: "bg-[var(--admin-text-muted)]", label: "Non" },
};

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = statusConfig[status] || { bg: "bg-[var(--admin-text-dim)]/10", text: "text-[var(--admin-text-muted)]", dot: "bg-[var(--admin-text-muted)]", label: status };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bg} ${config.text} transition-colors ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
