import { NextRequest, NextResponse } from "next/server";
import { referralRepository } from "@/modules/referral";
import { requireAdmin } from "@/shared/auth";
import { toPublicError } from "@/shared/errors/to-public-error";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const COMMISSION_STATUSES = new Set(["pending", "approved", "paid", "rejected"]);

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const { id } = await params;
    const data = await referralRepository.findCommissionById(id);
    if (!data) return NextResponse.json({ error: "Komisi tidak ditemukan" }, { status: 404 });
    return NextResponse.json(data);
  } catch (err) {
    const message = toPublicError(err, "Terjadi kesalahan");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const { id } = await params;
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
        return NextResponse.json(
          { error: "Status tidak valid (pending/approved/paid/rejected)" },
          { status: 400 }
        );
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
    const message = toPublicError(err, "Terjadi kesalahan");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const { id } = await params;
    await referralRepository.deleteCommission(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = toPublicError(err, "Terjadi kesalahan");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
