import test from "node:test";
import assert from "node:assert/strict";
import { workspaceUnavailable } from "../src/server/authorization/bootstrap";
import { localServices } from "../src/server/config/local-services";

const valid = {
  APP_ENV: "local",
  DATABASE_URL: "postgresql://postgres:synthetic@127.0.0.1:5432/sangha_local",
  REDIS_URL: "redis://127.0.0.1:6379",
};
test("ปิดพื้นที่ทำงานและห้ามcacheระหว่างยังไม่มีAuth", async () => {
  const response = workspaceUnavailable();
  assert.equal(response.status, 403);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.match(await response.text(), /ยังไม่เปิดพื้นที่ทำงาน/);
});
test("รับconnectionที่เป็นlocalและไม่แก้ค่า", () =>
  assert.deepEqual(localServices(valid), {
    databaseUrl: valid.DATABASE_URL,
    redisUrl: valid.REDIS_URL,
  }));
for (const [label, change] of Object.entries({
  missing: { DATABASE_URL: undefined },
  wrongEnvironment: { APP_ENV: "production" },
  remoteDatabase: {
    DATABASE_URL: "postgresql://synthetic:example@remote.invalid/db",
  },
  remoteRedis: { REDIS_URL: "redis://remote.invalid:6379" },
  protocol: { DATABASE_URL: "https://localhost/db" },
  invalid: { DATABASE_URL: "bad-synthetic-value" },
  override: { DATABASE_URL: valid.DATABASE_URL + "?host=remote.invalid" },
})) {
  test(`ปฏิเสธค่าตั้งบริการ ${label} และไม่เปิดเผยค่า`, () => {
    assert.throws(
      () => localServices({ ...valid, ...change }),
      (error) =>
        error instanceof Error &&
        !error.message.includes("synthetic") &&
        !error.message.includes("remote.invalid") &&
        !error.message.includes("postgresql"),
    );
  });
}
