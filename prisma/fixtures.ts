import { createHash } from "node:crypto";

/** Stable UUIDs for synthetic fixtures only, never national identifiers. */
export function fixtureId(key: string): string {
  const hash = createHash("sha256")
    .update(`ch06-synthetic-v1:${key}`)
    .digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-5${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

export const FIXTURE_TIME = new Date("2026-01-01T00:00:00Z");
export const FIXTURE_DATE = new Date("2026-01-01T00:00:00Z");
export const SEED_ACTOR_ID = fixtureId("service:seed");
export const REFERENCE_CODES = [
  ["identity_review", "DEMO_UNVERIFIED", "ยังไม่ตรวจตัวตน — สมมติ"],
  ["person_state", "DEMO_ACTIVE", "สถานะบุคคลทดลอง — สมมติ"],
  ["organization_status", "DEMO_ACTIVE", "หน่วยงานทดลอง — สมมติ"],
  ["geography_kind", "DEMO_AREA", "พื้นที่สมมติ ไม่ใช่รหัสทางการ"],
  ["name_kind", "DEMO_DISPLAY", "ชื่อแสดงทดลอง — สมมติ"],
  ["contact_channel", "DEMO_EMAIL", "อีเมลสมมติ .invalid"],
  ["address_kind", "DEMO_LOCATION", "ที่ตั้งสมมติ"],
] as const;
