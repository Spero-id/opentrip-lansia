import { db } from "@/shared/db";
import { notifications, type NewNotification } from "./notification.schema";
import { eq, desc, and, count } from "drizzle-orm";

export const notificationRepository = {
  async create(data: NewNotification) {
    const [row] = await db.insert(notifications).values(data).returning();
    return row;
  },

  async createMany(rows: NewNotification[]) {
    if (rows.length === 0) return [];
    return db.insert(notifications).values(rows).returning();
  },

  async findByUserId(userId: string, limit = 20, offset = 0) {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);
  },

  async countUnread(userId: string) {
    const [res] = await db
      .select({ cnt: count() })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return res?.cnt ?? 0;
  },

  async markAsRead(id: string, userId: string) {
    const [row] = await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .returning();
    return row ?? null;
  },

  async markAllAsRead(userId: string) {
    return db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  },
};
