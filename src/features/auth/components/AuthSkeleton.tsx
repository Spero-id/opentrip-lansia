interface AuthSkeletonProps {
  fields?: number;
  // Login renders an extra "Ingat saya / Lupa Password?" row between the
  // last field and the submit button; register has no such row.
  rememberRow?: boolean;
}

export default function AuthSkeleton({ fields = 2, rememberRow = false }: AuthSkeletonProps) {
  return (
    <div
      aria-busy="true"
      aria-label="Memuat"
      className="fixed inset-0 overflow-hidden lg:static lg:h-screen bg-background flex flex-col lg:flex"
    >
      <div className="flex flex-col flex-1 min-h-0 lg:h-full lg:flex-none w-full lg:grid lg:grid-cols-2 lg:grid-rows-1 overflow-hidden">
        <div className="hidden lg:block bg-muted" />

        <div className="relative flex-1 min-h-0 overflow-y-auto bg-background p-10 flex flex-col [&>*:first-child]:mt-auto [&>*:last-child]:mb-auto lg:w-full lg:mx-auto lg:max-w-xl">
          <div className="flex flex-col space-y-4 animate-pulse">
            <div className="space-y-4">
              <div className="h-8 lg:h-9 w-2/3 rounded-lg bg-muted" />
              <div className="h-5 w-1/2 rounded bg-muted" />
            </div>

            {Array.from({ length: fields }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-5 w-24 rounded bg-muted" />
                <div className="h-10 w-full rounded-lg bg-muted" />
              </div>
            ))}

            {rememberRow && (
              <div className="flex items-center justify-between">
                <div className="h-5 w-24 rounded bg-muted" />
                <div className="h-5 w-20 rounded bg-muted" />
              </div>
            )}

            <div className="h-11 w-full rounded-md bg-muted" />

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-muted" />
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-px flex-1 bg-muted" />
            </div>

            <div className="h-10 w-full rounded-md bg-muted" />

            <div className="h-5 w-56 self-center rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
