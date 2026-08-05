import { db } from "@/shared/db";
import { bookings, bookingItems, bookingParticipants } from "./booking.schema";
import { payments } from "@/modules/payment/payment.schema";
import { eq, desc, or, like, type SQL } from "drizzle-orm";
import type { UUID } from "@/shared/types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export interface IBookingRepository {
  findAll(): Promise<(typeof bookings.$inferSelect)[]>;
  findById(id: UUID): Promise<typeof bookings.$inferSelect | null>;
  findByUserId(userId: UUID): Promise<(typeof bookings.$inferSelect)[]>;
  findByUserIdOrEmail(userId: UUID, email?: string): Promise<(typeof bookings.$inferSelect)[]>;
  create(data: typeof bookings.$inferInsert): Promise<typeof bookings.$inferSelect>;
  update(id: UUID, data: Partial<typeof bookings.$inferInsert>): Promise<void>;
  createItems(items: (typeof bookingItems.$inferInsert)[]): Promise<void>;
  findItemsByBookingId(bookingId: UUID): Promise<(typeof bookingItems.$inferSelect)[]>;
  createParticipants(participants: (typeof bookingParticipants.$inferInsert)[]): Promise<void>;
  findParticipantsByBookingId(bookingId: UUID): Promise<(typeof bookingParticipants.$inferSelect)[]>;
  findPaymentsByBookingId(bookingId: UUID): Promise<(typeof payments.$inferSelect)[]>;
}

export const bookingRepository: IBookingRepository = {
  async findAll() {
    return db.select().from(bookings).orderBy(desc(bookings.createdAt));
  },

  async findById(id) {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
    return booking ?? null;
  },

  async findByUserId(userId) {
    if (!isUuid(userId)) return [];
    return db.select().from(bookings).where(eq(bookings.userId, userId)).orderBy(desc(bookings.createdAt));
  },

  async findByUserIdOrEmail(userId, email) {
    const conditions: SQL<unknown>[] = [];
    if (isUuid(userId)) conditions.push(eq(bookings.userId, userId));
    if (email) conditions.push(like(bookings.notes, `%${email}%`));
    if (conditions.length === 0) return [];
    return db
      .select()
      .from(bookings)
      .where(or(...conditions))
      .orderBy(desc(bookings.createdAt));
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

  async createParticipants(participants) {
    if (participants.length === 0) return;
    await db.insert(bookingParticipants).values(participants);
  },

  async findParticipantsByBookingId(bookingId) {
    return db.select().from(bookingParticipants).where(eq(bookingParticipants.bookingId, bookingId));
  },

  async findPaymentsByBookingId(bookingId) {
    return db.select().from(payments).where(eq(payments.bookingId, bookingId));
  },
};

