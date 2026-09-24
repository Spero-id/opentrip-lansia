import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth.config";
import { db } from "@/shared/db";
import { referrals, commissions } from "@/modules/referral/referral.schema";
import { users } from "@/modules/auth/auth.schema";
import { eq, count, sum, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user's referral code
    const [user] = await db
      .select({ referralCode: users.referralCode })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    // Get referral stats by status
    const [totalStats] = await db
      .select({
        totalReferred: count(),
      })
      .from(referrals)
      .where(eq(referrals.referrerId, userId));

    const [convertedStats] = await db
      .select({
        count: count(),
      })
      .from(referrals)
      .where(and(eq(referrals.referrerId, userId), eq(referrals.status, "converted")));

    const [pendingStats] = await db
      .select({
        count: count(),
      })
      .from(referrals)
      .where(and(eq(referrals.referrerId, userId), eq(referrals.status, "pending")));

    // Get total commission
    const [commissionStats] = await db
      .select({
        totalCommission: sum(commissions.amount),
      })
      .from(commissions)
      .where(eq(commissions.agentId, userId));

    // Get user's loyalty points
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
    return NextResponse.json(
      { error: "Gagal mengambil data referral" },
      { status: 500 }
    );
  }
}
