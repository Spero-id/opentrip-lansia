export default function Subs() {
  return (
    <section
      className="relative bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/footer-image-subs-2.jpeg')",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
      <div className="relative border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 text-white">
                Dapetin Info Trip & Promo Terbaru
              </h3>
              <p className="text-white/60 text-sm">
                Kami akan mengirimkan info trip & promo terbaru langsung ke email kamu.
              </p>
            </div>
            <form className="flex w-full lg:w-auto gap-3">
              <input
                type="email"
                placeholder="Masukkan email kamu"
                className="flex-1 lg:w-72 bg-white border border-white/10 rounded-full px-5 py-3 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-[#df7224] transition-colors"
              />
              <button
                type="submit"
                className="flex items-center gap-2 bg-[#df7224] text-white px-4 py-3 rounded-full text-[13px] font-semibold hover:bg-[#c3611c] transition-colors shrink-0"
              >
                Subscribe
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
