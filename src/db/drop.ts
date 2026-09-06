import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function dropAll() {
  const tables = await sql`SELECT tablename FROM pg_tables WHERE schemaname='public'`;
  for (const t of tables) {
    await sql.unsafe(`DROP TABLE IF EXISTS "${t.tablename}" CASCADE`);
  }
  console.log(`Dropped ${tables.length} tables`);
}

dropAll().catch(console.error);
