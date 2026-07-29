const A = "#df7224";

export default function AboutSection({ dest }) {
  return (
    <div>
      <section className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2 text-gray-900">
          <span className="w-1.5 h-6 sm:w-2 sm:h-8 rounded-full" style={{ backgroundColor: A }}></span>
          Tentang Destinasi
        </h2>
        <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
          {dest.description}
        </p>
      </section>
      <section>
        <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900">Sorotan Utama</h3>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {dest.highlights.map((h, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#df7224] text-white text-xs sm:text-sm font-semibold"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              {h}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
