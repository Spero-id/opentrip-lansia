import { db } from "@/shared/db";
import { bookings, bookingItems, bookingParticipants } from "./booking.schema";
import { eq, desc } from "drizzle-orm";
import type { UUID } from "@/shared/types";

export interface IBookingRepository {
  findById(id: UUID): Promise<typeof bookings.$inferSelect | null>;
  findByUserId(userId: UUID): Promise<(typeof bookings.$inferSelect)[]>;
  create(data: typeof bookings.$inferInsert): Promise<typeof bookings.$inferSelect>;
  update(id: UUID, data: Partial<typeof bookings.$inferInsert>): Promise<void>;
  createItems(items: (typeof bookingItems.$inferInsert)[]): Promise<void>;
  findItemsByBookingId(bookingId: UUID): Promise<(typeof bookingItems.$inferSelect)[]>;
}

export const bookingRepository: IBookingRepository = {
  async findById(id) {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
    return booking ?? null;
  },

  async findByUserId(userId) {
    return db.select().from(bookings).where(eq(bookings.userId, userId)).orderBy(desc(bookings.createdAt));
  },

  async create(data) {
    const [booking] = await db.insert(bookings).values(data).returning();
    return booking;
  },

  async update(id, data) {
    await db.update(bookings).set(data).where(eq(bookings.id, id));
  },

  async createItems(items) {
    await db.insert(bookingItems).values(items);
  },

  async findItemsByBookingId(bookingId) {
    return db.select().from(bookingItems).where(eq(bookingItems.bookingId, bookingId));
  },
};
