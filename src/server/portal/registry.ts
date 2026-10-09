import "server-only";
import { registryQueries } from "./queries";
import { currentIdentity } from "./auth";
import { transaction } from "./database";
import { PortalError } from "./config";
import { registryFilter } from "./filters";
export type RegistryKind = "people" | "organizations";
export async function registry(kind: RegistryKind, query: URLSearchParams) {
  const identity = await currentIdentity();
  if (!identity) throw new PortalError(401, "กรุณาเข้าสู่ระบบ");
  const action = kind + ".read";
  if (!identity.grants.some((g) => g.actions.includes(action)))
    throw new PortalError(403, "ไม่มีสิทธิ์อ่านทะเบียนนี้");
  const f = registryFilter(query);
  return transaction(identity.authId, async (db) => {
    const live = await db.query(
      "SELECT EXISTS(SELECT 1 FROM private.portal_session s JOIN private.user_account a ON a.id=s.account_id WHERE s.token_hash=$1 AND a.id=$2 AND a.is_active AND s.revoked_at IS NULL AND s.expires_at>CURRENT_TIMESTAMP AND s.created_at>a.revoked_before AND to_timestamp($4::double precision/1000)>a.revoked_before AND (NOT a.require_mfa OR $3)) AS live",
      [
        identity.sessionHash,
        identity.accountId,
        identity.strongMfa,
        identity.issuedAt,
      ],
    );
    if (!live.rows[0].live)
      throw new PortalError(
        401,
        "บัญชีหมดอายุหรือถูกยกเลิก กรุณาเข้าสู่ระบบใหม่",
      );
    // Check current database grants, including expiry/revocation since page load.
    const allowed = await db.query(
      "SELECT EXISTS(SELECT 1 FROM private.role_assignment WHERE account_id=private.portal_account() AND $1=ANY(actions) AND starts_at<=CURRENT_TIMESTAMP AND ends_at>CURRENT_TIMESTAMP AND revoked_at IS NULL) AS allowed",
      [action],
    );
    if (!allowed.rows[0].allowed)
      throw new PortalError(403, "สิทธิ์นี้หมดอายุหรือถูกถอนแล้ว");
    const rows = await db.query(registryQueries[kind], [f.pattern, f.offset]);
    await db.query(
      "INSERT INTO private.portal_access_event(account_id,event_type) VALUES($1,$2)",
      [identity.accountId, action],
    );
    return {
      rows: rows.rows.slice(0, 25) as {
        code: string;
        name: string | null;
        revision: number;
      }[],
      hasMore: rows.rows.length > 25,
      page: f.page,
      q: f.q,
      asOf: new Date().toISOString(),
    };
  });
}
