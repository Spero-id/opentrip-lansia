import { db } from "@/db";
import { trips, itineraryItems, tripDestinations } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import TripForm from "../../trip-form";

export default async function EditTrip({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [trip] = await db.select().from(trips).where(eq(trips.id, id)).limit(1);
  if (!trip) notFound();

  const itinerary = await db
    .select()
    .from(itineraryItems)
    .where(eq(itineraryItems.tripId, id))
    .orderBy(asc(itineraryItems.dayNumber), asc(itineraryItems.startTime));

  const destinations = await db
    .select()
    .from(tripDestinations)
    .where(eq(tripDestinations.tripId, id))
    .orderBy(asc(tripDestinations.dayOrder));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Edit Trip</h1>
          <p className="text-sm text-slate-500 mt-1">{trip.title}</p>
        </div>
      </div>
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <TripForm initial={{ ...trip, itinerary, tripDestinations: destinations }} />
      </div>
    </div>
  );
}
