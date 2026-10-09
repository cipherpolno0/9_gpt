# Software acceptance และ UAT ของบริการกลาง

รุ่น0.1 · app/schema0.8.0 · ข้อมูลสมมติ · เจ้าหน้าที่ลงนาม: PENDING_OWNER

| รหัส | Scenario / trace | Implementation | หลักฐานซอฟต์แวร์ | UAT เจ้าหน้าที่ |
| --- | --- | --- | --- | --- |
| SW01 | central Document/version/upload/retry/scan ACL | documents API/storage, work_file_* | documents.test.ts, workflow-cases.ts | PENDING_STORAGE_SCAN |
| SW02 | draft resume/returned correction/no duplicate | Requests UI/API, work_save | workflow-cases.ts | PENDING_AUTH_BROWSER |
| SW03 | out-of-scope target/moved Person/expired delegation | work_save/work_transition | workflow-cases.ts | PENDING_AUTH_BROWSER |
| SW04 | maker checker / review evidence / immutable approval | work_transition/decision/revision | workflow-cases.ts | PENDING_OWNER |
| SW05 | simultaneous approval and same browser key | work locks + unique constraints | workflow.integration.ts native PostgreSQL | PENDING_BROWSER |
| SW06 | source/outbox failure rollback; consumer crash/retry | outbox/receipt/work_deliver_one | workflow.integration.ts, workflow-cases.ts | PENDING_WORKER_HOST |
| SW07 | file bytes after approval / content hash | FileVersion guard/readObject | SQL immutable + unit hash/type; actual object tamper PENDING | PENDING_STORAGE |
| SW08 | privacy: unauthorized list/file/worker/no-store | RPC ACL/scope/SESSION_USER | SQL negative tests + HTTP smoke | PENDING_AUTH_STAGING |

ดูผลรันจริงและ CI URL ใน [shared-workflow-results](../tests/results/shared-workflow-results.json) WASM เป็นการตรวจ SQL เสริมแบบ connectionเดียว ไม่แทน PostgreSQL locks การจำลอง protocol ClamAV ไม่ใช่การสแกนด้วย signature จริง

## ขั้นตอน UAT เมื่อบริการพร้อม

1. O04/C02 จัดบัญชีสมมติ maker reviewer approver1 approver2 outsider และ technical; ยืนยัน explicit grants, MFA, scope/time กับ DocumentAccess พร้อมใช้ Auth กลาง
2. maker อัปโหลดหลักฐาน PDF สมมติ ตรวจว่า quarantine ยังดาวน์โหลดไม่ได้ จากนั้น scan worker จริงทำงาน ตรวจ hash/CLEAN และหลักฐาน scan รวมกรณี EICAR ที่อนุญาตในพื้นที่ทดสอบ
3. maker บันทึกร่าง ออกจากหน้าแล้วกลับแก้เรื่องเดิม ส่งตรวจ reviewer ส่งกลับพร้อมเหตุผล maker แก้เป็นrevision2และส่งเรื่องเดิมใหม่
4. พยายามเปลี่ยน target_id เป็นหน่วยงานB, ใช้ technical/outsider อนุมัติ หรือ maker ตรวจเอง ต้องถูกปฏิเสธผ่าน API รวมการถอนสิทธิ์ขณะเปิดหน้าอยู่
5. ให้หลักฐานกับ reviewer/approvers ตาม ACL reviewer ตรวจครบ approverสอง browserอนุมัติพร้อมกัน มีคำตัดสินหนึ่งชุด อีกฝ่ายเห็นconflict ห้ามแก้รุ่นที่อนุมัติแล้ว
6. หยุด worker หลัง claimก่อนcommit เริ่มใหม่ ส่ง eventซ้ำ/ผิดลำดับ notification/receiptไม่ซ้ำ และตามcorrelation_idได้ เปิดnotificationไม่ถือว่ารับทราบหนังสือ
7. ถอน ACLของreviewer แล้วพยายามดาวน์โหลด URLเดิม ต้องปฏิเสธ ตรวจว่าบุคคลอีกพื้นที่ไม่เห็นรายการ/snippet/body/metadataลับ
8. เก็บ screenshots สมมติและเวลา เจ้าหน้าที่ระบุ PASS/FAIL เหตุผล ผู้รับผิดชอบ และหลักฐาน ห้ามระบบใส่ลายเซ็นหรือปิดรายการแทนผู้ใช้

UAT นี้ไม่ครอบคลุม activation/historyคำสั่ง ผลสอบที่นั่งจริง ledgerงบ stock custody สารบรรณและExcelครบ9ระบบ รายการ UAT01–09 และ UAT_MASTER ยังไม่ผ่านจากการส่งมอบบริการกลางนี้
