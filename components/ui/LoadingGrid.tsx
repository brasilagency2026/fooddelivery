export function LoadingGrid() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
          <div className="h-44 shimmer" />
          <div className="p-4" style={{ background: "var(--color-surface)" }}>
            <div className="h-5 w-3/4 rounded-lg shimmer mb-2" />
            <div className="h-3 w-full rounded-lg shimmer mb-1" />
            <div className="h-3 w-2/3 rounded-lg shimmer mb-4" />
            <div className="flex gap-3">
              <div className="h-3 w-16 rounded shimmer" />
              <div className="h-3 w-20 rounded shimmer" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
