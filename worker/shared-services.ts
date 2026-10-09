import "dotenv/config";
import { Pool } from "pg";
import { databaseConfiguration } from "../src/server/portal/config";
import { readObject } from "../src/server/documents/storage";
import { scanWithClamAV } from "../src/server/documents/clamav";
const task = process.argv[2];
async function main() {
  if (
    !["notifications", "scan"].includes(task) ||
    !["test", "staging"].includes(process.env.APP_ENV ?? "") ||
    process.env.PORTAL_DATA_MODE !== "SYNTHETIC"
  )
    throw new Error("WORKER_DISABLED");
  const variable =
    task === "scan" ? "PORTAL_SCAN_DATABASE_URL" : "PORTAL_WORKER_DATABASE_URL";
  const role = task === "scan" ? "portal_scan_worker" : "portal_event_worker";
  const pool = new Pool({
    ...databaseConfiguration({
      ...process.env,
      PORTAL_DATABASE_URL: process.env[variable],
    }),
    max: 1,
    connectionTimeoutMillis: 5000,
    application_name: "portal-" + task,
  });
  async function call(sql: string, args: unknown[] = []) {
    const db = await pool.connect();
    try {
      const roles = await db.query(
        "SELECT rolsuper,rolbypassrls FROM pg_roles WHERE rolname=CURRENT_USER",
      );
      if (
        !roles.rows[0] ||
        roles.rows[0].rolsuper ||
        roles.rows[0].rolbypassrls
      )
        throw new Error("WORKER_PRIVILEGE_INVALID");
      await db.query("BEGIN");
      await db.query("SET LOCAL ROLE " + role);
      await db.query("SET LOCAL statement_timeout='5s'");
      const r = await db.query(sql, args);
      await db.query("COMMIT");
      return r.rows;
    } catch (e) {
      await db.query("ROLLBACK").catch(() => {});
      throw e;
    } finally {
      db.release();
    }
  }
  try {
    let processed = 0;
    if (task === "notifications") {
      // Bounded invocation; scheduler may retry. Never keep work in a Vercel web request.
      for (let i = 0; i < 25; i++) {
        const rows = await call("SELECT private.work_deliver_one() AS id");
        if (!rows[0].id) break;
        processed++;
      }
    } else {
      const rows = await call("SELECT private.work_scan_candidates() AS file");
      for (const { file } of rows) {
        const bytes = await readObject(
          file.object_key,
          file.sha256,
          file.size_bytes,
        );
        const result = await scanWithClamAV(bytes);
        await call("SELECT private.work_scan_result($1,$2,$3,$4)", [
          file.id,
          file.sha256,
          result,
          "CLAMAV_INSTREAM",
        ]);
        processed++;
      }
    }
    console.log(JSON.stringify({ task, processed })); // Counts only; no name, identity, key or payload.
  } finally {
    await pool.end();
  }
}
main().catch(() => {
  console.error(
    "งานยังไม่สำเร็จ คงรายการไว้สำหรับ retry; ตรวจบริการและสิทธิ์ตามคู่มือ",
  );
  process.exitCode = 1;
});
