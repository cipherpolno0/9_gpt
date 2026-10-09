import "dotenv/config";
import { Pool } from "pg";
import { uuid } from "../src/server/portal/claims";
// Operator-only. JSON over stdin; never create a separate password database.
async function main() {
  if (process.argv[2] !== "--apply") throw new Error();
  let input = "";
  for await (const chunk of process.stdin) {
    input += chunk;
    if (input.length > 16384) throw new Error();
  }
  const c = JSON.parse(input);
  if (
    !uuid(c.authUserId) ||
    !uuid(c.personId) ||
    !uuid(c.assignmentId) ||
    !uuid(c.organizationId) ||
    !Array.isArray(c.actions) ||
    c.actions.length === 0 ||
    c.actions.some(
      (a: unknown) =>
        !["people.read", "organizations.read"].includes(String(a)),
    )
  )
    throw new Error();
  const start = new Date(c.startsAt),
    end = new Date(c.endsAt);
  if (
    !Number.isFinite(start.getTime()) ||
    !Number.isFinite(end.getTime()) ||
    end <= start
  )
    throw new Error();
  if (!process.env.DIRECT_DATABASE_URL || process.env.APP_ENV !== "test")
    throw new Error();
  // This version deliberately provisions synthetic test accounts only.
  const pool = new Pool({
    connectionString: process.env.DIRECT_DATABASE_URL,
    connectionTimeoutMillis: 5000,
    max: 1,
  });
  const db = await pool.connect();
  try {
    await db.query("BEGIN");
    const existing = (
      await db.query(
        "SELECT id,person_id FROM private.user_account WHERE auth_user_id=$1 FOR UPDATE",
        [c.authUserId],
      )
    ).rows[0];
    if (existing && existing.person_id !== c.personId) throw new Error();
    const account =
      existing ??
      (
        await db.query(
          "INSERT INTO private.user_account(auth_user_id,person_id) VALUES($1,$2) RETURNING id",
          [c.authUserId, c.personId],
        )
      ).rows[0];
    const prior = (
      await db.query(
        "SELECT account_id,organization_id,actions,starts_at,ends_at FROM private.role_assignment WHERE id=$1",
        [c.assignmentId],
      )
    ).rows[0];
    if (prior) {
      if (
        prior.account_id !== account.id ||
        prior.organization_id !== c.organizationId ||
        JSON.stringify(prior.actions) !== JSON.stringify(c.actions) ||
        new Date(prior.starts_at).getTime() !== start.getTime() ||
        new Date(prior.ends_at).getTime() !== end.getTime()
      )
        throw new Error();
    } else
      await db.query(
        "INSERT INTO private.role_assignment(id,account_id,organization_id,role_code,actions,starts_at,ends_at) VALUES($1,$2,$3,'REGISTER_READER',$4,$5,$6)",
        [c.assignmentId, account.id, c.organizationId, c.actions, start, end],
      );
    await db.query("COMMIT");
    console.log(
      "บัญชีทดสอบและสิทธิ์ทะเบียนพร้อม ไม่มีการเก็บรหัสผ่านหรือเพิ่มสิทธิ์อนุมัติ",
    );
  } catch {
    await db.query("ROLLBACK").catch(() => {});
    throw new Error();
  } finally {
    db.release();
    await pool.end();
  }
}
main().catch(() => {
  console.error(
    "จัดสิทธิ์ไม่ได้ ตรวจ JSON ตัวตนกลาง ช่วงเวลา และฐานทดสอบ; ไม่มีการแสดง credentials",
  );
  process.exitCode = 1;
});
