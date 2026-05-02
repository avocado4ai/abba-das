export function PostListSkeleton() {
  return (
    <div className="space-y-12">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-12 bg-white/5 rounded-2xl mb-4" />
          <div className="space-y-3">
            <div className="h-6 bg-white/5 rounded w-3/4" />
            <div className="h-4 bg-white/5 rounded" />
            <div className="h-4 bg-white/5 rounded w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-48 bg-white/5 rounded-2xl mb-4" />
      <div className="space-y-3">
        <div className="h-6 bg-white/5 rounded" />
        <div className="h-4 bg-white/5 rounded w-5/6" />
      </div>
    </div>
  );
}

export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`h-4 bg-white/5 rounded ${i === lines - 1 ? 'w-5/6' : 'w-full'}`} />
      ))}
    </div>
  );
}
