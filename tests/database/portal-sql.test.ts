/** Supplementary PostgreSQL WASM tests; not native concurrency or provider acceptance. */
import test from "node:test";
import { registryQueries } from "../../src/server/portal/queries";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { btree_gist } from "@electric-sql/pglite/contrib/btree_gist";
import { fixtureReplay } from "./fixture-replay";
import { seedSyntheticData } from "../../prisma/seed-data";
import { fixtureId } from "../../prisma/fixtures";
test("Portal RLS — supplementary SQL WASM", async (t) => {
  const db = new PGlite({ extensions: { btree_gist } });
  const auth = fixtureId("auth:reader"),
    account = fixtureId("account:reader"),
    adminAuth = fixtureId("auth:admin"),
    adminAccount = fixtureId("account:admin"),
    orgA = fixtureId("org:a"),
    orgB = fixtureId("org:b");
  async function runtime(user: string | null, fn: () => Promise<void>) {
    await db.exec("BEGIN; SET LOCAL ROLE portal_runtime");
    try {
      await db.query("SELECT set_config('app.auth_uid',$1,true)", [user ?? ""]);
      await fn();
    } finally {
      await db.exec("ROLLBACK");
    }
  }
  try {
    await t.test(
      "migration ใหม่ทำงานต่อจาก core โดยไม่แก้ migration เดิม",
      async () => {
        await db.exec(
          readFileSync(
            "prisma/migrations/20261003130000_core_foundation/migration.sql",
            "utf8",
          ),
        );
        await db.exec(
          readFileSync(
            "prisma/migrations/20261009170000_portal_access/migration.sql",
            "utf8",
          ),
        );
        await seedSyntheticData(fixtureReplay(db));
        await db.query(
          "INSERT INTO private.user_account(id,auth_user_id) VALUES($1,$2),($3,$4)",
          [account, auth, adminAccount, adminAuth],
        );
        await db.query(
          "INSERT INTO private.role_assignment(account_id,organization_id,role_code,actions,starts_at,ends_at) VALUES($1,$2,'REGISTER_READER',ARRAY['people.read','organizations.read'],CURRENT_TIMESTAMP-interval '1 day',CURRENT_TIMESTAMP+interval '1 day'),($3,NULL,'TECHNICAL_ADMIN',ARRAY['admin.read'],CURRENT_TIMESTAMP-interval '1 day',CURRENT_TIMESTAMP+interval '1 day')",
          [account, orgA, adminAccount],
        );
        for (const [person, org] of [
          ["a", orgA],
          ["b", orgB],
        ])
          await db.query(
            "INSERT INTO private.person_affiliation(person_id,organization_id,effective_from,evidence_document_id) VALUES($1,$2,'2026-01-01',$3)",
            [
              fixtureId("person:" + person),
              org,
              fixtureId("document:evidence"),
            ],
          );
      },
    );
    await t.test("anonymous อ่านคนหน่วยงานและบัญชีไม่ได้", async () =>
      runtime(null, async () => {
        for (const table of ["person", "organization", "user_account"])
          assert.equal(
            (await db.query("SELECT * FROM private." + table)).rows.length,
            0,
          );
      }),
    );
    await t.test(
      "scope A อ่านเฉพาะ A รวมชื่อ ไม่มี count พื้นที่ B",
      async () =>
        runtime(auth, async () => {
          const roster = await db.query(registryQueries.people, ["%", 0]);
          assert.deepEqual(roster.rows, [
            {
              code: "DEMO_PERSON_A",
              name: "บุคคลสมมติ A ตัวอย่างบท06",
              revision: 1,
            },
          ]);
          assert.equal(
            (await db.query(registryQueries.people, ["%DEMO_PERSON_B%", 0]))
              .rows.length,
            0,
          );
          assert.equal(
            (await db.query(registryQueries.organizations, ["%DEMO_ORG_B%", 0]))
              .rows.length,
            0,
          );

          assert.deepEqual(
            (await db.query("SELECT person_code FROM private.person")).rows,
            [{ person_code: "DEMO_PERSON_A" }],
          );
          assert.deepEqual(
            (
              await db.query(
                "SELECT organization_code FROM private.organization",
              )
            ).rows,
            [{ organization_code: "DEMO_ORG_A" }],
          );
          assert.equal(
            (
              await db.query(
                "SELECT * FROM private.person_name_history WHERE person_id=$1",
                [fixtureId("person:b")],
              )
            ).rows.length,
            0,
          );
          assert.equal(
            (
              await db.query("SELECT * FROM private.organization WHERE id=$1", [
                orgB,
              ])
            ).rows.length,
            0,
          );
          assert.equal(
            (
              await db.query("SELECT * FROM private.user_account WHERE id=$1", [
                adminAccount,
              ])
            ).rows.length,
            0,
          );
        }),
    );
    await t.test(
      "technical admin ไม่ได้รับสิทธิ์ทะเบียนจากชื่อหน้าที่",
      async () =>
        runtime(adminAuth, async () => {
          for (const table of ["person", "organization"])
            assert.equal(
              (await db.query("SELECT * FROM private." + table)).rows.length,
              0,
            );
        }),
    );
    await t.test("หมดอายุหรือถอนสิทธิ์แล้วไม่อ่านทะเบียนต่อ", async () => {
      await db.query(
        "UPDATE private.role_assignment SET ends_at=CURRENT_TIMESTAMP-interval '1 second' WHERE account_id=$1",
        [account],
      );
      await runtime(auth, async () =>
        assert.equal(
          (await db.query("SELECT * FROM private.person")).rows.length,
          0,
        ),
      );
      await db.query(
        "UPDATE private.role_assignment SET ends_at=CURRENT_TIMESTAMP+interval '1 day',revoked_at=CURRENT_TIMESTAMP WHERE account_id=$1",
        [account],
      );
      await runtime(auth, async () =>
        assert.equal(
          (await db.query("SELECT * FROM private.organization")).rows.length,
          0,
        ),
      );
    });
    await t.test(
      "RLS FORCE ทั้ง 25 ตาราง และ runtime ไม่มี BYPASSRLS",
      async () => {
        const tables = await db.query<{ n: number }>(
          "SELECT count(*)::int AS n FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='private' AND c.relkind='r' AND c.relrowsecurity AND c.relforcerowsecurity",
        );
        assert.equal(tables.rows[0].n, 25);
        assert.deepEqual(
          (
            await db.query(
              "SELECT rolsuper,rolbypassrls,rolcanlogin FROM pg_roles WHERE rolname='portal_runtime'",
            )
          ).rows,
          [{ rolsuper: false, rolbypassrls: false, rolcanlogin: false }],
        );
      },
    );
    await t.test(
      "runtime เขียนทะเบียนและอ่านข้อมูลส่วนตัว/เอกสาร/rate table ไม่ได้",
      async () => {
        for (const sql of [
          "UPDATE private.person SET is_active=false",
          "SELECT * FROM private.person_private",
          "SELECT * FROM private.document",
          "SELECT * FROM private.portal_auth_limit",
        ]) {
          await runtime(auth, async () => {
            await assert.rejects(
              db.query(sql),
              (e) =>
                typeof e === "object" &&
                e !== null &&
                "code" in e &&
                e.code === "42501",
            );
          });
        }
      },
    );
    await t.test("session ของอีกบัญชีอ่านหรือยกเลิกไม่ได้", async () => {
      await db.query(
        "INSERT INTO private.portal_session(token_hash,account_id,expires_at) VALUES($1,$2,CURRENT_TIMESTAMP+interval '1 hour')",
        ["a".repeat(64), adminAccount],
      );
      await runtime(auth, async () => {
        assert.equal(
          (await db.query("SELECT * FROM private.portal_session")).rows.length,
          0,
        );
        assert.equal(
          (
            await db.query(
              "UPDATE private.portal_session SET revoked_at=CURRENT_TIMESTAMP RETURNING token_hash",
            )
          ).rows.length,
          0,
        );
      });
    });
    await t.test(
      "login rate limit ใช้ definer แคบ ไม่เปิดตารางให้ runtime",
      async () => {
        await db.exec("SET ROLE portal_runtime");
        for (let i = 0; i < 11; i++) {
          const r = await db.query<{ allowed: boolean }>(
            "SELECT private.portal_login_attempt($1) AS allowed",
            ["b".repeat(64)],
          );
          assert.equal(r.rows[0].allowed, i < 10);
        }
        await db.exec("RESET ROLE");
      },
    );
    await t.test(
      "temp relation ไม่ข้าม rate limit ของ SECURITY DEFINER",
      async () => {
        await db.exec(
          "SET ROLE portal_runtime; CREATE TEMP TABLE portal_auth_limit(key_hash text PRIMARY KEY,window_start timestamptz NOT NULL,attempts integer NOT NULL); GRANT ALL ON portal_auth_limit TO portal_auth_guard",
        );
        for (let i = 0; i < 11; i++) {
          const r = await db.query<{ allowed: boolean }>(
            "SELECT private.portal_login_attempt($1) AS allowed",
            ["c".repeat(64)],
          );
          assert.equal(r.rows[0].allowed, i < 10);
          await db.exec("DELETE FROM pg_temp.portal_auth_limit");
        }
        await db.exec("DROP TABLE pg_temp.portal_auth_limit; RESET ROLE");
      },
    );
  } finally {
    await db.close();
  }
});
