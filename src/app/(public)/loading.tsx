export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-4 py-10 sm:px-6 lg:px-8" aria-busy="true" aria-label="Memuat">
      <div className="mb-6 h-8 w-2/3 rounded-xl bg-slate-200" />
      <div className="mb-3 h-4 w-1/2 rounded-lg bg-slate-100" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-56 rounded-2xl bg-slate-100" />
        <div className="h-56 rounded-2xl bg-slate-100" />
        <div className="h-56 rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}
