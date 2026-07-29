import {
  Search,
  FileText,
  ClipboardCheck,
  CreditCard,
  Send,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Pilih Destinasi",
    description:
      "Jelajahi berbagai paket open trip yang tersedia di halaman destinasi. Gunakan filter untuk mencari trip sesuai budget, durasi, atau lokasi tujuanmu.",
  },
  {
    number: "02",
    icon: FileText,
    title: "Cek Detail Trip",
    description:
      "Klik paket yang diminati untuk melihat detail lengkap seperti itinerary per hari, harga, fasilitas yang termasuk, serta syarat dan ketentuan perjalanan.",
  },
  {
    number: "03",
    icon: ClipboardCheck,
    title: "Isi Formulir Pemesanan",
    description:
      "Klik tombol Booking, lalu isi data diri lengkap seperti nama, nomor telepon, email, jumlah peserta, dan tanggal keberangkatan yang diinginkan.",
  },
  {
    number: "04",
    icon: CreditCard,
    title: "Lakukan Pembayaran",
    description:
      "Pilih metode pembayaran yang tersedia (transfer bank, e-wallet, atau kartu kredit). Lakukan pembayaran sesuai nominal yang tertera sebelum batas waktu.",
  },
  {
    number: "05",
    icon: Send,
    title: "Terima Konfirmasi",
    description:
      "Setelah pembayaran terverifikasi, kamu akan menerima e-voucher dan detail keberangkatan via email & WhatsApp. Tinggal bersiap untuk petualangan!",
  },
];

export default function TutorialSection() {
  return (
    <section id="tutorial" className="relative bg-white py-10 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[0.85fr_1.15fr] md:gap-10 lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-[#df7224] font-semibold text-sm tracking-wide mb-3">
              CARA BOOKING
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-snug mb-4">
              Booking Trip Impian mu Cuma{" "}
              <span className="text-[#df7224]">5 Langkah</span>
            </h2>
            <p className="text-gray-500 mb-8 max-w-sm leading-relaxed">
              Gak perlu ribet, dari cari destinasi sampe siap berangkat, semua
              bisa kamu lakuin langsung dari HP.
            </p>

            <div className="relative rounded-3xl overflow-hidden hidden lg:block">
              <img
                src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=700&fit=crop"
                alt="Booking trip dari HP"
                className="w-full h-[480px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#df7224] flex items-center justify-center flex-shrink-0">
                  <Send size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    E-voucher terkirim
                  </p>
                  <p className="text-xs text-gray-500">
                    Langsung ke email & WhatsApp
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="relative space-y-10">
              <div className="absolute left-6 top-2 bottom-2 w-px bg-gray-300" />

              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.number} className="relative flex gap-6">
                    <div className="relative z-10 w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-gray-900" />
                    </div>

                    <div className="flex-1 pt-1">
                      <div className="flex items-baseline gap-3 mb-1.5">
                        <span className="text-xs font-bold text-[#df7224] tracking-widest">
                          LANGKAH {step.number}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-[15px] text-gray-500 leading-relaxed max-w-lg">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 sm:ml-[72px] inline-flex items-center gap-2 bg-orange-50 text-[#df7224] px-5 py-3 rounded-full text-sm font-semibold">
              <ClipboardCheck size={16} />
              Sudah siap booking? Pilih paket trip favoritmu sekarang!
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
