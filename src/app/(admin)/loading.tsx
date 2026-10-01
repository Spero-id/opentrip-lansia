export default function Loading() {
  return (
    <div className="animate-pulse p-6" aria-busy="true" aria-label="Memuat">
      <div className="mb-6 h-8 w-1/3 rounded-xl bg-slate-200" />
      <div className="rounded-3xl border border-slate-200 p-4">
        <div className="mb-3 h-10 rounded-xl bg-slate-100" />
        <div className="mb-3 h-10 rounded-xl bg-slate-100" />
        <div className="h-10 rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}
