"use client";

import { useState, useEffect } from "react";

export default function Subs() {
  const [email, setEmail] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e) => {
        if (e.key === "Escape") setShowPopup(false);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [showPopup]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal berlangganan");
        return;
      }

      setShowPopup(true);
      setEmail("");
    } catch {
      setError("Terjadi kesalahan, coba lagi nanti");
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
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
              <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full lg:w-auto">
                <div className="flex gap-3">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="Masukkan email kamu"
                    disabled={loading}
                    className="flex-1 lg:w-72 bg-white border border-white/10 rounded-full px-5 py-3 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-[#F49D1A] transition-colors disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-[#F49D1A] text-white px-4 py-3 rounded-full text-[13px] font-semibold hover:bg-[#c47d12] transition-colors shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Mengirim..." : "Subscribe"}
                    {!loading && (
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
                    )}
                  </button>
                </div>
                {error && <p className="text-red-400 text-xs px-5">{error}</p>}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Success Popup Modal */}
      {showPopup && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="relative bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl border border-gray-100 transform scale-100 transition-all duration-300 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background design elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[#F49D1A]/5 pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-[#F49D1A]/5 pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
              aria-label="Tutup"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Success Icon */}
            <div className="w-16 h-16 bg-[#F49D1A]/10 border border-[#F49D1A]/20 text-[#F49D1A] rounded-full flex items-center justify-center mb-6 shadow-xs relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F49D1A]/10 opacity-75"></span>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold text-gray-900 mb-3">Selamat Bergabung di Keluarga Jelajah Memoria!</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-6 font-medium">
              Kami telah mengirimkan email sambutan untuk Anda. Sampai jumpa di perjalanan seru berikutnya!
            </p>

            {/* Action Button */}
            <button
              onClick={() => setShowPopup(false)}
              className="w-full py-3.5 bg-[#F49D1A] text-white font-semibold rounded-2xl shadow-md shadow-[#F49D1A]/20 hover:bg-[#c47d12] hover:shadow-[#F49D1A]/30 active:scale-98 transition-all duration-200 text-sm cursor-pointer"
            >
              Mulai Jelajah
            </button>
          </div>
        </div>
      )}
    </>
  );
}

