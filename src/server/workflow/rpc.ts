import "server-only";
import { randomUUID } from "node:crypto";
import { currentIdentity } from "../portal/auth";
import { transaction } from "../portal/database";
import { PortalError } from "../portal/config";
import { uuid } from "../portal/claims";
const functions = {
  files: "work_files",
  requests: "work_requests",
  notifications: "work_notifications",
  filePrepare: "work_file_prepare",
  fileUploaded: "work_file_uploaded",
  fileRead: "work_file_read",
  share: "work_share",
  revoke: "work_revoke",
  save: "work_save",
  transition: "work_transition",
  ack: "work_notification_ack",
} as const;
export type WorkCall = keyof typeof functions;
export async function rpc<T = unknown>(
  name: WorkCall,
  args: unknown[] = [],
): Promise<T[]> {
  const identity = await currentIdentity();
  if (!identity) throw new PortalError(401, "กรุณาเข้าสู่ระบบ");
  if (
    !["test", "staging"].includes(process.env.APP_ENV ?? "") ||
    process.env.PORTAL_DATA_MODE !== "SYNTHETIC"
  )
    throw new PortalError(503, "ธุรกรรมทดลองยังไม่เปิดในสภาพแวดล้อมนี้");
  return transaction(identity.authId, async (db) => {
    await db.query(
      "SELECT set_config('app.session_hash',$1,true),set_config('app.auth_issued_at',$2,true),set_config('app.strong_mfa',$3,true),set_config('app.correlation_id',$4,true)",
      [
        identity.sessionHash,
        String(identity.issuedAt),
        String(identity.strongMfa),
        randomUUID(),
      ],
    );
    try {
      const result = await db.query(
        `SELECT private.${functions[name]}(${args.map((_, i) => "$" + (i + 1)).join(",")}) AS result`,
        args,
      );
      return result.rows.map((r) => r.result as T);
    } catch (error) {
      const e = error as { code?: string; message?: string };
      if (e.code === "28000")
        throw new PortalError(
          401,
          "บัญชีหมดอายุหรือถูกถอนสิทธิ์ กรุณาเข้าสู่ระบบใหม่",
        );
      if (e.code === "42501")
        throw new PortalError(
          403,
          "ไม่มีสิทธิ์ในหน่วยงานนี้ หรือผู้ยื่นและผู้ตรวจไม่สามารถอนุมัติรายการของตนเอง",
        );
      if (e.code === "40001" || e.code === "23505")
        throw new PortalError(
          409,
          "รายการเปลี่ยนไปแล้วหรือ key เดิมใช้กับข้อมูลต่างกัน กรุณาโหลดรุ่นล่าสุดและตรวจคำตัดสินก่อนลองใหม่",
        );
      if (e.code?.startsWith("22") || e.code === "23514")
        throw new PortalError(
          422,
          "ข้อมูลหรือเหตุผลยังไม่ครบ เอกสารต้องผ่านการสแกน และผู้ตรวจต้องได้รับสิทธิ์อ่านหลักฐานครบ",
        );
      throw new PortalError(503, "บริการธุรกรรมยังไม่พร้อม กรุณาติดต่อผู้ดูแล");
    }
  });
}
export function requireUuid(value: unknown, label = "รหัส"): string {
  if (typeof value !== "string" || !uuid(value))
    throw new PortalError(400, label + "ไม่ถูกต้อง");
  return value;
}
export function requireRevision(value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0)
    throw new PortalError(400, "รุ่นข้อมูลไม่ถูกต้อง");
  return value;
}
