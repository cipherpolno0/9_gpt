export class PortalError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}
export function authConfiguration(
  env: Record<string, string | undefined> = process.env,
) {
  const raw = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!raw || !key)
    throw new PortalError(503, "ยังไม่ได้เชื่อมบริการบัญชีของเว็บไซต์");
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new PortalError(503, "การตั้งค่าบริการบัญชีไม่ถูกต้อง");
  }
  if (
    url.protocol !== "https:" ||
    !url.hostname.endsWith(".supabase.co") ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    url.username ||
    url.password ||
    url.port
  )
    throw new PortalError(503, "การตั้งค่าบริการบัญชีไม่ถูกต้อง");
  return { base: url.origin, key };
}
export function configured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
    process.env.PORTAL_DATABASE_URL &&
    process.env.PORTAL_LOGIN_PEPPER,
  );
}
export function databaseConfiguration(
  env: Record<string, string | undefined> = process.env,
) {
  let u: URL;
  try {
    u = new URL(env.PORTAL_DATABASE_URL ?? "");
  } catch {
    throw new PortalError(503, "ยังไม่ได้ตั้งค่าฐานข้อมูลทะเบียน");
  }
  if (
    !["postgres:", "postgresql:"].includes(u.protocol) ||
    !u.hostname ||
    !u.username ||
    u.pathname.length < 2 ||
    u.hash
  )
    throw new PortalError(503, "การตั้งค่าฐานข้อมูลไม่ถูกต้อง");
  // Parse fields explicitly so sslmode in a URL cannot override certificate verification.
  const production = env.NODE_ENV === "production";
  if (
    production &&
    (!u.password ||
      !(
        u.hostname.endsWith(".supabase.co") ||
        u.hostname.endsWith(".pooler.supabase.com")
      ))
  )
    throw new PortalError(503, "ฐานข้อมูลใช้งานจริงยังไม่ได้จำกัดปลายทาง");
  return {
    host: u.hostname,
    port: Number(u.port || 5432),
    database: decodeURIComponent(u.pathname.slice(1)),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    ssl: !["127.0.0.1", "localhost", "[::1]"].includes(u.hostname)
      ? {
          rejectUnauthorized: true,
          ...(env.PORTAL_DATABASE_CA ? { ca: env.PORTAL_DATABASE_CA } : {}),
        }
      : false,
  };
}
export function assertSameOrigin(request: Request) {
  const expected =
    process.env.PORTAL_ORIGIN ??
    (process.env.VERCEL_ENV === "preview" &&
    /^[a-z0-9-]+\.vercel\.app$/.test(process.env.VERCEL_URL ?? "")
      ? "https://" + process.env.VERCEL_URL
      : undefined) ??
    (process.env.NODE_ENV !== "production"
      ? new URL(request.url).origin
      : undefined);
  if (!expected || request.headers.get("origin") !== expected)
    throw new PortalError(403, "คำขอไม่ได้มาจากเว็บไซต์นี้");
}
export async function boundedForm(request: Request) {
  if (
    !request.headers
      .get("content-type")
      ?.startsWith("application/x-www-form-urlencoded")
  )
    throw new PortalError(415, "รูปแบบคำขอไม่ถูกต้อง");
  const reader = request.body?.getReader();
  if (!reader) throw new PortalError(400, "ไม่มีข้อมูลคำขอ");
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const r = await reader.read();
    if (r.done) break;
    size += r.value.length;
    if (size > 16384) {
      await reader.cancel();
      throw new PortalError(413, "คำขอใหญ่เกินกำหนด");
    }
    chunks.push(r.value);
  }
  return new URLSearchParams(Buffer.concat(chunks).toString("utf8"));
}
