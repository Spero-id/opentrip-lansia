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

    // Whitelist — hanya status & isFeatured yang boleh diubah admin.
    // Tanpa ini, body apa pun diteruskan ke update() dan admin bisa
    // mengubah userId/bookingId/tripId (memecah referensi) atau
    // mengisi status dengan nilai di luar enum.
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

    // Ambil tripId SEBELUM update, untuk sinkronisasi statistik trip
    const before = await reviewRepository.findById(id);

    await reviewRepository.update(id, updates);

    // Status berubah (approved/rejected) → hitung ulang jumlah & rata-rata ulasan
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

    // Ambil tripId SEBELUM dihapus, untuk sinkronisasi statistik trip
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
