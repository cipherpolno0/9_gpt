# ยืนยันนำเข้าโดยไม่เกิดใบสมัครซ้ำ — บท 62

รุ่น 0.1 | 9 ตุลาคม 2569 (2026-10-09) | baseline `23aa0b5` | **Proposal / BLOCKED — ยังไม่มี commit worker หรือ Application service**

## 1 สถานะและแนวคิดทีละขั้น

บท61และ37ยังไม่ผ่าน อ่าน [PROGRESS](PROGRESS.md), [IMPORT_STAGING_DRY_RUN](IMPORT_STAGING_DRY_RUN.md), [APPLICATION_SCHEMA](APPLICATION_SCHEMA.md) และ [SEAT_ALLOCATION](SEAT_ALLOCATION.md) ก่อนใช้เอกสารนี้ พบ19coremodels ไม่มี Application/Candidate/ImportBatch/OperationReceipt/FileVersion/OutboxEvent/สิทธิ์ผู้ใช้จริง worker ตรวจ connection เท่านั้น `corepack pnpm db:test` exit1 ไม่ได้รัน transaction ของบท62

1. Dry run ตรวจข้อมูลโดยไม่สร้างบุคคลหรือใบสมัคร การยืนยันต้องผูกกับรายงานรุ่นที่ตรวจแล้ว
2. Idempotency คือจดจำคำสั่งเดิมและผลที่บันทึกสำเร็จ ปุ่มกดซ้ำไม่ใช่การสมัครครั้งใหม่
3. Unique business key ป้องกันคำสั่งคนละ key หรือคนละช่องทางสร้างใบสมัครสำหรับโอกาสสมัครเดียวกัน
4. Transaction บันทึก Person/Candidate/Application/snapshot/ลิงก์แถว/ผลสำเร็จ/audit/outbox ทั้งชุด หรือย้อนกลับทั้งชุด ข้อมูลว่า worker กำลังทำงานเป็น staging metadata ซึ่งอาจบันทึกแยกได้
5. นำเข้าสำเร็จเป็นหลักฐานว่าได้ใบสมัครจริง ยังไม่ใช่อนุมัติ ที่นั่งสอบ หรือผลสอบผ่าน

เพดาน10MiB/2000แถวใน BLUEPRINT และเพดานทดลอง20แถวของ template59 **ยังไม่ใช่เพดาน commit ที่ทดสอบแล้ว** ต้องวัดบน PostgreSQL จริงรวมการสร้างคนใหม่ การแย่ง lock outbox และ failure ก่อนตั้ง `tested_commit_profile` ปัจจุบันค่าเป็น NULL/NOT_MEASURED และ `commit_enabled=false` โหมดแบ่ง commit ไม่รองรับในข้อเสนอ0.1 ไม่อ้างว่า atomic ทั้งไฟล์จาก mock/fixture

## 2 ปุ่มยืนยันและสัญญา request

เส้นทางเสนอ `/app/exams/imports/[batchId]/preview` และ POST `/api/exam-imports/[batchId]/confirm` **ยังไม่มี route นี้** หน้า `/app` ปัจจุบันปฏิเสธ403 ปุ่มเปิดเมื่อ active dry-run ครบทุกแถว error_count=0 ไม่ stale/expired และ warning ได้รับทราบครบ พร้อมสิทธิ์ยืนยันปัจจุบัน ฝั่ง server ตรวจซ้ำทุกข้อ ไม่เชื่อ client checkbox/count/verified flag

Input อนุญาตเฉพาะ batch_id, expected_batch_revision, dry_run_version, manifest_digest, warning_ack_reference และ idempotency_key บัญชี เวลา scope matching Person normalized rows และ registration_slot มาจากบริการกลาง/ข้อมูลที่บันทึกแล้ว ไม่รับจาก browser Queue payload มีเพียง commit intent reference และ generation ไม่ส่ง raw identity หรือ grant จาก client

Warning acknowledgment ต้องผูก actor, report version, warning digest, server time และ audit reference ไม่มี warning ใช้ชุดว่างที่ server คำนวณเอง รายงานหรือ warning เปลี่ยนต้องรับทราบใหม่ ไม่มีการรับทราบที่ยกเว้น ERROR/identity/evidence/กฎ TO VERIFY ผู้ใช้ต้องยังมีสิทธิ์ตอนยืนยันและตอน worker ทำงาน

ตอบ202เมื่อบันทึก intent แล้วเท่านั้น ไม่ใช่ committed; 409 conflict ที่ผู้ใช้เข้าใจได้ เช่น “มีผู้ยืนยันรายการนี้แล้ว กรุณาโหลดสถานะล่าสุด” หรือ “คำสั่งเดิมอ้างข้อมูลคนละรุ่น กรุณาตรวจใหม่” การไม่ผ่าน scope ต้องปฏิเสธก่อนคืนรายละเอียด Foreign batch/Application/Person ไม่เปิดเผยว่ามีอยู่ ให้ retry status ผ่าน current ACL เช่นเดียวกับอ่านผลสำเร็จ

## 3 Key, fingerprint และ receipt

| กลไกเสนอ                        | เขตความไม่ซ้ำ / ข้อบังคับ                                                            | ผลเมื่อซ้ำ                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| OperationReceipt กลาง           | authenticated actor + command namespace + idempotency key; fingerprint NOT NULL      | payload เดิมคืนสถานะ/ผลเดิม payload ต่าง409 ไม่แก้คำสั่งเดิม                              |
| Commit intent ของ batch         | batch_id มี active intent ได้หนึ่งชุด; immutable pins หลังยืนยัน                     | สอง browser แม้สร้างคนละ key ต้อง resolve intent เดียว หรือ conflict ไม่สร้างสองงานสำเร็จ |
| Batch commit summary            | unique(batch_id) สำหรับ source FileVersion ที่ immutable                             | มีผลสำเร็จหนึ่งชุด แม้ worker leaseหมดหรือ dryrunรุ่นใหม่ ห้ามนำ batchเดิมมา commit เพิ่ม |
| CommitReceipt แถว ตาม logical04 | unique(import_row_id), unique(import_batch_id, application_id)                       | อ้าง Application จริงด้วย FK ไม่เป็นทะเบียนใบสมัครใหม่                                    |
| Candidate กลาง                  | unique(person_id)                                                                    | หลายปีใช้ Candidate เดิม                                                                  |
| Application กลาง05              | unique(candidate_id, session_offering_id, registration_slot) ทุกสถานะตาม policy05    | เปลี่ยน center/org/channel/key ไม่สร้างโอกาสสมัครใหม่ ไม่ข้ามโดยย้ายแถวเก่าออก            |
| Verified identity กลาง          | unique locator ตาม identity policy ที่ยืนยัน เช่น issuer/type/value ภายใต้ขอบเขตจริง | resolve Person เดิมโดยบริการกลาง ไม่ uniqueชื่อ ไม่สมมติ passport number เป็นรหัสทั่วโลก  |
| Outbox success event            | unique(commit summary reference, event kind, destination reference)                  | retry ส่ง event เดิม ไม่สร้าง Application ใหม่                                            |

ชื่อ model/constraint เป็น logical delta **ไม่ใช่ DDL ที่ติดตั้งแล้ว** Summary แยกจาก CommitReceipt รายแถวเดิม ห้ามกำหนด unique(batch_id) ที่ receiptรายแถวเพราะจะทำให้ทั้ง batch มีได้ใบสมัครเดียว ต้องใช้ composite FK/check ให้ row/run/batch/application/opportunity/receipt สอดคล้อง และ NOT NULL ใน key ไม่อาศัย nullable key ป้องกันซ้ำ

Fingerprint ต้องสร้างฝั่ง server จาก command/version, source FileVersion+checksum, ordered normalized manifest+checksum, selected context, template/identity/eligibility/evidence policy versions, dryrun/report version, warning acknowledgment digest, intended Application state และ data mode การแก้ชื่อ หมายเหตุ หน่วยงาน หรือไฟล์ใช้ keyเดิมต้อง conflict ไม่เงียบใช้ข้อมูลใหม่ Key ไม่ใส่เลขบัตร/ชื่อ; ข้อเสนอเป็น opaque random value ไม่ใช่สิทธิ์เข้าถึง

ใช้ production canonicalization ADR ที่บท61ระบุ ห้าม hash JSON ตามลำดับ object ของ browser Fixtureบท62ไม่มี hash production หรือ checksum XLSX จริง เมื่อพบ Application business key เดิมจากคำสั่งอื่นต้อง rollback ทั้ง batch และรายงานซ้ำให้ตรวจใหม่ **ไม่** silently merge/upsert แก้ใบสมัครเดิม Receipt เดิมที่สำเร็จและ fingerprintตรงจึง replay ได้

## 4 State และการกู้คืน

ชื่อ commit state0.1 เป็น layer แยกจาก validation state61: `VALIDATED_READY` และ warningackครบจึงแสดง `validated`; statusนี้ไม่หมายถึง approved Applicant การ mapping `completed` ในlogical04เป็น `committed` ต้อง migration/ADR เมื่อ implementationพร้อม ไม่แก้ข้อมูลย้อนหลังโดย renameเงียบ

| จาก        | เหตุการณ์ / guard                                                      | ไป                          | ผลต่อทะเบียน                                                                  |
| ---------- | ---------------------------------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------- |
| validated  | current ACL + fresh manifest + errors0 + ackครบ + tested profile       | committing                  | intent/dispatch outboxเท่านั้น ยังไม่สร้าง Application                        |
| committing | transaction ผ่านครบและมี summary/row receipts                          | committed                   | ทุกแถวพร้อม audit/outbox success ใน transactionเดียว                          |
| committing | rollback ยืนยันแล้ว                                                    | failed                      | ไม่มี Person/Candidate/Application/receipt/success event ของ transactionนั้น  |
| failed     | retry transient ใช้ immutable intent/keyเดิม + ตรวจ current facts ใหม่ | committing                  | ไม่ใช้ผล eligibility ที่ cache ไว้                                            |
| failed     | facts/rules/file/report เปลี่ยนหรือหมดอายุ                             | failed / NEEDS_REVALIDATION | runใหม่และintentรุ่นใหม่/keyใหม่หลังยกเลิก intentเก่า ไม่มี mutation registry |
| committed  | key/pins เดิมและมี current read permission                             | committed                   | คืน receipt เดิมแม้ช่วงสมัครปิดแล้ว ไม่สร้างซ้ำ                               |
| ใด ๆ       | keyเดิมแต่ payloadต่าง                                                 | ไม่เปลี่ยน                  | 409/IDEMPOTENCY_CONFLICT                                                      |

กรณี networkขาดหลัง SQL COMMIT ต้องค้น durable summary/receipt ก่อนสรุปว่า failed; ไม่เชื่อข้อความใน queue ว่า “สำเร็จ” หาก DBยังไม่บันทึก กรณี processตายก่อน COMMIT DB rollback แต่ stagingอาจค้าง committing ใช้ lease+generation/fencing และ current CAS กู้คืน การ leaseหมดไม่พิสูจน์ว่า rollback ต้องรอ/ตรวจธุรกรรมและ summary ห้าม workerเก่าเขียน failed ทับ committed

Retry serialization/deadlock ทั้ง transaction แบบ bounded ข้อเสนอสูงสุด3attemptsรวมครั้งแรกพร้อม jitter/deadline เมื่อเกินให้failed retryable ห้าม retryเฉพาะแถวหรือทุก23505โดยไม่แยกความขัดแย้ง Retryหลังrollbackตรวจ current facts ใหม่เสมอ ถ้า dryrunpinไม่ตรงต้อง dryrunใหม่ ไม่แทน fingerprintเดิมเอง Success outboxส่งล่าช้าไม่ทำให้ Applicationหายหรือเกิดซ้ำ Consumerตรวจสิทธิ์ตอนส่งและdedupe event ไม่มีการส่งอีเมลจริงในบทนี้

## 5 ผลสำเร็จและหลักฐานตรวจรับ

Private success DTO คืน batch/summary reference, committed_at, จำนวน rows committed, persons created/existing, candidates created/existing, applications created และ row→Application.id/เลขอ้างอิงจริงจาก05 พร้อม state `draft` ตามข้อเสนอทดลอง ไม่รับเลข Application จากไฟล์ ไม่จัด seat/approve/score/publish ไม่สร้าง Enrollment อัตโนมัติ ไม่ใส่ rawเลขบัตร วันเกิด หรือหลักฐานใน notification

ถ้า05กำหนดให้นำเข้าเป็น submitted ต้องมี explicit command, shared submission validation/workflow และ policyรุ่นใหม่ก่อนเปลี่ยน defaultนี้ วันที่มีผล/วันบันทึก/ชื่อสังกัดขณะสมัครเก็บใน ApplicationSnapshot กลาง ไม่ joinชื่อปัจจุบันทับประวัติ กระบวนการแก้หลังสำเร็จใช้ amendmentบท63เมื่อได้รับสั่งและ dependencyพร้อม ไม่ deleteผลสำเร็จเพื่อให้กดนำเข้าอีกครั้ง

ดู [transaction/integration](IMPORT_COMMIT_TRANSACTION.md), [24กรณีทดสอบ](../tests/system09/COMMIT_CASES.md), [fixture PLAN_ONLY](../tests/fixtures/system09/commit-plan.json) เกณฑ์62ทั้งสอง **BLOCKED / NOT RUN** ไม่ใช้เอกสารหรือ JSONแทนผล two-browser/nativePG/workerretry

อ้างอิงเทคนิคที่อ่านรอบ62: [PostgreSQL18 Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html) และ [Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html) สำหรับ whole-transaction retry และ uniqueness ไม่เป็นการรับรอง transaction ของ repositoryนี้หรือกฎรับสมัครทางการ
