import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

test("9โมดูลหนึ่งrepositoryไม่มีpackageหรือทะเบียนloginแยก", () => {
  const modules = readdirSync("src/modules");
  assert.equal(modules.length, 9);
  for (const name of modules)
    assert.deepEqual(readdirSync(`src/modules/${name}`), ["README.md"]);
  assert.match(
    readFileSync("src/modules/exam-imports/README.md", "utf8"),
    /applicationserviceของexams/,
  );
});
test("Prisma7configไม่ใช้URLในdatasourceหรือgeneratorรุ่นเก่า", () => {
  const schema = readFileSync("prisma/schema.prisma", "utf8");
  assert.match(schema, /provider\s*=\s*"prisma-client"/);
  assert.doesNotMatch(schema, /prisma-client-js|url\s*=/);
  assert.match(readFileSync("prisma.config.ts", "utf8"), /DIRECT_DATABASE_URL/);
});
test("dependencyตรงรุ่นstableและReact/Prismaเป็นชุดเดียว", () => {
  const p = JSON.parse(readFileSync("package.json", "utf8"));
  for (const v of Object.values<string>({
    ...p.dependencies,
    ...p.devDependencies,
  }))
    assert.match(v, /^\d+\.\d+\.\d+$/);
  assert.equal(p.dependencies.react, p.dependencies["react-dom"]);
  assert.equal(p.dependencies["@prisma/client"], p.devDependencies.prisma);
  assert.equal(p.dependencies["@prisma/adapter-pg"], p.devDependencies.prisma);
});
