import Link from "next/link";
import { tripService } from "@/modules/trip/trip.service";
import {
  Search,
  Calendar,
  MapPin,
  Star,
  CheckCircle2,
  ShieldCheck,
  Headphones,
  Compass,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Plus,
  Quote,
  Send,
  Smartphone,
  Route,
  Users,
  Wallet,
} from "lucide-react";

async function getTrips() {
  try {
    const trips = await tripService.getPublishedTrips();
    return trips.slice(0, 8);
  } catch (e) {
    return [];
  }
}

export default async function Home() {
  const tripList = await getTrips();

  // Fallback visual trip items matching Image 1 mockups if DB is empty
  const defaultDestinations = [
    {
      id: "dest-1",
      slug: "kawah-ijen",
      title: "Kawah Ijen",
      location: "Banyuwangi, Jawa Timur",
      category: "Pegunungan",
      rating: "4.9",
      price: "Rp 500rb",
      image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "dest-2",
      slug: "labuan-bajo",
      title: "Labuan Bajo",
      location: "Nusa Tenggara Timur",
      category: "Pantai & Laut",
      rating: "5.0",
      price: "Rp 1.800rb",
      image: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "dest-3",
      slug: "nusa-penida",
      title: "Nusa Penida",
      location: "Bali",
      category: "Pulau Exotis",
      rating: "4.8",
      price: "Rp 750rb",
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "dest-4",
      slug: "cappadocia",
      title: "Cappadocia",
      location: "Turki",
      category: "Internasional",
      rating: "4.9",
      price: "Rp 8.500rb",
      image: "https://images.unsplash.com/photo-1570939617782-99c478b4742a?auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <main className="overflow-hidden bg-white">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative pt-8 pb-20 md:pt-14 md:pb-28 overflow-hidden bg-gradient-to-b from-orange-50/40 via-white to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-xs font-semibold text-[#e06d26] shadow-xs">
                <span>Terpercaya 👍</span>
                <span className="text-slate-300">|</span>
                <span>OpenTrip Premium Indonesia</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Discover The <span className="text-[#e06d26]">Best Destinations</span> In The World
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Nikmati perjalanan liburan terbaik untuk diri anda dan keluarga. Pengalaman berkesan dengan layanan profesional, aman dan terpercaya.
              </p>

              {/* Floating Search Bar */}
              <div className="pt-4">
                <div className="bg-white p-3 sm:p-4 rounded-3xl shadow-2xl border border-slate-100 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  
                  {/* Destination Field */}
                  <div className="sm:col-span-5 flex items-center gap-3 px-3 py-2 border border-slate-100 sm:border-0 rounded-2xl sm:rounded-none">
                    <MapPin className="w-5 h-5 text-[#e06d26] shrink-0" />
                    <div className="text-left w-full">
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Destinasi</label>
                      <input
                        type="text"
                        placeholder="Mau jalan ke mana?"
                        className="w-full text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden bg-transparent"
                      />
                    </div>
                  </div>

                  <div className="hidden sm:block w-[1px] h-8 bg-slate-200" />

                  {/* Date Field */}
                  <div className="sm:col-span-4 flex items-center gap-3 px-3 py-2 border border-slate-100 sm:border-0 rounded-2xl sm:rounded-none">
                    <Calendar className="w-5 h-5 text-[#e06d26] shrink-0" />
                    <div className="text-left w-full">
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tanggal & Waktu</label>
                      <input
                        type="text"
                        placeholder="Pilih Tanggal"
                        className="w-full text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden bg-transparent"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="sm:col-span-3">
                    <Link
                      href="/trips"
                      className="flex items-center justify-center gap-2 w-full bg-[#e06d26] hover:bg-[#c85b18] text-white font-medium py-3 px-4 rounded-2xl shadow-lg shadow-orange-500/25 transition active:scale-98"
                    >
                      <Search className="w-4 h-4" />
                      <span className="text-sm">Search</span>
                    </Link>
                  </div>

                </div>
              </div>

            </div>

            {/* Hero Right Imagery Grid Collage */}
            <div className="lg:col-span-6 relative">
              <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto lg:max-w-none">
                
                <div className="space-y-4">
                  <div className="relative h-56 sm:h-64 rounded-3xl overflow-hidden shadow-xl group">
                    <img
                      src="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80"
                      alt="Rafting Adventure"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>
                  <div className="relative h-40 sm:h-48 rounded-3xl overflow-hidden shadow-lg group">
                    <img
                      src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
                      alt="Tropical Sunset Beach"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-8">
                  <div className="relative h-40 sm:h-48 rounded-3xl overflow-hidden shadow-lg group">
                    <img
                      src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80"
                      alt="Diving & Coral Reef"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>
                  <div className="relative h-56 sm:h-64 rounded-3xl overflow-hidden shadow-xl group">
                    <img
                      src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80"
                      alt="Resort & Sea view"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. KENAPA HARUS PILIH OPENTRIP INI? */}
      {/* ========================================================================= */}
      <section id="tentang" className="py-20 bg-slate-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                Kenapa Harus Pilih <span className="text-[#e06d26]">OpenTrip Ini?</span>
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Kami menyediakan layanan open trip berkualitas tinggi dengan fasilitas lengkap, dokumentasi profesional, serta pendampingan tour guide ramah & berpengalaman.
              </p>

              <div className="space-y-5 pt-2">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#e06d26] flex items-center justify-center shrink-0 shadow-xs">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Banyak Pilihan Destinasi</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Mulai dari pegunungan, pantai eksotis, wisata budaya, hingga destinasi internasional populer.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#e06d26] flex items-center justify-center shrink-0 shadow-xs">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Transaksi Mudah & Transparan</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Proses booking cepat, jaminan harga terbaik tanpa biaya tersembunyi, serta sistem pembayaran aman.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#e06d26] flex items-center justify-center shrink-0 shadow-xs">
                    <Headphones className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Layanan 24/7</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Tim customer service kami siap melayani dan membantu semua kebutuhan perjalanan Anda kapan saja.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Large Image with Badge */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1000&q=80"
                  alt="Scenic Wooden Boat View"
                  className="w-full h-[420px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Floating CTA Overlay Badge */}
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#e06d26] text-white flex items-center justify-center">
                      <Search className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Search & Trip Now</h4>
                      <p className="text-xs text-slate-500">Temukan ribuan pengalaman seru</p>
                    </div>
                  </div>
                  <Link
                    href="/trips"
                    className="bg-[#e06d26] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#c85b18] transition"
                  >
                    Jelajahi
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. DESTINASI PALING DIMINATI */}
      {/* ========================================================================= */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold text-[#e06d26] tracking-widest uppercase">
                DESTINASI IMPAN
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mt-1">
                Destinasi Paling <span className="text-[#e06d26]">Diminati</span>
              </h2>
            </div>
            
            {/* Carousel Navigation Arrows */}
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-[#e06d26] hover:text-[#e06d26] transition">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-[#e06d26] hover:text-[#e06d26] transition">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tripList.length > 0
              ? tripList.map((t) => (
                  <Link
                    key={t.id}
                    href={`/trips/${t.slug}`}
                    className="group rounded-3xl border border-slate-100 bg-white p-3.5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="relative h-52 w-full rounded-2xl overflow-hidden bg-slate-100">
                      <img
                        src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80"
                        alt={t.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold text-slate-800 flex items-center gap-1 shadow-xs">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>4.9</span>
                      </div>
                    </div>
                    <div className="pt-3 px-1">
                      <span className="text-[11px] font-semibold text-[#e06d26] uppercase tracking-wider">
                        📍 Open Trip
                      </span>
                      <h3 className="font-bold text-slate-900 text-lg group-hover:text-[#e06d26] transition mt-0.5 line-clamp-1">
                        {t.title}
                      </h3>
                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          <span className="block text-[11px] text-slate-400">Mulai dari</span>
                          <span className="font-extrabold text-[#e06d26] text-base">
                            {t.price ? `Rp ${parseInt(t.price).toLocaleString("id-ID")}` : "Hubungi Kami"}
                          </span>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-orange-50 text-[#e06d26] flex items-center justify-center group-hover:bg-[#e06d26] group-hover:text-white transition">
                          <Plus className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              : defaultDestinations.map((dest) => (
                  <Link
                    key={dest.id}
                    href={`/trips/${dest.slug}`}
                    className="group rounded-3xl border border-slate-100 bg-white p-3.5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="relative h-52 w-full rounded-2xl overflow-hidden bg-slate-100">
                      <img
                        src={dest.image}
                        alt={dest.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold text-slate-800 flex items-center gap-1 shadow-xs">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>{dest.rating}</span>
                      </div>
                    </div>
                    <div className="pt-3 px-1">
                      <span className="text-[11px] font-semibold text-[#e06d26] uppercase tracking-wider">
                        📍 {dest.category}
                      </span>
                      <h3 className="font-bold text-slate-900 text-lg group-hover:text-[#e06d26] transition mt-0.5 line-clamp-1">
                        {dest.title}
                      </h3>
                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          <span className="block text-[11px] text-slate-400">Mulai dari</span>
                          <span className="font-extrabold text-[#e06d26] text-base">{dest.price}</span>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-orange-50 text-[#e06d26] flex items-center justify-center group-hover:bg-[#e06d26] group-hover:text-white transition">
                          <Plus className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. BOOKING TRIP IMPIAN MU CUMA 5 LANGKAH */}
      {/* ========================================================================= */}
      <section className="py-20 bg-slate-50/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Phone graphic mockup */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm rounded-[40px] bg-slate-900 p-4 shadow-2xl border-4 border-slate-800">
                <div className="relative rounded-[32px] overflow-hidden bg-white h-[480px]">
                  <img
                    src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80"
                    alt="App Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full w-max text-xs mb-3">
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Kemudahan Dalam Genggaman</span>
                    </div>
                    <h3 className="text-xl font-bold">Booking Instan via OpenTrip Mobile</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <span className="text-xs font-bold text-[#e06d26] tracking-widest uppercase">
                  CARA BOOKING
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mt-1">
                  Booking Trip Impian mu Cuma <span className="text-[#e06d26]">5 Langkah</span>
                </h2>
                <p className="text-slate-600 mt-2">
                  Langkah mudah untuk pemesanan trip di platform kami, praktis dan langsung terkonfirmasi.
                </p>
              </div>

              {/* 5 Steps */}
              <div className="space-y-4">
                {[
                  { num: "01", title: "Pilih Destinasi", desc: "Temukan paket trip sesuai lokasi impian dan tanggal keberangkatan Anda." },
                  { num: "02", title: "Cek Detail Trip", desc: "Pelajari fasilitas, fasilitator tour, itinerary, serta harga paket." },
                  { num: "03", title: "Isi Form Pemesanan", desc: "Masukkan data peserta dengan lengkap dan pilih opsi tambahan jika ada." },
                  { num: "04", title: "Lakukan Pembayaran", desc: "Pilih metode pembayaran aman via Virtual Account, QRIS, atau Kartu Kredit." },
                  { num: "05", title: "Terima Konfirmasi", desc: "Tiket E-Voucher dan panduan perjalanan langsung dikirimkan ke email Anda." },
                ].map((step, idx) => (
                  <div key={step.num} className="flex items-start gap-4 p-3.5 rounded-2xl hover:bg-white transition border border-transparent hover:border-slate-100 hover:shadow-xs">
                    <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#e06d26] font-bold flex items-center justify-center shrink-0">
                      {step.num}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{step.title}</h4>
                      <p className="text-sm text-slate-500 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  href="/trips"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#e06d26] px-6 py-3 font-semibold text-white shadow-lg shadow-orange-500/25 hover:bg-[#c85b18] transition"
                >
                  <span>Mulai Cari Destinasi</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. TESTIMONIAL SECTION */}
      {/* ========================================================================= */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold text-[#e06d26] tracking-widest uppercase">
                TESTIMONI
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mt-1">
                Apa Kata Mereka Setelah <span className="text-[#e06d26]">Travelling</span>
              </h2>
            </div>
            
            <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-2xl border border-orange-100">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-800">4.9 / 5.0 (2,500+ Ulasan)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Aditya Pratama",
                trip: "Trip Labuan Bajo",
                review: "Pelayanan sangat ramah dan profesional! Tour guide selalu mendampingi dengan sabar, kapal bersih, dan dokumentasi foto hasilnya luar biasa bagus.",
                avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
              },
              {
                name: "Siti Rahmawati",
                trip: "Trip Kawah Ijen",
                review: "Pengalaman pertama ikut OpenTrip dan langsung jatuh cinta. Semuanya terorganisir dengan sangat rapi dari penjemputan sampai penginapan.",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
              },
              {
                name: "Budi Santoso",
                trip: "Trip Nusa Penida",
                review: "Sangat direkomendasikan untuk liburan keluarga. Fasilitas lengkap, makanan enak, dan biaya transparan tanpa ada hidden fee sama sekali.",
                avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <Quote className="w-8 h-8 text-orange-200" />
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">"{item.review}"</p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-200/60">
                  <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                    <p className="text-xs text-[#e06d26] font-medium">{item.trip}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5b. PRIVATE TRIP CTA SECTION */}
      {/* ========================================================================= */}
      <section className="py-20 bg-gradient-to-br from-orange-50/80 via-white to-orange-50/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[36px] bg-[#0b0f19] p-8 sm:p-14 lg:p-16 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#e06d26]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-6 text-center lg:text-left">
                <span className="inline-block text-[10px] font-bold text-[#e06d26] bg-[#e06d26]/10 px-3 py-1.5 rounded-full border border-[#e06d26]/30 tracking-widest uppercase">
                  PRIVATE TRIP
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
                  Punya Rencana Perjalanan untuk{" "}
                  <span className="text-[#e06d26]">Rombongan Sendiri?</span>
                </h2>
                <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-lg mx-auto lg:mx-0">
                  Tentukan destinasi, durasi, jumlah peserta, dan kebutuhan perjalanan Anda. Tim kami akan menyiapkan proposal terbaik.
                </p>

                <div className="space-y-3 pt-2">
                  {[
                    { icon: Route, text: "Itinerary fleksibel sesuai keinginan Anda" },
                    { icon: Users, text: "Pendampingan sesuai kebutuhan lansia" },
                    { icon: Wallet, text: "Estimasi harga transparan tanpa biaya tersembunyi" },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                        <div className="w-8 h-8 rounded-xl bg-[#e06d26]/15 text-[#e06d26] flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-medium">{item.text}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4">
                  <Link
                    href="/private-trip"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#e06d26] hover:bg-[#c85b18] text-white font-bold px-8 py-4 text-base shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all active:scale-98"
                  >
                    <span>Rencanakan Private Trip</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>

              <div className="hidden lg:flex justify-center">
                <div className="relative w-full max-w-sm">
                  <div className="aspect-[3/4] rounded-3xl bg-gradient-to-br from-[#e06d26]/20 to-[#e06d26]/5 border border-slate-700/50 p-1">
                    <div className="w-full h-full rounded-2xl bg-slate-800/50 backdrop-blur-sm p-6 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-[#e06d26]/20 text-[#e06d26] flex items-center justify-center">
                        <Route className="w-8 h-8" />
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        "Buat perjalanan impian Anda sendiri. Pilih destinasi, tentukan jadwal, dan kami yang atur sisanya."
                      </p>
                      <div className="w-12 h-[2px] bg-[#e06d26]/50 rounded-full" />
                      <div className="flex -space-x-2">
                        {[1,2,3].map((n) => (
                          <div key={n} className="w-8 h-8 rounded-full bg-slate-600 border-2 border-slate-800" />
                        ))}
                        <div className="w-8 h-8 rounded-full bg-[#e06d26] border-2 border-slate-800 flex items-center justify-center text-white text-[10px] font-bold">+</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. NEWSLETTER BANNER */}
      {/* ========================================================================= */}
      <section id="promo" className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-[#0b0f19] rounded-[36px] p-8 sm:p-12 text-white relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl">
            
            <div className="space-y-2 text-center lg:text-left z-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Dapatkan Info Trip & Promo Terbaru
              </h2>
              <p className="text-slate-400 text-sm max-w-md">
                Daftarkan email kamu sekarang dan dapatkan voucher diskon hingga 20% untuk pemesanan pertama.
              </p>
            </div>

            <div className="w-full lg:w-auto z-10">
              <form className="flex flex-col sm:flex-row gap-3 w-full max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Masukkan email kamu"
                  className="bg-slate-800/90 text-white placeholder-slate-400 px-4 py-3 rounded-2xl text-sm border border-slate-700 focus:outline-hidden focus:border-[#e06d26] w-full"
                />
                <button
                  type="button"
                  className="bg-[#e06d26] hover:bg-[#c85b18] text-white font-semibold px-6 py-3 rounded-2xl text-sm flex items-center justify-center gap-2 transition shrink-0 shadow-lg shadow-orange-500/20"
                >
                  <span>Subscribe</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
