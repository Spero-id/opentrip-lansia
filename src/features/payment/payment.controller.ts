import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { payments } from "@/db/schema/payments";
import { bookings } from "@/db/schema/bookings";
import { eq } from "drizzle-orm";
import { auth } from "@/features/auth/auth.config";
import { paymentService } from "./payment.service";
import { paymentRepository } from "./payment.repository";
import { isCompleteAccount } from "./payment-account";
import { toPublicError } from "@/lib/errors/to-public-error";
import { notificationService } from "@/features/notification/notification.service";
import { auditService, pickFields } from "@/features/audit";

type PaymentIdParams = { params: Promise<{ paymentId: string }> };

const ALLOWED_METHODS = new Set(["BCA", "BRI", "MANDIRI", "GOPAY", "OVO", "DANA", "QRIS"]);

/** Payment fields allowed in audit — `proofUrl` is deliberately excluded (uploaded file). */
const PAYMENT_AUDIT_FIELDS = ["status", "reviewedBy", "reviewedAt", "adminNote"] as const;

export const paymentController = {
  async create(req: NextRequest) {
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const body = await req.json();
      const { bookingId, paymentMethod, proofUrl } = body;
      if (!bookingId || !paymentMethod || !proofUrl) {
        return NextResponse.json({ error: "Data pembayaran tidak lengkap" }, { status: 400 });
      }
      if (typeof proofUrl !== "string" || !proofUrl.startsWith("/api/uploads/") || proofUrl.includes("..")) {
        return NextResponse.json({ error: "URL bukti transfer tidak valid" }, { status: 400 });
      }
      if (!ALLOWED_METHODS.has(paymentMethod)) {
        return NextResponse.json({ error: "Metode pembayaran tidak valid" }, { status: 400 });
      }
      const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
      if (!booking) {
        return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
      }
      if (booking.userId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (booking.status !== "pending_payment" && booking.status !== "pending") {
        return NextResponse.json({ error: "Pesanan sudah diproses sebelumnya" }, { status: 400 });
      }
      const existing = await db.select().from(payments).where(eq(payments.bookingId, bookingId));
      let payment;
      if (existing.length > 0 && existing[0].status === "pending") {
        [payment] = await db
          .update(payments)
          .set({ method: paymentMethod, proofUrl, amount: booking.totalAmount })
          .where(eq(payments.id, existing[0].id))
          .returning();
      } else {
        [payment] = await db
          .insert(payments)
          .values({
            bookingId,
            method: paymentMethod,
            amount: booking.totalAmount,
            currency: booking.currency || "IDR",
            status: "pending",
            proofUrl,
          })
          .returning();
      }
      await db.update(bookings).set({ status: "pending", updatedAt: new Date() }).where(eq(bookings.id, bookingId));
      void notificationService
        .onPaymentProofUploaded({
          bookingCode: booking.bookingCode,
          bookingId: booking.id,
          userName: session.user.name || session.user.email || "User",
        })
        .catch((e) => console.error("notify payment_proof failed", e));
      return NextResponse.json({ success: true, payment });
    } catch (err) {
      const message = toPublicError(err, "Terjadi kesalahan");
      console.error("Payment create error:", err);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },

  async review(req: NextRequest, ctx: PaymentIdParams) {
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (session.user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const { paymentId } = await ctx.params;
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
      await auditService.record({
        adminId: session.user.id,
        action: "update",
        entityType: "payment",
        entityId: paymentId,
        oldValues: pickFields(existing, PAYMENT_AUDIT_FIELDS),
        newValues: pickFields(payment, PAYMENT_AUDIT_FIELDS),
        description: action === "approve" ? "Pembayaran disetujui admin" : "Pembayaran ditolak admin",
      });
      return NextResponse.json(payment);
    } catch (err) {
      const message = toPublicError(err, "Terjadi kesalahan");
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },

  async listAccounts() {
    try {
      const accounts = await paymentService.getActiveAccounts();
      return NextResponse.json(accounts.filter((a) => isCompleteAccount(a)));
    } catch (err) {
      return NextResponse.json({ error: toPublicError(err, "Terjadi kesalahan") }, { status: 500 });
    }
  },
};
