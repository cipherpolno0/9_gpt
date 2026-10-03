import { spawn } from "node:child_process";
import assert from "node:assert/strict";
import { setTimeout as delay } from "node:timers/promises";

const port = 3105;
const base = `http://127.0.0.1:${port}`;
const child = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    String(port),
  ],
  { stdio: ["ignore", "pipe", "pipe"] },
);
let startupFailed = false;
child.on("error", () => {
  startupFailed = true;
});
child.on("exit", () => {
  startupFailed = true;
});
// ไม่แสดงstdout/stderrของserverที่อาจมีข้อมูลจากenvironment
child.stdout.resume();
child.stderr.resume();
let passed = 0;
try {
  let ready = false;
  for (let i = 0; i < 80 && !startupFailed; i++) {
    try {
      ready = (await fetch(base)).ok;
    } catch {
      /* รอserverเริ่ม */
    }
    if (ready) break;
    await delay(200);
  }
  assert.ok(
    ready && !startupFailed,
    "เปิดเว็บทดสอบไม่ได้ ตรวจbuildและพอร์ต3105",
  );
  const root = await fetch(base);
  const html = await root.text();
  assert.equal(root.status, 200);
  passed++;
  assert.match(html, /lang="th"/);
  assert.match(html, /เว็บไซต์กองบริหารทะเบียนและวัดผล/);
  passed++;
  assert.doesNotMatch(
    html,
    /CHANGE_THIS_LOCAL_ONLY|DATABASE_URL|POSTGRES_PASSWORD|sb_secret_/,
  );
  passed++;
  const cssPaths = [
    ...new Set(
      [...html.matchAll(/href="([^" ]+\.css(?:\?[^" ]*)?)"/g)].map((m) => m[1]),
    ),
  ];
  assert.ok(cssPaths.length > 0);
  let css = "";
  let fontUrl;
  for (const path of cssPaths) {
    const stylesheetUrl = new URL(path, base);
    const r = await fetch(stylesheetUrl);
    assert.equal(r.status, 200);
    const content = await r.text();
    css += content;
    const font = content.match(/url\((?:["']?)([^)"']+\.woff2?)(?:["']?)\)/);
    if (font && !fontUrl) fontUrl = new URL(font[1], stylesheetUrl);
  }
  assert.match(css, /Sarabun/);
  passed++;
  assert.ok(fontUrl);
  assert.equal((await fetch(fontUrl)).status, 200);
  passed++;
  for (const path of ["/app", "/app/admin", "/app/exams/imports"]) {
    for (const method of [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
      "HEAD",
    ]) {
      const r = await fetch(base + path, { method });
      assert.equal(r.status, 403);
      assert.equal(r.headers.get("cache-control"), "no-store");
      passed++;
    }
  }
  assert.equal((await fetch(base + "/missing-chapter05-page")).status, 404);
  passed++;
  console.log(
    `ตรวจHTTPหน้าแรก/CSS/ฟอนต์/403ทุกmethod/404ผ่าน ${passed} รายการ`,
  );
} catch {
  console.error(
    "ตรวจHTTPไม่ผ่าน ผ่านไป",
    passed,
    "รายการ ตรวจbuild พอร์ต3105 และการเปิดserver",
  );
  process.exitCode = 1;
} finally {
  child.kill("SIGTERM");
}
