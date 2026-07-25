import Link from "next/link";
import { tripService } from "@/modules/trip/trip.service";
import { Search, MapPin, Star, Calendar, Clock, Plus } from "lucide-react";

export default async function TripList({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  let rows: any[] = [];
  try {
    rows = await tripService.getPublishedTrips();
  } catch (e) {
    rows = [];
  }

  if (q) {
    rows = rows.filter((r) => r.title.toLowerCase().includes(q.toLowerCase()));
  }

  const defaultTrips = [
    {
      id: "t-1",
      slug: "kawah-ijen",
      title: "OpenTrip Kawah Ijen & Blue Fire",
      description: "Jelajahi keajaiban fenomena api biru Kawah Ijen dengan pemandangan sunrise terbaik di Jawa Timur.",
      durationDays: 2,
      price: "500000",
      image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80",
      rating: "4.9",
      type: "Pegunungan",
    },
    {
      id: "t-2",
      slug: "labuan-bajo",
      title: "Phinisi Luxury Trip Labuan Bajo",
      description: "Pengalaman menginap di atas kapal Phinisi menjelajahi Pulau Komodo, Padar, dan Pink Beach.",
      durationDays: 3,
      price: "1800000",
      image: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=800&q=80",
      rating: "5.0",
      type: "Bahari & Laut",
    },
    {
      id: "t-3",
      slug: "nusa-penida",
      title: "Exotic Island Trip Nusa Penida Bali",
      description: "Kunjungi Kelingking Beach, Broken Beach, dan Crystal Bay dengan dokumentasi drone profesional.",
      durationDays: 1,
      price: "750000",
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
      rating: "4.8",
      type: "Pulau & Pantai",
    },
  ];

  const displayTrips = rows.length > 0 ? rows : defaultTrips;

  return (
    <div className="bg-slate-50/50 min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <span className="text-xs font-bold text-[#e06d26] uppercase tracking-widest">KATALOG DESTINASI</span>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              Jelajahi Paket <span className="text-[#e06d26]">OpenTrip</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Temukan pengalaman perjalanan terbaik yang aman, nyaman, dan terpercaya.
            </p>
          </div>

          {/* Search Box */}
          <form className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200 w-full md:w-auto">
            <div className="flex items-center gap-2 px-3 w-full md:w-64">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Cari nama destinasi..."
                className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden"
              />
            </div>
            <button className="rounded-xl bg-[#e06d26] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#c85b18] transition shrink-0 shadow-sm">
              Cari
            </button>
          </form>
        </div>

        {/* Trips Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayTrips.map((t) => (
            <Link
              key={t.id}
              href={`/trips/${t.slug}`}
              className="group rounded-3xl border border-slate-100 bg-white p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-slate-100 mb-4">
                  <img
                    src={t.image || "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80"}
                    alt={t.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold text-slate-800 flex items-center gap-1 shadow-xs">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{t.rating || "4.9"}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-[#e06d26] uppercase tracking-wider">
                    📍 {t.type || "Open Trip"}
                  </span>
                  <h3 className="font-bold text-slate-900 text-lg group-hover:text-[#e06d26] transition line-clamp-1">
                    {t.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {t.description || "Perjalanan liburan menyenangkan dengan fasilitas komplit dan guide profesional."}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="flex items-center gap-1 text-xs text-slate-400 mb-0.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {t.durationDays} Hari
                  </span>
                  {t.price && (
                    <span className="font-extrabold text-[#e06d26] text-base">
                      Rp {parseInt(t.price).toLocaleString("id-ID")}
                    </span>
                  )}
                </div>
                <div className="w-9 h-9 rounded-full bg-orange-50 text-[#e06d26] flex items-center justify-center group-hover:bg-[#e06d26] group-hover:text-white transition">
                  <Plus className="w-5 h-5" />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
