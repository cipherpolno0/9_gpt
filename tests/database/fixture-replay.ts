import assert from "node:assert/strict";
import type { PGlite } from "@electric-sql/pglite";
import type { PrismaClient } from "../../src/generated/prisma/client";
const snake = (s: string) => s.replace(/[A-Z]/g, (c) => "_" + c.toLowerCase());
type UpsertCall = {
  where: { id: string };
  update: Record<string, never>;
  create: Record<string, unknown>;
};

/** Replays scalar fixture inserts only; this is not a Prisma adapter. */
export function fixtureReplay(db: PGlite): PrismaClient {
  const tx = new Proxy(
    {},
    {
      get(_target, property) {
        if (property === "$executeRaw")
          return async (strings: TemplateStringsArray, ...args: unknown[]) => {
            const sql = strings.reduce(
              (r, s, i) => r + s + (i < args.length ? `$${i + 1}` : ""),
              "",
            );
            await db.query(sql, args);
            return 1;
          };
        return {
          upsert: async ({ where, update, create }: UpsertCall) => {
            assert.deepEqual(update, {});
            const table = snake(String(property));
            assert.match(table, /^[a-z_]+$/);
            const found = await db.query(
              `SELECT id FROM private.${table} WHERE id=$1`,
              [where.id],
            );
            if (found.rows.length) return found.rows[0];
            const columns = Object.keys(create);
            for (const column of columns) assert.match(column, /^[a-zA-Z]+$/);
            const values = Object.values(create).map((v) =>
              v instanceof Date
                ? v.toISOString()
                : typeof v === "object" && v !== null
                  ? JSON.stringify(v)
                  : v,
            );
            const result = await db.query(
              `INSERT INTO private.${table}(${columns.map(snake).join(",")}) VALUES(${columns.map((_, i) => `$${i + 1}`).join(",")}) RETURNING *`,
              values,
            );
            return result.rows[0];
          },
        };
      },
    },
  );
  return {
    $transaction: async (fn: (tx: unknown) => Promise<unknown>) => {
      await db.exec("BEGIN");
      try {
        const result = await fn(tx);
        await db.exec("COMMIT");
        return result;
      } catch (error) {
        await db.exec("ROLLBACK");
        throw error;
      }
    },
  } as unknown as PrismaClient;
}
