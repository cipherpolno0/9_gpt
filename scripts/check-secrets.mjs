import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const paths = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
  { encoding: "utf8" },
)
  .split("\0")
  .filter(Boolean);
const patterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /gh[pousr]_[A-Za-z0-9]{30,}/,
  /github_pat_[A-Za-z0-9_]{40,}/,
  /sb_secret_[A-Za-z0-9_-]{20,}/,
  /AKIA[0-9A-Z]{16}/,
];
const bad = [];
for (const path of paths) {
  if (/(^|\/)\.env(?:\.|$)/.test(path) && !/\.example$/.test(path)) {
    bad.push(path);
    continue;
  }
  if (/\.(?:png|jpg|woff2?|zip)$/.test(path)) continue;
  const content = readFileSync(path, "utf8");
  if (patterns.some((pattern) => pattern.test(content))) bad.push(path);
}
if (bad.length) {
  console.error("พบไฟล์ต้องตรวจ ห้ามcommit:", [...new Set(bad)].join(", "));
  process.exitCode = 1;
} else
  console.log("ไม่พบ.envจริงหรือรูปแบบsecretที่ตัวตรวจรองรับในไฟล์ที่Gitเห็น");
