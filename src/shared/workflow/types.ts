export type Grant = { organization_id: string | null; actions: string[] };
export type FileRow = {
  id: string;
  document_id: string;
  revision: number;
  label: string;
  scan_status: string;
  sha256: string;
};
export type RequestRow = {
  id: string;
  kind: string;
  organization_id: string;
  status: string;
  revision: number;
  tracking_code: string;
  payload: Record<string, string>;
  file_version_ids: string[];
  snapshot_hash: string;
  data_mode: string;
  created_by_account_id: string;
  decisions: {
    decision: string;
    reason: string;
    revision: number;
    decided_at: string;
    authority_assignment_id: string;
    snapshot_hash: string;
  }[];
};
export type NoticeRow = {
  id: string;
  request_id: string;
  event_type: string;
  created_at: string;
  acknowledged_at: string | null;
};
export const statusLabel: Record<string, string> = {
  draft: "ร่าง",
  submitted: "รอตรวจ",
  returned: "ส่งกลับแก้ไข",
  reviewed: "ตรวจแล้ว รออนุมัติ",
  approved: "อนุมัติทดลอง",
  rejected: "ปฏิเสธ",
  cancelled: "ยกเลิก",
};
export const kindLabel: Record<string, string> = {
  PERSON_CORRECTION: "แก้ข้อมูลบุคคล",
  ORGANIZATION_CHANGE: "เปลี่ยนข้อมูลหน่วยงาน",
  EXAM_CENTER_CHANGE: "เปลี่ยนข้อมูลสนาม",
};
