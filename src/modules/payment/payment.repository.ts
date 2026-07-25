import { db } from "@/shared/db";
import { payments } from "./payment.schema";
import { eq } from "drizzle-orm";
import type { UUID } from "@/shared/types";

export interface IPaymentRepository {
  findById(id: UUID): Promise<typeof payments.$inferSelect | null>;
  findByBookingId(bookingId: UUID): Promise<(typeof payments.$inferSelect)[]>;
  create(data: typeof payments.$inferInsert): Promise<typeof payments.$inferSelect>;
  update(id: UUID, data: Partial<typeof payments.$inferInsert>): Promise<void>;
}

export const paymentRepository: IPaymentRepository = {
  async findById(id) {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
    return payment ?? null;
  },

  async findByBookingId(bookingId) {
    return db.select().from(payments).where(eq(payments.bookingId, bookingId));
  },

  async create(data) {
    const [payment] = await db.insert(payments).values(data).returning();
    return payment;
  },

  async update(id, data) {
    await db.update(payments).set(data).where(eq(payments.id, id));
  },
};
