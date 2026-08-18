import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "./src/shared/db";

async function run() {
  try {
    console.log("Adding cover_image column to blogs...");
    await db.execute(sql`ALTER TABLE blogs ADD COLUMN IF NOT EXISTS cover_image text;`);
    console.log("Migration complete!");
  } catch (err) {
    console.error("Migration failed:", err);
  }
  process.exit(0);
}

run();
