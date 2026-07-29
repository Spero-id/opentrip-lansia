"use client";

export default function StepProgress({ currentStep }) {
  const steps = [
    { key: "details", label: "Detail Pesanan" },
    { key: "payment", label: "Pembayaran" },
  ];

  const idx = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center">
          <div className={`flex items-center gap-2 ${i <= idx ? "text-[#df7224]" : "text-gray-300"}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              i <= idx ? "bg-[#df7224] text-white" : "bg-gray-100 text-gray-400"
            }`}>
              {i + 1}
            </div>
            <span className={`text-xs font-semibold hidden sm:block ${i <= idx ? "text-gray-800" : "text-gray-400"}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-8 sm:w-16 h-0.5 mx-2 rounded-full ${i < idx ? "bg-[#df7224]" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}
