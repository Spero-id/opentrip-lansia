import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { isReadOnlyCall, isTransientError, RETRY_DELAYS_MS } from "./retry";

const sql = neon(process.env.DATABASE_URL!);

const sqlWithRetry = new Proxy(sql, {
  apply(target, thisArg, args: unknown[]) {
    const run = async (attempt: number): Promise<unknown> => {
      try {
        return await Reflect.apply(target, thisArg, args);
      } catch (err) {
        const delay = RETRY_DELAYS_MS[attempt];
        if (isReadOnlyCall(args) && isTransientError(err) && delay !== undefined) {
          console.warn(
            `[db] transient Neon error, retrying in ${delay}ms (attempt ${attempt + 2}/${RETRY_DELAYS_MS.length + 1}): ${err instanceof Error ? err.message.slice(0, 140) : err}`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          return run(attempt + 1);
        }
        throw err;
      }
    };
    return run(0);
  },
});

export const db = drizzle(sqlWithRetry);

export type DB = typeof db;