import "dotenv/config";
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { assertLocalDatabase } from "../../prisma/local-safety";
import { workflowCases, asWork, orgA, code } from "./workflow-cases";
test("native PostgreSQL shared documents workflow and concurrency", async (t) => {
  const pool = new Pool({
    connectionString: assertLocalDatabase(
      process.env.CH06_TEST_DATABASE_URL,
      process.env.APP_ENV,
      "test",
    ),
    max: 6,
    connectionTimeoutMillis: 5000,
  });
  const db = await pool.connect();
  try {
    const state = await workflowCases(t, db);
    const call = async (name: string, fn: string, args: unknown[]) => {
      const client = await pool.connect();
      try {
        return await asWork(
          client,
          name,
          `SELECT private.${fn}(${args.map((_, i) => "$" + (i + 1)).join(",")}) AS data`,
          args,
        );
      } finally {
        client.release();
      }
    };
    await t.test(
      "two browser commits create one draft with identical idempotency key",
      async () => {
        const key = randomUUID();
        const args = [
          null,
          orgA,
          "ORGANIZATION_CHANGE",
          JSON.stringify(state.payload),
          [state.file.id],
          0,
          key,
        ];
        const results = await Promise.all([
          call("maker", "work_save", args),
          call("maker", "work_save", args),
        ]);
        assert.deepEqual(results[0], results[1]);
      },
    );
    await t.test(
      "two real connections approve concurrently: one final decision and explicit conflict",
      async () => {
        const request = (
          await state.query("maker", "work_save", [
            null,
            orgA,
            "ORGANIZATION_CHANGE",
            JSON.stringify(state.payload),
            [state.file.id],
            0,
            randomUUID(),
          ])
        )[0].data as { id: string };
        await state.query("maker", "work_transition", [
          request.id,
          1,
          "submitted",
          "",
          randomUUID(),
        ]);
        // Reviewer ACL was explicitly revoked above; restore with scoped grant, not worker privileges.
        const reviewer = (
          await db.query(
            "SELECT account_id FROM private.role_assignment WHERE 'requests.review'=ANY(actions) AND NOT 'requests.create'=ANY(actions)",
          )
        ).rows[0].account_id;
        await state.query("maker", "work_share", [
          state.file.document_id,
          reviewer,
          new Date(Date.now() + 3600000).toISOString(),
        ]);
        await state.query("reviewer", "work_transition", [
          request.id,
          1,
          "reviewed",
          "ตรวจหลักฐานสมมติครบแล้ว",
          randomUUID(),
        ]);
        const results = await Promise.allSettled(
          ["approver", "approver2"].map((name) =>
            call(name, "work_transition", [
              request.id,
              1,
              "approved",
              "อนุมัติรายการสมมติพร้อมกัน",
              randomUUID(),
            ]),
          ),
        );
        assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
        const failure = results.find((r) => r.status === "rejected");
        assert.ok(
          failure &&
            failure.status === "rejected" &&
            code("40001")(failure.reason),
        );
        const row = await db.query(
          "SELECT count(*)::int AS n FROM private.workflow_decision WHERE request_id=$1 AND decision IN ('approved','rejected')",
          [request.id],
        );
        assert.equal(row.rows[0].n, 1);
        assert.equal(
          (
            await db.query(
              "SELECT count(*)::int AS n FROM private.integration_outbox WHERE aggregate_id=$1 AND aggregate_version=3",
              [request.id],
            )
          ).rows[0].n,
          1,
        );
      },
    );
    await t.test(
      "outbox failure rolls back status, decision, audit and idempotency receipt together",
      async () => {
        const request = (
          await state.query("maker", "work_save", [
            null,
            orgA,
            "ORGANIZATION_CHANGE",
            JSON.stringify(state.payload),
            [state.file.id],
            0,
            randomUUID(),
          ])
        )[0].data as { id: string };
        const before = (
          await db.query("SELECT count(*)::int AS n FROM private.audit_logs")
        ).rows[0].n;
        await db.query(
          "CREATE FUNCTION private.test_outbox_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'INJECTED_FAILURE' USING ERRCODE='P0001'; END $$",
        );
        await db.query(
          "CREATE TRIGGER test_outbox_failure BEFORE INSERT ON private.integration_outbox FOR EACH ROW EXECUTE FUNCTION private.test_outbox_failure()",
        );
        const key = randomUUID();
        try {
          await assert.rejects(
            state.query("maker", "work_transition", [
              request.id,
              1,
              "submitted",
              "",
              key,
            ]),
            code("P0001"),
          );
        } finally {
          await db.query(
            "DROP TRIGGER test_outbox_failure ON private.integration_outbox",
          );
          await db.query("DROP FUNCTION private.test_outbox_failure()");
        }
        assert.equal(
          (
            await db.query(
              "SELECT status FROM private.workflow_request WHERE id=$1",
              [request.id],
            )
          ).rows[0].status,
          "draft",
        );
        assert.equal(
          (
            await db.query(
              "SELECT count(*)::int AS n FROM private.operation_receipt WHERE idempotency_key=$1",
              [key],
            )
          ).rows[0].n,
          0,
        );
        assert.equal(
          (await db.query("SELECT count(*)::int AS n FROM private.audit_logs"))
            .rows[0].n,
          before,
        );
        await state.query("maker", "work_transition", [
          request.id,
          1,
          "submitted",
          "",
          key,
        ]);
        assert.equal(
          (
            await db.query(
              "SELECT count(*)::int AS n FROM private.integration_outbox WHERE aggregate_id=$1",
              [request.id],
            )
          ).rows[0].n,
          1,
        );
      },
    );
  } finally {
    db.release();
    await pool.end();
  }
});
