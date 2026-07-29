import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { A } from "./helpers/constants";
import Subs from "../landing/Subs";

function formatRupiah(v) {
  if (!v && v !== 0) return "-";
  return "Rp " + Math.floor(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

const icons = {
  user: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  phone: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.578 1.238l-.466.397a1 1 0 0 0-.302 1.212 12.06 12.06 0 0 0 6.178 6.121"/>
    </svg>
  ),
  email: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  ),
  calendar: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  clock: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  users: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  pin: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  building: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>
    </svg>
  ),
  edit: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
};

function Row({ icon, label, value }) {
  return (
    <div className="flex justify-between items-center py-2.5">
      <span className="text-xs text-gray-500 flex items-center gap-1.5">
        <span className="text-gray-400">{icon}</span>
        {label}
      </span>
      <span className="text-xs font-semibold text-gray-800 text-right max-w-[55%] break-words">
        {value}
      </span>
    </div>
  );
}

export default function SuccessState({ form, onReset }) {
  return (
    <>
      <Navbar />

      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-5 pt-5 pb-8">
          <p className="font-semibold text-sm tracking-wide mb-2" style={{ color: A }}>
            PRIVATE TRIP
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Request <span style={{ color: A }}>Berhasil</span>
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-3">
        <div className="max-w-lg mx-auto flex flex-col gap-5">

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div
              className="p-8 flex flex-col items-center text-center relative overflow-hidden"
              style={{ backgroundColor: A }}
            >
              <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
              <div className="relative w-16 h-16 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center mb-4 shadow-lg">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Request Terkirim!</h2>
              <p className="text-white/80 text-sm">
                Tim kami akan menghubungi kamu dalam <strong className="text-white">1x24 jam</strong>
              </p>
            </div>

            <div className="px-5 pb-4 divide-y divide-gray-50">
              <Row icon={icons.user}     label="Nama Pemesan"  value={form.nama || "-"} />
              <Row icon={icons.phone}    label="Nomor Ponsel"  value={form.phone || "-"} />
              <Row icon={icons.email}    label="Email"         value={form.email || "-"} />
              <Row icon={icons.calendar} label="Tanggal"       value={form.tanggal ? new Date(form.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"} />
              <Row icon={icons.clock}    label="Durasi"        value={form.durasi ? `${form.durasi} Hari` : "-"} />
              <Row icon={icons.users}    label="Peserta"       value={form.participants?.length ? `${form.participants.length} orang` : "-"} />
              <Row icon={icons.pin}      label="Meeting Point" value={form.meetingPoint || "-"} />
              <Row icon={icons.building} label="Trip Dari"     value={form.tripFrom + (form.namaInstitusi ? ` — ${form.namaInstitusi}` : "")} />

              {form.tripType === "custom" && form.customTripName && (
                <Row icon={icons.edit} label="Nama Trip" value={form.customTripName} />
              )}

              {form.tripType === "explorer" && form.selectedDestinasi && (
                <div className="pt-3 flex gap-3 items-center">
                  <img
                    src={form.selectedDestinasi.image}
                    alt={form.selectedDestinasi.title}
                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{form.selectedDestinasi.title}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{form.selectedDestinasi.location}</p>
                    <p className="text-[11px] font-semibold mt-0.5" style={{ color: A }}>
                      * {form.selectedDestinasi.rating.toFixed(1)} · mulai {formatRupiah(form.selectedDestinasi.priceMin)}
                    </p>
                  </div>
                </div>
              )}

              {(form.budget || form.selectedDestinasi?.priceMin) && (
                <div
                  className="flex justify-between items-center py-3 mt-2 rounded-xl px-3"
                  style={{ backgroundColor: `${A}08`, border: `1px solid ${A}20` }}
                >
                  <span className="text-xs font-semibold text-gray-700">Estimasi Budget</span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatRupiah(form.tripType === "explorer" ? form.selectedDestinasi?.priceMin : form.budget)}
                    <span className="text-xs font-normal text-gray-400"> /pax</span>
                  </span>
                </div>
              )}

              {form.participants && form.participants.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-50">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Peserta ({form.participants.length})
                  </p>
                  <div className="space-y-1.5">
                    {form.participants.map((p, i) => (
                      <div key={p.id} className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-semibold shrink-0"
                          style={{ backgroundColor: `${A}15`, color: A }}
                        >
                          {i + 1}
                        </div>
                        <p className="text-xs font-semibold text-gray-700 flex-1 truncate">
                          {p.fullName || `Peserta ${i + 1}`}
                        </p>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {p.gender === "male" ? "Laki-laki" : p.gender === "female" ? "Perempuan" : "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-gray-700 mb-3">Langkah Selanjutnya</h3>
            <div className="space-y-3">
              {[
                "Tim kami akan menghubungi kamu via WhatsApp atau email untuk konfirmasi request.",
                "Itinerary dan rincian harga akan dikirimkan setelah diskusi awal.",
                "Simpan screenshot halaman ini sebagai referensi.",
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                    style={{ backgroundColor: `${A}15`, color: A }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-xs text-gray-500 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onReset}
            className="w-full py-3 rounded-xl text-white mb-10 font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
            style={{ backgroundColor: A }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#c8631e")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = A)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Kembali ke Halaman Custom Trip
          </button>
        </div>
      </div>

      <Subs />
      <Footer />
    </>
  );
}
