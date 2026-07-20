interface ShopSkeletonProps {
  count?: number;
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl bg-surface border border-border-strong">
      <div className="relative aspect-square w-full bg-surface-elevated admin-shimmer" />
      <div className="flex flex-col gap-2.5 p-5">
        <div className="h-2.5 w-16 rounded bg-surface-elevated admin-shimmer" />
        <div className="h-4 w-3/4 rounded bg-surface-elevated admin-shimmer" />
        <div className="h-3 w-1/2 rounded bg-surface-elevated admin-shimmer" />
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-3 w-3 rounded bg-surface-elevated admin-shimmer" />
          ))}
          <div className="ml-1 h-2.5 w-8 rounded bg-surface-elevated admin-shimmer" />
        </div>
        <div className="h-5 w-20 rounded bg-surface-elevated admin-shimmer" />
        <div className="h-2.5 w-14 rounded bg-surface-elevated admin-shimmer" />
      </div>
      <div className="px-5 pb-5">
        <div className="h-11 w-full rounded-xl bg-surface-elevated admin-shimmer" />
      </div>
    </div>
  );
}

export function ShopSkeleton({ count = 8 }: ShopSkeletonProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
