import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth.config";
import { db } from "@/shared/db";
import { users } from "@/modules/auth/auth.schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { referralCode } = body;

    if (!referralCode || typeof referralCode !== "string") {
      return NextResponse.json(
        { error: "Kode referral tidak valid" },
        { status: 400 }
      );
    }

    const code = referralCode.trim().toUpperCase();
    if (code.length === 0 || code.length > 50) {
      return NextResponse.json(
        { error: "Kode referral tidak valid" },
        { status: 400 }
      );
    }

    // Find user with this referral code
    const [referrer] = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(eq(users.referralCode, code))
      .limit(1);

    if (!referrer) {
      return NextResponse.json(
        { error: "Kode referral tidak ditemukan" },
        { status: 404 }
      );
    }

    // Prevent self-referral
    if (referrer.id === session.user.id) {
      return NextResponse.json(
        { error: "Tidak bisa menggunakan kode referral sendiri" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      referrerName: referrer.name,
      referrerId: referrer.id,
    });
  } catch (err) {
    console.error("POST /api/checkout/validate-referral error:", err);
    return NextResponse.json(
      { error: "Gagal memvalidasi kode referral" },
      { status: 500 }
    );
  }
}
