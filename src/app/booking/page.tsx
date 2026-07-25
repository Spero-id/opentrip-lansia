import { db } from "@/shared/db";
import { tripDepartures, tripPrices, trips } from "@/modules/trip/trip.schema";
import { eq } from "drizzle-orm";
import BookingForm from "./booking-form";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, CheckCircle } from "lucide-react";

export default async function BookingPage({ searchParams }: { searchParams: Promise<{ departure?: string }> }) {
  const { departure } = await searchParams;
  
  let dep: any = null;
  let trip: any = null;
  let priceList: any[] = [];

  if (departure && departure !== "demo") {
    try {
      const [foundDep] = await db
        .select()
        .from(tripDepartures)
        .where(eq(tripDepartures.id, departure))
        .limit(1);

      if (foundDep) {
        dep = foundDep;
        const [foundTrip] = await db.select().from(trips).where(eq(trips.id, dep.tripId)).limit(1);
        trip = foundTrip;
        priceList = await db.select().from(tripPrices).where(eq(tripPrices.departureId, dep.id));
      }
    } catch (e) {
      dep = null;
    }
  }

  // Fallback data if no departure found or demo requested
  if (!dep) {
    dep = { id: departure || "demo-dep", startDate: "2026-08-10", endDate: "2026-08-12" };
    trip = { title: "OpenTrip Labuan Bajo & Komodo Island", type: "Bahari & Laut" };
    priceList = [
      { id: "pr-1", name: "Paket Reguler (Per Orang)", price: "750000", quota: 15, quotaBooked: 2 },
      { id: "pr-2", name: "Paket Premium Phinisi (Per Orang)", price: "1500000", quota: 10, quotaBooked: 1 },
    ];
  }

  return (
    <div className="bg-slate-50/50 min-h-screen py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link href="/trips" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#e06d26] transition">
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Destinasi</span>
          </Link>
        </div>

        {/* Card Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm mb-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#e06d26] uppercase tracking-wider">
            <CheckCircle className="w-4 h-4" />
            <span>LANGKAH 1 DARI 2: FORM PEMESANAN</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{trip?.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-4 h-4 text-[#e06d26]" />
              <span>{dep.startDate} — {dep.endDate}</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-4 h-4 text-[#e06d26]" />
              <span>{trip?.type || "Open Trip"}</span>
            </span>
          </div>
        </div>

        {/* Booking Form Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xl">
          <BookingForm departureId={dep.id} prices={priceList} />
        </div>

      </div>
    </div>
  );
}
