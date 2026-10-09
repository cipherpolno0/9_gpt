import test from "node:test";
import assert from "node:assert/strict";
import {
  authConfiguration,
  assertSameOrigin,
  boundedForm,
  PortalError,
  databaseConfiguration,
} from "../src/server/portal/config";
import { verifiedClaims, uuid } from "../src/server/portal/claims";
import { registryFilter } from "../src/server/portal/filters";
test("production DB บังคับ TLS ตรวจ certificate และไม่เปิดตาม sslmode URL", () => {
  const d = databaseConfiguration({
    NODE_ENV: "production",
    PORTAL_DATABASE_URL:
      "postgresql://synthetic:synthetic@db.project.supabase.co:5432/postgres?sslmode=disable",
  });
  assert.deepEqual(d.ssl, { rejectUnauthorized: true });
  assert.deepEqual(
    databaseConfiguration({
      NODE_ENV: "development",
      PORTAL_DATABASE_URL:
        "postgresql://synthetic:synthetic@db.project.supabase.co/postgres",
    }).ssl,
    { rejectUnauthorized: true },
  );
  assert.throws(
    () =>
      databaseConfiguration({
        NODE_ENV: "production",
        PORTAL_DATABASE_URL:
          "postgresql://synthetic:synthetic@evil.invalid/postgres",
      }),
    PortalError,
  );
});
test("บัญชีไม่ตั้งค่าและ URL นอกบริการที่อนุญาตต้องปิด", () => {
  assert.throws(() => authConfiguration({}), PortalError);
  for (const url of [
    "http://project.supabase.co",
    "https://evil.test",
    "https://project.supabase.co.evil.test",
    "https://project.supabase.co/?next=evil",
    "https://u:p@project.supabase.co",
    "https://project.supabase.co:1234",
  ])
    assert.throws(
      () =>
        authConfiguration({
          NEXT_PUBLIC_SUPABASE_URL: url,
          NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "synthetic-public",
        }),
      PortalError,
    );
  assert.equal(
    authConfiguration({
      NEXT_PUBLIC_SUPABASE_URL: "https://synthetic.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "synthetic-public",
    }).base,
    "https://synthetic.supabase.co",
  );
});
test("CSRF ไม่มี Origin หรือคนละ origin ถูกปฏิเสธ", () => {
  const old = process.env.PORTAL_ORIGIN;
  process.env.PORTAL_ORIGIN = "https://portal.example.invalid";
  try {
    for (const origin of [undefined, "https://evil.invalid"]) {
      const r = new Request("https://portal.example.invalid/api/auth/login", {
        method: "POST",
        headers: origin ? { origin } : {},
      });
      assert.throws(() => assertSameOrigin(r), PortalError);
    }
    assertSameOrigin(
      new Request("https://portal.example.invalid/api/auth/login", {
        headers: { origin: "https://portal.example.invalid" },
      }),
    );
  } finally {
    if (old === undefined) delete process.env.PORTAL_ORIGIN;
    else process.env.PORTAL_ORIGIN = old;
  }
});
test("form จำกัด 16KiB ฝั่ง server และไม่รับ JSON", async () => {
  const req = (body: string, type = "application/x-www-form-urlencoded") =>
    new Request("http://localhost/", {
      method: "POST",
      headers: { "content-type": type },
      body,
    });
  assert.equal(
    (await boundedForm(req("email=demo%40example.invalid&code=123456"))).get(
      "email",
    ),
    "demo@example.invalid",
  );
  await assert.rejects(
    boundedForm(req("a=" + "x".repeat(16384))),
    (e) => e instanceof PortalError && e.status === 413,
  );
  await assert.rejects(
    boundedForm(req("{}", "application/json")),
    (e) => e instanceof PortalError && e.status === 415,
  );
});
test("ข้อมูลเวลาหลัง network validation ต้องไม่ขาด iat หรือสลับบัญชี", () => {
  const now = Date.parse("2026-10-09T00:00:00Z"),
    id = "00000000-0000-5000-a000-000000000001";
  const token = (claims: object) =>
    "synthetic." +
    Buffer.from(JSON.stringify(claims)).toString("base64url") +
    ".synthetic";
  const c = { sub: id, iat: now / 1000, exp: now / 1000 + 60, aal: "aal2" };
  assert.equal(verifiedClaims(token(c), id, now).aal, "aal2");
  for (const value of [
    { ...c, iat: undefined },
    { ...c, exp: now / 1000 },
    { ...c, iat: now / 1000 + 120 },
    { ...c, sub: "different" },
    { ...c, exp: "9999999999" },
  ])
    assert.throws(() => verifiedClaims(token(value), id, now), PortalError);
  assert.equal(uuid(id), true);
  assert.equal(uuid("------------------------------------"), false);
});
test("ค้นทะเบียนรักษาไทยและตีความ wildcard เป็นข้อความ จำกัด pagination", () => {
  assert.equal(
    registryFilter(new URLSearchParams({ q: "สมชาย%_\\" })).pattern,
    "%สมชาย\\%\\_\\\\%",
  );
  assert.equal(registryFilter(new URLSearchParams({ page: "2" })).offset, 25);
  for (const page of ["0", "-1", "1.5", "801", "Infinity"])
    assert.throws(
      () => registryFilter(new URLSearchParams({ page })),
      PortalError,
    );
  assert.throws(
    () => registryFilter(new URLSearchParams({ q: "ก".repeat(81) })),
    PortalError,
  );
});
