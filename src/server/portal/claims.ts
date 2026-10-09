import { PortalError } from "./config";
// Only call after /auth/v1/user has validated this exact bearer token.
export function verifiedClaims(
  token: string,
  userId: string,
  now = Date.now(),
) {
  try {
    const c = JSON.parse(
      Buffer.from(token.split(".")[1] ?? "", "base64url").toString("utf8"),
    );
    if (
      c.sub !== userId ||
      !Number.isSafeInteger(c.exp) ||
      !Number.isSafeInteger(c.iat) ||
      c.iat * 1000 > now + 30000 ||
      c.exp * 1000 <= now ||
      c.iat > c.exp
    )
      throw new Error();
    return {
      expiresAt: new Date(c.exp * 1000),
      issuedAt: c.iat * 1000,
      aal: c.aal as unknown,
    };
  } catch {
    throw new PortalError(401, "บัญชีหมดอายุหรือข้อมูลบัญชีไม่ถูกต้อง");
  }
}
export function uuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(
      value,
    )
  );
}
