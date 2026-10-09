import "dotenv/config";
import { execFileSync } from "node:child_process";
import { Pool } from "pg";
import { assertLocalDatabase } from "../prisma/local-safety";

async function main() {
  const action = process.argv[2];
  if (!["create", "migrate", "status", "test"].includes(action))
    throw new Error("คำสั่งไม่ถูกต้อง");
  const testMode = action === "test";
  const connectionString = assertLocalDatabase(
    testMode
      ? process.env.CH06_TEST_DATABASE_URL
      : process.env.CH06_DATABASE_URL,
    process.env.APP_ENV,
    testMode ? "test" : "demo",
  );
  const url = new URL(connectionString);
  const databaseName = url.pathname.slice(1);
  const env = {
    ...process.env,
    CH06_DATABASE_URL: connectionString,
    DIRECT_DATABASE_URL: connectionString,
  };
  const runner = process.env.npm_execpath;
  if (!runner) throw new Error("รันคำสั่งผ่าน pnpm");
  if (action === "create" || testMode) {
    url.pathname = "/postgres";
    const admin = new Pool({
      connectionString: url.toString(),
      connectionTimeoutMillis: 5000,
    });
    try {
      const found = await admin.query(
        "SELECT 1 FROM pg_database WHERE datname=$1",
        [databaseName],
      );
      if (!found.rowCount) {
        // Guard only allows fixed lowercase/alphanumeric DB names; no user SQL.
        await admin.query(
          `CREATE DATABASE "${databaseName}" TEMPLATE template0 ENCODING 'UTF8'`,
        );
      }
      console.log("ฐานทดลองพร้อม ไม่มีการลบหรือ reset ฐานเดิม");
    } finally {
      await admin.end();
    }
    if (action === "create") return;
  }
  if (testMode) {
    const pool = new Pool({ connectionString, connectionTimeoutMillis: 5000 });
    try {
      const rows = await pool.query(
        "SELECT n.nspname,c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE c.relkind='r' AND n.nspname NOT IN ('pg_catalog','information_schema')",
      );
      if (rows.rowCount) {
        const migrationTable = rows.rows.some(
          (r) => r.nspname === "public" && r.relname === "_prisma_migrations",
        );
        if (
          !migrationTable ||
          rows.rows.some(
            (r) =>
              !["public", "private"].includes(r.nspname) ||
              (r.nspname === "public" && r.relname !== "_prisma_migrations"),
          )
        )
          throw new Error("ฐานทดสอบไม่ใช่ฐานบท06");
        const migrations = await pool.query(
          "SELECT migration_name,finished_at FROM public._prisma_migrations",
        );
        const supported = [
          "20261003130000_core_foundation",
          "20261009170000_portal_access",
        ];
        if (
          !migrations.rowCount ||
          migrations.rowCount > supported.length ||
          migrations.rows.some(
            (r) => !supported.includes(r.migration_name) || !r.finished_at,
          )
        )
          throw new Error("รุ่นฐานทดสอบไม่ตรง");
      }
    } finally {
      await pool.end();
    }
  }
  if (action === "status") {
    execFileSync(
      process.execPath,
      [runner, "exec", "prisma", "migrate", "status"],
      { env, stdio: "inherit" },
    );
    return;
  }
  execFileSync(
    process.execPath,
    [runner, "exec", "prisma", "migrate", "deploy"],
    { env, stdio: "inherit" },
  );
  if (testMode) {
    execFileSync(process.execPath, [runner, "run", "db:generate"], {
      env,
      stdio: "inherit",
    });
    execFileSync(
      process.execPath,
      [
        "--import",
        "tsx",
        "--test",
        "--test-concurrency=1",
        "tests/database/core.integration.ts",
        "tests/database/portal.integration.ts",
      ],
      {
        env: { ...env, CH06_TEST_DATABASE_URL: connectionString },
        stdio: "inherit",
      },
    );
  }
}
main().catch(() => {
  console.error(
    "คำสั่งฐานทดลองไม่สำเร็จ ตรวจ PostgreSQL/URL รุ่น migration และ DATABASE.md; ไม่แสดง credential",
  );
  process.exitCode = 1;
});
