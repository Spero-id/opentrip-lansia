import { NextRequest, NextResponse } from "next/server";
import { referralRepository } from "./referral.repository";
import { db } from "@/lib/db";
import { referrals } from "@/db/schema/referral";
import { bookings } from "@/db/schema/bookings";
import { tripDepartures, trips } from "@/db/schema/trips";
import { users } from "@/db/schema/auth";
import { desc, eq, inArray } from "drizzle-orm";
import { toPublicError } from "@/lib/errors/to-public-error";

type IdParams = { params: Promise<{ id: string }> };

async function idOf(ctx: IdParams): Promise<string> {
  const { id } = await ctx.params;
  return id;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const COMMISSION_STATUSES = new Set(["pending", "approved", "paid", "rejected"]);

function invalidCommissionCreate(body: { agentId?: unknown; bookingId?: unknown; amount?: unknown; status?: unknown }): string | null {
  if (typeof body.agentId !== "string" || !body.agentId.trim()) return "agentId wajib diisi";
  if (typeof body.bookingId !== "string" || !UUID_REGEX.test(body.bookingId)) return "bookingId tidak valid";
  if (typeof body.amount !== "string" || !/^\d+$/.test(body.amount)) return "Amount harus berupa angka tanpa titik/koma";
  if (typeof body.status !== "string" || !COMMISSION_STATUSES.has(body.status)) {
    return "Status tidak valid (pending/approved/paid/rejected)";
  }
  return null;
}

export const referralController = {
  async listCommissions() {
    try {
      return NextResponse.json(await referralRepository.findAllCommissions());
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 500 });
    }
  },

  async createCommission(req: NextRequest) {
    try {
      const body = await req.json();
      const invalid = invalidCommissionCreate(body);
      if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });
      const { agentId, bookingId, amount, status } = body;
      const data = await referralRepository.createCommission({ agentId: agentId.trim(), bookingId, amount, status });
      return NextResponse.json(data, { status: 201 });
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 400 });
    }
  },

  async getCommission(_req: NextRequest, ctx: IdParams) {
    try {
      const data = await referralRepository.findCommissionById(await idOf(ctx));
      if (!data) return NextResponse.json({ error: "Komisi tidak ditemukan" }, { status: 404 });
      return NextResponse.json(data);
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 500 });
    }
  },

  async updateCommission(req: NextRequest, ctx: IdParams) {
    try {
      const id = await idOf(ctx);
      const body = await req.json();
      const updates: { agentId?: string; bookingId?: string; amount?: string; status?: string } = {};
      if ("agentId" in body) {
        if (typeof body.agentId !== "string" || !body.agentId.trim()) {
          return NextResponse.json({ error: "agentId tidak valid" }, { status: 400 });
        }
        updates.agentId = body.agentId.trim();
      }
      if ("bookingId" in body) {
        if (typeof body.bookingId !== "string" || !UUID_REGEX.test(body.bookingId)) {
          return NextResponse.json({ error: "bookingId tidak valid" }, { status: 400 });
        }
        updates.bookingId = body.bookingId;
      }
      if ("amount" in body) {
        if (typeof body.amount !== "string" || !/^\d+$/.test(body.amount)) {
          return NextResponse.json({ error: "Amount harus berupa angka tanpa titik/koma" }, { status: 400 });
        }
        updates.amount = body.amount;
      }
      if ("status" in body) {
        if (typeof body.status !== "string" || !COMMISSION_STATUSES.has(body.status)) {
          return NextResponse.json({ error: "Status tidak valid (pending/approved/paid/rejected)" }, { status: 400 });
        }
        updates.status = body.status;
      }
      if (Object.keys(updates).length === 0) {
        return NextResponse.json(
          { error: "Tidak ada field yang bisa diubah (agentId/bookingId/amount/status)" },
          { status: 400 }
        );
      }
      await referralRepository.updateCommission(id, updates);
      return NextResponse.json({ success: true });
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 400 });
    }
  },

  async deleteCommission(_req: NextRequest, ctx: IdParams) {
    try {
      await referralRepository.deleteCommission(await idOf(ctx));
      return NextResponse.json({ success: true });
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 400 });
    }
  },

  async history() {
    try {
      const allReferrals = await db
        .select({
          id: referrals.id,
          referrerId: referrals.referrerId,
          referredUserId: referrals.referredUserId,
          bookingId: referrals.bookingId,
          status: referrals.status,
          createdAt: referrals.createdAt,
          referrerName: users.name,
          referrerEmail: users.email,
        })
        .from(referrals)
        .leftJoin(users, eq(referrals.referrerId, users.id))
        .orderBy(desc(referrals.createdAt));

      if (allReferrals.length === 0) return NextResponse.json([]);

      const referredIds = [...new Set(allReferrals.map((r) => r.referredUserId).filter((v): v is string => !!v))];
      const bookingIds = [...new Set(allReferrals.map((r) => r.bookingId).filter((v): v is string => !!v))];

      const [referredUsers, bookingRows] = await Promise.all([
        referredIds.length
          ? db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(inArray(users.id, referredIds))
          : Promise.resolve([]),
        bookingIds.length
          ? db.select({ id: bookings.id, bookingCode: bookings.bookingCode, departureId: bookings.departureId }).from(bookings).where(inArray(bookings.id, bookingIds))
          : Promise.resolve([]),
      ]);

      const departureIds = [...new Set(bookingRows.map((b) => b.departureId).filter((v): v is string => !!v))];
      const departureRows = departureIds.length
        ? await db.select({ id: tripDepartures.id, tripId: tripDepartures.tripId }).from(tripDepartures).where(inArray(tripDepartures.id, departureIds))
        : [];
      const tripIds = [...new Set(departureRows.map((d) => d.tripId).filter((v): v is string => !!v))];
      const tripRows = tripIds.length
        ? await db.select({ id: trips.id, title: trips.title }).from(trips).where(inArray(trips.id, tripIds))
        : [];

      const referredById = new Map(referredUsers.map((u) => [u.id, u]));
      const bookingById = new Map(bookingRows.map((b) => [b.id, b]));
      const tripIdByDeparture = new Map(departureRows.map((d) => [d.id, d.tripId]));
      const titleByTrip = new Map(tripRows.map((t) => [t.id, t.title]));

      const enriched = allReferrals.map((ref) => {
        const referredUser = ref.referredUserId ? referredById.get(ref.referredUserId) : undefined;
        const booking = ref.bookingId ? bookingById.get(ref.bookingId) : undefined;
        const tripId = booking?.departureId ? tripIdByDeparture.get(booking.departureId) : undefined;
        return {
          id: ref.id,
          referrerName: ref.referrerName ?? "Unknown",
          referrerEmail: ref.referrerEmail ?? "-",
          referredUserName: referredUser?.name ?? "Belum booking",
          referredUserEmail: referredUser?.email ?? "-",
          bookingCode: booking?.bookingCode ?? null,
          tripTitle: tripId ? (titleByTrip.get(tripId) ?? null) : null,
          status: ref.status,
          createdAt: ref.createdAt,
        };
      });

      return NextResponse.json(enriched);
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 500 });
    }
  },
};
