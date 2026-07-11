import { Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--admin-surface)] border border-[var(--admin-border)]">
        {icon || <Inbox size={28} className="text-[var(--admin-text-dim)]" />}
      </div>
      <h3 className="mb-1 text-lg font-semibold text-[var(--admin-text)]">{title}</h3>
      {description && <p className="mb-4 max-w-sm text-sm text-[var(--admin-text-muted)]">{description}</p>}
      {action}
    </div>
  );
}
