interface AuthSkeletonProps {
  fields?: number;
}

export default function AuthSkeleton({ fields = 2 }: AuthSkeletonProps) {
  return (
    <div
      aria-busy="true"
      aria-label="Memuat"
      className="fixed inset-0 overflow-hidden lg:static lg:h-auto lg:min-h-screen bg-background flex flex-col lg:flex lg:items-center lg:justify-center lg:p-4"
    >
      <div className="flex flex-col flex-1 min-h-0 lg:min-h-0 lg:flex-none w-full max-w-6xl lg:grid lg:grid-cols-2 lg:rounded-2xl overflow-hidden lg:border lg:border-border lg:shadow-xs">
        <div className="hidden lg:block bg-muted lg:min-h-[650px]" />

        <div className="relative flex-1 min-h-0 overflow-y-auto bg-background p-10 flex flex-col justify-center">
          <div className="flex flex-col space-y-5 animate-pulse">
            <div className="h-4 w-36 self-start rounded bg-muted" />

            <div className="space-y-2">
              <div className="h-8 w-2/3 rounded-lg bg-muted" />
              <div className="h-4 w-1/2 rounded bg-muted" />
            </div>

            {Array.from({ length: fields }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="h-10 w-full rounded-lg bg-muted" />
              </div>
            ))}

            <div className="h-11 w-full rounded-md bg-muted" />

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-muted" />
              <div className="h-3 w-32 rounded bg-muted" />
              <div className="h-px flex-1 bg-muted" />
            </div>

            <div className="h-11 w-full rounded-md bg-muted" />

            <div className="h-4 w-56 self-center rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
