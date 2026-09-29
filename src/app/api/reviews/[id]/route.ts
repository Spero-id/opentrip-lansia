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

    // Ambil tripId SEBELUM update, untuk sinkronisasi statistik trip
    const before = await reviewRepository.findById(id);

    await reviewRepository.update(id, body);

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
