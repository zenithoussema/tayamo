interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color?: string;
  trend?: { value: number; isPositive: boolean };
}

export default function StatCard({ label, value, icon, color = "bg-[#1a1a24]", trend }: StatCardProps) {
  return (
    <div className="admin-card group relative overflow-hidden p-5">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--admin-gold)]/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--admin-text-muted)]">{label}</p>
          <p className="mt-1 text-3xl font-bold text-[var(--admin-text)]">{value}</p>
          {trend && (
            <p className={`mt-1 text-xs font-medium ${trend.isPositive ? "text-[var(--admin-success)]" : "text-[var(--admin-danger)]"}`}>
              {trend.isPositive ? "+" : ""}{trend.value}% ce mois
            </p>
          )}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color} text-[var(--admin-gold)]`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
