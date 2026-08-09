import { db } from "@/shared/db";
import { destinationCategories, horeca, vendors, horecaTypes, vendorTypes, meetingPoints } from "./master.schema";
import { eq } from "drizzle-orm";
import type { UUID } from "@/shared/types";
import { slugify } from "@/shared/utils/helpers";

export const masterRepository = {
  async getDestinationCategories() {
    return db.select().from(destinationCategories);
  },

  async createDestinationCategory(name: string) {
    const slug = slugify(name);
    const [existing] = await db
      .select()
      .from(destinationCategories)
      .where(eq(destinationCategories.name, name))
      .limit(1);
    if (existing) return existing;
    const [item] = await db
      .insert(destinationCategories)
      .values({ name, slug, isActive: true })
      .returning();
    return item;
  },

  async getHorecaTypes() {
    return db.select().from(horecaTypes);
  },

  async getVendorTypes() {
    return db.select().from(vendorTypes);
  },

  async getHorecaList() {
    return db.select().from(horeca);
  },

  async getVendors() {
    return db.select().from(vendors);
  },

  // HORECA
  async getHorecaById(id: UUID) {
    const [item] = await db.select().from(horeca).where(eq(horeca.id, id)).limit(1);
    return item ?? null;
  },

  async createHoreca(data: typeof horeca.$inferInsert) {
    const [item] = await db.insert(horeca).values(data).returning();
    return item;
  },

  async updateHoreca(id: UUID, data: Partial<typeof horeca.$inferInsert>) {
    const [item] = await db.update(horeca).set(data).where(eq(horeca.id, id)).returning();
    return item ?? null;
  },

  async deleteHoreca(id: UUID) {
    await db.delete(horeca).where(eq(horeca.id, id));
  },

  // Vendors
  async getVendorById(id: UUID) {
    const [item] = await db.select().from(vendors).where(eq(vendors.id, id)).limit(1);
    return item ?? null;
  },

  async createVendor(data: typeof vendors.$inferInsert) {
    const [item] = await db.insert(vendors).values(data).returning();
    return item;
  },

  async updateVendor(id: UUID, data: Partial<typeof vendors.$inferInsert>) {
    const [item] = await db.update(vendors).set(data).where(eq(vendors.id, id)).returning();
    return item ?? null;
  },

  async deleteVendor(id: UUID) {
    await db.delete(vendors).where(eq(vendors.id, id));
  },

  // Meeting Points
  async getMeetingPoints() {
    return db.select().from(meetingPoints).orderBy(meetingPoints.name);
  },

  async getMeetingPointById(id: UUID) {
    const [item] = await db.select().from(meetingPoints).where(eq(meetingPoints.id, id)).limit(1);
    return item ?? null;
  },

  async createMeetingPoint(data: typeof meetingPoints.$inferInsert) {
    const [item] = await db.insert(meetingPoints).values(data).returning();
    return item;
  },

  async updateMeetingPoint(id: UUID, data: Partial<typeof meetingPoints.$inferInsert>) {
    const [item] = await db.update(meetingPoints).set(data).where(eq(meetingPoints.id, id)).returning();
    return item ?? null;
  },

  async deleteMeetingPoint(id: UUID) {
    await db.delete(meetingPoints).where(eq(meetingPoints.id, id));
  },
};
