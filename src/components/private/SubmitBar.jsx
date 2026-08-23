import { A } from "./helpers/constants";

export default function SubmitBar({ isLoading = false }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
      <p className="text-[11px] leading-4 text-[#6B7280] max-w-[420px]">
        <span className="text-[#6B7280]">* Dengan mengirim form ini, Anda menyetujui data akan diproses sesuai </span>
        <span className="text-[#6B7280] underline decoration-gray-300 underline-offset-2">Syarat &amp; Ketentuan</span>
        <span className="text-[#6B7280]">&nbsp;yang berlaku.</span>
      </p>
      <button
        type="submit"
        disabled={isLoading}
        className="px-6 py-3 rounded-lg text-white font-semibold text-[13px] tracking-wide transition-all active:scale-[0.98] flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shrink-0 shadow-sm"
        style={{ backgroundColor: A }}
        onMouseEnter={(e) => {
          if (!isLoading) e.currentTarget.style.backgroundColor = "#c47d12";
        }}
        onMouseLeave={(e) => {
          if (!isLoading) e.currentTarget.style.backgroundColor = A;
        }}
      >
        {isLoading ? "Mengirim..." : "Request Custom Trip"}
        {isLoading ? (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="animate-spin"
          >
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
          </svg>
        ) : (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="M12 5l7 7-7 7" />
          </svg>
        )}
      </button>
    </div>
  );
}
