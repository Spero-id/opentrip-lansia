const A = "#df7224";

export default function MeetingSection({ dest }) {
  return (
    <section>
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 text-gray-900">
        <span className="w-1.5 h-6 sm:w-2 sm:h-8 rounded-full" style={{ backgroundColor: A }}></span>
        Titik Kumpul
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {dest.meetingPoints?.map((mp, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-white shadow-sm border border-gray-100 hover:border-[#df7224]/30 hover:shadow-md transition-all group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-50 text-[#df7224] shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-lg text-gray-900">{mp.time}</div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{mp.location}</div>
              </div>
            </div>
            <p className="text-sm text-gray-500">{mp.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
