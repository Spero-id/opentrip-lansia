import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "./src/shared/db";

async function run() {
  try {
    console.log("Adding is_senior_friendly column...");
    await db.execute(sql`ALTER TABLE destinations ADD COLUMN IF NOT EXISTS is_senior_friendly boolean DEFAULT false;`);
    console.log("Dropping difficulty_level column...");
    await db.execute(sql`ALTER TABLE destinations DROP COLUMN IF EXISTS difficulty_level;`);
    console.log("Migration complete!");
  } catch (err) {
    console.error("Migration failed:", err);
  }
  process.exit(0);
}

run();
