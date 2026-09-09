import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! });

async function truncateAll() {
  const client = await pool.connect();
  try {
    const res = await client.query(
      "SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename NOT LIKE '__drizzle%'"
    );
    for (const t of res.rows) {
      await client.query(`TRUNCATE TABLE "${t.tablename}" CASCADE`);
    }
    console.log(`Cleared ${res.rowCount} tables`);
  } finally {
    client.release();
  }
  await pool.end();
}

truncateAll().catch(console.error);
