"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

const TERMS_CONTENT = {
  terms: {
    title: "Syarat & Ketentuan",
    sections: [
      {
        title: "1. Ketentuan Umum",
        content:
          "Dengan melakukan pemesanan pada OpenTrip Lansia, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan yang berlaku. OpenTrip Lansia adalah platform penyelenggara perjalanan wisata khusus lansia yang berkomitmen memberikan pengalaman perjalanan yang aman, nyaman, dan menyenangkan.",
      },
      {
        title: "2. Prosedur Pemesanan",
        content:
          "Pemesanan dianggap sah setelah peserta mengisi data diri dengan lengkap dan benar serta melakukan pembayaran sesuai dengan total harga yang tercantum. OpenTrip Lansia berhak membatalkan pemesanan jika data yang diberikan tidak lengkap atau tidak valid. Peserta wajib memberikan data diri yang sesuai dengan identitas resmi (KTP/Paspor) untuk keperluan tiket dan asuransi perjalanan.",
      },
      {
        title: "3. Harga & Pembayaran",
        content:
          "Harga yang tercantum sudah termasuk biaya layanan dan belum termasuk biaya meeting point tambahan apabila ada. Pembayaran dilakukan melalui metode pembayaran yang tersedia (Virtual Account, e-Wallet, QRIS). Pembayaran harus dilakukan sebelum batas waktu yang ditentukan. OpenTrip Lansia berhak mengubah harga sewaktu-waktu dengan pemberitahuan terlebih dahulu.",
      },
      {
        title: "4. Pembatalan & Refund",
        content:
          "Pembatalan oleh peserta harus dilakukan minimal 7 hari sebelum hari keberangkatan untuk mendapatkan refund penuh. Pembatalan kurang dari 7 hari sebelum keberangkatan dikenakan biaya pembatalan sebesar 50% dari total harga. Pembatalan pada hari keberangkatan atau tidak hadir (no-show) tidak dapat dikembalikan. OpenTrip Lansia berhak membatalkan perjalanan apabila jumlah peserta tidak mencapai kuota minimum dengan memberikan refund penuh atau opsi penggantian jadwal.",
      },
      {
        title: "5. Kesehatan & Keselamatan",
        content:
          "Peserta wajib menyampaikan kondisi kesehatan secara jujur dan lengkap. Peserta dengan kondisi kesehatan tertentu mungkin diwajibkan membawa pendamping. OpenTrip Lansia menyediakan asuransi perjalanan dasar untuk setiap peserta. Peserta disarankan memiliki asuransi kesehatan pribadi tambahan. OpenTrip Lansia tidak bertanggung jawab atas biaya pengobatan di luar cakupan asuransi yang disediakan.",
      },
      {
        title: "6. Perubahan Jadwal & Rute",
        content:
          "OpenTrip Lansia berhak melakukan perubahan jadwal, rute, atau fasilitas perjalanan apabila terjadi kondisi force majeure seperti bencana alam, cuaca buruk, kerusuhan, atau kebijakan pemerintah. Perubahan akan dikomunikasikan kepada peserta secepat mungkin. Peserta berhak membatalkan perjalanan dengan refund penuh apabila perubahan signifikan terjadi.",
      },
      {
        title: "7. Tanggung Jawab Peserta",
        content:
          "Peserta bertanggung jawab atas barang bawaan pribadi selama perjalanan. Peserta wajib mematuhi peraturan dan arahan dari tour leader selama perjalanan. Peserta dilarang membawa barang terlarang sesuai ketentuan hukum yang berlaku. Peserta bertanggung jawab atas kerusakan yang disebabkan oleh tindakannya selama perjalanan.",
      },
      {
        title: "8. Ketentuan Lainnya",
        content:
          "OpenTrip Lansia berhak memperbarui syarat dan ketentuan ini sewaktu-waktu. Perubahan akan diinformasikan melalui website. Dengan melanjutkan pemesanan, Anda dianggap menyetujui versi terbaru dari syarat dan ketentuan yang berlaku.",
      },
    ],
  },
  privacy: {
    title: "Kebijakan Privasi",
    sections: [
      {
        title: "1. Informasi yang Dikumpulkan",
        content:
          "Kami mengumpulkan informasi pribadi yang Anda berikan saat melakukan pemesanan, termasuk namun tidak terbatas pada: nama lengkap, alamat email, nomor telepon, tanggal lahir, jenis kelamin, dan informasi kesehatan yang relevan untuk keperluan perjalanan.",
      },
      {
        title: "2. Penggunaan Informasi",
        content:
          "Informasi pribadi Anda digunakan untuk: memproses pemesanan dan pembayaran, mengkomunikasikan konfirmasi dan pembaruan perjalanan, memberikan layanan pelanggan, mengirimkan informasi promo (dengan persetujuan Anda), keperluan asuransi perjalanan, dan mematuhi kewajiban hukum yang berlaku.",
      },
      {
        title: "3. Perlindungan Data",
        content:
          "Kami menerapkan langkah-langkah keamanan teknis dan organisasi yang sesuai untuk melindungi data pribadi Anda dari akses tidak sah, perubahan, pengungkapan, atau perusakan. Data Anda disimpan di server yang aman dengan akses terbatas.",
      },
      {
        title: "4. Pembagian Data dengan Pihak Ketiga",
        content:
          "Kami dapat membagikan data Anda dengan pihak ketiga yang terpercaya untuk keperluan: pemrosesan pembayaran (midtrans), penyedia asuransi perjalanan, penyedia layanan transportasi dan akomodasi, dan mitra penyelenggara perjalanan. Pihak ketiga ini terikat oleh perjanjian kerahasiaan dan tidak diizinkan menggunakan data Anda untuk tujuan lain.",
      },
      {
        title: "5. Penyimpanan & Retensi Data",
        content:
          "Data pribadi Anda akan disimpan selama diperlukan untuk memenuhi tujuan pengumpulannya atau sesuai dengan ketentuan hukum yang berlaku. Data kesehatan akan dihapus atau dianonimkan setelah periode tertentu pasca perjalanan selesai.",
      },
      {
        title: "6. Hak Anda",
        content:
          "Anda berhak untuk: mengakses data pribadi yang kami simpan, meminta koreksi data yang tidak akurat, meminta penghapusan data (dengan batasan tertentu), menarik persetujuan yang telah diberikan, dan mengajukan keluhan terkait pemrosesan data Anda.",
      },
      {
        title: "7. Perubahan Kebijakan",
        content:
          "Kebijakan privasi ini dapat diperbarui secara berkala. Perubahan akan diumumkan melalui website kami. Dengan terus menggunakan layanan kami setelah perubahan, Anda dianggap menyetujui kebijakan privasi yang telah diperbarui.",
      },
    ],
  },
};

export default function TermsModal({ type, onClose, onAgree }) {
  const content = TERMS_CONTENT[type];
  const scrollRef = useRef(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    if (!isClient) return;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, isClient]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const threshold = 15;
      const isAtBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
      if (isAtBottom) setHasScrolledToBottom(true);
    };

    handleScroll();

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isClient) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg h-[85vh] max-h-[600px] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-900">{content.title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M15 5L5 15M5 5l10 10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Modal Body / Scrollable Content */}
        <div className="relative flex-1 min-h-0 flex flex-col">
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-5 space-y-5 text-sm text-gray-600 leading-relaxed overscroll-contain"
          >
            {content.sections.map((section, i) => (
              <div key={i}>
                <h3 className="font-bold text-gray-900 mb-2">{section.title}</h3>
                <p>{section.content}</p>
              </div>
            ))}
            <div className="h-4" />
          </div>
          {!hasScrolledToBottom && (
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/90 to-transparent pt-6 pb-3 text-center z-10">
              <span className="inline-block text-xs font-medium text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full shadow-sm">
                Scroll ke bawah untuk menyetujui ↓
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-100 p-4 shrink-0 bg-white z-10">
          <button
            onClick={() => onAgree()}
            disabled={!hasScrolledToBottom}
            className="w-full bg-[#df7224] text-white py-3 rounded-xl font-semibold hover:bg-[#c3611c] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {hasScrolledToBottom
              ? "Saya Setuju"
              : "Scroll ke bawah untuk menyetujui"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
