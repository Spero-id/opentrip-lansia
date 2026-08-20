import { A } from "./helpers/constants";

const STEPS = [
  { label: "Pemesan" },
  { label: "Pilihan Trip" },
  { label: "Detail Perjalanan" },
  { label: "Konfirmasi" },
];

function StepCircle({ state, index }) {
  if (state === "done") {
    return (
      <span
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: A }}
        aria-hidden="true"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    );
  }

  return (
    <span
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
      style={
        state === "active"
          ? { backgroundColor: `${A}15`, color: A, border: `2px solid ${A}` }
          : { backgroundColor: "#f3f4f6", color: "#9ca3af", border: "2px solid #e5e7eb" }
      }
    >
      {index + 1}
    </span>
  );
}

export default function StepIndicator({ currentStep }) {
  return (
    <nav aria-label="Langkah pengisian" className="pt-6 pb-2">
      <ol className="flex items-center">
        {STEPS.map((step, i) => {
          const stepNumber = i + 1;
          const state =
            stepNumber < currentStep ? "done" : stepNumber === currentStep ? "active" : "upcoming";
          const isLast = i === STEPS.length - 1;

          return (
            <li key={step.label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <StepCircle state={state} index={i} />
                <span
                  className={`mt-1.5 text-[11px] font-semibold whitespace-nowrap ${
                    state === "active"
                      ? "text-gray-900"
                      : state === "done"
                      ? "text-gray-600"
                      : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {!isLast && (
                <div
                  className="flex-1 h-0.5 mx-2 sm:mx-4 mb-5"
                  style={{
                    backgroundColor: stepNumber < currentStep ? A : "#e5e7eb",
                  }}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}