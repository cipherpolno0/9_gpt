import "dotenv/config";
import test from "node:test";
import assert from "node:assert/strict";
import { Pool, type PoolClient } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { assertLocalDatabase } from "../../prisma/local-safety";
import { seedSyntheticData } from "../../prisma/seed-data";
import { fixtureId, SEED_ACTOR_ID } from "../../prisma/fixtures";
import { bangkokDateKey } from "../../src/shared/dates/bangkok";

const connectionString = assertLocalDatabase(
  process.env.CH06_TEST_DATABASE_URL,
  process.env.APP_ENV,
  "test",
);
const pool = new Pool({ connectionString, connectionTimeoutMillis: 5000 });
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});
const nil = "00000000-0000-5000-a000-000000000000";

async function transaction(fn: (client: PoolClient) => Promise<void>) {
  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    await c.query(
      "SELECT set_config('app.service_actor_id',$1,true),set_config('app.correlation_id',$2,true)",
      [SEED_ACTOR_ID, fixtureId("operation:test")],
    );
    await fn(c);
  } finally {
    await c.query("ROLLBACK");
    c.release();
  }
}
async function rejectsSql(sql: string, values: unknown[], state: string) {
  await transaction(async (c) => {
    await assert.rejects(
      c.query(sql, values),
      (e: unknown) =>
        typeof e === "object" && e !== null && "code" in e && e.code === state,
    );
  });
}
async function snapshot() {
  const tables = await pool.query(
    "SELECT tablename FROM pg_tables WHERE schemaname='private' ORDER BY tablename",
  );
  const result: Record<string, unknown> = {};
  for (const { tablename } of tables.rows) {
    // Names come from trusted migration catalog, limited identifiers.
    assert.match(tablename, /^[a-z_]+$/);
    const rows = await pool.query(
      // Snapshot every column deterministically, including tables whose key is a hash.
      `SELECT to_jsonb(t) AS data FROM private."${tablename}" t ORDER BY data`,
    );
    result[tablename] = rows.rows.map((r) => r.data);
  }
  return result;
}

test("PostgreSQL core06 — migration/seed/constraints/RLS", async (t) => {
  try {
    await t.test(
      "seedสองครั้งและพร้อมกันไม่ซ้ำ ไม่เขียนทับและไม่เพิ่มauditซ้ำ",
      async () => {
        await seedSyntheticData(prisma);
        const first = await snapshot();
        await seedSyntheticData(prisma);
        await Promise.all([
          seedSyntheticData(prisma),
          seedSyntheticData(prisma),
        ]);
        assert.deepEqual(await snapshot(), first);
        assert.equal(await prisma.person.count(), 3);
        assert.equal(await prisma.organization.count(), 2);
        assert.equal(await prisma.academicYear.count(), 2);
        assert.equal(await prisma.fiscalYear.count(), 2);
        assert.equal(await prisma.auditLog.count(), 41);
      },
    );
    await t.test(
      "Prismaอ่าน FKร่วมได้ โดยคนเดียวไม่สร้างทะเบียนตามบทบาท",
      async () => {
        const person = await prisma.person.findUniqueOrThrow({
          where: { personCode: "DEMO_PERSON_A" },
          include: {
            personPrivateByPersonId: true,
            personContactByPersonId: true,
            personNameHistoryByPersonId: true,
          },
        });
        assert.equal(person.personPrivateByPersonId?.personId, person.id);
        assert.equal(person.personContactByPersonId[0].personId, person.id);
        assert.equal(person.personNameHistoryByPersonId[0].personId, person.id);
      },
    );
    await t.test("unique person_code และ uniqueข้อมูลส่วนตัว", async () => {
      await rejectsSql(
        "UPDATE private.person SET person_code='DEMO_PERSON_A' WHERE person_code='DEMO_PERSON_B'",
        [],
        "23505",
      );
      await rejectsSql(
        "UPDATE private.person_private SET person_id=$1 WHERE id=$2",
        [fixtureId("person:a"), fixtureId("private:b")],
        "23505",
      );
    });
    await t.test("FKผิดคน/หน่วย/ปีต้องถูกปฏิเสธ", async () => {
      await rejectsSql(
        "UPDATE private.person_private SET person_id=$1 WHERE id=$2",
        [nil, fixtureId("private:a")],
        "23503",
      );
      await rejectsSql(
        "UPDATE private.organization SET organization_type_id=$1 WHERE id=$2",
        [nil, fixtureId("org:a")],
        "23503",
      );
      await rejectsSql(
        "UPDATE private.academic_year SET policy_version_id=$1 WHERE id=$2",
        [nil, fixtureId("academic:2026")],
        "23503",
      );
    });
    await t.test("รหัสข้ามโดเมน/mergeตนเอง/ช่วงปีผิดถูกปฏิเสธ", async () => {
      await rejectsSql(
        "UPDATE private.person SET current_state_id=$1 WHERE id=$2",
        [
          fixtureId("code:organization_status:DEMO_ACTIVE"),
          fixtureId("person:a"),
        ],
        "23514",
      );
      await rejectsSql(
        "UPDATE private.person SET merged_into_person_id=id WHERE id=$1",
        [fixtureId("person:a")],
        "23514",
      );
      await rejectsSql(
        "UPDATE private.academic_year SET ends_on=starts_on WHERE id=$1",
        [fixtureId("academic:2026")],
        "23514",
      );
    });
    await t.test("ประวัติimmutableและช่วงทับถูกปฏิเสธ", async () => {
      await rejectsSql(
        "UPDATE private.person_name_history SET given_name='ชื่อใหม่' WHERE id=$1",
        [fixtureId("personname:a")],
        "23514",
      );
      await rejectsSql(
        "INSERT INTO private.person_name_history(id,person_id,name_kind_id,given_name,effective_from,recorded_by_actor_id,evidence_document_id) SELECT $1,person_id,name_kind_id,'ชื่อสมมติซ้ำ',effective_from,recorded_by_actor_id,evidence_document_id FROM private.person_name_history WHERE id=$2",
        [nil, fixtureId("personname:a")],
        "23P01",
      );
    });
    await t.test(
      "แทนประวัติในtransactionเดียวเก็บรุ่นเก่าและหลักฐาน",
      async () => {
        await transaction(async (c) => {
          await c.query(
            "UPDATE private.person_name_history SET superseded_at='2026-10-03T12:00:00Z' WHERE id=$1",
            [fixtureId("personname:a")],
          );
          await c.query(
            "INSERT INTO private.person_name_history(id,person_id,name_kind_id,given_name,effective_from,recorded_at,recorded_by_actor_id,evidence_document_id,replaces_id) SELECT $1,person_id,name_kind_id,'บุคคลสมมติ A รุ่นแก้ไข',effective_from,'2026-10-03T12:00:01Z',recorded_by_actor_id,evidence_document_id,id FROM private.person_name_history WHERE id=$2",
            [nil, fixtureId("personname:a")],
          );
          const rows = await c.query(
            "SELECT given_name,superseded_at,replaces_id FROM private.person_name_history WHERE person_id=$1 ORDER BY recorded_at",
            [fixtureId("person:a")],
          );
          assert.equal(rows.rowCount, 2);
          assert.equal(rows.rows[0].given_name, "บุคคลสมมติ A");
          assert.equal(rows.rows[1].replaces_id, fixtureId("personname:a"));
        });
      },
    );
    await t.test("soft-deleteรักษาFK และห้ามลบ/แก้audit", async () => {
      await rejectsSql(
        "DELETE FROM private.person WHERE id=$1",
        [fixtureId("person:a")],
        "23514",
      );
      await rejectsSql(
        "UPDATE private.audit_logs SET action_code='OTHER'",
        [],
        "23514",
      );
      await transaction(async (c) => {
        await c.query("UPDATE private.person SET is_active=false WHERE id=$1", [
          fixtureId("person:a"),
        ]);
        const rows = await c.query(
          "SELECT p.row_version,p.is_active,x.person_id FROM private.person p JOIN private.person_private x ON x.person_id=p.id WHERE p.id=$1",
          [fixtureId("person:a")],
        );
        assert.equal(rows.rows[0].is_active, false);
        assert.equal(rows.rows[0].row_version, 2);
        assert.equal(rows.rows[0].person_id, fixtureId("person:a"));
      });
    });
    await t.test("ภูมิศาสตร์ไม่เป็นscopeและห้ามวงจร", async () => {
      await rejectsSql(
        "UPDATE private.geography SET parent_geography_id=$1 WHERE id=$2",
        [fixtureId("geo:b"), fixtureId("geo:a")],
        "23514",
      );
      const rows = await pool.query(
        "SELECT geography_id,count(*)::int AS n FROM private.address_version GROUP BY geography_id",
      );
      assert.equal(rows.rows[0].n, 2);
    });
    await t.test(
      "auditร่วมtransactionไม่มีค่าข้อมูลส่วนตัว และrollbackร่วมกัน",
      async () => {
        const before = await prisma.auditLog.count();
        await transaction(async (c) => {
          await c.query(
            "UPDATE private.person_private SET private_notes='DEMO_PRIVATE_SENTINEL' WHERE id=$1",
            [fixtureId("private:a")],
          );
          const logs = await c.query(
            "SELECT to_jsonb(a) AS data FROM private.audit_logs a WHERE target_id=$1 ORDER BY recorded_at DESC LIMIT 1",
            [fixtureId("private:a")],
          );
          assert.ok(logs.rows[0].data.changed_fields.includes("private_notes"));
          assert.equal(
            JSON.stringify(logs.rows[0].data).includes("DEMO_PRIVATE_SENTINEL"),
            false,
          );
        });
        assert.equal(await prisma.auditLog.count(), before);
        assert.doesNotMatch(
          (
            await prisma.personPrivate.findUniqueOrThrow({
              where: { id: fixtureId("private:a") },
            })
          ).privateNotes ?? "",
          /SENTINEL/,
        );
      },
    );
    await t.test(
      "RLSครบ25ตาราง; limited roleแม้grant/ปลอมcontextก็อ่านแก้ไม่ได้",
      async () => {
        await transaction(async (c) => {
          const flags = await c.query(
            "SELECT c.relname,c.relrowsecurity,c.relforcerowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='private' AND c.relkind='r'",
          );
          assert.equal(flags.rowCount, 25);
          for (const row of flags.rows)
            assert.ok(row.relrowsecurity && row.relforcerowsecurity);
          await c.query(
            "CREATE ROLE ch06_rls_probe NOLOGIN NOSUPERUSER NOBYPASSRLS",
          );
          await c.query("GRANT USAGE ON SCHEMA private TO ch06_rls_probe");
          await c.query(
            "GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA private TO ch06_rls_probe",
          );
          await c.query("SET LOCAL ROLE ch06_rls_probe");
          for (const row of flags.rows) {
            const rows = await c.query(
              `SELECT * FROM private."${row.relname}"`,
            );
            assert.equal(rows.rowCount, 0);
          }
          const update = await c.query(
            "UPDATE private.person SET is_active=false",
          );
          assert.equal(update.rowCount, 0);
          await assert.rejects(
            c.query(
              "INSERT INTO private.service_actor(actor_code,label_th) VALUES('DEMO_UNAUTHORIZED','สมมติ')",
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
    await t.test(
      "PostgreSQLวันไทยตรงJavaScriptที่ก่อน/หลังเที่ยงคืน",
      async () => {
        for (const iso of [
          "2026-12-31T16:59:59.999Z",
          "2026-12-31T17:00:00Z",
          "2026-10-03T17:00:00Z",
        ]) {
          const row = await pool.query(
            "SELECT to_char($1::timestamptz AT TIME ZONE 'Asia/Bangkok','YYYY-MM-DD') AS date_key",
            [iso],
          );
          assert.equal(row.rows[0].date_key, bangkokDateKey(iso));
        }
      },
    );
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
});
