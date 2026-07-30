import { A } from "./helpers/constants";

export default function SubmitBar() {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <p className="text-xs text-gray-400">
        <span style={{ color: A }}>*</span> Data akan diproses sesuai Syarat & Ketentuan yang berlaku.
      </p>
      <button
        type="submit"
        className="px-7 py-3 rounded-lg text-white font-bold text-sm tracking-wide transition-all active:scale-95 flex items-center gap-2"
        style={{ backgroundColor: A }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#c47d12")}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = A)}
      >
        Request Custom Trip
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
        </svg>
      </button>
    </div>
  );
}
