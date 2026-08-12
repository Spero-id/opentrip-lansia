import { db } from "@/shared/db";
import { sql } from "drizzle-orm";

export const dashboardService = {
  async getStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

    const [
      tripCountResult,
      bookingThisMonthResult,
      revenueResult,
      activePromosResult,
      bookingLastMonthResult,
    ] = await Promise.all([
      db.execute(sql`SELECT COUNT(*)::int AS count FROM trips`),
      db.execute(sql`SELECT COUNT(*)::int AS count FROM bookings WHERE booking_date >= ${startOfMonth}`),
      db.execute(sql`SELECT COALESCE(SUM(CAST(total_amount AS numeric)), 0)::text AS total FROM bookings WHERE status IN ('confirmed', 'completed')`),
      db.execute(sql`SELECT COUNT(*)::int AS count FROM promotions WHERE is_active = true`),
      db.execute(sql`SELECT COUNT(*)::int AS count FROM bookings WHERE booking_date >= ${startOfLastMonth} AND booking_date <= ${endOfLastMonth}`),
    ]);

    const totalTrips = Number((tripCountResult.rows[0] as any)?.count ?? 0);
    const bookingThisMonth = Number((bookingThisMonthResult.rows[0] as any)?.count ?? 0);
    const bookingLastMonth = Number((bookingLastMonthResult.rows[0] as any)?.count ?? 0);
    const revenueNum = Number((revenueResult.rows[0] as any)?.total ?? 0);
    const activePromos = Number((activePromosResult.rows[0] as any)?.count ?? 0);

    const bookingChange =
      bookingLastMonth === 0
        ? null
        : Math.round(((bookingThisMonth - bookingLastMonth) / bookingLastMonth) * 100);

    const revenueFormatted =
      revenueNum >= 1_000_000_000
        ? `Rp ${(revenueNum / 1_000_000_000).toFixed(1)}M`
        : revenueNum >= 1_000_000
        ? `Rp ${(revenueNum / 1_000_000).toFixed(1)}Jt`
        : `Rp ${revenueNum.toLocaleString("id-ID")}`;

    return {
      totalTrips,
      bookingThisMonth,
      bookingChange,
      revenue: revenueFormatted,
      activePromos,
    };
  },

  async getRecentBookings() {
    const result = await db.execute(sql`
      SELECT
        b.id,
        b.booking_code,
        b.status,
        b.total_amount,
        b.currency,
        b.booking_date,
        COALESCE(u.name, bp.full_name, '-') AS customer_name,
        COALESCE(t.title, '-') AS trip_name
      FROM bookings b
      LEFT JOIN users u ON u.id = b.user_id
      LEFT JOIN booking_participants bp ON bp.booking_id = b.id AND bp.is_primary = true
      LEFT JOIN trip_departures td ON td.id = b.departure_id
      LEFT JOIN trips t ON t.id = td.trip_id
      ORDER BY b.booking_date DESC
      LIMIT 5
    `);

    return result.rows.map((b: any) => ({
      id: b.id as string,
      bookingCode: b.booking_code as string,
      status: b.status as string,
      totalAmount: b.total_amount as string,
      currency: b.currency as string,
      bookingDate: b.booking_date as string,
      customerName: b.customer_name as string,
      tripName: b.trip_name as string,
    }));
  },
};
