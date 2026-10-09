# ประวัติผู้รับผิดชอบและที่ตั้งครุภัณฑ์ — บท 50

รุ่น 0.1 | 8 ตุลาคม 2569 (2026-10-08) | source `3441054` | **Proposal / BLOCKED: ไม่มี custody/history services จริง**

อ่าน [ASSET_LIFECYCLE](ASSET_LIFECYCLE.md) และ [INVENTORY_SCHEMA](INVENTORY_SCHEMA.md) ใช้ AssetRegister47, Person13–17, Organization19–20 และสถานที่กลางเดิม ไม่มีPerson/Organizationสำเนาสำหรับผู้ยืมหรือผู้ซ่อม

## 1 แยกเจ้าของ ผู้รับผิดชอบ และผู้ถือของ

Asset.owner_organization_id อ้างหลักฐานเจ้าของ; AssetAssignment ระบุผู้รับผิดชอบหลักและหน่วยงานตามช่วงเวลา; Loan/handoverระบุผู้ถือครองทางกายภาพชั่วคราว ทั้งสามอาจต่างกัน การเปลี่ยนผู้รับผิดชอบไม่ถือว่าโอนกรรมสิทธิ์ หรือเพิ่ม RoleAssignmentให้คนรับใหม่

DEMOเสนอนโยบาย PRIMARY_CUSTODIAN หนึ่งคนต่อชิ้นต่อช่วง แต่หน้าที่ร่วม/ผู้ตรวจ/ผู้ประสานงานเก็บ assignment_kindแยกเมื่อเจ้าของยืนยัน ไม่ใช้กฎหนึ่งคนหนึ่งชิ้นหรือหนึ่งคนหนึ่งหน้าที่กับทุกคน กฎ singletonต้องเทียบ asset+kind ข้ามคนทั้งหมด

## 2 ขั้นตอนส่งมอบเมื่อย้ายหรือลาออก

1. เหตุการณ์บุคคล17สร้าง impact/task ให้เจ้าหน้าที่ทรัพย์สินตามscope ตรวจของที่ถือ/Loanค้าง/การซ่อม/ข้อเรียกร้อง ไม่เลือกผู้แทนหรือปิดLoanเอง ใช้source event IDและdedupeเพื่อไม่สร้างงานซ้ำ
2. สร้างคำขอส่งมอบอ้าง old_assignment_id/asset versions/ผู้รับใหม่ Personที่ยืนยัน/สองOrganizationและtyped placeที่มีอยู่/วันที่จริง/สภาพ/หลักฐาน พร้อมรายการค้างและผู้อนุมัติคนละคนกับผู้สร้าง
3. ตรวจผู้รับที่รับหน้าที่ได้/ผู้มีอำนาจ/ช่วงdelegation/source still current/Loan-return-maintenanceที่ขัดกัน หากต้องส่งมอบความรับผิดชอบขณะซ่อมหรือยืมให้ policyและผู้อนุมัติยืนยันผลกระทบ ไม่แสดงว่าของอยู่กับผู้รับใหม่โดยไม่มีphysicalhandover
4. เมื่อมีผล transactionปิดช่วงassignmentเดิมและเปิดใหม่ พร้อมsource event/locationเฉพาะส่วนที่ส่งมอบจริง/history snapshot/receipt/audit/outbox ไม่ลบชื่อคนเดิมหรือแก้รายงานเก่าด้วยคนปัจจุบัน

## 3 เวลาอ้างอิงและการแก้ผิด

ใช้ช่วงวันมีผล [effective_from,effective_to) ตาม47/04; handover/loan/returnที่ต้องเรียงภายในวันใช้ effective_at TIMESTAMPTZของserver ไม่บีบหลายเหตุการณ์ในวันเดียวลง DATEจนแยกลำดับไม่ได้ แสดง พ.ศ. และ Asia/Bangkok ส่วน recorded_atแยกเวลาบันทึกจริง

query(valid_at,known_at) เลือกข้อมูลที่มีผล ณ valid_atและเป็นรุ่นที่ระบบทราบ ณ known_at; planned futureไม่เป็นcurrentก่อนวันจริง ไม่รอnotification workerเพื่อให้queryย้อนหลังถูกต้อง การอนุมัติส่งมอบอนาคตยังต้องตรวจชนrevision/dependencyและcapacityของช่วงนั้น

การแก้ย้อนหลังสร้างreplaces/source reason/evidence/decisionใหม่และบันทึกsupersession event ไม่แก้ payloadหรือauditเดิม Projectionของknowledge intervalsสร้างจากเหตุการณ์เหล่านี้ได้ การปิดช่วงเป็นเหตุการณ์ใหม่; รายการเดิมที่ยังไม่รู้วันสิ้นสุดยังอ่านได้ด้วย known_atก่อนเหตุการณ์ปิด

Assignment snapshot pinชื่อPerson/Organizationและplace/AddressVersionที่ใช้ในหลักฐาน ไม่latest joinแล้วเปลี่ยนชื่อ/ที่อยู่เอกสารเก่าโดยเงียบ UIต้องแสดงว่าเป็นชื่อ ณ วันอ้างอิงและลิงก์ทะเบียนปัจจุบันแยกตามสิทธิ์ Snapshotไม่อนุญาตส่งข้อมูลส่วนตัวเกินfield policy

typed place referenceเลือก StockLocationในWarehouse47 หรือ OrganizationLocation20ที่มีหลักฐาน รวมจุดส่งมอบ/ผู้ซ่อมภายนอกที่ยืนยัน ไม่สร้างWarehouseปลอมหรือเดาพิกัด ที่ตั้งไม่ทราบแสดงไม่ทราบพร้อมเหตุผลและจัดงานตรวจ ไม่เติมตำแหน่งเดิมเพื่อทำให้ดูครบ

## 4 ตรวจประวัติและความปลอดภัย

source eventsเป็นแหล่งจริง current projectionต้องreconcileด้วย committedmanifest/watermarkเดียว ไม่แก้historyตามprojection รายงานแยกผู้รับผิดชอบหลัก ผู้ยืม physicalholder สภาพ และที่ตั้ง พร้อมvalid_at/known_at/รุ่นต้นทาง

อ่านย้อนหลังยังใช้สิทธิ์ปัจจุบันและpurpose: ผู้ดูข้อมูลของตนเห็นเฉพาะรายการที่policyอนุญาต ไม่ได้สิทธิ์ดูทุกคนที่เคยอยู่ในOrganizationจากsnapshot การอ่าน/export/job/download/QR47/privateHTML cacheตรวจcurrentAuthDAL/RLS/fieldpolicyและCLEAN+ACLแยก; คนถูกถอนสิทธิ์ไม่คงสิทธิ์เพราะเป็นcustodianเก่า

ข้อมูลสมมติใน [fixture50](fixtures/asset-lifecycle-50-plan.json) มีการปิดช่วง ย้ายผู้รับผิดชอบ ส่งมอบอนาคต และแก้ที่ตั้งย้อนหลัง เป็นreference descriptors ไม่ใช่history DB ที่บันทึกจริง กรณีช่วงซ้อน/retry/nativeconstraints/asof/privateexportยัง **NOT RUN** ไม่เริ่ม51
