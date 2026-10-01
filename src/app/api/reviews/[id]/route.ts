import { NextRequest, NextResponse } from "next/server";
import { reviewRepository } from "@/modules/review";
import { requireAdmin } from "@/shared/auth";
import { toPublicError } from "@/shared/errors/to-public-error";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const { id } = await params;
    const body = await req.json();

    const updates: { status?: string; isFeatured?: boolean } = {};
    if ("status" in body) {
      if (!["pending", "approved", "rejected"].includes(body.status)) {
        return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
      }
      updates.status = body.status;
    }
    if ("isFeatured" in body) {
      if (typeof body.isFeatured !== "boolean") {
        return NextResponse.json({ error: "isFeatured harus boolean" }, { status: 400 });
      }
      updates.isFeatured = body.isFeatured;
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "Tidak ada field yang bisa diubah (status/isFeatured)" },
        { status: 400 }
      );
    }

    const before = await reviewRepository.findById(id);

    await reviewRepository.update(id, updates);

    if (before) {
      await reviewRepository.recomputeTripStats(before.tripId);
    }

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

    const before = await reviewRepository.findById(id);

    await reviewRepository.delete(id);

    if (before) {
      await reviewRepository.recomputeTripStats(before.tripId);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = toPublicError(err, "Terjadi kesalahan");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
