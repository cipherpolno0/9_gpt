import { execFileSync } from "node:child_process";

// ใช้pnpmตัวเดียวกับที่เปิดคำสั่งนี้ ไม่เผลอเรียกglobalคนละรุ่นเมื่อใช้Corepack
const runner = process.env.npm_execpath;
if (!runner) {
  console.error("กรุณารันด้วย pnpm check");
  process.exitCode = 1;
} else {
  try {
    for (const name of [
      "db:validate",
      "lint",
      "typecheck",
      "test",
      "db:test:sql",
      "format:check",
      "secrets:check",
      "build",
    ]) {
      execFileSync(process.execPath, [runner, "run", name], {
        stdio: "inherit",
      });
    }
  } catch {
    process.exitCode = 1;
  }
}
