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
  for (const path of [
    "/registry",
    "/exams",
    "/learn",
    "/downloads",
    "/contact",
    "/requests/track",
    "/login",
  ]) {
    const r = await fetch(base + path);
    assert.equal(r.status, 200);
    assert.match(await r.text(), /lang="th"/);
    passed++;
  }
  for (const path of [
    "/app",
    "/app/admin",
    "/app/people",
    "/app/organizations",
    "/app/exams/imports",
    "/app/requests",
    "/app/documents",
    "/app/notifications",
  ]) {
    const r = await fetch(base + path, { redirect: "manual" });
    assert.equal(r.status, 307);
    assert.equal(new URL(r.headers.get("location"), base).pathname, "/login");
    assert.match(r.headers.get("cache-control"), /no-store/);
    passed++;
  }
  for (const path of [
    "/api/people",
    "/api/organizations",
    "/api/exams/imports",
    "/api/requests",
    "/api/documents/versions",
    "/api/notifications",
    "/api/documents/versions/00000000-0000-4000-8000-000000000000",
  ]) {
    const r = await fetch(base + path);
    assert.equal(r.status, 401);
    assert.match(r.headers.get("cache-control"), /no-store/);
    assert.doesNotMatch(await r.text(), /DEMO_PERSON_|DATABASE_URL|token/);
    passed++;
  }
  for (const path of ["/api/auth/login", "/api/auth/logout"]) {
    const r = await fetch(base + path, {
      method: "POST",
      redirect: "manual",
      headers: {
        origin: "https://other.example.invalid",
        "content-type": "application/x-www-form-urlencoded",
      },
      body: "email=synthetic%40example.invalid&password=synthetic",
    });
    assert.equal(r.status, 403);
    passed++;
  }
  for (const path of [
    "/api/requests",
    "/api/documents/access",
    "/api/notifications",
  ]) {
    const response = await fetch(base + path, {
      method: "POST",
      headers: {
        origin: "https://other.example.invalid",
        "Content-Type": "application/json",
      },
      body: "{}",
    });
    assert.equal(response.status, 403);
    assert.match(response.headers.get("cache-control"), /no-store/);
    passed++;
  }
  const health = await fetch(base + "/api/health");
  assert.deepEqual(await health.json(), { status: "ok", service: "web" });
  passed++;
  const guide = await fetch(base + "/guides/getting-started.txt");
  assert.equal(guide.status, 200);
  assert.match(await guide.text(), /คู่มือเริ่มต้น/);
  passed++;
  assert.equal((await fetch(base + "/missing-chapter05-page")).status, 404);
  passed++;
  console.log(
    `ตรวจHTTPเมนูสาธารณะ/ฟอนต์/redirect/401/CSRF/404ผ่าน ${passed} รายการ`,
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
