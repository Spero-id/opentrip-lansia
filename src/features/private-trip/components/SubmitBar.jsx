import { A } from "./helpers/constants";
import { Loader2, ArrowRight } from "lucide-react";

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
          <Loader2 size={14} strokeWidth={2.5} className="animate-spin" />
        ) : (
          <ArrowRight size={14} strokeWidth={2.2} />
        )}
      </button>
    </div>
  );
}
