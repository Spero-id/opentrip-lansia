import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! });

async function dropAll() {
  const client = await pool.connect();
  try {
    const res = await client.query(
      "SELECT tablename FROM pg_tables WHERE schemaname='public'"
    );
    for (const t of res.rows) {
      await client.query(`DROP TABLE IF EXISTS "${t.tablename}" CASCADE`);
    }
    console.log(`Dropped ${res.rowCount} tables`);
  } finally {
    client.release();
  }
  await pool.end();
}

dropAll().catch(console.error);
