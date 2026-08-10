import { neon } from "@neondatabase/serverless";

// Gunakan raw SQL via Neon langsung — menghindari Turbopack bug dengan drizzle-orm/pg-core
function getSQL() {
  return neon(process.env.DATABASE_URL!);
}

export const dashboardService = {
  async getStats() {
    const sql = getSQL();
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
      sql`SELECT COUNT(*)::int AS count FROM trips`,
      sql`SELECT COUNT(*)::int AS count FROM bookings WHERE booking_date >= ${startOfMonth}`,
      sql`SELECT COALESCE(SUM(CAST(total_amount AS numeric)), 0)::text AS total FROM bookings WHERE status IN ('confirmed', 'completed')`,
      sql`SELECT COUNT(*)::int AS count FROM promotions WHERE is_active = true`,
      sql`SELECT COUNT(*)::int AS count FROM bookings WHERE booking_date >= ${startOfLastMonth} AND booking_date <= ${endOfLastMonth}`,
    ]);

    const totalTrips = Number(tripCountResult[0]?.count ?? 0);
    const bookingThisMonth = Number(bookingThisMonthResult[0]?.count ?? 0);
    const bookingLastMonth = Number(bookingLastMonthResult[0]?.count ?? 0);
    const revenueNum = Number(revenueResult[0]?.total ?? 0);
    const activePromos = Number(activePromosResult[0]?.count ?? 0);

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
    const sql = getSQL();
    const rows = await sql`
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
    `;

    return rows.map((b) => ({
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
