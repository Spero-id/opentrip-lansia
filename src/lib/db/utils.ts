import { sql } from "drizzle-orm";
import { db } from ".";

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function withTransaction<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
  return db.transaction(fn);
}

export function increment(column: string, amount: number = 1) {
  return sql`${sql.identifier(column)} + ${amount}`;
}
