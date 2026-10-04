import { NextRequest, NextResponse } from "next/server";
import { referralRepository } from "./referral.repository";
import { auth } from "@/features/auth/auth.config";
import { db } from "@/lib/db";
import { referrals, commissions } from "@/db/schema/referral";
import { bookings } from "@/db/schema/bookings";
import { tripDepartures, trips } from "@/db/schema/trips";
import { users } from "@/db/schema/auth";
import { desc, eq, count, inArray, sql } from "drizzle-orm";
import { toPublicError } from "@/utils/errors/to-public-error";
import { auditService, diffFields, pickFields } from "@/features/audit";

type IdParams = { params: Promise<{ id: string }> };

async function idOf(ctx: IdParams): Promise<string> {
  const { id } = await ctx.params;
  return id;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const COMMISSION_STATUSES = new Set(["pending", "approved", "paid", "rejected"]);
const COMMISSION_AUDIT_FIELDS = ["agentId", "bookingId", "amount", "status"] as const;

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
      await auditService.record({
        adminId: (await auth.api.getSession({ headers: req.headers }))?.user?.id ?? null,
        action: "create",
        entityType: "commission",
        entityId: data.id,
        newValues: pickFields(data, COMMISSION_AUDIT_FIELDS),
        description: `Komisi ${amount} dibuat`,
      });
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
      const before = await referralRepository.findCommissionById(id);
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
      const after = await referralRepository.findCommissionById(id);
      const changes = diffFields(before, after, COMMISSION_AUDIT_FIELDS);
      if (Object.keys(changes).length > 0) {
        await auditService.record({
          adminId: (await auth.api.getSession({ headers: req.headers }))?.user?.id ?? null,
          action: "update",
          entityType: "commission",
          entityId: id,
          oldValues: pickFields(before, COMMISSION_AUDIT_FIELDS),
          newValues: changes,
          description: `Komisi diperbarui (${Object.keys(changes).join(", ")})`,
        });
      }
      return NextResponse.json({ success: true });
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 400 });
    }
  },

  async deleteCommission(req: NextRequest, ctx: IdParams) {
    try {
      const id = await idOf(ctx);
      const before = await referralRepository.findCommissionById(id);
      await referralRepository.deleteCommission(id);
      if (before) {
        await auditService.record({
          adminId: (await auth.api.getSession({ headers: req.headers }))?.user?.id ?? null,
          action: "delete",
          entityType: "commission",
          entityId: id,
          oldValues: pickFields(before, COMMISSION_AUDIT_FIELDS),
          newValues: null,
          description: "Komisi dihapus",
        });
      }
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

  async userStats(req: NextRequest) {
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const userId = session.user.id;
      const [user] = await db
        .select({ referralCode: users.referralCode })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      const [totalStats] = await db
        .select({ totalReferred: count() })
        .from(referrals)
        .where(eq(referrals.referrerId, userId));
      const [convertedStats] = await db
        .select({ count: count() })
        .from(referrals)
        .where(sql`${referrals.referrerId} = ${userId} AND ${referrals.status} = 'converted'`);
      const [pendingStats] = await db
        .select({ count: count() })
        .from(referrals)
        .where(sql`${referrals.referrerId} = ${userId} AND ${referrals.status} = 'pending'`);
      const [commissionStats] = await db
        .select({ totalCommission: sql<number>`coalesce(sum(${commissions.amount}::numeric), 0)` })
        .from(commissions)
        .where(eq(commissions.agentId, userId));
      const [userWithPoints] = await db
        .select({ loyaltyPoints: users.loyaltyPoints })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      return NextResponse.json({
        referralCode: user?.referralCode ?? null,
        loyaltyPoints: userWithPoints?.loyaltyPoints ?? 0,
        stats: {
          totalReferred: totalStats?.totalReferred ?? 0,
          convertedReferred: convertedStats?.count ?? 0,
          pendingReferred: pendingStats?.count ?? 0,
          totalCommission: Number(commissionStats?.totalCommission ?? 0),
        },
      });
    } catch (err) {
      console.error("GET /api/user/referral error:", err);
      return NextResponse.json({ error: "Gagal mengambil data referral" }, { status: 500 });
    }
  },

  async userHistory(req: NextRequest) {
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const url = new URL(req.url);
      const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
      const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") ?? "10")));
      const offset = (page - 1) * limit;
      const userId = session.user.id;
      const history = await db
        .select({
          id: referrals.id,
          referredUserId: referrals.referredUserId,
          bookingId: referrals.bookingId,
          status: referrals.status,
          createdAt: referrals.createdAt,
          referredUserName: users.name,
          referredUserEmail: users.email,
          bookingCode: bookings.bookingCode,
          tripId: tripDepartures.tripId,
        })
        .from(referrals)
        .leftJoin(users, eq(referrals.referredUserId, users.id))
        .leftJoin(bookings, eq(referrals.bookingId, bookings.id))
        .leftJoin(tripDepartures, eq(bookings.departureId, tripDepartures.id))
        .where(eq(referrals.referrerId, userId))
        .orderBy(desc(referrals.createdAt))
        .limit(limit)
        .offset(offset);
      const tripIds = [...new Set(history.map((h) => h.tripId).filter(Boolean))] as string[];
      let tripMap = new Map<string, string>();
      if (tripIds.length > 0) {
        const allTrips = await db.select({ id: trips.id, title: trips.title }).from(trips);
        tripMap = new Map(allTrips.map((t) => [t.id, t.title]));
      }
      const referralIds = history.map((h) => h.id).filter(Boolean) as string[];
      const commissionMap = new Map<string, { amount: number; status: string }>();
      if (referralIds.length > 0) {
        const allCommissions = await db
          .select({ referralId: commissions.referralId, amount: commissions.amount, status: commissions.status })
          .from(commissions);
        for (const c of allCommissions) {
          if (c.referralId && referralIds.includes(c.referralId)) {
            commissionMap.set(c.referralId, { amount: Number(c.amount ?? 0), status: c.status ?? "pending" });
          }
        }
      }
      const mappedHistory = history.map((h) => ({
        id: h.id,
        referredUserName: h.referredUserName ?? "User",
        referredUserEmail: h.referredUserEmail ?? "",
        bookingCode: h.bookingCode ?? "-",
        tripName: h.tripId ? (tripMap.get(h.tripId) ?? "-") : "-",
        status: h.status ?? "pending",
        commissionAmount: commissionMap.get(h.id!)?.amount ?? 0,
        commissionStatus: commissionMap.get(h.id!)?.status ?? null,
        createdAt: h.createdAt,
      }));
      const [{ total }] = await db
        .select({ total: count() })
        .from(referrals)
        .where(eq(referrals.referrerId, userId));
      return NextResponse.json({
        history: mappedHistory,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      });
    } catch (err) {
      console.error("GET /api/user/referral/history error:", err);
      return NextResponse.json({ error: "Gagal mengambil history referral" }, { status: 500 });
    }
  },
};
