export function ListingCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white" aria-hidden="true">
      <div className="skeleton aspect-[4/3]" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-6 w-2/5 rounded-md" />
        <div className="skeleton h-4 w-full rounded-md" />
        <div className="skeleton h-4 w-4/5 rounded-md" />
        <div className="flex gap-3 pt-1">
          <div className="skeleton h-4 w-16 rounded-md" />
          <div className="skeleton h-4 w-20 rounded-md" />
          <div className="skeleton h-4 w-16 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function ListingGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Đang tải danh sách phòng">
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
      <span className="sr-only">Đang tải…</span>
    </div>
  );
}
