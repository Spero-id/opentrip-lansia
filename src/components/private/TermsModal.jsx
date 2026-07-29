"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

const A = "#df7224";

const TERMS_CONTENT = [
  {
    title: "1. Definisi",
    body: `Dalam syarat dan ketentuan ini, "Kami" merujuk pada tim OpenTrip selaku penyelenggara layanan Private Trip. "Kamu" merujuk pada pemohon atau pemesan yang mengajukan request Custom Trip melalui platform ini.`,
  },
  {
    title: "2. Ketentuan Pemesanan",
    body: `Pemesanan Private Trip dianggap sah setelah formulir request diterima dan dikonfirmasi oleh tim kami melalui nomor WhatsApp atau email yang kamu daftarkan. Kami berhak menolak request yang tidak memenuhi kriteria layanan kami tanpa pemberitahuan lebih lanjut.`,
  },
  {
    title: "3. Pembayaran",
    body: `Pembayaran dilakukan setelah itinerary dan harga final disepakati oleh kedua pihak. Kami menerima pembayaran melalui transfer bank, e-wallet, atau metode lain yang tertera pada saat konfirmasi. DP minimal 50% dari total harga wajib dilunasi sebelum tanggal keberangkatan.`,
  },
  {
    title: "4. Pembatalan dan Reschedule",
    body: `Pembatalan yang dilakukan lebih dari 14 hari sebelum keberangkatan akan dikenakan biaya administrasi sebesar 10% dari total harga. Pembatalan 7–14 hari sebelum keberangkatan dikenakan biaya 30%. Pembatalan kurang dari 7 hari sebelum keberangkatan tidak dapat dikembalikan (non-refundable). Reschedule dapat dilakukan maksimal 1 kali tanpa biaya tambahan selama jadwal baru tersedia.`,
  },
  {
    title: "5. Tanggung Jawab Peserta",
    body: `Peserta wajib memastikan kondisi fisik yang memadai sesuai jenis trip yang dipilih. Peserta bertanggung jawab atas perlengkapan pribadi selama perjalanan. Kami tidak bertanggung jawab atas kehilangan barang bawaan pribadi selama trip berlangsung.`,
  },
  {
    title: "6. Force Majeure",
    body: `Kami tidak bertanggung jawab atas keterlambatan, pembatalan, atau perubahan itinerary yang disebabkan oleh kondisi cuaca ekstrem, bencana alam, kerusuhan, keputusan pemerintah, atau kejadian lain di luar kendali kami. Dalam kondisi ini, kami akan berupaya memberikan solusi terbaik, termasuk penjadwalan ulang perjalanan.`,
  },
  {
    title: "7. Asuransi Perjalanan",
    body: `Kami sangat menyarankan setiap peserta untuk memiliki asuransi perjalanan pribadi. Beberapa paket trip tertentu sudah termasuk asuransi perjalanan dasar — detail akan dicantumkan pada konfirmasi itinerary.`,
  },
  {
    title: "8. Privasi dan Data",
    body: `Data pribadi yang kamu berikan (nama, nomor telepon, email, dan informasi lainnya) hanya digunakan untuk keperluan pengelolaan trip dan tidak akan dibagikan kepada pihak ketiga tanpa persetujuan kamu, kecuali diwajibkan oleh hukum yang berlaku.`,
  },
  {
    title: "9. Perubahan Syarat dan Ketentuan",
    body: `Kami berhak mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan diinformasikan melalui platform kami. Dengan melanjutkan penggunaan layanan setelah perubahan, kamu dianggap menyetujui syarat dan ketentuan yang telah diperbarui.`,
  },
  {
    title: "10. Persetujuan",
    body: `Dengan menekan tombol "Setuju & Lanjutkan", kamu menyatakan telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan Private Trip yang berlaku. Persetujuan ini bersifat mengikat secara hukum.`,
  },
];

export default function TermsModal({ onAgree, onClose }) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 40) {
      setHasScrolledToBottom(true);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center px-4 py-8"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-gray-200/50 shadow-xl w-full max-w-lg flex flex-col overflow-hidden"
        style={{ maxHeight: "85vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${A}15` }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={A} strokeWidth="2.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900">Syarat &amp; Ketentuan</p>
              <p className="text-[10px] text-gray-400 font-normal">Private Trip · OpenTrip</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Tutup"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div
          className="flex items-center gap-2 px-5 py-2 text-xs shrink-0 border-b"
          style={hasScrolledToBottom
            ? { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0", color: "#16a34a" }
            : { backgroundColor: `${A}08`, borderColor: `${A}20`, color: A }
          }
        >
          {hasScrolledToBottom ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Kamu sudah membaca seluruh ketentuan
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
              Scroll ke bawah untuk membaca seluruh ketentuan
            </>
          )}
        </div>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#e5e7eb transparent" }}
        >
          {TERMS_CONTENT.map((section) => (
            <div key={section.title} className="pb-3 border-b border-gray-50 last:border-0">
              <p className="text-xs font-semibold text-gray-700 mb-1.5">
                {section.title}
              </p>
              <p className="text-xs text-gray-500 leading-relaxed font-normal">
                {section.body}
              </p>
            </div>
          ))}
          <div className="h-2" />
        </div>

        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0 space-y-3">
          <div className="flex items-start gap-2.5">
            <div
              className="w-4 h-4 mt-0.5 rounded border-2 flex items-center justify-center shrink-0 transition-all"
              style={hasScrolledToBottom
                ? { backgroundColor: A, borderColor: A }
                : { borderColor: "#d1d5db" }
              }
            >
              {hasScrolledToBottom && (
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              {hasScrolledToBottom
                ? <span>Saya telah membaca dan menyetujui <span className="font-medium text-gray-700">Syarat & Ketentuan</span> Private Trip yang berlaku.</span>
                : "Baca semua ketentuan di atas terlebih dahulu sebelum melanjutkan."
              }
            </p>
          </div>

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={hasScrolledToBottom ? onAgree : undefined}
              disabled={!hasScrolledToBottom}
              className="flex-1 py-2.5 rounded-xl text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
              style={hasScrolledToBottom
                ? { backgroundColor: A }
                : { backgroundColor: "#d1d5db", cursor: "not-allowed" }
              }
              onMouseEnter={e => { if (hasScrolledToBottom) e.currentTarget.style.backgroundColor = "#c8631e"; }}
              onMouseLeave={e => { if (hasScrolledToBottom) e.currentTarget.style.backgroundColor = A; }}
            >
              Setuju &amp; Lanjutkan
              {hasScrolledToBottom && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
