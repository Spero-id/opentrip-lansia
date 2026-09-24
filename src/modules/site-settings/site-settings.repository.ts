import { db } from "@/shared/db";
import { siteSettings } from "./site-settings.schema";
import { eq } from "drizzle-orm";

export interface ISiteSettingsRepository {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, description?: string): Promise<void>;
  getAll(): Promise<{ key: string; value: string; description: string | null }[]>;
}

export const siteSettingsRepository: ISiteSettingsRepository = {
  async get(key) {
    const [row] = await db
      .select({ value: siteSettings.value })
      .from(siteSettings)
      .where(eq(siteSettings.key, key))
      .limit(1);
    return row?.value ?? null;
  },

  async set(key, value, description) {
    const existing = await this.get(key);
    if (existing !== null) {
      await db
        .update(siteSettings)
        .set({ value, updatedAt: new Date() })
        .where(eq(siteSettings.key, key));
    } else {
      await db.insert(siteSettings).values({ key, value, description });
    }
  },

  async getAll() {
    return db.select().from(siteSettings);
  },
};
