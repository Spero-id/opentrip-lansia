import { sql } from "drizzle-orm";
import { db } from ".";

export async function withTransaction<T>(fn: () => Promise<T>): Promise<T> {
  return db.transaction(fn);
}

export function increment(column: string, amount: number = 1) {
  return sql`${sql.identifier(column)} + ${amount}`;
}
