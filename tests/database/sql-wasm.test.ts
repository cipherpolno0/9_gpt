/** Supplementary SQL checks, NOT Prisma/PostgreSQL server acceptance. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { btree_gist } from "@electric-sql/pglite/contrib/btree_gist";
import type { PrismaClient } from "../../src/generated/prisma/client";
import { seedSyntheticData } from "../../prisma/seed-data";
import { fixtureId, SEED_ACTOR_ID } from "../../prisma/fixtures";
import { bangkokDateKey } from "../../src/shared/dates/bangkok";

const snake = (s: string) => s.replace(/[A-Z]/g, (c) => "_" + c.toLowerCase());
type UpsertCall = {
  where: { id: string };
  update: Record<string, never>;
  create: Record<string, unknown>;
};

/** Replays scalar fixture inserts only; this is not a Prisma adapter. */
function fixtureReplay(db: PGlite): PrismaClient {
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

test("SQL supplementary — PostgreSQL WASM; server/Prisma/concurrency NOT RUN", async (t) => {
  const db = new PGlite({ extensions: { btree_gist } });
  const nil = "00000000-0000-5000-a000-000000000000";
  async function inRollback(fn: () => Promise<void>) {
    await db.exec("BEGIN");
    try {
      await db.query(
        "SELECT set_config('app.service_actor_id',$1,true),set_config('app.correlation_id',$2,true)",
        [SEED_ACTOR_ID, fixtureId("operation:sqltest")],
      );
      await fn();
    } finally {
      await db.exec("ROLLBACK");
    }
  }
  async function rejects(sql: string, values: unknown[], state: string) {
    await inRollback(async () => {
      await assert.rejects(
        db.query(sql, values),
        (e: unknown) =>
          typeof e === "object" &&
          e !== null &&
          "code" in e &&
          e.code === state,
      );
    });
  }
  try {
    await t.test("migration SQLทุกstatementรันกับฐานWASMว่าง", async () => {
      await db.exec(
        readFileSync(
          "prisma/migrations/20261003130000_core_foundation/migration.sql",
          "utf8",
        ),
      );
      const version = await db.query<{ version: string }>("SELECT version()");
      console.log("SQL backend:", version.rows[0].version);
    });
    await t.test(
      "replayชุดfixtureสองครั้งคง41รายการและaudit41ไม่เพิ่มซ้ำ",
      async () => {
        const replay = fixtureReplay(db);
        await seedSyntheticData(replay);
        const first = await db.query(
          "SELECT count(*)::int AS n FROM private.audit_logs",
        );
        await seedSyntheticData(replay);
        const second = await db.query(
          "SELECT count(*)::int AS n FROM private.audit_logs",
        );
        assert.deepEqual(second.rows, first.rows);
        assert.deepEqual(first.rows, [{ n: 41 }]);
        for (const [table, n] of [
          ["person", 3],
          ["organization", 2],
          ["academic_year", 2],
          ["fiscal_year", 2],
        ]) {
          assert.deepEqual(
            (await db.query(`SELECT count(*)::int AS n FROM private.${table}`))
              .rows,
            [{ n }],
          );
        }
      },
    );
    await t.test("uniqueและFKไม่รับคนซ้ำ/บุคคลที่ไม่มี", async () => {
      await rejects(
        "UPDATE private.person SET person_code='DEMO_PERSON_A' WHERE person_code='DEMO_PERSON_B'",
        [],
        "23505",
      );
      await rejects(
        "UPDATE private.person_private SET person_id=$1 WHERE id=$2",
        [nil, fixtureId("private:a")],
        "23503",
      );
      await rejects(
        "UPDATE private.person_private SET person_id=$1 WHERE id=$2",
        [fixtureId("person:a"), fixtureId("private:b")],
        "23505",
      );
      await rejects(
        "UPDATE private.academic_year SET policy_version_id=$1 WHERE id=$2",
        [nil, fixtureId("academic:2026")],
        "23503",
      );
    });
    await t.test("รหัสผิดโดเมน ปีช่วงผิด mergeตนเองถูกปฏิเสธ", async () => {
      await rejects(
        "UPDATE private.person SET current_state_id=$1 WHERE id=$2",
        [
          fixtureId("code:organization_status:DEMO_ACTIVE"),
          fixtureId("person:a"),
        ],
        "23514",
      );
      await rejects(
        "UPDATE private.academic_year SET ends_on=starts_on WHERE id=$1",
        [fixtureId("academic:2026")],
        "23514",
      );
      await rejects(
        "UPDATE private.person SET merged_into_person_id=id WHERE id=$1",
        [fixtureId("person:a")],
        "23514",
      );
    });
    await t.test("ประวัติไม่ทับและช่วงทับถูกปฏิเสธ", async () => {
      await rejects(
        "UPDATE private.person_name_history SET given_name='ชื่อใหม่' WHERE id=$1",
        [fixtureId("personname:a")],
        "23514",
      );
      await rejects(
        "INSERT INTO private.person_name_history(id,person_id,name_kind_id,given_name,effective_from,recorded_by_actor_id,evidence_document_id) SELECT $1,person_id,name_kind_id,'ชื่อสมมติซ้ำ',effective_from,recorded_by_actor_id,evidence_document_id FROM private.person_name_history WHERE id=$2",
        [nil, fixtureId("personname:a")],
        "23P01",
      );
    });
    await t.test("แก้ประวัติด้วยsupersedeและinsertเก็บชื่อเดิม", async () => {
      await inRollback(async () => {
        await db.query(
          "UPDATE private.person_name_history SET superseded_at='2026-10-03T12:00:00Z' WHERE id=$1",
          [fixtureId("personname:a")],
        );
        await db.query(
          "INSERT INTO private.person_name_history(id,person_id,name_kind_id,given_name,effective_from,recorded_at,recorded_by_actor_id,evidence_document_id,replaces_id) SELECT $1,person_id,name_kind_id,'บุคคลสมมติ A รุ่นใหม่',effective_from,'2026-10-03T12:00:01Z',recorded_by_actor_id,evidence_document_id,id FROM private.person_name_history WHERE id=$2",
          [nil, fixtureId("personname:a")],
        );
        const rows = await db.query<{ given_name: string }>(
          "SELECT given_name FROM private.person_name_history WHERE person_id=$1 ORDER BY recorded_at",
          [fixtureId("person:a")],
        );
        assert.deepEqual(
          rows.rows.map((r) => r.given_name),
          ["บุคคลสมมติ A", "บุคคลสมมติ A รุ่นใหม่"],
        );
      });
    });
    await t.test(
      "ไม่มีactorcontextไม่เขียนได้ และห้ามลบ/แก้audit",
      async () => {
        await assert.rejects(
          db.query("UPDATE private.person SET is_active=false"),
          (e: unknown) =>
            typeof e === "object" &&
            e !== null &&
            "code" in e &&
            e.code === "23514",
        );
        await rejects(
          "DELETE FROM private.person WHERE id=$1",
          [fixtureId("person:a")],
          "23514",
        );
        await rejects(
          "UPDATE private.audit_logs SET action_code='OTHER'",
          [],
          "23514",
        );
      },
    );
    await t.test(
      "softdelete FKยังอยู่และauditrollbackไม่เก็บค่าลับ",
      async () => {
        const before = await db.query(
          "SELECT count(*) FROM private.audit_logs",
        );
        await inRollback(async () => {
          await db.query(
            "UPDATE private.person SET is_active=false WHERE id=$1",
            [fixtureId("person:a")],
          );
          const joined = await db.query(
            "SELECT p.row_version,x.person_id FROM private.person p JOIN private.person_private x ON x.person_id=p.id WHERE p.id=$1",
            [fixtureId("person:a")],
          );
          assert.equal(joined.rows.length, 1);
          assert.equal(
            (joined.rows[0] as { row_version: number }).row_version,
            2,
          );
          await db.query(
            "UPDATE private.person_private SET private_notes='DEMO_PRIVATE_SENTINEL' WHERE id=$1",
            [fixtureId("private:a")],
          );
          const logs = await db.query(
            "SELECT to_jsonb(a) AS data FROM private.audit_logs a WHERE target_id=$1",
            [fixtureId("private:a")],
          );
          assert.equal(
            JSON.stringify(logs.rows).includes("DEMO_PRIVATE_SENTINEL"),
            false,
          );
        });
        assert.deepEqual(
          (await db.query("SELECT count(*) FROM private.audit_logs")).rows,
          before.rows,
        );
      },
    );
    await t.test(
      "ภูมิศาสตร์ป้องกันวงจร และสองหน่วยมีภูมิศาสตร์เดียวได้",
      async () => {
        await rejects(
          "UPDATE private.geography SET parent_geography_id=$1 WHERE id=$2",
          [fixtureId("geo:b"), fixtureId("geo:a")],
          "23514",
        );
        assert.deepEqual(
          (
            await db.query(
              "SELECT count(DISTINCT geography_id)::int AS n FROM private.address_version",
            )
          ).rows,
          [{ n: 1 }],
        );
      },
    );
    await t.test(
      "RLSครบ19ตาราง grantและactorcontextไม่เปิดlimitedrole",
      async () => {
        await inRollback(async () => {
          const flags = await db.query<{
            relname: string;
            relrowsecurity: boolean;
            relforcerowsecurity: boolean;
          }>(
            "SELECT c.relname,c.relrowsecurity,c.relforcerowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='private' AND c.relkind='r'",
          );
          assert.equal(flags.rows.length, 19);
          assert.ok(
            flags.rows.every((r) => r.relrowsecurity && r.relforcerowsecurity),
          );
          await db.exec(
            "CREATE ROLE ch06_wasm_probe NOLOGIN NOSUPERUSER NOBYPASSRLS; GRANT USAGE ON SCHEMA private TO ch06_wasm_probe; GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA private TO ch06_wasm_probe; SET LOCAL ROLE ch06_wasm_probe;",
          );
          for (const row of flags.rows)
            assert.equal(
              (await db.query(`SELECT * FROM private.${row.relname}`)).rows
                .length,
              0,
            );
          await assert.rejects(
            db.query(
              "INSERT INTO private.service_actor(actor_code,label_th) VALUES('DEMO_DENIED','สมมติ')",
            ),
            (e: unknown) =>
              typeof e === "object" &&
              e !== null &&
              "code" in e &&
              e.code === "42501",
          );
        });
      },
    );
    await t.test("SQLกับJavaScriptให้วันไทยตรงกันใกล้เที่ยงคืน", async () => {
      for (const iso of ["2026-12-31T16:59:59.999Z", "2026-12-31T17:00:00Z"]) {
        const rows = await db.query<{ k: string }>(
          "SELECT to_char($1::timestamptz AT TIME ZONE 'Asia/Bangkok','YYYY-MM-DD') AS k",
          [iso],
        );
        assert.equal(rows.rows[0].k, bangkokDateKey(iso));
      }
    });
  } finally {
    await db.close();
  }
});
