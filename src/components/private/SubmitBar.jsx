import { A } from "./helpers/constants";

export default function SubmitBar({ isLoading = false }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <p className="text-xs text-gray-400">
        <span style={{ color: A }}>*</span> Data akan diproses sesuai Syarat & Ketentuan yang berlaku.
      </p>
      <button
        type="submit"
        disabled={isLoading}
        className="px-7 py-3 rounded-lg text-white font-bold text-sm tracking-wide transition-all active:scale-95 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ backgroundColor: A }}
        onMouseEnter={e => { if (!isLoading) e.currentTarget.style.backgroundColor = "#c47d12"; }}
        onMouseLeave={e => { if (!isLoading) e.currentTarget.style.backgroundColor = A; }}
      >
        {isLoading ? "Mengirim..." : "Request Custom Trip"}
        {isLoading ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        )}
      </button>
    </div>
  );
}
