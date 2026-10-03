import test from "node:test";
import assert from "node:assert/strict";
import { assertLocalDatabase } from "../prisma/local-safety";
import { fixtureId } from "../prisma/fixtures";

test("seed/test จำกัดloopbackและชื่อฐานใหม่เฉพาะบท06", () => {
  const local =
    "postgresql://postgres:placeholder@127.0.0.1:5432/sangha_ch06_demo";
  assert.equal(assertLocalDatabase(local, "local", "demo"), local);
  assert.throws(() => assertLocalDatabase(local, "production", "demo"));
  assert.throws(() => assertLocalDatabase(local, "local", "test"));
  for (const unsafe of [
    "postgresql://p@host.supabase.co/sangha_ch06_demo",
    "postgresql://p@127.0.0.1/postgres",
    "postgresql://p@127.0.0.1/sangha_local",
    local + "?host=remote",
    local + "#remote",
    "invalid",
    "postgresql://p@127.0.0.1/sangha_ch06_demo%22",
  ]) {
    assert.throws(() => assertLocalDatabase(unsafe, "local", "demo"));
  }
});
test("fixtureUUIDคงเดิมในชุดเดิม คนชื่อคล้ายไม่mergeอัตโนมัติ", () => {
  assert.equal(fixtureId("person:a"), fixtureId("person:a"));
  assert.notEqual(fixtureId("person:a"), fixtureId("person:b"));
  assert.match(
    fixtureId("person:a"),
    /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-a[0-9a-f]{3}-[0-9a-f]{12}$/,
  );
});
