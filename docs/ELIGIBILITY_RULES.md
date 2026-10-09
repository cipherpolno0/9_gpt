# กฎคุณสมบัติผู้สมัคร — บท 36

รุ่น 0.1 | 5 ตุลาคม 2569 (2026-10-05) เวลาไทย | source `47632bf` | **Proposal / BLOCKED — ยังไม่มี eligibility services จริง**

บท35ยังไม่ผ่านตาม [APPLICATION_SCHEMA](APPLICATION_SCHEMA.md) ไม่มี Candidate, Application, ApplicationSnapshot, EligibilityRuleVersion, ExamSession หรือ FormTemplateRegistry ใน Prisma และยังไม่มี Auth/DAL/Workflow/FileVersion ที่จำเป็น เอกสารนี้เป็นสัญญาการพัฒนาต่อ ไม่ใช่กฎทางการหรือบริการที่ผ่านทดสอบแล้ว ดู [ROSTER_WORKSPACE](ROSTER_WORKSPACE.md) และ [APPLICATION_EXPORT](APPLICATION_EXPORT.md)

## 1 แนวคิดทีละขั้น

1. ตัวตนผู้สมัครมาจาก Person และ Candidate กลาง การมีชื่อในบัญชีรายชื่อไม่แปลว่ามีคุณสมบัติสอบผ่าน
2. กฎมีรุ่น ระบุประเภท ระดับ ช่วงชั้น รอบ วันมีผล และหลักฐานที่เจ้าของงานรับรอง ไม่ใช้วันสอบหรือเกณฑ์จากปีก่อนแทนปีนี้
3. ผลตรวจเป็นหลักฐานว่าใช้ข้อเท็จจริงและกฎรุ่นใด ณ เวลาใด การตรวจผ่านในหน้าจอไม่ใช่ใบอนุญาตส่งคำขอได้ตลอดไป
4. เมื่อส่งหรืออนุมัติ backend ต้องตรวจสิทธิ์ ข้อมูล หลักฐาน และเงื่อนไขปัจจุบันซ้ำใน transaction เดียวกับ workflow/receipt/audit/outbox
5. ประโยคเดิมหรือผลทางการต้องอ้างแหล่งที่ยืนยัน คะแนนแบบฝึกหัดระบบ3ไม่ใช่ผลสอบทางการระบบ5

## 2 สัญญารุ่นกฎที่เสนอ

ต่อ EligibilityRuleVersion ของ logical04 และ PolicyVersion กลาง06 ไม่สร้างกฎใน importer อีกชุด แบบ04ยังผูก session_level_id; ต้องปรับ typed binding ให้ตรง SessionOffering/ช่วงชั้นตามบท21/35ก่อน migration ไม่แก้ทั้ง128ตารางจากเอกสารนี้

| กลุ่มฟิลด์เสนอ    | สิ่งที่ต้องเก็บและตรวจ                                                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Identity/context  | UUID, policy_version_id, version/code, ExamType/ExamLevel/SessionOffering bindings, ปี/ช่วงชั้น/purpose ที่รุ่นนั้นครอบคลุม                            |
| Provenance        | source Document/FileVersion/hash, หน่วยออก รุ่นเอกสาร วันที่ประกาศ/วันมีผล ผู้สร้าง ผู้ตรวจคนละคน วันรับรอง และ recorded_at                            |
| Verification      | mode DEMO/OFFICIAL แยกจาก verification_status; TO_VERIFY ไม่ใช้เป็นกฎอนุมัติทางการ lifecycle ร่าง/ตรวจ/เผยแพร่/ถอนต้องผ่านอำนาจที่ยืนยัน               |
| Predicates        | เงื่อนไขชนิดข้อมูลที่ validate ได้เกี่ยวกับประเภท/ระดับ/ประโยคเดิม/ช่วงชั้น ห้ามใช้ script หรือ expression ที่ client สั่งรันได้                       |
| Windows           | registration open/close instants, timezone Asia/Bangkok, วันที่อ้างอิงคุณสมบัติ และ cutoff policy ที่รับรอง ใช้ช่วง [open, close) เป็นข้อเสนอให้ยืนยัน |
| Evidence/identity | requirement codes และทางเลือกหลักฐานที่รับรอง แยกจำเป็น/มีเงื่อนไข/ทางเลือก จำนวนและการตรวจต้อง configuration ไม่บังคับเลขบัตรไทยกับทุกคน              |
| Evaluation pins   | rule/source versions, snapshot revision, fact/evidence refs, checked_at, rule hash และ reason codes; ไม่เก็บไฟล์หรือชุดข้อมูลส่วนตัวเต็มใน audit       |

รุ่นที่เผยแพร่แล้วแก้สาระเป็นรุ่นใหม่ เก็บรุ่นเก่าและผลตรวจเดิมแบบ immutable การเลือกใช้กฎเมื่อ returned/resubmit หรืออนุมัติหลังเปลี่ยนกฎต้องมีนโยบายที่รับรอง ไม่เลือกกฎเก่าที่ผ่อนปรนเอง เมื่อรุ่นถูกถอนต้องตรวจ current withdrawal policy อีกครั้ง ไม่ถือ hash ที่เคยผ่านเป็นสิทธิ์ถาวร

## 3 ผลตรวจและการส่งอนุมัติที่เสนอ

| Code เสนอ           | ความหมาย                                            | การทำงานต่อ                                                    |
| ------------------- | --------------------------------------------------- | -------------------------------------------------------------- |
| ELIGIBLE_TO_ATTEMPT | ข้อมูลที่มีสิทธิ์ตรวจผ่านเงื่อนไขของรุ่น ณ เวลานี้  | ยังต้องตรวจซ้ำใน command; ไม่ใช่ approval/seat/result          |
| NOT_OPEN            | ยังไม่ถึงเวลาเปิดสมัครตาม server clock              | เก็บร่างได้เมื่อมีสิทธิ์ แต่ไม่ส่ง                             |
| CLOSED              | ถึงเวลาปิดหรือหลังปิด                               | ไม่ส่งหรือจองที่นั่งจากผลตรวจเก่า                              |
| INELIGIBLE          | ข้อเท็จจริงที่ยืนยันขัดเงื่อนไขรุ่น                 | ไม่ส่ง; แสดงเฉพาะเหตุผลที่ field policy อนุญาต                 |
| EVIDENCE_REQUIRED   | หลักฐานที่กฎกำหนดขาด/ยังไม่ผ่าน/ยังไม่ยืนยัน        | ไม่ส่ง; บอก requirement code และวิธีแก้ที่ไม่เผยไฟล์ของผู้อื่น |
| NOT_READY           | ขาดกฎ แหล่งยืนยัน context หรือหลักฐานสำหรับวินิจฉัย | ไม่ตีความ unknown เป็นผ่าน และไม่อนุมัติทางการ                 |

การไม่ผ่าน account/action/resource/scope ให้ปฏิเสธตาม [REQUIREMENTS](REQUIREMENTS.md) ก่อนคืนผลตรวจ ไม่มี eligibility reason หรือ existence ของผู้สมัครนอกพื้นที่ผ่าน error ผลตรวจนี้ยังไม่มี enum/API จริง

command ต้อง resolve Person/Candidate/Enrollment/Organization/year/type/level/stage/session/center จาก FK ฝั่ง server ไม่เชื่อ org_id, eligible, verified, approved, clock หรือ prior_score จาก client ใช้ application service เดียวกับระบบ9 ตรวจ expected revision/current rule/evidence bindings/ช่วงมอบหมาย/maker-checker แล้ว seal snapshot และเปลี่ยน workflow ตาม [APPLICATION_STATES](APPLICATION_STATES.md) แบบ atomic

เวลาเก็บเป็น Gregorian/UTC instants และแสดง พ.ศ. ใช้ Asia/Bangkok แปลง calendar เป็น instant ก่อนตรวจ cutoff; ไม่นำปี label มาเดาวันจริง ลำดับ lock/CAS ต้องร่วมกับ writers ที่ปิดรอบหรือเปลี่ยนกฎและ capacity ตาม [EXAM_SESSIONS](EXAM_SESSIONS.md) ระบุ linearization point ของเวลาใน transaction การเริ่ม worker ก่อนปิดรอบไม่ให้สิทธิ์ commit หลัง deadline โดยอัตโนมัติ หากนโยบายยกเว้นมีจริงต้องมีคำอนุมัติและหลักฐาน ไม่สร้าง override จากปุ่มผู้ดูแลเทคนิค

## 4 ชื่อเดิม ประโยคเดิม และตัวตนที่ไม่มีบัตรไทย

| ข้อมูล                     | วิธีตรวจที่เสนอ                                                                                                   | สิ่งที่ห้ามสรุปเอง                                                               |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| ชื่อปัจจุบัน/ชื่อเดิม/ฉายา | อ้าง PersonNameHistory และหลักฐานการเชื่อมชื่อที่เจ้าหน้าที่มีสิทธิ์ตรวจ ตรึงชื่อขณะสมัครใน snapshot              | ชื่อคล้ายกันไม่ใช่บุคคลเดียวกัน ไม่รวม Person อัตโนมัติ                          |
| ประโยคเดิม                 | อ้างผลสอบทางการที่รับรองหรือหลักฐานตามช่องทางที่นโยบายยอมรับ มีปี/ประเภท/ระดับ/แหล่งชัด                           | คะแนนฝึกหรือข้อความใน Excel ไม่แทนผลสอบที่ตรวจแล้ว ไม่เดาเกณฑ์เลื่อนชั้น         |
| ไม่มีบัตรไทย               | ใช้ verified identity reference กลางและทางเลือกหลักฐานที่เจ้าของงานรับรอง; ถ้ากฎทางเลือกยังไม่ยืนยันให้ NOT_READY | ไม่บังคับเลข13หลัก ไม่เติมศูนย์หรือเลขปลอม ไม่อนุมานสัญชาติจากเอกสาร/ชื่อ        |
| หลักฐาน                    | ใช้ Document/FileVersion กลาง ต้องเป็นของเรื่อง/คนที่ถูกต้อง ผ่าน scan/ACL และการตรวจเนื้อหาตามหน้าที่            | scan CLEAN ไม่เท่ากับหลักฐานแท้หรือคุณสมบัติผ่าน METADATA_ONLY ไม่ใช่ไฟล์หลักฐาน |

ไม่เพิ่มเลขเอกสารหรือไฟล์ผู้สมัครจริงใน repository การเชื่อม User–Person ต้องผ่านขั้นยืนยันกลาง ไม่ใช้การกรอกเลขเอกสารใน roster เป็นการเชื่อมบัญชีเอง ประเภทหลักฐานทางเลือก การจับคู่หมายเหตุ และอำนาจยกเว้นยัง Q004/Q006/Q008/Q025 TO VERIFY ไม่รับรองจากความจำหรือชื่อเมนู

## 5 ทดลองด้วยกฎสมมติเมื่อ runtime พร้อม

Proposal ใช้ namespace `DEMO_ELIGIBILITY_V1` และข้อมูลชื่อ “ผู้สมัครสมมติ ก01”, reference “DEMO-REF-000001” ไม่มีบัตร เบอร์ หรือที่อยู่จริง ข้อกำหนดสาธิตใช้ context ตรงกัน ช่วงสมัครสมมติ และหลักฐานสาธิตที่ระบุชัด ไม่ใส่คะแนนผ่าน อายุ หรือประโยคที่ต้องได้ก่อนเป็นกฎทางการ

fixture วันเปิดสมมติ `2026-10-06T00:00:00+07:00` ปิด `2026-10-07T00:00:00+07:00` มีไว้ทดสอบขอบเขตเวลาเท่านั้น ไม่ใช่ปฏิทินสอบปี2569 ไม่ยกระดับ DEMO เป็น VERIFIED/OFFICIAL เมื่อทดสอบผ่าน บทนี้ยังไม่มี configuration/seed/service ที่รันชุดนี้

## 6 แผนตรวจรับ — P36 ทุกกรณี NOT RUN

| Case ref | สิ่งที่จะทดสอบเมื่อ dependency พร้อม                                      | หลักฐานที่ต้องได้                                                                  |
| -------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| P36-01   | ก่อนเปิด/ตรงเปิด/ก่อนปิด/ตรงปิดใกล้เที่ยงคืนประเทศไทย                     | server cutoff [open,close) ถูกต้อง ไม่ใช้วัน UTC/client clock                      |
| P36-02   | clock ปลอม ผลตรวจเก่า worker ล่าช้า ปิดรอบแข่ง submit                     | command ตรวจปัจจุบัน atomic; ไม่มีใบส่งสำเร็จหรือที่นั่งบางส่วนหลัง deny           |
| P36-03   | ผิดประเภท/ระดับ/ช่วงชั้น ประโยคเดิมผิด หรือแหล่งผลยังไม่รับรอง            | INELIGIBLE/NOT_READY ไม่ส่ง; คะแนนฝึกไม่แทนผลทางการ                                |
| P36-04   | ขาดหลักฐาน quarantine/rejected/ผิดเจ้าของ/scanผ่านแต่ยังไม่ตรวจเนื้อหา    | EVIDENCE_REQUIRED/NOT_READY ไม่มี preview/download/submit ที่ลัด ACL               |
| P36-05   | ไม่มีบัตรไทย หลักฐานทางเลือกที่ DEMO policy รับรอง และไม่มีทางเลือกยืนยัน | เส้นทางที่รับรองใช้ได้โดยไม่เลข13หลัก; unknown ไม่ผ่านเอง                          |
| P36-06   | ชื่อเดิม/เปลี่ยนชื่อหลังสมัคร หลักฐานเชื่อมชื่อไม่ตรง                     | พบคนเดิมเมื่อมีสิทธิ์ snapshot เดิมคงอยู่ คู่คล้ายส่งตรวจไม่ mergeเอง              |
| P36-07   | คนซ้ำจากชื่อคล้ายและ business key ซ้ำจากเว็บ/Excel retry                  | suggestion แยกจาก duplicate unique; Candidate/Application ไม่เกิดซ้ำ               |
| P36-08   | สลับ school/center/application ID ใน URL/body/query/list/count/export     | ไม่มีแถว/จำนวน/เหตุผล/ไฟล์นอก scope ใช้ current DAL เดียวกัน                       |
| P36-09   | draft/returned แก้พร้อมกันและพยายามแก้ submitted/approved/approveตนเอง    | CAS conflict เข้าใจได้ ไม่มีแก้ sealed snapshot หรือข้าม maker-checker             |
| P36-10   | เปลี่ยน/ถอน rule/template/evidence version ขณะ resubmit/approve/export    | pins เดิมอยู่ครบ ตรวจ policy ปัจจุบัน ไม่มี latest join/TO_VERIFY official output  |
| P36-11   | PDF ตัวอย่างชื่อไทย สระ/วรรณยุกต์ เลขอ้างอิง หลายหน้า A4                  | ตรวจไฟล์จริงและภาพทุกหน้า ฟอนต์ครบ อ่านไม่แตก/ตัด/ทับ; ไม่เพียง text extraction    |
| P36-12   | Excel ภาษาไทย เลขศูนย์นำหน้า/ยาวเกิน15หลัก และค่าขึ้นต้น = + - @          | typed strings อ่านกลับตรง ไม่มี formulas/macros/external links/hidden private data |
| P36-13   | ถอน grant/session หลัง enqueue/render ก่อน download และ retry export      | current ACL/worker/gateway ตรวจซ้ำ ไฟล์ private manifest/hash เดิมไม่รั่ว          |
| P36-14   | ค้นไทยหลายเงื่อนไข pagination keyboard/status/error ที่375/768/1024/1440  | focus/labels/empty state/ข้อความสถานะใช้ได้ ไม่สีอย่างเดียวหรือ public cache       |

เกณฑ์36-01ผูกP36-01–05/09/10; เกณฑ์36-02ผูกP36-08/10–13 ทุกกรณีและทั้งสองเกณฑ์ **BLOCKED / NOT RUN** การทดสอบ date helper เดิมไม่ใช่ eligibility/API/export ผ่าน

## 7 Versions คำสั่ง และผลจริง

app/schema0.6.0, Prisma7.10.0, Next16.3.8, pnpm11.28.2, lockfile9, Sarabun5.3.0; 19 core models และ migrationเดียว `20261003130000_core_foundation` SHA256 `04a149fcd349f0ac3f1b5929cfcf571f8b0880541e84a40ad929054b67d72756` ไม่เปลี่ยน ไม่เพิ่ม package/schema/migration/runtime/seed หรือแตะ production

```bash
corepack pnpm db:test
node --import tsx --test tests/dates.test.ts
```

db:test exit1 safe error ไม่แยกสาเหตุ env/connection ไม่แสดง credentials; Python read-only probe พบ Docker CLI/socket ไม่มี และ loopback5432/5546 ConnectionRefusedError date tests ผ่าน3/3 exit0ไม่ skip ตรวจ helper วันไทย/cutoff/วันที่กำกวมเท่านั้น

ตรวจรับบท35และต้นทาง DB-06/Q027, DOCKER-05/Q026, Auth/DAL/FileVersion/workflow/ExamSession ก่อน implementation36 ไม่ถามยืนยันแผน07ที่อนุมัติแล้วซ้ำ ไม่มี executable P36/eligibility/roster/export/API/import-worker/browser ใหม่ ไม่รัน typecheck/lint/build/ชุดrootunitทั้งหมด (`pnpm test`)/nativeintegration ในรอบ36 บท37ยังไม่เริ่ม ไม่เดาขอบเขต ไม่ push/deploy

## 8 ผลตรวจเอกสารและขอบเขตของหลักฐาน

Pythoninlineตรวจ14case IDs, 6result codes, 6export steps, 6operations, 29local linksใน3สัญญาใหม่และ2README, traceabilityหัวข้อ30, DEC-152–155, version headers4ไฟล์ และรายการเปลี่ยน9ไฟล์ผ่าน ตรวจ19models/1migration/checksumเดิมและschema/seed/package/lock/logical04/workerไม่เปลี่ยนผ่าน พบและแก้การอ้างFILE_STORAGEที่ยังไม่มีเป็นลิงก์PROGRESS ไม่สร้างบริการไฟล์โดยอ้างจากเอกสาร

```bash
corepack pnpm exec prettier --ignore-path /dev/null --check docs/ELIGIBILITY_RULES.md docs/ROSTER_WORKSPACE.md docs/APPLICATION_EXPORT.md src/modules/exams/README.md src/modules/exam-imports/README.md
git diff --check
git diff --cached --check
corepack pnpm secrets:check
```

Prettier/whitespace/secretscheckผ่านตามขอบเขตตัวตรวจ หลังแก้blank EOFและลิงก์ที่ขาด เป็นdocument/inventory checks ไม่ใช่14กรณีP36ทำงานแล้ว ไม่มีการสร้างหรือเปิดไฟล์PDFExcelจริง เกณฑ์36ทั้งสองยังBLOCKED
