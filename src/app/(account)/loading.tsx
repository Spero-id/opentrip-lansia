export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-4 py-10 sm:px-6 lg:px-8" aria-busy="true" aria-label="Memuat">
      <div className="mb-6 h-8 w-1/2 rounded-xl bg-border" />
      <div className="space-y-4">
        <div className="h-24 rounded-2xl bg-muted" />
        <div className="h-24 rounded-2xl bg-muted" />
        <div className="h-24 rounded-2xl bg-muted" />
      </div>
    </div>
  );
}
