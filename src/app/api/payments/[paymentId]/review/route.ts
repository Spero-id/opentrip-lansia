import { NextRequest, NextResponse } from "next/server";
import { paymentService } from "@/modules/payment/payment.service";
import { paymentRepository } from "@/modules/payment/payment.repository";
import { auth } from "@/modules/auth/auth.config";

export async function POST(req: NextRequest, { params }: { params: Promise<{ paymentId: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { paymentId } = await params;
    const body = await req.json();
    const { action, note } = body;

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "Aksi tidak valid." }, { status: 400 });
    }
    if (action === "reject" && !note?.trim()) {
      return NextResponse.json({ error: "Alasan wajib diisi saat menolak pembayaran." }, { status: 400 });
    }

    const existing = await paymentRepository.findById(paymentId);
    if (!existing) {
      return NextResponse.json({ error: "Pembayaran tidak ditemukan." }, { status: 404 });
    }
    if (existing.status !== "pending") {
      return NextResponse.json({ error: "Pembayaran sudah diproses sebelumnya." }, { status: 400 });
    }

    const payment = await paymentService.reviewPayment(paymentId, action, note?.trim() || null, session.user.id);
    if (!payment) {
      return NextResponse.json({ error: "Pembayaran tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json(payment);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
