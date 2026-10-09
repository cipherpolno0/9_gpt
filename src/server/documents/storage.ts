import { PortalError, authConfiguration } from "../portal/config";
import { maximumFileBytes, contentHash } from "./files";
function storageConfiguration() {
  const { base } = authConfiguration();
  const key = process.env.SUPABASE_STORAGE_SERVER_KEY;
  const bucket = process.env.PORTAL_PRIVATE_BUCKET;
  if (!key || !bucket || !/^portal-[a-z0-9-]+$/.test(bucket))
    throw new PortalError(503, "ยังไม่ได้ตั้งคลังเอกสาร private");
  return { base, key, bucket };
}
async function privateBucket(c: ReturnType<typeof storageConfiguration>) {
  let response: Response;
  try {
    response = await fetch(`${c.base}/storage/v1/bucket/${c.bucket}`, {
      headers: { apikey: c.key, Authorization: "Bearer " + c.key },
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    throw new PortalError(503, "ยังตรวจคลังเอกสารไม่ได้");
  }
  if (!response.ok) throw new PortalError(503, "ยังตรวจคลังเอกสารไม่ได้");
  const bucket = await response.json();
  if (bucket.id !== c.bucket || bucket.public !== false)
    throw new PortalError(
      503,
      "คลังเอกสารต้องเป็น private ก่อนรับหรือเปิดไฟล์",
    );
}
function objectPath(path: string) {
  if (!/^[a-f0-9-]{36}\/[a-f0-9-]{36}\/[a-f0-9-]{36}$/.test(path))
    throw new PortalError(400, "รหัสไฟล์ไม่ถูกต้อง");
  return path;
}
export async function readObject(
  path: string,
  expectedHash: string,
  expectedSize: number,
) {
  const c = storageConfiguration();
  await privateBucket(c);
  let res: Response;
  try {
    res = await fetch(
      `${c.base}/storage/v1/object/${c.bucket}/${objectPath(path)}`,
      {
        headers: { apikey: c.key, Authorization: "Bearer " + c.key },
        redirect: "error",
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      },
    );
  } catch {
    throw new PortalError(503, "ยังอ่านไฟล์จากคลังไม่ได้");
  }
  if (!res.ok || !res.body) throw new PortalError(503, "ไฟล์ยังไม่พร้อม");
  if (
    !Number.isSafeInteger(expectedSize) ||
    expectedSize < 1 ||
    expectedSize > maximumFileBytes
  )
    throw new PortalError(409, "ขนาดไฟล์ไม่ตรงกับรุ่นที่บันทึก");
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      total += next.value.length;
      if (total > expectedSize) {
        await reader.cancel();
        throw new PortalError(
          409,
          "เนื้อหาไฟล์เปลี่ยน ต้องสร้างรุ่นใหม่และตรวจใหม่",
        );
      }
      chunks.push(next.value);
    }
  } finally {
    reader.releaseLock();
  }
  const data = Buffer.concat(chunks);
  if (data.length !== expectedSize || contentHash(data) !== expectedHash)
    throw new PortalError(
      409,
      "เนื้อหาไฟล์เปลี่ยน ต้องสร้างรุ่นใหม่และตรวจใหม่",
    );
  return data;
}
export async function putObject(
  path: string,
  bytes: Buffer,
  mime: string,
  sha: string,
) {
  const c = storageConfiguration();
  await privateBucket(c);
  let res: Response;
  try {
    res = await fetch(
      `${c.base}/storage/v1/object/${c.bucket}/${objectPath(path)}`,
      {
        method: "POST",
        headers: {
          apikey: c.key,
          Authorization: "Bearer " + c.key,
          "Content-Type": mime,
          "x-upsert": "false",
          "Cache-Control": "no-store",
        },
        body: new Uint8Array(bytes),
        redirect: "error",
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      },
    );
  } catch {
    throw new PortalError(503, "อัปโหลดไม่สำเร็จ ใช้ key เดิมลองใหม่ได้");
  }
  if (res.ok) return;
  // A retry may find an immutable existing object; prove bytes before marking uploaded.
  if ([400, 409].includes(res.status)) {
    await readObject(path, sha, bytes.length);
    return;
  }
  throw new PortalError(503, "อัปโหลดไม่สำเร็จ ใช้ key เดิมลองใหม่ได้");
}
