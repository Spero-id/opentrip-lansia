import Link from "next/link";
import { notFound } from "next/navigation";
import { tripService } from "@/modules/trip/trip.service";
import { MapPin, Clock, Calendar, Star, CheckCircle, ShieldCheck, ArrowLeft, Users } from "lucide-react";

export default async function TripDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let result;
  try {
    result = await tripService.getTripBySlug(slug);
  } catch (e) {
    result = null;
  }

  // If not found in DB, provide standard detail object so demo preview works gracefully
  const trip = result?.trip || {
    id: "demo-slug",
    slug,
    title: slug.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" "),
    description: "Nikmati perjalanan seru dengan pemandangan menakjubkan, akomodasi nyaman, serta didampingi tour guide profesional sepanjang perjalanan.",
    durationDays: 3,
    type: "Open Trip",
  };

  const departures = result?.departures || [
    { id: "dep-1", startDate: "2026-08-10", endDate: "2026-08-12", maxParticipants: 15 },
    { id: "dep-2", startDate: "2026-08-24", endDate: "2026-08-26", maxParticipants: 15 },
  ];

  const prices = result?.prices || [
    { id: "pr-1", name: "Reguler", price: "750000" },
    { id: "pr-2", name: "VIP Package", price: "1200000" },
  ];

  return (
    <div className="bg-slate-50/50 min-h-screen py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/trips"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#e06d26] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Semua Trip</span>
          </Link>
        </div>

        {/* Hero Cover Image Header */}
        <div className="relative h-72 sm:h-96 w-full rounded-3xl overflow-hidden shadow-2xl mb-8 border-4 border-white">
          <img
            src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80"
            alt={trip.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
            <div>
              <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium mb-2">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>4.9 / 5.0 Rating Ulasan</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">{trip.title}</h1>
            </div>
            
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-xs">
              <Clock className="w-4 h-4 text-[#e06d26]" />
              <span>{trip.durationDays} Hari Perjalanan</span>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Description & Included Features */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Tentang Paket Trip Ini</h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                {trip.description}
              </p>

              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#e06d26] flex items-center justify-center">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Fasilitas Lengkap</h4>
                    <p className="text-[11px] text-slate-500">Trans & Akomodasi</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#e06d26] flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Pasti Berangkat</h4>
                    <p className="text-[11px] text-slate-500">Jaminan Layanan</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Departures Schedule */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Jadwal Keberangkatan & Harga</h2>
                <span className="text-xs text-[#e06d26] font-semibold bg-orange-50 px-3 py-1 rounded-full">
                  Slot Terbatas
                </span>
              </div>

              <div className="space-y-4">
                {departures.map((d) => (
                  <div
                    key={d.id}
                    className="rounded-2xl border border-slate-100 p-5 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-orange-200 hover:bg-orange-50/30 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                        <Calendar className="w-4 h-4 text-[#e06d26]" />
                        <span>{d.startDate} — {d.endDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Maksimal {d.maxParticipants} Peserta</span>
                      </div>
                      
                      {prices.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {prices.map((p) => (
                            <span key={p.id} className="text-xs font-medium bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700">
                              {p.name}: <strong className="text-[#e06d26]">Rp {parseInt(p.price).toLocaleString("id-ID")}</strong>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/booking?departure=${d.id}`}
                      className="rounded-xl bg-[#e06d26] px-6 py-3 text-xs font-semibold text-white shadow-md shadow-orange-500/20 hover:bg-[#c85b18] transition text-center shrink-0"
                    >
                      Pesan Sekarang
                    </Link>
                  </div>
                ))}
              </div>

            </div>

          </div>

          {/* Right Column: Sticky Summary Box */}
          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl sticky top-24 space-y-5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">RINGKASAN PAKET</span>
              
              <div>
                <span className="text-xs text-slate-500 block">Mulai dari</span>
                <div className="text-3xl font-extrabold text-[#e06d26]">
                  {prices.length > 0 ? `Rp ${parseInt(prices[0].price).toLocaleString("id-ID")}` : "Rp 750.000"}
                </div>
                <span className="text-xs text-slate-400 block mt-0.5">/ pax (peserta)</span>
              </div>

              <div className="space-y-3 pt-2 text-xs text-slate-600 border-t border-slate-100">
                <div className="flex justify-between py-1">
                  <span>Tipe Perjalanan</span>
                  <span className="font-semibold text-slate-900">{trip.type}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Durasi</span>
                  <span className="font-semibold text-slate-900">{trip.durationDays} Hari</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Dokumentasi</span>
                  <span className="font-semibold text-slate-900">Termasuk Drone</span>
                </div>
              </div>

              <Link
                href={`/booking?departure=${departures[0]?.id || "demo"}`}
                className="w-full rounded-2xl bg-[#e06d26] py-3.5 text-white font-semibold shadow-lg shadow-orange-500/25 hover:bg-[#c85b18] transition text-center block text-sm"
              >
                Pilih Tanggal & Booking
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
