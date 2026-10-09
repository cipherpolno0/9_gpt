# ตรวจรับระบบ 8 — สารบรรณและเอกสารข้ามระบบ

รุ่นเอกสาร 0.1 | 8 ตุลาคม 2569 (2026-10-08) | BLOCKED / PLAN_ONLY

อ้าง [MASTER](../00_MASTER_PROMPT.md), [BLUEPRINT](../BLUEPRINT.md), [test specifications](../tests/system08/ACCEPTANCE_CASES.md), [fixture](../tests/fixtures/system08/coverage-plan.json), [คู่มือ](MANUAL_EOFFICE.md) และ [TRACEABILITY](TRACEABILITY.md)

## สิ่งที่ตรวจพบจริง

ตรวจต่อจาก commit `bc3796e` บท53–57 ทั้งหมด BLOCKED และส่งมอบ contracts เท่านั้น โฟลเดอร์ `src/modules/correspondence` มี README ไม่มีบริการหรือหน้าสารบรรณ `src/modules/files` และ `src/modules/workflow` ยังไม่มี Prisma core19 models/213scalarfields มี Document แบบ METADATA_ONLY ไม่มี FileVersion/record ACL/Auth grants/Correspondence/StepDecision/register counter/receipt/approval evidence/outbox consumer จริง Worker เพียงตรวจ DB/Redis ไม่ส่งหนังสือ

รอบ58 `corepack pnpm test` ผ่าน17ข้อของส่วนกลาง (bootstrapปิดworkspace403/no-store, local service/database safety, วันไทย, โครงโครงการและแพ็กเกจ) ไม่ใช่ E2E ระบบ8 `corepack pnpm db:test` exit1; Docker/PostgreSQL tools/socketไม่พบ TCP127.0.0.1:5432/5546connect_ex111 ไม่เปิดproductionหรือใช้WASM/PGliteเป็น nativeacceptance ไม่อ่านค่าcredential

ยังทำตัวอย่างที่ “อ้างไฟล์กลางจริง” ไม่ได้: Document metadata ไม่มี FileVersion/object/hash/scan/ACL หรือคำตัดสินธุรกิจที่อ้างย้อนจริง การใส่รหัสใน fixture ไม่สร้าง FK หรือไฟล์ใน Storage งาน58ส่งมอบ test specifications และข้อมูลสมมติครบ พร้อมคู่มือเสนอ ไม่ส่งมอบ executable E2E ที่เรียก API ไม่มีอยู่จริง ทั้ง30กรณี P58-01–30/เกณฑ์58-01/02 NOT RUN ไม่มีactualfile/decision/delivery/receipt

## Dependencies และ gate ก่อนเริ่ม E2E

| บท/ส่วนกลาง    | สิ่งที่ต้องมีและตรวจผ่านจริง                                                                                    | สถานะรอบ58                       |
| -------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| 53             | Correspondence/RecordVersion/register namespace/counter/unique/VOID history                                     | BLOCKED ไม่มีบริการ              |
| 54             | draft/revision/review/approved snapshot/dispatch permit/preview sanitation                                      | BLOCKED ไม่มีบริการ              |
| 55             | recipient-context snapshot/routing/inbox/outbox/receipt/task/reminder/lease                                     | BLOCKED ไม่มีบริการ              |
| 56             | current record-source-file ACL/scan/retention/hold/disclosure/destruction guards                                | BLOCKED ไม่มีบริการ              |
| 57             | approval evidence ตรึงรุ่น/authority และ SIGNING_NOT_CONFIGURED ที่คืนจาก server                                | BLOCKED ไม่มีบริการ              |
| 07/08/10/11/06 | บัญชีกลาง/current grants/revocable session/FileVersion/scan/privateStorage/sharedworkflow/audit/outbox/nativeDB | BLOCKED                          |
| ระบบ1/4/6/7    | คำสั่งหรือรายการจริงในฐานทดลองพร้อม source decision/version/central file FK                                     | BLOCKED ตัวอย่างเป็น descriptors |

## ชุดทดสอบและการเตรียมข้อมูล

ใช้ TEST_ เท่านั้น ไม่มีบุคคลจริงหรือเลขทะเบียนทางการ มีผู้สร้าง ผู้ตรวจ ผู้อนุมัติคนละบัญชี บุคคลหนึ่งบัญชีมีสองหน้าที่ในสองหน่วย และผู้รับอีกคน กลุ่มผู้รับเพิ่มสมาชิกหลังเวลาส่ง รหัสเหมือนชื่อให้แยก Person ID/Organization/context ไม่สร้าง login อีกชุด

Fixture มี4ตัวอย่างข้ามระบบ แต่ละตัวอย่างมี input V1 กับ correction V2 รวม8 file descriptors ข้อความและ SHA256 เป็น checksum ของข้อมูลสมมติเท่านั้น actual_file_version_ref/source_decision_ref/record_ref/storage_ref ทั้งหมด NULL ไม่มีไฟล์อัปโหลดหรือคำสั่งมีผลจริง ระยะหน้าที่/receipt/retention ในข้อมูลทดลองไม่เป็นนโยบายทางการ

| ตัวอย่าง                | Source ที่ต้องได้จริงก่อนรัน                                    | การเชื่อมสารบรรณที่คาดหวัง                                                             | ผลข้างเคียงที่ต้องห้าม                              |
| ----------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------- |
| TEST_01_MOVE            | คำสั่งย้ายระบบ1/คำอนุมัติ/วันมีผล/เอกสารกลางรุ่นV1              | source version+decision → Correspondence/RecordVersion → exact FileVersion V1 เดียวกัน | เปิดหรือส่งหนังสือไม่ย้าย Person/RoleAssignment เอง |
| TEST_04_OPEN_CENTER     | คำสั่งเปิดสนามระบบ4/คำตัดสิน/activation วันที่อนาคต             | อ้างคำสั่งและไฟล์รุ่นที่ source อนุมัติ; read-as-of แยกจากเวลาบันทึก                   | ไม่เปิดสนามก่อนวันจริงจากการลงทะเบียน/ack           |
| TEST_06_BUDGET_APPROVAL | ใบอนุมัติงบระบบ6/ledger event/decision+evidenceรุ่นV1           | source decision กับ e-office review decision เป็นคนละรายการที่อ้างกัน                  | เปิด/ปิดเรื่อง/ส่งซ้ำไม่จัดสรรหรือจองงบซ้ำ          |
| TEST_07_GOODS_RECEIPT   | รับพัสดุระบบ7/inspection/receipt/order reference/decisionรุ่นV1 | ไฟล์ตรวจรับกลางเดิม พร้อมเวลารับและเวลาบันทึก                                          | ไม่จ่ายเงิน/เพิ่มstockอีกครั้งจากการเปิดหนังสือ     |

ไม่ใช้ e-office approval แทนอำนาจ source approval แต่ละระบบ และไม่คัดลอกไฟล์เพื่อเพิ่มสิทธิ์ Link ระหว่างระบบต้องตรวจ current ACL ทุกต้นทาง เมื่อ source แก้ V2 เรื่องเก่าคง V1/decisionเดิม มี correction relation ไปเรื่องใหม่ ไม่แก้ Document.latest แล้วแทน V1 เงียบ ๆ

## ขั้นตอนรันที่ต้องทำเมื่อ dependencies พร้อม

1. เปิดฐานทดลอง PostgreSQL/Auth/Storage/scan/worker ในสภาพแวดล้อมที่ตรวจได้ ใช้ migration/restricted runtime role/RLS ตามส่วนกลาง บันทึกรุ่นโค้ด schema migration policy configuration และข้อมูลเริ่มต้น ไม่ใช้ข้อมูลจริง
2. สร้าง source examples ทั้ง4ด้วย service เจ้าของ เก็บ actual IDs ของ source version/decision/effective-recorded/document/file object version/hash/CLEAN และ baselineจำนวนธุรกรรม source ก่อนทำสารบรรณ
3. ผู้สร้างร่างหนังสือส่งแบบทดลอง แนบ exact FileVersion เลือกผู้รับ ID+context บันทึก/reload ส่งตรวจ ผู้ตรวจส่งกลับพร้อมเหตุผล ผู้สร้างแก้revisionเดิมแล้วส่งใหม่ ผู้ตรวจ/ผู้อนุมัติคนละคนอ่านรุ่นเดียวกับที่จะตัดสิน
4. อนุมัติแล้วออกเลขตาม policy ที่ยืนยันของประเภทหนังสือส่ง ทดสอบคนแข่ง/retry/VOID และแยกnamespaceหน่วยงาน/ปีทะเบียน/ประเภท ไม่ใช้ปีการศึกษาหรือปีงบเป็นปีทะเบียนโดยอัตโนมัติ หนังสือรับ/ภายใน/เวียนตรวจลำดับตาม policy ของตน ไม่สมมติว่าต้องมีลำดับเดียวกันทุกประเภท
5. ยืนยันรายชื่อก่อนส่ง direct+group ที่ซ้ำ context เดียวรวมหนึ่ง endpoint แต่คนเดียวสองหน้าที่มี endpoint แยก กลุ่ม snapshot ณ เวลาส่งไม่เพิ่มผู้รับเมื่อสมาชิกใหม่เข้าทีหลัง Workerตรวจสิทธิ์ปัจจุบันก่อนสร้างกล่องรับ
6. เก็บ queued/delivered/acknowledged/assigned/completed เป็นสถานะคนละความหมาย เปิดnotificationไม่ack ผู้รับกดยืนยันแบบมีหลักฐานเวลา server; รับทราบหน้าที่Aไม่แทนB มอบหมายผู้มีสิทธิ์ครบ มิฉะนั้น pending_access โดยไม่เผยไฟล์ลับ
7. ปิดเรื่องด้วย action/เหตุผล/หลักฐานตาม closure policy เมื่อเงื่อนไขค้างครบ ไม่ปิดจาก GET/all-delivered/all-notification-seen/taskเดียวเสร็จโดยอัตโนมัติ ปิดเรื่องไม่VOIDเลข ไม่ลบหลักฐาน ไม่ยกเลิกlegalhold และไม่เพิ่มpublicvisibility
8. ค้น/export/preview/download/print/thumbnail/fulltext ภายใต้หน้าที่ปัจจุบัน และตรวจตารางสิทธิ์ก่อน/ตรง/หลังวันพ้นหน้าที่ อ่าน history ไม่ใช่ใช้สิทธิ์เก่าที่ยุติแล้ว ทดลอง explicit historical grant ใหม่เฉพาะเมื่อ policy/source/file อนุญาตจริง
9. ทำ fault injection ก่อนcommit/หลังcommit/ระหว่างworkerกับoutbox/หลังส่งก่อนreceipt ตรวจ durable idempotency/leasefence/reconcileและsource countsเดิม ไม่แปล delivered ว่าผู้รับอ่านหรือรับทราบ และไม่ทำการส่งอีเมลจริงที่ยังไม่ได้ตั้งค่า
10. บันทึกหลักฐานทุกรายการตามตาราง test specifications พร้อม SQL observations/HTTP DTO/worker events/ภาพUIที่ไม่เผยsecretหรือPII ให้เจ้าหน้าที่ทบทวนผลเทียบpolicy แยก software result จาก official signoff

ยังไม่ได้ทำขั้นตอน1–10กับระบบ8จริง รายการนี้เป็นคำแนะนำรันภายหลัง ไม่มีคำสั่ง E2E npm/Playwright ที่สร้างขึ้นลอย ๆ

## เกณฑ์ตรวจรับและหลักฐาน

| เกณฑ์                                                 | กรณี                  | หลักฐานต้องได้จริง                                                                                                       | สถานะ             |
| ----------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------- |
| 58-01 คนเดียวหลายหน้าที่ ไม่มีสิทธิ์เก่าโดยปริยาย     | P58-06/08/09/12–16/19 | currentrole/context/time/source-filepolicy negativeทุกช่องทางและworker; receiptเก่าคงตรวจได้เฉพาะผู้มีสิทธิ์             | BLOCKED / NOT RUN |
| 58-02 ทุกตัวอย่างอ้างfile version+decisionย้อนหลังได้ | P58-18/21/23–29       | FK/object bytes/hash/decision IDs/review cycle/approval evidence/source event/record versionและcorrection chainจริงทั้ง4 | BLOCKED / NOT RUN |

หลักฐานรันต้องมี run_id/commit/schema/migration/policy/config version/environment/mock dataset IDs/test case/expected/actual/status/reproduction steps/authorized observer/recorded_at/artifact refs ผู้รันจริงไม่ใช้รหัสเจ้าของ O08 แทนชื่อผู้ตรวจรับจริง actual=NULL ไม่เป็นPASS ภาพหน้าจออย่างเดียวไม่พิสูจน์transactionหรือStorage ACL

## การรับรองนโยบายและคู่มือ

O08/C03 ต้องตรวจเลขทะเบียน/ประเภท/ปี/อำนาจ/วิธีรับทราบ/ปิดเรื่อง/ชั้นความลับ/เผยแพร่/retention/hold/disclosure/signing และsource owners O01/O04/O06/O07ตรวจผลกระทบ Q005/Q006/Q009/Q016/Q025ยังTO VERIFY/Needs Legal Review owner signoff=NULL ไม่ใส่ชื่อหรือผลรับรองที่ไม่มี การผ่านsoftware testsไม่รับรองข้อกำหนดสารบรรณหรือกฎหมาย

คู่มือเสนอใน [MANUAL_EOFFICE](MANUAL_EOFFICE.md) ยังไม่มีหน้าระบบจริงให้ผู้ใช้ทดลอง ขั้นตอนส่งล้มเหลว/retry/revoke/แก้รุ่นใหม่ไม่ทำให้ธุรกรรม source ใหม่ การรับทราบและคำตัดสินในอดีตคงอยู่ ไม่ทำลายเพื่อแก้สถานะค้าง

## คำสั่งและรุ่นรอบ58

| คำสั่ง                                                                                                                                                                                   | ผล                     | ขอบเขต                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------- |
| `corepack pnpm test`                                                                                                                                                                     | exit0 ผ่าน17/17        | ส่วนกลางเดิม ไม่ใช่P58/E2E            |
| `corepack pnpm db:test`                                                                                                                                                                  | exit1                  | native core DBไม่พร้อม ไม่มีP58runner |
| `python -m json.tool tests/fixtures/system08/coverage-plan.json`                                                                                                                         | exit0 ตรวจsyntaxแล้ว   | ไม่ตรวจdatabase/Auth/Storage          |
| `corepack pnpm exec prettier --ignore-path /dev/null --check docs/UAT_SYSTEM_08.md docs/MANUAL_EOFFICE.md tests/system08/ACCEPTANCE_CASES.md tests/fixtures/system08/coverage-plan.json` | ผลตรวจบันทึกในPROGRESS | รูปแบบเอกสาร ไม่E2E                   |

package/schema0.6.0 PrismaCLI/client/adapter7.10.0 Next16.3.8 pnpm11.28.2 lockfile9 Sarabun5.3.0 core19/213 migrationเดียว `20261003130000_core_foundation` คงเดิม ไม่มีschema/migration/RLS/seed/runtime/worker/package/lockหรือexecutabletestใหม่ ไม่เริ่ม59 ต้องแก้53–57/ส่วนกลาง/nativeDB/sourceexamplesจริงและรันP58ก่อนผ่าน [MASTERข้อ2](../00_MASTER_PROMPT.md) ยังระบุ “ก่อนเริ่มเขียนโค้ด สรุปแผนเป็นไทยไม่เกิน 10 บรรทัดแล้วรอคำว่า ‘ตกลง’” รอบนี้เตรียม specifications/คู่มือภายใต้ blocker ไม่สร้างบริการทดแทนหรือ test ที่แสดงผ่านจากmock engine
