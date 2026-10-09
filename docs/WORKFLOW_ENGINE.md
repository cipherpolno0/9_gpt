# Workflow กลาง — แบบเตรียมบท 11

วันที่ 3 ตุลาคม 2569 | รุ่นเอกสาร 0.1 | **Proposal / BLOCKED — ยังไม่มี implementation หรือผลทดสอบบท11**

พรอมป์ต์บท11กำหนดให้ผ่านบท07และบท10ก่อน ปัจจุบันบท07ยังไม่มี authz/DAL และบท10ยังไม่มี FileVersion/scan/ACL จึงยังเริ่มบริการ workflow หรือ outbox worker ไม่ได้ เอกสารนี้เตรียมสัญญาและเกณฑ์ทดสอบ ไม่ใช่ Prisma schema, migration หรือบริการที่เรียกใช้งานได้

## 1 แนวคิดทีละขั้น

1. Workflow บอกว่าเรื่องอยู่ขั้นไหน ใครมีหน้าที่ตรวจ และใช้กฎรุ่นใด แต่โมดูลเจ้าของเรื่องยังตรวจเงื่อนไขของตน เช่น สถานะหน่วยงาน หน้าต่างสมัคร และงบคงเหลือ
2. คำว่า approved หมายถึงคำขอผ่านการอนุมัติ ส่วน effective หมายถึงโมดูลเจ้าของได้เปลี่ยนทะเบียนจริงแล้ว ทั้งสองเวลาอาจต่างกัน
3. Optimistic version คือเลขรุ่นที่ผู้ตรวจอ่านไว้ หากข้อมูลเปลี่ยนก่อนกดอนุมัติให้หยุดด้วย conflict เพื่ออ่านและตรวจใหม่ ไม่ทับงานคนอื่น
4. Outbox คือรายการงานที่บันทึกในฐานข้อมูลพร้อมธุรกรรมหลัก เมื่อ worker หยุด รายการยังอยู่และนำกลับมาทำได้ การรับงานซ้ำต้องไม่สร้างผลแจ้งเตือนซ้ำ

## 2 ฐานเดิมและ dependency

| รายการ | สถานะจริง |
| --- | --- |
| schema / migration | core0.6.0, Prisma7.10.0, 19 models, 213 scalar fields, migration1ไฟล์เดิม |
| audit | AuditLog map เป็น private.audit_logs; trigger เก็บชื่อฟิลด์ actor/correlation ใน transaction เดียวกับ write |
| row_version | มีในข้อมูลกลางบางตารางและ trigger เพิ่มรุ่น ยังไม่มี WorkflowInstance |
| authz / session / file ACL | บท07/08/10ยังไม่ได้สร้าง; ServiceActor ใช้ provenance ไม่ใช่บัญชี login |
| worker | SELECT1/RedisPING และรอ ไม่มี outbox consumer |
| PostgreSQL server acceptance | DB-06/Q027ยัง BLOCKED; ผล WASM เดิมไม่พิสูจน์การอนุมัติแข่งหรือ worker recovery |

ต้องปิด DB-06 ตาม [DATABASE ข้อ10](DATABASE.md#10-ตรวจซ้ำก่อนบท07--3-ตุลาคม-2569-เวลาไทย) แล้วตรวจรับ07→08→10ก่อน implementation11 แผนบท07เดิมอนุมัติแล้ว ไม่ต้องขอซ้ำ ส่วนก่อนเขียนโค้ดบท11ต้องมีแผนและการอนุมัติตาม MASTER ข้อ2

## 3 สัญญาข้อมูลที่เสนอ — ยังไม่ใช่ schema

ใช้ UUID, FK ชัดเจน, ชื่อตาราง/คอลัมน์ snake_case และ timestamptz สำหรับเวลา เปิด RLS และใช้ runtime role ที่จำกัด การเพิ่มต้องอยู่ใน migration ใหม่ ไม่แก้ migration core เดิม

| Model / บริการที่เสนอ | ข้อมูลและข้อจำกัดที่ต้องมี |
| --- | --- |
| WorkflowDefinition | ประเภทเรื่อง รุ่นกฎ และขั้นตอนที่ผ่าน validation; unique(type_code, version); รุ่นที่ถูกใช้งานแล้วแก้ไม่ได้ ต้องสร้างรุ่นใหม่ |
| WorkflowInstance | definition FK, resource reference, creator account FK, status, row_version, review_cycle, submitted resource version, effective_at และ recorded_at; สังกัดอ่านจากเจ้าของทรัพยากรฝั่ง server |
| StepDecision | instance/step/review_cycle, reviewer FK, decision, expected_version, เวลา เหตุผลแบบจำกัดความยาว และหลักฐาน FileVersion/hash; unique(instance_id, review_cycle, step_code, reviewer_id) |
| AuditEvent | สัญญาบริการ src/server/audit ที่ใช้ audit_logs กลางเดิม; migration ต้องเพิ่ม actor/เหตุการณ์ธุรกิจที่จำเป็นและรักษา audit รุ่นเก่า ไม่สร้างทะเบียน audit อีกชุด |
| OutboxEvent | event UUID, type/version, resource/instance FK, initiating actor, correlation UUID, dedupe_key, available_at, attempts, status, lease_token/lease_until และ error_code ที่ไม่ใส่ secret; unique(dedupe_key) |
| Notification / DevSinkReceipt | unique(event_id, recipient_account_id, channel); ข้อความขั้นต่ำและ resource reference; sink ทดลองเป็น receipt ในฐานเดียวกัน ไม่มีการส่งอีเมลหรือข้อความออกจริง |

Resource reference ต้อง resolve ผ่าน adapter ที่ลงทะเบียนใน server ตามโมดูลจริง พร้อมตรวจชนิด/การมีอยู่และการเชื่อมเจ้าของใน transaction ห้ามรับชื่อ model, SQL หรือ org_id จาก client เพื่อใช้เป็นสิทธิ์ ต้องเลือก FK หรือ binding ที่ฐาน enforce ได้เมื่อ schema โมดูลพร้อม ไม่ยอมรับ UUID อิสระเป็นหลักฐานการเป็นเจ้าของ

ข้อมูลกฎต้องเป็น configuration ที่ validation ได้ ไม่รับโค้ดให้รัน จำนวนผู้อนุมัติ ขั้นตอน อำนาจ และวงเงินทางการยัง TO VERIFY ใช้กฎสมมติที่ระบุ DEMO เท่านั้น ไม่ให้ผู้ดูแลเทคนิคมีอำนาจอนุมัติธุรกิจอัตโนมัติ

## 4 สถานะและการเปลี่ยน

| จาก | ไป | เงื่อนไขที่เสนอ |
| --- | --- | --- |
| draft | submitted | เจ้าของส่งเรื่องผ่าน DAL; validation ของโมดูลครบ; pin รุ่นกฎ/resource/evidence snapshot |
| submitted | reviewing | ผู้ตรวจที่มีสิทธิ์ปัจจุบันรับตรวจ และไม่ใช่ผู้สร้าง |
| reviewing | returned | บันทึกเหตุผลให้แก้ เก็บ decision รอบเดิมไว้ |
| returned | submitted | แก้ผ่านเจ้าของโมดูล เพิ่ม row_version และ review_cycle แล้วสร้าง snapshot รอบใหม่ ไม่ใช้ decision รอบก่อนอนุมัติรุ่นใหม่ |
| reviewing | approved | ขั้นตอนและผู้มีอำนาจครบตาม configuration; รุ่นข้อมูลและหลักฐานยังตรงที่ตรวจ |
| reviewing | rejected | ผู้มีหน้าที่ปฏิเสธพร้อมเหตุผลตามกฎรุ่นที่ pin |
| draft / submitted / reviewing / returned | cancelled | อำนาจถอนเรื่องและผลข้างเคียงต้องผ่านกฎโมดูล ไม่เป็นสิทธิ์ของทุกคน |
| approved | effective | ถึง effective_at และโมดูลเจ้าของยืนยัน invariants พร้อมเขียนทะเบียน/ประวัติจริงใน transaction |

rejected/cancelled/effective เป็นจบรอบ ไม่เปิดกลับโดยแก้สถานะตรง งานแก้ผลใช้คำขอใหม่ที่อ้างเรื่องเดิม หาก approved ยังทำให้มีผลไม่ได้ ให้คง approved และบันทึกเหตุการณ์/ปัญหา ห้ามแสดงว่า effective ก่อนทะเบียนเปลี่ยนจริง เรื่องที่ไม่เปลี่ยนทะเบียนจบ approved ได้ตามชนิดเรื่อง

## 5 สัญญา transaction และ maker checker

1. ทุก read/mutation/export/API และ job ผ่าน DAL เดียว ตรวจบัญชี action resource scope และช่วงมอบหมายจาก server ห้ามเชื่อ role/org_id ที่ส่งมา
2. ใน transaction อ่านเรื่อง รุ่นข้อมูลเจ้าของ รุ่นกฎ และหลักฐานที่ตรวจผ่าน scan/ACL ของบท10 ต้องตรวจสิทธิ์ซ้ำใน transaction และกำหนดการ serialize การถอนสิทธิ์กับคำสั่งอนุมัติร่วมบท07 สิทธิ์ที่ถอนก่อนเริ่มคำสั่งต้องไม่อนุญาต
3. ปฏิเสธเมื่อ actor เป็นผู้สร้าง แม้ actor มีหลายบทบาทหรือเป็นผู้ดูแล; กฎแต่ละขั้นอาจแยกผู้ตรวจและผู้อนุมัติเพิ่มตาม configuration
4. เปลี่ยนเรื่องด้วยเงื่อนไข id+expected row_version+สถานะเดิม และตรวจ submitted resource version ด้วย หากไม่ตรง คืน HTTP409/รหัส WORKFLOW_CONFLICT โดยไม่สร้าง decision/audit/outbox ที่บอกว่าสำเร็จ ไม่ retry การอนุมัติรุ่นใหม่อัตโนมัติ
5. บันทึก decision, การเปลี่ยนเรื่อง, audit และ outbox ใน transaction เดียว งาน effective ต้องรวมทะเบียน/ประวัติของโมดูลด้วย หากส่วนใดล้มเหลว rollback ทั้งหมด
6. กำหนด command idempotency key ที่ผูก actor/เรื่อง/ชนิดคำสั่ง และ fingerprint ของ payload แบบจำกัดฟิลด์; keyเดิม/payloadเดิมคืน receipt เดิมหลังตรวจสิทธิ์ปัจจุบัน keyเดิม/payloadต่างกันคืน conflict

Audit เก็บ actor, event code, target/version, เวลา, correlation และเหตุผลที่จำกัดข้อมูล ไม่คัด body/เอกสารเต็มชุด และไม่เก็บ password/token/recovery code ต้องแยกหลักฐาน actor ของ worker กับผู้ริเริ่ม ห้ามเชื่อ GUC หรือ service credential เป็นอำนาจธุรกิจ เหตุการณ์ปฏิเสธ/conflict เก็บขั้นต่ำแยกจากธุรกรรมที่ rollback และห้ามอ้างว่ามี decision สำเร็จ

effective_at เก็บค่ามาตรฐาน ตัดรอบด้วย Asia/Bangkok และแสดง พ.ศ. ที่ UI วันบันทึกกับวันมีผลเป็นคนละช่อง ห้ามใช้ปี พ.ศ. เป็นค่าปีใน timestamp

## 6 Outbox, worker recovery และ notification

งานแจ้งเตือนเสนอให้ worker poll outbox จาก PostgreSQL โดยตรง Redis ยังไม่เป็นแหล่งจริงที่จำเป็นต่อการไม่สูญหาย กลไก claim/locking ต้องเลือกและทดสอบ native PostgreSQL ก่อนยืนยัน

1. claim งาน ready แบบ atomic พร้อม lease_token/lease_until แล้ว commit ก่อนเริ่มทำงาน; ทุกการต่อ lease และ ack ต้องตรง token ล่าสุด เพื่อกัน worker เก่าที่ lease หมดกลับมาเขียนผล
2. ก่อนประมวลผลและก่อนส่งผล ตรวจสิทธิ์ผู้ริเริ่ม scope บัญชี และ ACL ล่าสุด กรณีสิทธิ์ถอนให้พักงานพร้อมรหัสสาเหตุ ไม่เปลี่ยนเป็นส่งสำเร็จและไม่ทิ้ง event เงียบ ๆ งานตามเวลาที่ใช้ authority ของระบบต้องมีการมอบหมายที่ตรวจได้ ไม่ยกเว้นสิทธิ์ทั้งระบบ
3. สร้าง Notification/DevSinkReceipt ด้วย unique dedupe key และ ack outbox ใน transaction เดียว ตรวจ lease token ใน transaction หาก worker ล่มก่อน commit ไม่มีผลค้าง หากล่มหลัง commit การส่งซ้ำคืน receipt เดิม
4. เมื่อ lease หมด งานกลับมารับได้ เมื่อพลาดชั่วคราวเพิ่ม attempts และ available_at ตาม backoff configuration; เกินเพดานเข้า dead letter พร้อม error_code/correlation ไม่เก็บข้อความ driver ที่อาจมี secret
5. การ replay dead letter ต้องตรวจอำนาจและเหตุผล ใช้ event/dedupe key เดิม เก็บประวัติ attempts ไม่สร้าง event ใหม่เพียงเพื่อเลี่ยง unique constraint
6. ทุกการอ่าน notification และเปิดลิงก์กลับเรื่องต้องตรวจ DAL ล่าสุด การมี notification ไม่ให้สิทธิ์อ่านเรื่องและข้อความไม่ใส่ข้อมูลส่วนตัวที่ผู้รับอาจหมดสิทธิ์แล้ว

ข้อรับประกันที่เสนอคือมี durable outbox และผลแจ้งเตือนในเว็บ/dev sink ไม่ซ้ำตาม unique key ไม่อ้างว่า worker ประมวลผลครั้งเดียว หากเปลี่ยนเป็นส่งภายนอกที่อยู่คนละ transaction ต้องมีสัญญา idempotency/receipt ของ provider และทดสอบช่วงส่งสำเร็จแต่ worker ยังไม่ ack ก่อนรับรองว่าจะไม่ส่งซ้ำ

## 7 แผนตรวจรับ — ทุกกรณี NOT RUN

| รหัส | การจำลอง | ผลที่ต้องตรวจจาก PostgreSQL/บริการจริง |
| --- | --- | --- |
| WF11-01 | ผู้ตรวจอ่านรุ่น1 เจ้าของแก้เป็นรุ่น2 แล้วผู้ตรวจอนุมัติรุ่น1 | conflict; ไม่มี decision สำเร็จหรือ outbox จากคำสั่งที่แพ้ |
| WF11-02 | ผู้สร้างมีทั้งบทบาทผู้เสนอและผู้อนุมัติ | ถูกปฏิเสธใน API/DAL/job แม้เรียกตรง |
| WF11-03 | ผู้ตรวจสองคนอนุมัติรุ่นเดียวกันพร้อมกัน | transition สำเร็จตามกฎเพียงครั้งเดียว; อีกคำสั่ง conflict; ไม่เกิด business effect ซ้ำ |
| WF11-04 | จังหวัดAส่ง ID/body/query ของจังหวัดB และถอน/หมดช่วงมอบหมายก่อนทำ job | ถูกปฏิเสธ ไม่เปลี่ยนเรื่อง/ทะเบียน/ส่งแจ้งเตือน |
| WF11-05 | หลักฐานยังไม่ scan, เปลี่ยน file version หรือหมด ACL | submit/approve/effective ไม่ผ่านตามกฎ ไม่ใช้ metadata Document เดิมแทนผล scan |
| WF11-06 | ล่มก่อน commit งานหลัก และหลัง commit ก่อน worker claim | กรณีแรกไม่มีผลหลัก/outbox กรณีหลัง event อยู่และทำต่อได้ |
| WF11-07 | ล่มหลัง claim และหลังสร้าง notification/receipt ก่อน ack | หมด lease แล้วรับต่อ; ผลที่ยังไม่ commit rollback; notification/receipt ไม่ซ้ำ |
| WF11-08 | ล่มหลัง transaction notification+ack commit แล้ว replay event | มี notification/receipt เพียงหนึ่งตาม dedupe key |
| WF11-09 | worker เก่ากลับหลัง lease ถูก worker ใหม่รับ; retry จนครบเพดาน | tokenเก่าเขียนผลไม่ได้; dead letter มีหลักฐาน; replayไม่เปลี่ยน dedupe key |
| WF11-10 | approved มีผลวันถัดไปใกล้เที่ยงคืนไทย แล้ว module invariant เปลี่ยน | ก่อนถึงเวลาไม่มีทะเบียนใหม่; ถ้าเงื่อนไขไม่ผ่านคง approved พร้อมเหตุผล |

## 8 วิธีดำเนินต่อและข้อจำกัด

คำสั่งที่มีจริงสำหรับปิด dependency บนเครื่องที่พร้อมตาม DATABASE คือ `corepack pnpm db:test`, `corepack pnpm check` และ `corepack pnpm smoke` ส่วน `corepack pnpm worker:check` ตรวจบริการเท่านั้น ไม่ทดสอบ outbox ไม่มีกลุ่มคำสั่ง workflow tests ใน package.json และไม่ได้รัน runtime acceptance บท11

เมื่อ prerequisite ผ่านและแผนบท11ได้รับอนุมัติ จึงเพิ่ม src/server/workflow, src/server/audit, migration และ outbox worker พร้อม tests ตามตาราง ไม่เปิด engine ที่ใช้สิทธิ์จำลองข้าม authz/scan ไม่เลื่อนไปบท12จากผลตรวจเอกสาร
