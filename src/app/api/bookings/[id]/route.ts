import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db";
import { bookings, bookingParticipants, healthDeclarations } from "@/modules/booking/booking.schema";
import { payments } from "@/modules/payment/payment.schema";
import { eq } from "drizzle-orm";
import { auth } from "@/modules/auth/auth.config";

const VALID_STATUSES = ["pending", "awaiting_verification", "confirmed", "cancelled", "completed"] as const;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Fetch booking with participants and payments
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id))
      .limit(1);

    if (!booking) {
      return NextResponse.json(
        { error: "Booking tidak ditemukan" },
        { status: 404 }
      );
    }

    if (booking.userId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch participants
    const participants = await db
      .select()
      .from(bookingParticipants)
      .where(eq(bookingParticipants.bookingId, id));

    // Fetch health declarations for participants
    const healthDecls = [];
    for (const p of participants) {
      const [health] = await db
        .select()
        .from(healthDeclarations)
        .where(eq(healthDeclarations.participantId, p.id))
        .limit(1);
      if (health) healthDecls.push(health);
    }

    // Fetch payments
    const paymentRecords = await db
      .select()
      .from(payments)
      .where(eq(payments.bookingId, id));

    return NextResponse.json({
      ...booking,
      participants,
      healthDeclarations: healthDecls,
      payments: paymentRecords,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    console.error("Get booking error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, adminMessage } = body;

    const [existing] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Booking tidak ditemukan" },
        { status: 404 }
      );
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Status tidak valid" },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (status) updates.status = status;
    if (adminMessage !== undefined) {
      if (typeof adminMessage !== "string" || adminMessage.length > 2000) {
        return NextResponse.json(
          { error: "Pesan admin tidak valid" },
          { status: 400 }
        );
      }
      let notesObj: Record<string, unknown> = {};
      try {
        notesObj = existing.notes ? JSON.parse(existing.notes) : {};
      } catch {
        notesObj = {};
      }
      notesObj.adminMessage = adminMessage.trim();
      updates.notes = JSON.stringify(notesObj);
    }

    await db
      .update(bookings)
      .set(updates)
      .where(eq(bookings.id, id));

    return NextResponse.json({ success: true, status, adminMessage: updates.adminMessage ?? (updates.notes ? JSON.parse(String(updates.notes)).adminMessage : null) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    console.error("Update booking status error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
