export default function Loading() {
  return (
    <div className="mx-auto max-w-md animate-pulse px-4 py-16" aria-busy="true" aria-label="Memuat">
      <div className="mb-6 h-8 w-2/3 rounded-xl bg-border" />
      <div className="mb-3 h-12 rounded-xl bg-muted" />
      <div className="mb-3 h-12 rounded-xl bg-muted" />
      <div className="h-11 rounded-xl bg-border" />
    </div>
  );
}
