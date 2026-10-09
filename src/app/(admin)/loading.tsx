export default function Loading() {
  return (
    <div className="animate-pulse p-6" aria-busy="true" aria-label="Memuat">
      <div className="mb-6 h-8 w-1/3 rounded-xl bg-border" />
      <div className="rounded-3xl border border-border p-4">
        <div className="mb-3 h-10 rounded-xl bg-muted" />
        <div className="mb-3 h-10 rounded-xl bg-muted" />
        <div className="h-10 rounded-xl bg-muted" />
      </div>
    </div>
  );
}
