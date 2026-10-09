import { createHash } from "node:crypto";
import { PortalError } from "../portal/config";
// Web limit stays below Vercel Function request/response payload ceiling.
export const maximumWebUploadBytes = 4 * 1024 * 1024;
export const maximumFileBytes = 10 * 1024 * 1024;
export function contentHash(bytes: Uint8Array) {
  return createHash("sha256").update(bytes).digest("hex");
}
export function inspectUpload(bytes: Uint8Array, label: string, mime: string) {
  if (bytes.length < 1 || bytes.length > maximumFileBytes)
    throw new PortalError(413, "ไฟล์ต้องไม่เกิน 10 MiB");
  const name = label.normalize("NFC");
  if (
    name.length < 1 ||
    name.length > 150 ||
    [...name].some((c) => c.charCodeAt(0) < 32 || c === "/" || c === "\\")
  )
    throw new PortalError(400, "ชื่อไฟล์ไม่ถูกต้อง");
  const b = Buffer.from(bytes);
  const valid =
    (mime === "application/pdf" &&
      /\.pdf$/i.test(name) &&
      b.subarray(0, 5).toString() === "%PDF-") ||
    (mime === "image/png" &&
      /\.png$/i.test(name) &&
      b
        .subarray(0, 8)
        .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) ||
    (mime === "image/jpeg" &&
      /\.jpe?g$/i.test(name) &&
      b[0] === 255 &&
      b[1] === 216 &&
      b[2] === 255);
  if (!valid)
    throw new PortalError(
      415,
      "รับ PDF PNG JPEG ที่ชนิดและเนื้อหาตรงกันเท่านั้น ต้องผ่านการสแกนก่อนอ่าน",
    );
  return { label: name, mime, size: bytes.length, sha256: contentHash(bytes) };
}
export async function boundedBytes(request: Request, limit = maximumFileBytes) {
  const reader = request.body?.getReader();
  if (!reader) throw new PortalError(400, "ไม่มีไฟล์");
  const chunks: Uint8Array[] = [];
  let n = 0;
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      n += next.value.length;
      if (n > limit) {
        await reader.cancel();
        throw new PortalError(413, "ไฟล์ใหญ่เกินกำหนด");
      }
      chunks.push(next.value);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks);
}
