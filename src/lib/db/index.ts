import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { DATABASE_URL } from "@/lib/env/server";

const pool = new pg.Pool({ connectionString: DATABASE_URL });
export const db = drizzle(pool);

export type DB = typeof db;
