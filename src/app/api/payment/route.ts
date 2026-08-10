import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db";
import { payments } from "@/modules/payment/payment.schema";
import { bookings } from "@/modules/booking/booking.schema";
import { eq } from "drizzle-orm";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const bookingId = formData.get("bookingId") as string;
    const paymentMethod = formData.get("paymentMethod") as string;
    const totalAmount = formData.get("totalAmount") as string;
    const paymentProofFile = formData.get("paymentProof") as File | null;

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID tidak valid" },
        { status: 400 }
      );
    }

    // Save payment proof file
    let paymentProofUrl: string | null = null;
    if (paymentProofFile && paymentProofFile.size > 0) {
      const uploadsDir = join(process.cwd(), "public", "uploads");
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      const bytes = await paymentProofFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = paymentProofFile.name.split(".").pop() || "jpg";
      const filename = `payment-${bookingId}-${Date.now()}.${ext}`;
      const filepath = join(uploadsDir, filename);

      await writeFile(filepath, buffer);
      paymentProofUrl = `/uploads/${filename}`;
    }

    // Save payment record
    await db.insert(payments).values({
      bookingId,
      method: paymentMethod || "manual",
      amount: totalAmount || "0",
      status: "awaiting_verification",
      gatewayResponse: paymentProofUrl ? { proofUrl: paymentProofUrl } : null,
    });

    // Update booking status
    await db.update(bookings)
      .set({ status: "awaiting_verification", updatedAt: new Date() })
      .where(eq(bookings.id, bookingId));

    return NextResponse.json({ success: true, paymentProofUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    console.error("Payment error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
