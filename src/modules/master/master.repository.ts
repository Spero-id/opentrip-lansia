import { db } from "@/shared/db";
import { destinations, destinationCategories, horeca, vendors, horecaTypes, vendorTypes, meetingPoints } from "./master.schema";
import { eq } from "drizzle-orm";
import type { UUID } from "@/shared/types";

type DestinationInsert = typeof destinations.$inferInsert;

export const masterRepository = {
  async getDestinations() {
    return db.select().from(destinations);
  },

  async getDestinationById(id: UUID) {
    const [dest] = await db.select().from(destinations).where(eq(destinations.id, id)).limit(1);
    return dest ?? null;
  },

  async createDestination(data: DestinationInsert) {
    const [dest] = await db.insert(destinations).values(data).returning();
    return dest;
  },

  async updateDestination(id: UUID, data: Partial<DestinationInsert>) {
    const [dest] = await db.update(destinations).set(data).where(eq(destinations.id, id)).returning();
    return dest ?? null;
  },

  async deleteDestination(id: UUID) {
    await db.delete(destinations).where(eq(destinations.id, id));
  },

  async getDestinationCategories() {
    return db.select().from(destinationCategories);
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
