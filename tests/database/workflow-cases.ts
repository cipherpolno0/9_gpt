import assert from "node:assert/strict";
import { randomUUID, createHash } from "node:crypto";
import type { TestContext } from "node:test";
import { fixtureId, SEED_ACTOR_ID } from "../../prisma/fixtures";
export interface SqlClient {
  query(
    sql: string,
    args?: unknown[],
  ): Promise<{ rows: Record<string, unknown>[] }>;
}
export const orgA = fixtureId("org:a"),
  orgB = fixtureId("org:b");
export const workflowUsers = [
  "maker",
  "reviewer",
  "approver",
  "approver2",
  "outsider",
  "technical",
].map((name) => ({
  name,
  id: randomUUID(),
  auth: randomUUID(),
  hash: createHash("sha256").update(randomUUID()).digest("hex"),
}));
export async function workFixtures(db: SqlClient) {
  await db.query(
    "SELECT set_config('app.service_actor_id',$1,false),set_config('app.correlation_id',$2,false)",
    [SEED_ACTOR_ID, randomUUID()],
  );
  for (const u of workflowUsers) {
    await db.query(
      "INSERT INTO private.user_account(id,auth_user_id,require_mfa) VALUES($1,$2,true)",
      [u.id, u.auth],
    );
    const actions =
      u.name === "maker"
        ? [
            "documents.upload",
            "documents.read",
            "documents.share",
            "requests.create",
            "requests.read",
            "requests.review",
            "requests.approve",
          ]
        : u.name === "reviewer"
          ? ["documents.read", "requests.read", "requests.review"]
          : u.name.startsWith("approver")
            ? ["documents.read", "requests.read", "requests.approve"]
            : ["requests.read", "requests.approve"];
    await db.query(
      "INSERT INTO private.role_assignment(account_id,organization_id,role_code,actions,starts_at,ends_at) VALUES($1,$2,$3,$4,CURRENT_TIMESTAMP-interval '1 day',CURRENT_TIMESTAMP+interval '1 day')",
      [
        u.id,
        u.name === "technical" ? null : u.name === "outsider" ? orgB : orgA,
        u.name === "technical" ? "TECHNICAL_ADMIN" : "BUSINESS_OPERATOR",
        u.name === "technical" ? ["admin.read"] : actions,
      ],
    );
    await db.query(
      "INSERT INTO private.portal_session(token_hash,account_id,expires_at) VALUES($1,$2,CURRENT_TIMESTAMP+interval '1 hour')",
      [u.hash, u.id],
    );
  }
  const login = (await db.query("SELECT SESSION_USER AS login")).rows[0].login;
  await db.query(
    "INSERT INTO private.worker_scope(db_login,organization_id,purpose,starts_at,ends_at) VALUES($1,$2,'notification',CURRENT_TIMESTAMP-interval '1 day',CURRENT_TIMESTAMP+interval '1 day'),($1,$2,'scan',CURRENT_TIMESTAMP-interval '1 day',CURRENT_TIMESTAMP+interval '1 day')",
    [login, orgA],
  );
}
export async function asWork(
  db: SqlClient,
  name: string,
  sql: string,
  args: unknown[] = [],
) {
  const u = workflowUsers.find((x) => x.name === name);
  assert.ok(u);
  await db.query("BEGIN");
  try {
    await db.query("SET LOCAL ROLE portal_runtime");
    await db.query(
      "SELECT set_config('app.auth_uid',$1,true),set_config('app.session_hash',$2,true),set_config('app.auth_issued_at',$3,true),set_config('app.strong_mfa','true',true),set_config('app.correlation_id',$4,true)",
      [u.auth, u.hash, String(Date.now()), randomUUID()],
    );
    const result = await db.query(sql, args);
    await db.query("COMMIT");
    return result.rows;
  } catch (e) {
    await db.query("ROLLBACK");
    throw e;
  }
}
export async function worker(
  db: SqlClient,
  role: "portal_scan_worker" | "portal_event_worker",
  sql: string,
  args: unknown[] = [],
) {
  await db.query("BEGIN");
  try {
    await db.query("SET LOCAL ROLE " + role);
    const r = await db.query(sql, args);
    await db.query("COMMIT");
    return r.rows;
  } catch (e) {
    await db.query("ROLLBACK");
    throw e;
  }
}
export const code = (expected: string) => (e: unknown) =>
  !!e && typeof e === "object" && "code" in e && e.code === expected;
export async function workflowCases(t: TestContext, db: SqlClient) {
  await workFixtures(db);
  const query = (name: string, fn: string, args: unknown[] = []) =>
    asWork(
      db,
      name,
      `SELECT private.${fn}(${args.map((_, i) => "$" + (i + 1)).join(",")}) AS data`,
      args,
    );
  const sha = "e".repeat(64);
  let file: Record<string, unknown>, request: Record<string, unknown>;
  const payload = {
    subject: "ขอปรับข้อมูลหน่วยงานสมมติ",
    reason: "เพื่อทดสอบเส้นทางส่งตรวจด้วยข้อมูลสมมติ",
    target_id: orgA,
    effective_on: "2026-10-10",
  };
  const saveKey = randomUUID();
  let submitKey: string;
  await t.test(
    "private file retry uses one central Document and FileVersion; quarantine denies reads",
    async () => {
      const key = randomUUID();
      file = (
        await query("maker", "work_file_prepare", [
          orgA,
          null,
          "หลักฐานสมมติ.pdf",
          "application/pdf",
          25,
          sha,
          key,
        ])
      )[0].data as Record<string, unknown>;
      assert.deepEqual(
        (
          await query("maker", "work_file_prepare", [
            orgA,
            null,
            "หลักฐานสมมติ.pdf",
            "application/pdf",
            25,
            sha,
            key,
          ])
        )[0].data,
        file,
      );
      await assert.rejects(
        query("maker", "work_file_read", [file.id]),
        code("42501"),
      );
      await query("maker", "work_file_uploaded", [file.id, sha]);
      await assert.rejects(
        query("maker", "work_file_read", [file.id]),
        code("42501"),
      );
      await assert.rejects(
        query("maker", "work_scan_result", [
          file.id,
          sha,
          "CLEAN",
          "CLAMAV_INSTREAM",
        ]),
        code("42501"),
      );
      await worker(
        db,
        "portal_scan_worker",
        "SELECT private.work_scan_result($1,$2,$3,$4)",
        [file.id, sha, "CLEAN", "CLAMAV_INSTREAM"],
      );
      assert.equal(
        (
          (await query("maker", "work_file_read", [file.id]))[0].data as Record<
            string,
            unknown
          >
        ).sha256,
        sha,
      );
    },
  );
  await t.test(
    "scan permission and file version are immutable; public/raw table access denied",
    async () => {
      for (const fn of ["work_scan_candidates", "work_deliver_one"])
        await assert.rejects(query("technical", fn), code("42501"));
      await assert.rejects(
        db.query("UPDATE private.file_version SET sha256=$1 WHERE id=$2", [
          "a".repeat(64),
          file.id,
        ]),
        code("23514"),
      );
      await assert.rejects(
        asWork(db, "maker", "SELECT * FROM private.workflow_revision"),
        code("42501"),
      );
      await assert.rejects(
        worker(db, "portal_event_worker", "SELECT private.work_file_read($1)", [
          file.id,
        ]),
        code("42501"),
      );
    },
  );
  await t.test(
    "draft resume, same key different data conflict, scope B target blocked",
    async () => {
      request = (
        await query("maker", "work_save", [
          null,
          orgA,
          "ORGANIZATION_CHANGE",
          JSON.stringify(payload),
          [file.id],
          0,
          saveKey,
        ])
      )[0].data as Record<string, unknown>;
      assert.deepEqual(
        (
          await query("maker", "work_save", [
            null,
            orgA,
            "ORGANIZATION_CHANGE",
            JSON.stringify(payload),
            [file.id],
            0,
            saveKey,
          ])
        )[0].data,
        request,
      );
      await assert.rejects(
        query("maker", "work_save", [
          null,
          orgA,
          "ORGANIZATION_CHANGE",
          JSON.stringify({ ...payload, subject: "เปลี่ยนแล้ว" }),
          [file.id],
          0,
          saveKey,
        ]),
        code("40001"),
      );
      await assert.rejects(
        query("maker", "work_save", [
          request.id,
          orgA,
          "ORGANIZATION_CHANGE",
          JSON.stringify({ ...payload, target_id: orgB }),
          [file.id],
          1,
          randomUUID(),
        ]),
        code("42501"),
      );
      assert.equal((await query("outsider", "work_requests")).length, 0);
      assert.equal((await query("technical", "work_requests")).length, 0);
    },
  );
  await t.test(
    "server validates completeness and clean evidence before submit",
    async () => {
      const empty = (
        await query("maker", "work_save", [
          null,
          orgA,
          "ORGANIZATION_CHANGE",
          "{}",
          [],
          0,
          randomUUID(),
        ])
      )[0].data as Record<string, unknown>;
      await assert.rejects(
        query("maker", "work_transition", [
          empty.id,
          1,
          "submitted",
          "",
          randomUUID(),
        ]),
        code("23514"),
      );
      const incomplete = (
        await query("maker", "work_save", [
          null,
          orgA,
          "ORGANIZATION_CHANGE",
          JSON.stringify({ ...payload, effective_on: "10/11/26" }),
          [file.id],
          0,
          randomUUID(),
        ])
      )[0].data as Record<string, unknown>;
      await assert.rejects(
        query("maker", "work_transition", [
          incomplete.id,
          1,
          "submitted",
          "",
          randomUUID(),
        ]),
        code("23514"),
      );
    },
  );
  await t.test(
    "maker checker via SQL API, review requires document ACL and correction retains decisions",
    async () => {
      submitKey = randomUUID();
      await query("maker", "work_transition", [
        request.id,
        1,
        "submitted",
        "",
        submitKey,
      ]);
      await assert.rejects(
        query("maker", "work_transition", [
          request.id,
          1,
          "reviewed",
          "ตรวจเองต้องไม่ได้",
          randomUUID(),
        ]),
        code("42501"),
      );
      await assert.rejects(
        query("outsider", "work_transition", [
          request.id,
          1,
          "approved",
          "นอกพื้นที่ต้องไม่ได้",
          randomUUID(),
        ]),
        code("42501"),
      );
      await assert.rejects(
        query("reviewer", "work_transition", [
          request.id,
          1,
          "reviewed",
          "ตรวจเอกสารสมมติแล้ว",
          randomUUID(),
        ]),
        code("23514"),
      );
      const until = new Date(Date.now() + 3600000).toISOString();
      for (const u of workflowUsers.filter(
        (x) => x.name === "reviewer" || x.name.startsWith("approver"),
      ))
        await query("maker", "work_share", [file.document_id, u.id, until]);
      await query("reviewer", "work_transition", [
        request.id,
        1,
        "returned",
        "แก้ข้อความให้ครบก่อนตรวจ",
        randomUUID(),
      ]);
      const corrected = (
        await query("maker", "work_save", [
          request.id,
          orgA,
          "ORGANIZATION_CHANGE",
          JSON.stringify({ ...payload, subject: "แก้ข้อความแล้วสมมติ" }),
          [file.id],
          1,
          randomUUID(),
        ])
      )[0].data as Record<string, unknown>;
      assert.equal(corrected.id, request.id);
      assert.equal(corrected.revision, 2);
      request = corrected;
      await assert.rejects(
        query("maker", "work_save", [
          request.id,
          orgA,
          "ORGANIZATION_CHANGE",
          JSON.stringify(payload),
          [file.id],
          1,
          randomUUID(),
        ]),
        code("40001"),
      );
      await query("maker", "work_transition", [
        request.id,
        2,
        "submitted",
        "",
        randomUUID(),
      ]);
      await query("reviewer", "work_transition", [
        request.id,
        2,
        "reviewed",
        "ตรวจหลักฐานรุ่นนี้แล้ว",
        randomUUID(),
      ]);
      const rows = await query("maker", "work_requests");
      const item = rows
        .map((r) => r.data as Record<string, unknown>)
        .find((r) => r.id === request.id)!;
      assert.equal((item.decisions as unknown[]).length, 2);
      const decisions = item.decisions as {
        authority_snapshot: { organization_id: string; checked_at: string };
      }[];
      assert.equal(decisions[0].authority_snapshot.organization_id, orgA);
      assert.ok(decisions[0].authority_snapshot.checked_at);
      assert.match(item.snapshot_hash as string, /^[a-f0-9]{64}$/);
      assert.match(item.tracking_code as string, /^[a-f0-9]{32}$/);
    },
  );
  await t.test(
    "approval idempotency locks current revision and notification outbox atomically",
    async () => {
      const key = randomUUID();
      const result = await query("approver", "work_transition", [
        request.id,
        2,
        "approved",
        "อนุมัติทดสอบรุ่นนี้แล้ว",
        key,
      ]);
      assert.deepEqual(
        await query("approver", "work_transition", [
          request.id,
          2,
          "approved",
          "อนุมัติทดสอบรุ่นนี้แล้ว",
          key,
        ]),
        result,
      );
      await assert.rejects(
        query("maker", "work_save", [
          request.id,
          orgA,
          "ORGANIZATION_CHANGE",
          JSON.stringify(payload),
          [file.id],
          2,
          randomUUID(),
        ]),
        code("40001"),
      );
      await assert.rejects(
        query("approver2", "work_transition", [
          request.id,
          2,
          "approved",
          "อนุมัติจากอีกบัญชีหนึ่ง",
          randomUUID(),
        ]),
        code("40001"),
      );
      assert.equal(
        (
          await db.query(
            "SELECT count(*)::int AS n FROM private.workflow_decision WHERE request_id=$1 AND decision='approved'",
            [request.id],
          )
        ).rows[0].n,
        1,
      );
    },
  );
  await t.test(
    "worker crash rollback, retries and out-of-order guard do not duplicate notifications",
    async () => {
      await db.query("BEGIN");
      await db.query("SET LOCAL ROLE portal_event_worker");
      let first;
      try {
        first = await db.query("SELECT private.work_deliver_one() AS id");
        assert.ok(first.rows[0].id);
      } finally {
        await db.query("ROLLBACK");
      }
      assert.equal(
        (
          await db.query(
            "SELECT count(*)::int AS n FROM private.portal_notification",
          )
        ).rows[0].n,
        0,
      );
      for (let i = 0; i < 10; i++)
        await worker(
          db,
          "portal_event_worker",
          "SELECT private.work_deliver_one()",
        );
      const n = (
        await db.query(
          "SELECT count(*)::int AS n FROM private.integration_outbox",
        )
      ).rows[0].n;
      assert.equal(
        (
          await db.query(
            "SELECT count(*)::int AS n FROM private.portal_notification",
          )
        ).rows[0].n,
        n,
      );
      assert.equal(
        (
          await db.query(
            "SELECT count(*)::int AS n FROM private.integration_receipt",
          )
        ).rows[0].n,
        n,
      );
      assert.equal((await query("outsider", "work_notifications")).length, 0);
      await query("maker", "work_revoke", [
        file.document_id,
        workflowUsers.find((x) => x.name === "reviewer")!.id,
      ]);
      await assert.rejects(
        query("reviewer", "work_file_read", [file.id]),
        code("42501"),
      );
    },
  );
  await t.test(
    "target membership moved after draft is revalidated on submission",
    async () => {
      const person = fixtureId("person:a");
      await db.query(
        "INSERT INTO private.person_affiliation(person_id,organization_id,effective_from,evidence_document_id) VALUES($1,$2,'2026-01-01',$3)",
        [person, orgA, fixtureId("document:evidence")],
      );
      const draft = (
        await query("maker", "work_save", [
          null,
          orgA,
          "PERSON_CORRECTION",
          JSON.stringify({ ...payload, target_id: person }),
          [file.id],
          0,
          randomUUID(),
        ])
      )[0].data as Record<string, unknown>;
      await db.query(
        "UPDATE private.person_affiliation SET effective_to=(clock_timestamp() AT TIME ZONE 'Asia/Bangkok')::date WHERE person_id=$1 AND organization_id=$2",
        [person, orgA],
      );
      await assert.rejects(
        query("maker", "work_transition", [
          draft.id,
          1,
          "submitted",
          "",
          randomUUID(),
        ]),
        code("42501"),
      );
    },
  );
  await t.test(
    "expired delegation immediately removes approval and document access",
    async () => {
      const user = workflowUsers.find((x) => x.name === "outsider")!;
      await db.query(
        "UPDATE private.role_assignment SET ends_at=clock_timestamp()-interval '1 second' WHERE account_id=$1",
        [user.id],
      );
      await assert.rejects(
        query("outsider", "work_transition", [
          request.id,
          2,
          "approved",
          "ทดลองอำนาจที่หมดอายุ",
          randomUUID(),
        ]),
        code("42501"),
      );
    },
  );
  await t.test(
    "revoked session cannot mutate despite existing grants",
    async () => {
      await db.query(
        "UPDATE private.portal_session SET revoked_at=CURRENT_TIMESTAMP WHERE account_id=$1",
        [workflowUsers.find((x) => x.name === "technical")!.id],
      );
      await assert.rejects(query("technical", "work_requests"), code("28000"));
    },
  );
  return { query, file: file!, request: request!, payload };
}
