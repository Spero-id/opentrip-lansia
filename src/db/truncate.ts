import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function truncateAll() {
  const tables = await sql`SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename NOT LIKE '__drizzle%'`;
  for (const t of tables) {
    await sql.unsafe(`TRUNCATE TABLE "${t.tablename}" CASCADE`);
  }
  console.log(`Cleared ${tables.length} tables`);
}

truncateAll().catch(console.error);
