import { readFile, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";

try {
  const example = await readFile(
    new URL("../.env.example", import.meta.url),
    "utf8",
  );
  const password = randomBytes(24).toString("hex");
  await writeFile(
    new URL("../.env", import.meta.url),
    example.replaceAll("CHANGE_THIS_LOCAL_ONLY", password),
    { flag: "wx", mode: 0o600 },
  );
  console.log("สร้างการตั้งค่าในเครื่องแล้ว ไม่แสดงรหัสผ่าน");
} catch (error) {
  if (error?.code === "EEXIST")
    console.log("มีการตั้งค่าในเครื่องแล้ว จึงเก็บไฟล์เดิมไว้");
  else {
    console.error("สร้างการตั้งค่าไม่สำเร็จ ตรวจสิทธิ์ไฟล์และไฟล์ตัวอย่าง");
    process.exitCode = 1;
  }
}
