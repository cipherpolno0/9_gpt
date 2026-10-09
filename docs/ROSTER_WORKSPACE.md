# บัญชีรายชื่อผู้สมัคร — บท 36

รุ่น 0.1 | 5 ตุลาคม 2569 (2026-10-05) เวลาไทย | source `47632bf` | **Proposal / BLOCKED — ยังไม่มี roster UI หรือบริการข้อมูลจริง**

ต่อ PG-25 ใน [SITEMAP](SITEMAP.md) ใช้ `/app/exams/applications` และรายละเอียด `{application_id}` ของระบบ5ร่วม importer9 ไม่สร้างบัญชีสมัครหรือตารางบุคคลอีกชุด prerequisite35และDALยังขาด ดู [APPLICATION_SCHEMA](APPLICATION_SCHEMA.md), [APPLICATION_STATES](APPLICATION_STATES.md), [ELIGIBILITY_RULES](ELIGIBILITY_RULES.md), [APPLICATION_EXPORT](APPLICATION_EXPORT.md)

## 1 หน้าจอที่เสนอ

| ส่วน              | พฤติกรรมเมื่อพัฒนา                                                            | สิทธิ์/ความเป็นส่วนตัว                                                                  |
| ----------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Context           | เลือกปี ประเภท รอบ ระดับ ช่วงชั้น และโหมดรายสำนัก/สถานศึกษา/สนาม              | ตัวเลือกต้องมาจาก grants/current lineage ที่ยืนยัน ไม่ org_id จาก URL เป็นอำนาจ         |
| ค้น/กรอง          | ชื่อ/ฉายา/ชื่อเดิมที่มีสิทธิ์ รหัสอ้างอิง สถานะ และผลตรวจหลายเงื่อนไข         | snapshot name กับชื่อปัจจุบันมีป้ายแยก ไม่เปลี่ยนชื่อบนปีเก่า ไม่ log full search names |
| รายการ            | รหัสใบสมัคร ชื่อขณะสมัคร หน่วยขณะสมัคร context/state และจำนวนปัญหาที่เปิดได้  | DTO allowlist ต่อหน้าที่ ไม่ identity document/private contact/reason/file key          |
| คนคล้าย/คนซ้ำ     | ชื่อคล้ายเป็นคู่ให้เจ้าหน้าที่ตรวจ; business key ซ้ำแสดงปัญหาจาก serviceกลาง  | ไม่ merge/upsert Person จากชื่อ/วันเกิด ไม่แสดงคู่ของพื้นที่อื่น                        |
| แก้ก่อนส่ง        | draft/returned ใช้ expected revision, required fields และ evidenceกลาง        | ไม่แก้ sealed snapshot/submitted/approved ตรง; ทุก action ตรวจ server                   |
| ติดตาม/ข้อผิดพลาด | ดู workflow รุ่นที่มีสิทธิ์ error code/field label/วิธีแก้และ correlation ref | ไม่เปิดเหตุผลเต็มของคนอื่น ชื่อไฟล์ private หรือข้อมูลอ่อนไหวใน error                   |
| ส่งออก            | เลือก purpose/format/template version จาก registryที่ได้รับอนุมัติ            | server recheck scope/field/evidence/รุ่นตาม export contract ไม่ดึงทั้งตารางลง browser   |

รายสำนักคือสังกัดตอนสมัคร รายสนามคือ typed center/offering binding การมีสิทธิ์ในสำนักหนึ่งไม่อนุญาตดูผู้สมัครทุกสำนักของสนาม และ grantสนามไม่ให้ดูทุกข้อมูลส่วนตัวโดยอัตโนมัติ หลายหน่วยของ actor รวมได้เฉพาะ action/สาย/ช่วงเวลาที่รับรอง

## 2 DAL และ service boundaries ที่เสนอ

| Operation           | จุดตรวจหลัก                                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------------- |
| listRoster          | account/session/current assignment → bounded filters → scope query → allowlisted snapshot DTO → pagination     |
| readApplication     | server resolve target/context/person → resource+field policy → history/evidence metadata ที่อนุญาต             |
| saveDraft           | current grant + editable state + expected revision + typed input → CAS/receipt/audit transaction               |
| evaluateEligibility | verified context/facts/evidence/rule version → ผลตรวจที่ field policy เปิดได้; ไม่เปลี่ยนสถานะเอง              |
| submitApplication   | ตรวจใหม่ใน transaction ตาม ELIGIBILITY_RULES/Application/workflowกลาง ไม่เชื่อ booleanจากหน้าเว็บ              |
| requestExport       | validate selected IDs/query scope → snapshot/rule/template pins → private manifest/export job ที่ตรวจสิทธิ์ซ้ำ |

นี่คือชื่อ operation ในสัญญา ยังไม่มี functions/Server Actions/Route Handlers จริง ไม่สร้าง fake session/grant หรือ public localStorage เพื่อทำให้หน้าจอแสดงว่าผ่าน

list/count/options/autocomplete และ error ทุกจุดต้อง scope ก่อน aggregate เช่นเดียวกับ detail/export Pagination เสนอ cursor ที่ตรึง filter/sort/context และตรวจ current grantทุกหน้า ใช้ลำดับ stable ตาม reference+UUID และขนาดหน้ามีเพดาน configuration เปลี่ยน filterแล้วเริ่มหน้าแรก ห้าม unbounded export ผ่าน `page_size` หรือ query ลัด DAL

ดัชนีต้องเลือกจาก query จริงหลัง schemaพร้อม เช่น context+state+reference ไม่ indexทุกคอลัมน์ การค้นไทยไม่ตัดวรรณยุกต์/เปลี่ยนชื่อโดย normalize ผลที่ไม่มีสิทธิ์ไม่ใช้ global count หรือรายละเอียด duplicate conflict บอกว่ามีคนอยู่นอกพื้นที่

## 3 การแก้และติดตามที่ปลอดภัย

ส่งกลับแล้วใช้ ApplicationIDเดิม แก้ revision ใหม่และส่งสร้าง snapshot/cycleใหม่ เก็บคำตัดสินและรุ่นเดิม state6ค่าตามบท35 ใช้ engine11กลาง ผู้สร้างหรือผู้แก้สาระสำคัญไม่มีอำนาจอนุมัติเรื่องตนเอง การขอยกเว้นต้องอำนาจ/หลักฐานจริง ไม่ปุ่ม forceผ่าน eligibility

ไฟล์แนบใช้บริการเอกสาร10 เมื่อพร้อม quarantine/MIME/content/size/scan/ACL แยกจากการตรวจเนื้อหาโดยเจ้าหน้าที่ เบราว์เซอร์ส่ง Document/FileVersion refs ที่ตรวจเจ้าของอีกครั้ง ไม่ object key ที่ผู้ใช้เลือกเอง ร่างที่แนบไฟล์ยังไม่พร้อมอาจบันทึกได้ตาม policy แต่ส่งอนุมัติไม่ได้เมื่อ requirementจำเป็นไม่ครบ

ผลตรวจเดิมมีเวลาและรุ่นพร้อมข้อความ “ต้องตรวจอีกครั้งก่อนส่ง” ภาวะ network retryคืน receiptเดิมเมื่อ payloadตรงและยังมีสิทธิ์ revisionเก่าตอบ conflictพร้อมให้โหลดใหม่ ไม่รวม fieldส่วนตัวลง log/notification/client telemetry

## 4 Keyboard responsive และสถานะ

ใช้ components/tokens/fontกลาง ไม่เพิ่ม design systemอีกชุด กรองมี labels/fieldset ชัด ปุ่มค้น Enterและล้างเงื่อนไข มีข้อความ empty state เช่น “ไม่พบในขอบเขตที่มีสิทธิ์ ลองลดเงื่อนไขหรือเปลี่ยนปี” ไม่บอกว่าผู้สมัครนอก scope มีอยู่

375/768/1024/1440ต้องตรวจเว็บจริง; ตารางมี caption/column headers และ scroll regionที่ใช้ keyboardได้ โมบายรักษาป้ายกำกับคู่ค่า ไม่ซ่อนฟิลด์จนสถานะอ่านไม่ออก ปุ่มแก้/ส่งออกมีชื่อเฉพาะแถว หน้าใหม่รักษา focus ใช้ status text+badge ไม่สีอย่างเดียว error summaryลิงก์ field/aria-describedby; stale revision/live regionประกาศโดยไม่อ่านข้อมูลส่วนตัวทั้งหมด

route/API/RSC/private responses ต้อง dynamic/no-store/cache policyที่พิสูจน์จริง ไม่ static generateรายชื่อ หรือส่ง private DTOไป public search ใช้ auditอ่าน/ส่งออกตามนโยบายที่รับรอง ไม่เก็บชื่อผู้ค้นเต็มชุด

## 5 Gate และตรวจรับ

P36-06–09/14ในELIGIBILITY_RULESเป็นแผน roster/duplicate/CAS/scope/keyboard ส่วน P36-01–05/10เป็นแผน eligibility ไม่มี UI/service/API/browser ตรวจจริงในบทนี้ หน้า `/app`ปัจจุบันเป็น bootstrap403/no-store ไม่ใช่ระบบสิทธิ์ทำงานแล้ว

ไม่มี schema/migration/runtimeเพิ่ม ทั้งสองเกณฑ์36ยังBLOCKED ต้องผ่าน35และส่วนกลางก่อน implementation/acceptance บท37ยังไม่เริ่ม
