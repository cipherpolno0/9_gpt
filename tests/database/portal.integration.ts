import "dotenv/config";
import test from "node:test";
import assert from "node:assert/strict";
import { Pool, type PoolClient } from "pg";
import { assertLocalDatabase } from "../../prisma/local-safety";
import { fixtureId } from "../../prisma/fixtures";
import { registryQueries } from "../../src/server/portal/queries";
test("native PostgreSQL portal scope — requires migrated synthetic loopback DB", async (t) => {
  const url = assertLocalDatabase(
    process.env.CH06_TEST_DATABASE_URL,
    process.env.APP_ENV,
    "test",
  );
  const pool = new Pool({
    connectionString: url,
    max: 1,
    connectionTimeoutMillis: 5000,
  });
  let db: PoolClient | undefined;
  try {
    db = await pool.connect();
    await db.query("BEGIN");
    const c = db;
    const account = fixtureId("native:account"),
      auth = fixtureId("native:auth"),
      admin = fixtureId("native:admin"),
      adminAuth = fixtureId("native:admin-auth");
    await c.query(
      "INSERT INTO private.user_account(id,auth_user_id) VALUES($1,$2),($3,$4)",
      [account, auth, admin, adminAuth],
    );
    await c.query(
      "INSERT INTO private.role_assignment(account_id,organization_id,role_code,actions,starts_at,ends_at) VALUES($1,$2,'REGISTER_READER',ARRAY['people.read','organizations.read'],CURRENT_TIMESTAMP-interval '1 day',CURRENT_TIMESTAMP+interval '1 day'),($3,NULL,'TECHNICAL_ADMIN',ARRAY['admin.read'],CURRENT_TIMESTAMP-interval '1 day',CURRENT_TIMESTAMP+interval '1 day')",
      [account, fixtureId("org:a"), admin],
    );
    for (const [person, org] of [
      ["a", "a"],
      ["b", "b"],
    ])
      await c.query(
        "INSERT INTO private.person_affiliation(person_id,organization_id,effective_from,evidence_document_id) VALUES($1,$2,'2026-01-01',$3)",
        [
          fixtureId("person:" + person),
          fixtureId("org:" + org),
          fixtureId("document:evidence"),
        ],
      );
    async function asUser(user: string | null, fn: () => Promise<void>) {
      await c.query("SAVEPOINT request_context");
      try {
        await c.query("SET LOCAL ROLE portal_runtime");
        await c.query("SELECT set_config('app.auth_uid',$1,true)", [
          user ?? "",
        ]);
        await fn();
      } finally {
        await c.query("ROLLBACK TO SAVEPOINT request_context");
        await c.query("RELEASE SAVEPOINT request_context");
      }
    }
    await t.test(
      "actual roster queries preserve Thai and filter scope before paging",
      async () =>
        asUser(auth, async () => {
          assert.deepEqual(
            (await c.query(registryQueries.people, ["%", 0])).rows,
            [
              {
                code: "DEMO_PERSON_A",
                name: "บุคคลสมมติ A ตัวอย่างบท06",
                revision: 1,
              },
            ],
          );
          assert.equal(
            (await c.query(registryQueries.people, ["%DEMO_PERSON_B%", 0]))
              .rowCount,
            0,
          );
          assert.equal(
            (await c.query(registryQueries.organizations, ["%DEMO_ORG_B%", 0]))
              .rowCount,
            0,
          );
        }),
    );
    await t.test(
      "anonymous and technical admin cannot read either registry",
      async () => {
        for (const user of [null, adminAuth])
          await asUser(user, async () => {
            for (const query of Object.values(registryQueries))
              assert.equal((await c.query(query, ["%", 0])).rowCount, 0);
          });
      },
    );
    await t.test(
      "expired grants stop reads without restarting server",
      async () => {
        await c.query(
          "UPDATE private.role_assignment SET ends_at=CURRENT_TIMESTAMP-interval '1 second' WHERE account_id=$1",
          [account],
        );
        await asUser(auth, async () =>
          assert.equal(
            (await c.query(registryQueries.people, ["%", 0])).rowCount,
            0,
          ),
        );
      },
    );
    await t.test(
      "no private fields, files or approval rights are granted by reader role",
      async () => {
        for (const sql of [
          "SELECT * FROM private.person_private",
          "SELECT * FROM private.document",
          "UPDATE private.person SET is_active=false",
        ])
          await asUser(auth, async () =>
            assert.rejects(
              c.query(sql),
              (e) =>
                typeof e === "object" &&
                e !== null &&
                "code" in e &&
                e.code === "42501",
            ),
          );
      },
    );
  } finally {
    if (db) {
      await db.query("ROLLBACK").catch(() => {});
      db.release();
    }
    await pool.end();
  }
});
