# สัญญาหลักฐานอนุมัติภายใน — บท 57

รุ่นเอกสาร 0.1 | 8 ตุลาคม 2569 (2026-10-08) | Proposal / PLAN_ONLY / ไม่มี service หรือ migration

อ้าง [ข้อกำหนด](E_SIGNATURE_REQUIREMENTS.md), [workflow กลาง](WORKFLOW_ENGINE.md), [flow หนังสือ](CORRESPONDENCE_FLOW.md), [สิทธิ์รุ่นเอกสาร](RECORD_DOCUMENT_ACCESS.md), [retention](RECORDS_RETENTION.md) และ [adapter](SIGNING_ADAPTER_CONTRACT.md)

## แบบข้อมูลที่เสนอ

ใช้ approval_evidence ของ logical04 ต่อกับ StepDecision/RecordVersion/Document/FileVersion กลาง ไม่สร้างทะเบียนคำตัดสินอีกชุด `ServiceActor` ปัจจุบันเป็น provenance ไม่ใช่บัญชีอนุมัติ runtime ขณะนี้ยังไม่มีตารางต่อไปนี้

| ข้อมูลในหลักฐาน                                                       | แหล่งจริงที่ server ต้องอ่าน                                                | ข้อบังคับเสนอ                                                                    |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| evidence_id / decision_id / workflow_instance_id / review_cycle_id    | shared workflow และรหัสที่ server สร้าง                                     | immutable และ FK RESTRICT; ไม่รับจาก client โดยไม่มีการตรวจ                      |
| resource_ref / record_version_id / resource_revision                  | เรื่องและรุ่นที่เสนออนุมัติ                                                 | revision ต้องเท่ากับ candidate ใน workflow                                       |
| approver_account_id / approver_person_id                              | verified account กลางและ mapping ณ เวลาตัดสิน                               | account ต้องใช้งานได้ แยกผู้สร้าง/ผู้ตรวจ/ผู้อนุมัติตาม policy                   |
| decision_code / reason / recorded_at / effective_at                   | คำตัดสินและเวลาจาก server                                                   | recorded UTC; effective แยกเมื่อใช้จริง ไม่เชื่อ client time                     |
| authority_snapshot                                                    | assignment/delegation IDs+versions/action/scope/type/ช่วงเวลา/PolicyVersion | มีอำนาจที่รับรองและ current ณ commit; ไม่คัดลอก bearer token ลง snapshot         |
| read_receipt_ref                                                      | receipt ที่ server ออกหลัง authorize และเสิร์ฟรุ่นอ่าน                      | actor/candidate/hash ตรงและไม่หมดอายุตาม config; เปิดหน้าไม่พิสูจน์ว่าอ่านเข้าใจ |
| approved_manifest / manifest_digest                                   | เนื้อหา canonical และ sorted file manifest ที่ server สร้าง                 | bytes hash/size/type ของทุกไฟล์และ role; ไม่ใช้ approved_hash เพียงไฟล์เดียว     |
| canonicalization_profile_id / hash_algorithm                          | versioned policy และ implementation ที่ตรวจแล้ว                             | เปลี่ยนวิธี canonicalize ต้องรุ่นใหม่; proposal SHA256 ไม่ certificate           |
| signing_configuration_status                                          | configuration ที่ยืนยันจาก server                                           | SIGNING_NOT_CONFIGURED เมื่อไม่มี provider; ไม่สร้าง signing job                 |
| supersedes_evidence_ref / correction_reason / correction_document_ref | review cycle ใหม่ที่ผ่าน workflow                                           | ไม่แก้หลักฐานหรือ hash เดิมย้อนหลัง                                              |

`approved_manifest` ครอบคลุม body AST, ข้อมูลสำคัญของเรื่อง, ผู้ลงนาม/ผู้รับรหัสกลาง+context, รายการแนบ exact FileVersion IDs+byte hashes, template/layout/font/content policy versions และเงื่อนไขอนุมัติที่มีสาระสำคัญตามบท54 ไม่ใส่ credential, signed URL หรือ private storage path ลง digest/response สาธารณะ

Reference fixture ใช้ JSON UTF8 sorted keys ไม่มีช่องว่าง SHA256 สำหรับเทียบตัวอย่างเท่านั้น ไม่เป็นมาตรฐาน canonicalization ของ production Unicode/normalization/null/date/number/order/AST และ storage streaming digest ต้อง ADR มี golden vectors ก่อนใช้จริง ไม่ใช้ JSON.stringify จาก browser เป็นผู้กำหนด approved digest

ไฟล์ข้อความและ authority/read receipt/เวลาทั้งหมดใน fixture เป็นสมมติ ไม่มี object หรือบัญชีจริง ระยะ receipt 10 นาทีเป็นตัวอย่าง DEMO ไม่ใช่นโยบายที่หน่วยงานยืนยัน ตัวอย่าง all-guards-true อธิบายเงื่อนไขเท่านั้น ไม่สร้างคำอนุมัติจริง

## เส้นทางอ่านก่อนตัดสิน

1. authorize actor/action/current scope/delegation/record/version/source/file/class/representation/CLEAN ด้วยบริการกลางตามบท56 ทุกไฟล์ที่ต้องอ่านในการอนุมัติ ไม่ให้สิทธิ์จากการมี link
2. resolve candidate manifest และ exact immutable object version ตรวจ digest จาก bytes จริงก่อนเสิร์ฟ การ render preview ต้องผูก exact manifest; preview ไม่ใช่การรับรอง bytes ของ PDF ที่สร้างทีหลัง
3. server ออก read receipt ผูก account/manifest/version/issued_at/expiry; browser ส่งเฉพาะ opaque receipt ref กลับ ยังต้องตรวจสิทธิ์ ณ เวลาตัดสินใหม่ receipt ไม่ใช่สิทธิ์ถาวรหรือ trusted timestamp
4. ถ้า bytes ไม่ตรง manifest หรือไฟล์ scan ถูกถอน ตอบข้อผิดพลาดปลอดภัย “เอกสารรุ่นนี้เปลี่ยนหรือยังไม่พร้อม กรุณาตรวจรุ่นใหม่” หยุดตัดสิน/ส่ง/ลงนามและบันทึก incident ไม่แจกชื่อไฟล์ลับให้ผู้ไม่มีสิทธิ์

## Transaction และการทำซ้ำ

คำสั่งตัดสินรับ resource ref/candidate revision/review cycle/read receipt/reason/idempotency key ส่วน approver/time/hash/authority มาจาก server มี request fingerprint ผูก actor/action/resource/cycle/manifest/reason; key เดิม payload ต่างตอบ IDEMPOTENCY_CONFLICT

DB transaction ต้องล็อก workflow/candidate และ authorization guard version ที่ทุก writer ของ delegation/ACL/revoke ใช้ร่วมกัน ตรวจ maker checker, expiry, current grant, receipt และ digest อีกครั้ง CAS จาก REVIEW_PENDING ไปคำตัดสินหนึ่งชุด จากนั้นสร้าง StepDecision+ApprovalEvidence+audit+outbox+operation receipt แล้ว commit ทั้งชุด ถ้าทำไม่ครบ rollback ทั้งชุด

ข้อเสนอ constraints: unique active decision ต่อ workflow review cycle/step; unique evidence ต่อ decision+record version; unique operation key ต่อ actor/action/resource; unique outbox effect key ต่อ decision; file manifest FK ไป exact versions การอนุมัติสองคนหรือแก้ revision แข่งกันผู้แพ้ตอบ “มีผู้ตัดสินหรือแก้รุ่นนี้แล้ว กรุณาโหลดข้อมูลล่าสุด” ไม่อ้างว่า constraint เดิม logical04 เพียงตัวเดียวกันทุก race ได้

การ authorize ครั้งเดียวก่อน transaction ไม่ป้องกัน revoke race ต้องออกแบบทุก authorization writer/lock order/DB role/RLS และทดสอบจริง ไม่ถือว่า optimistic resource revision ป้องกันการเปลี่ยน delegation ได้เอง Receipt ของงาน retry ที่สำเร็จคืนข้อมูลได้เฉพาะเมื่อ current read ACL อนุญาต มิฉะนั้นตอบ deny ไม่รั่ว evidence

## การตรวจความครบถ้วนและแก้ผิด

บริการ verifyEvidence ที่เสนอทำ current read authorization ก่อนอ่าน snapshot แล้ว recompute manifest/byte digest ของ exact source versions ถ้าเท่ากันรายงาน INTEGRITY_MATCH ถ้าไม่เท่า VERSION_MISMATCH ถ้า object หาย/เข้าถึงไม่ได้รายงาน UNVERIFIABLE อย่างปลอดภัย ไม่อนุมาน approval valid จาก digest match และไม่เรียกผลนี้ว่า cryptographic signature verification

แก้ข้อผิดพลาดโดย new review cycle/evidence และ supersedes ref +เหตุผล+เอกสารตรวจ ไม่ rewrite approver/time/snapshot/hash เดิม ระงับ dispatch permit ที่เกี่ยวข้อง และส่งผลกระทบให้งานส่ง55/คำสั่ง1/4/งบ6/พัสดุ7 ตรวจตาม source reference ไม่ถอนหรือเปลี่ยนสถานะธุรกิจเหล่านั้นอัตโนมัติจากการ revalidate หลักฐานนี้

Evidence/manifest/read receipt/validation report ใช้ private ACL ตาม record+source+file และ audit ตาม policy56 การค้น/thumbnail/export/worker ไม่แสดงข้อความหรือชื่อผู้อนุมัติแก่ผู้ไม่มีสิทธิ์ hash ไม่เป็น public capability Legal hold ครอบคลุมหลักฐานตาม closure ที่ยืนยัน; retention ไม่มีค่าปีทางการที่เดา และไม่สร้างสำเนาไฟล์ลับใน audit

## หลักฐานที่ต้องได้ก่อนผ่าน

P57-01–12/22/24 ต้องมี migrations/constraints/RLS จริง, SQL concurrency/revoke rollback proofs, object bytes fixtures, API negative tests, audit/outbox receipts และการอ่านรุ่นเดิมหลังเปลี่ยนชื่อ/Document.latest ไม่ใช้ reference checksum ใน JSON เป็นหลักฐานว่าบริการนี้ทำงานแล้ว บริการทั้งหมด NOT RUN รอบ57
