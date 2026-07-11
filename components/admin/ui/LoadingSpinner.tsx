export default function LoadingSpinner({ size = 24 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center py-16">
      <div
        className="animate-spin rounded-full border-[3px] border-[var(--admin-border)] border-t-[var(--admin-gold)]"
        style={{ width: size, height: size }}
      />
    </div>
  );
}
