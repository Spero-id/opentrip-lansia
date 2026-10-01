import { NextRequest, NextResponse } from "next/server";
import { referralRepository } from "@/features/referral";
import { requireAdmin } from "@/shared/auth";
import { toPublicError } from "@/shared/errors/to-public-error";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const COMMISSION_STATUSES = new Set(["pending", "approved", "paid", "rejected"]);

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const data = await referralRepository.findAllCommissions();
    return NextResponse.json(data);
  } catch (err) {
    const message = toPublicError(err, "Terjadi kesalahan");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const { agentId, bookingId, amount, status } = body;

    if (typeof agentId !== "string" || !agentId.trim()) {
      return NextResponse.json({ error: "agentId wajib diisi" }, { status: 400 });
    }
    if (typeof bookingId !== "string" || !UUID_REGEX.test(bookingId)) {
      return NextResponse.json({ error: "bookingId tidak valid" }, { status: 400 });
    }
    if (typeof amount !== "string" || !/^\d+$/.test(amount)) {
      return NextResponse.json({ error: "Amount harus berupa angka tanpa titik/koma" }, { status: 400 });
    }
    if (typeof status !== "string" || !COMMISSION_STATUSES.has(status)) {
      return NextResponse.json(
        { error: "Status tidak valid (pending/approved/paid/rejected)" },
        { status: 400 }
      );
    }

    const data = await referralRepository.createCommission({
      agentId: agentId.trim(),
      bookingId,
      amount,
      status,
    });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    const message = toPublicError(err, "Terjadi kesalahan");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
