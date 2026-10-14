export default function Loading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-56 rounded-xl bg-slate-200" />
      <div className="h-4 w-80 max-w-full rounded-lg bg-slate-200" />
      <div className="grid gap-3 pt-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-200/70" />
        ))}
      </div>
    </div>
  );
}
