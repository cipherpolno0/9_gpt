import "server-only";
import { Pool, type PoolClient } from "pg";
import { PortalError, databaseConfiguration } from "./config";
let pool: Pool | undefined;
function database() {
  if (!process.env.PORTAL_DATABASE_URL)
    throw new PortalError(503, "ยังไม่ได้เชื่อมฐานข้อมูลของเว็บไซต์");
  return (pool ??= new Pool({
    ...databaseConfiguration(),
    max: 4,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 10000,
    application_name: "sangha-portal",
  }));
}
export async function transaction<T>(
  authId: string | null,
  fn: (db: PoolClient) => Promise<T>,
): Promise<T> {
  let client: PoolClient;
  try {
    client = await database().connect();
  } catch {
    throw new PortalError(503, "ยังเชื่อมฐานข้อมูลไม่ได้ กรุณาติดต่อผู้ดูแล");
  }
  try {
    await client.query("BEGIN");
    const role = await client.query(
      "SELECT rolsuper,rolbypassrls FROM pg_roles WHERE rolname=current_user",
    );
    if (role.rows[0]?.rolsuper || role.rows[0]?.rolbypassrls)
      throw new PortalError(
        503,
        "บัญชีฐานข้อมูลยังไม่ได้จำกัดสิทธิ์สำหรับเว็บไซต์",
      );
    await client.query("SET LOCAL ROLE portal_runtime");
    await client.query("SET LOCAL statement_timeout='5s'");
    await client.query("SELECT set_config('app.auth_uid',$1,true)", [
      authId ?? "",
    ]);
    const value = await fn(client);
    await client.query("COMMIT");
    return value;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    if (error instanceof PortalError) throw error;
    throw new PortalError(503, "บริการข้อมูลยังไม่พร้อม กรุณาติดต่อผู้ดูแล");
  } finally {
    client.release();
  }
}
