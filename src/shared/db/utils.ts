import { sql } from "drizzle-orm";
import { db } from ".";

/**
 * Tipe transaksi Drizzle. Dipakai oleh layanan yang wajib atomik — semua query
 * di dalam callback harus memakai `tx` ini, bukan `db`.
 */
export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Jalankan beberapa operasi dalam SATU transaksi database.
 *
 * Callback menerima `tx`. Query yang tetap memakai `db` akan jalan di koneksi
 * lain, TIDAK ikut rollback, dan merusak atomicitas — jadi wajib pakai `tx`.
 */
export async function withTransaction<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
  return db.transaction(fn);
}

export function increment(column: string, amount: number = 1) {
  return sql`${sql.identifier(column)} + ${amount}`;
}
