import "server-only";
import { createHash, createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { authConfiguration, PortalError } from "./config";
import { transaction } from "./database";
import { uuid, verifiedClaims } from "./claims";
export const tokenCookie = "sangha_access";
export function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
type AuthUser = {
  id: string;
  factors?: { id: string; status: string; factor_type: string }[];
};
export async function authFetch(path: string, token?: string, body?: object) {
  const c = authConfiguration();
  let response: Response;
  try {
    response = await fetch(c.base + "/auth/v1/" + path, {
      method: body ? "POST" : "GET",
      headers: {
        apikey: c.key,
        ...(token ? { Authorization: "Bearer " + token } : {}),
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    throw new PortalError(503, "บริการบัญชียังเชื่อมต่อไม่ได้");
  }
  if (!response.ok)
    throw new PortalError(401, "เข้าสู่ระบบไม่ได้ กรุณาตรวจบัญชีและสิทธิ์");
  return response.json();
}
export async function signIn(email: string, password: string, code: string) {
  const pepper = process.env.PORTAL_LOGIN_PEPPER;
  if (!pepper || pepper.length < 32)
    throw new PortalError(503, "ยังไม่ได้ตั้งค่าความปลอดภัยของบัญชี");
  const key = createHmac("sha256", pepper)
    .update(email.trim().toLowerCase())
    .digest("hex");
  const allowed = await transaction(
    null,
    async (db) =>
      (
        await db.query("SELECT private.portal_login_attempt($1) AS allowed", [
          key,
        ])
      ).rows[0].allowed,
  );
  if (!allowed)
    throw new PortalError(
      429,
      "ลองเข้าสู่ระบบหลายครั้งเกินกำหนด กรุณารอ 10 นาที",
    );
  const result = await authFetch("token?grant_type=password", undefined, {
    email,
    password,
  });
  let token = result.access_token;
  if (typeof token !== "string" || token.length > 8192)
    throw new PortalError(401, "เข้าสู่ระบบไม่ได้");
  // Network validation, never trust cookie or client-provided user IDs.
  let user: AuthUser = await authFetch("user", token);
  if (!uuid(user.id)) throw new PortalError(401, "เข้าสู่ระบบไม่ได้");
  if (code) {
    if (!/^[0-9]{6}$/.test(code))
      throw new PortalError(400, "รหัสยืนยันต้องเป็นตัวเลข 6 หลัก");
    const factor = user.factors?.find(
      (f) => f.status === "verified" && f.factor_type === "totp" && uuid(f.id),
    );
    if (!factor)
      throw new PortalError(403, "ยังไม่มีอุปกรณ์ยืนยันที่ได้รับการตั้งค่า");
    const challenge = await authFetch(
      "factors/" + factor.id + "/challenge",
      token,
      {},
    );
    if (!uuid(challenge.id)) throw new PortalError(401, "ยืนยันบัญชีไม่ได้");
    const verified = await authFetch(
      "factors/" + factor.id + "/verify",
      token,
      { challenge_id: challenge.id, code },
    );
    if (
      typeof verified.access_token !== "string" ||
      verified.access_token.length > 8192
    )
      throw new PortalError(401, "ยืนยันบัญชีไม่ได้");
    token = verified.access_token;
    user = await authFetch("user", token);
    if (!uuid(user.id)) throw new PortalError(401, "ยืนยันบัญชีไม่ได้");
  }
  const claims = verifiedClaims(token, user.id);
  const expiresAt = claims.expiresAt;
  await transaction(user.id, async (db) => {
    const account = (
      await db.query(
        "SELECT id,require_mfa,revoked_before FROM private.user_account WHERE auth_user_id=$1 AND is_active",
        [user.id],
      )
    ).rows[0];
    if (
      !account ||
      (account.require_mfa && claims.aal !== "aal2") ||
      claims.issuedAt <= new Date(account.revoked_before).getTime()
    )
      throw new PortalError(
        403,
        "บัญชียังไม่มีสิทธิ์หรือยังไม่ผ่านการยืนยันสองขั้นตอน กรุณากรอกรหัสจากแอปยืนยัน",
      );
    await db.query(
      "INSERT INTO private.portal_session(token_hash,account_id,expires_at) VALUES($1,$2,$3) ON CONFLICT(token_hash) DO NOTHING",
      [tokenHash(token), account.id, expiresAt],
    );
    await db.query(
      "INSERT INTO private.portal_access_event(account_id,event_type) VALUES($1,'login')",
      [account.id],
    );
  });
  return { token, expiresAt };
}
export async function currentIdentity() {
  const token = (await cookies()).get(tokenCookie)?.value;
  if (!token) return null;
  if (token.length > 8192) return null;
  try {
    const user: AuthUser = await authFetch("user", token);
    if (!uuid(user.id)) return null;
    const claims = verifiedClaims(token, user.id);
    return await transaction(user.id, async (db) => {
      const row = (
        await db.query(
          "SELECT a.id,a.auth_user_id,a.require_mfa,a.revoked_before FROM private.user_account a JOIN private.portal_session s ON s.account_id=a.id WHERE a.auth_user_id=$1 AND a.is_active AND s.token_hash=$2 AND s.revoked_at IS NULL AND s.expires_at>CURRENT_TIMESTAMP AND s.created_at>a.revoked_before",
          [user.id, tokenHash(token)],
        )
      ).rows[0];
      if (
        !row ||
        (row.require_mfa && claims.aal !== "aal2") ||
        claims.issuedAt <= new Date(row.revoked_before).getTime()
      )
        return null;
      const grants = (
        await db.query(
          "SELECT organization_id,actions FROM private.role_assignment WHERE account_id=$1 AND revoked_at IS NULL AND starts_at<=CURRENT_TIMESTAMP AND ends_at>CURRENT_TIMESTAMP",
          [row.id],
        )
      ).rows;
      return {
        accountId: row.id as string,
        authId: user.id,
        sessionHash: tokenHash(token),
        strongMfa: claims.aal === "aal2",
        issuedAt: claims.issuedAt,
        grants: grants as {
          organization_id: string | null;
          actions: string[];
        }[],
      };
    });
  } catch (error) {
    if (error instanceof PortalError && error.status === 401) return null;
    throw error;
  }
}
export async function logout() {
  const identity = await currentIdentity();
  const token = (await cookies()).get(tokenCookie)?.value;
  if (identity && token)
    await transaction(identity.authId, async (db) => {
      await db.query(
        "UPDATE private.portal_session SET revoked_at=CURRENT_TIMESTAMP WHERE token_hash=$1",
        [tokenHash(token)],
      );
      await db.query(
        "INSERT INTO private.portal_access_event(account_id,event_type) VALUES($1,'logout')",
        [identity.accountId],
      );
    });
}
