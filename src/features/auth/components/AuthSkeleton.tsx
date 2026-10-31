import AuthShell from "./AuthShell";

interface AuthSkeletonProps {
  fields?: number;
  // Login renders an extra "Ingat saya" row between the last field and the
  // submit button; register has no such row.
  rememberRow?: boolean;
}

// Wraps AuthShell so the skeleton can never drift from the real page layout;
// the display:contents wrapper adds a11y state without affecting the frame.
export default function AuthSkeleton({ fields = 2, rememberRow = false }: AuthSkeletonProps) {
  return (
    <div aria-busy="true" aria-label="Memuat" className="contents">
      <AuthShell
        aside={
          <div className="hidden lg:block bg-muted" />
        }
      >
        {/* Bars mirror the real column content: title, subtitle, fields,
            optional remember row, submit, divider, social, switch link.
            auth-skeleton.test.tsx replays the pixel math (login 452px,
            register 500px; baselines 460/592 measured live, then adjusted
            for the mb-2 title gap and the dropped confirm-password field) -
            keep bar heights and gaps in sync with the forms when editing. */}
        <div className="flex flex-col space-y-4 animate-pulse">
          {/* Title/subtitle block matches the forms' tightened mb-2 gap. */}
          <div className="space-y-2">
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
            // Single-sided row: the form now shows only "Ingat saya"
            // (checkbox + label) since "Lupa Password?" was removed.
            <div className="flex items-center">
              <div className="h-5 w-24 rounded bg-muted" />
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
      </AuthShell>
    </div>
  );
}
