# การจำแนกวัสดุ ครุภัณฑ์ และหน่วยนับ — บท 47

รุ่น 0.1 | 7 ตุลาคม 2569 (2026-10-07) | source `5db4f45` | **Proposal / BLOCKED — ไม่มีทะเบียนหรือบริการพัสดุจริง**

## 1 สถานะและแนวคิดทีละขั้น

บท46ยัง BLOCKED; Prisma มีข้อมูลกลาง19models แต่ไม่มี ItemCatalog/UnitOfMeasure/Warehouse/StockLocation/AssetCategory/AssetRegister และไม่มี current Auth/DAL/files/workflow สำหรับพัสดุ คำสั่งฐานทดลองรอบ47 exit1 ไม่มี native PostgreSQL พร้อมใช้ เอกสารนี้เป็นสัญญาการจำแนก ไม่ใช่การยืนยันว่าระบบ7ใช้งานได้

1. **ItemCatalog** คือชนิดของสิ่งของ เช่น “กระดาษสมมติสำหรับทดลอง” ไม่ใช่สิ่งของทุกชิ้นหรือยอดในคลัง
2. **วัสดุใช้สิ้นเปลือง** ติดตามจำนวนตาม item/คลัง/จุดเก็บ/หน่วย ตัวอย่าง item เดียวอยู่หลายคลังยังใช้รายการชนิดเดียว รายงานต้องแยกหน่วยและขอบเขต
3. **ครุภัณฑ์รายชิ้น** ใช้ AssetRegister หนึ่งรายการต่อชิ้น มีรหัสประจำชิ้นไม่ซ้ำ และประวัติผู้รับผิดชอบ/ที่ตั้ง/สถานะ/ราคา ไม่ใช้ quantity รวมแทนตัวตนชิ้น
4. **Warehouse/StockLocation** คือคลังและจุดเก็บที่อ้าง Organization กลาง ไม่สร้างชื่อ/ที่อยู่หน่วยงานอีกสำเนา ผู้รับผิดชอบอ้าง Person เดิม การมอบหมายดูแลทรัพย์สินไม่สร้างสิทธิ์เว็บไซต์อัตโนมัติ

## 2 Configuration ที่เจ้าของพัสดุต้องยืนยัน

| ประเด็น                | ข้อเสนอทดลอง                                                                      | Gate                                                                      |
| ---------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| classification version | MATERIAL_CONSUMABLE / ASSET_SERIALIZED พร้อม category/rule/evidence refs          | เป็นชนิดทดลอง ไม่เดาเกณฑ์ราคา อายุใช้งาน หรือหมวดครุภัณฑ์ทางการ           |
| asset category         | รหัส/ชื่อ/issuer/source edition/effective dates มีรุ่น                            | ไม่อ้างว่า category DEMO ตรงบัญชีราชการ; ค่าเสื่อม/จำหน่ายไม่อยู่บท47     |
| unit and precision     | quantity_scale0–6 ตาม logical04; discrete unit scale0                             | ต้อง policy ยืนยันก่อน official ไม่ใช้floatหรือปัดเศษโดยไม่มีนโยบาย       |
| acquisition cost       | exact money/currency/policy; known amount หรือ unknown พร้อมเหตุผล                | unknown ไม่เป็น0; donation/zero costต้องหลักฐานและนโยบายที่รับรอง         |
| identity/serial        | UUIDถาวรและ asset_code uniqueตลอดทะเบียนตามแบบ04; serial optional                 | ไม่มีserialไม่กรอกเลขปลอม serialไม่เป็นnaturalkeyหรือgloballyuniqueโดยเดา |
| funding/ownership      | source/FY/budget refsและหลักฐาน กลางระบบ6; ownerOrganizationกับcustodianPersonแยก | ไม่แปลงราคาได้มาเป็น ledger payment หรือเพิ่มวงเงินอัตโนมัติ              |

หมวดหลักและความหมายทางการยัง Q010/Q019/Q024/TO VERIFY ต้องผู้มีหน้าที่ O07 ร่วม O06 ตรวจนโยบายตามเรื่อง ไม่มีเจ้าหน้าที่ลงนามหรือแหล่งระเบียบที่ได้รับยืนยันในรอบนี้ ไม่สร้าง rule ทางการจากตัวอย่างสมมติ

เมื่อ item ถูกอ้างจากทะเบียนหรือ movement แล้ว ห้ามเปลี่ยนชนิด/หน่วยฐาน/precision ทับเพื่อให้ประวัติเดิมเปลี่ยนความหมาย ใช้รุ่นใหม่และคำขอแก้ที่มีหลักฐานตาม workflow กลาง การเปลี่ยน classification ไม่แปลง stock เป็นครุภัณฑ์หรือกลับกันโดยอัตโนมัติ

## 3 จำนวนและการแปลงหน่วย

เก็บ quantity เป็น NUMERIC(20,6)ตามข้อเสนอแบบ04 พร้อมหน่วยและ scale ที่อนุญาต รับส่งเป็น canonical decimal string หรือ integer scaled arithmetic ไม่ใช้ JS number คำนวณจำนวน อัตราแปลงใช้ numerator/denominator จำนวนเต็มบวกที่มีขอบเขตและ version; denominatorห้าม0

UnitConversionVersionต้องผูก item/version และบริบทบรรจุภัณฑ์เมื่อเกี่ยวข้อง ระบุ source unit, target unit, valid window, evidence และ precision/rounding policy ไม่ใช้ “กล่อง→ชิ้น” ทั่วทั้งฐานเพราะแต่ละชนิดหรือรุ่นบรรจุมีจำนวนไม่เท่ากัน การแปลงต่างdimension เช่นกิโลกรัมเป็นชิ้น ต้องหลักฐานเฉพาะ ไม่เดา ไม่มี ruleให้รายงานหน่วยเดิมและแจ้ง unavailable สำหรับยอดแปลง

| ตัวอย่างสมมติ              | รุ่นและผลคาดหมาย                                     | สิ่งที่ห้าม                                         |
| -------------------------- | ---------------------------------------------------- | --------------------------------------------------- |
| กระดาษDEMO 2กล่อง          | packV1 12ชิ้น/กล่อง → 24ชิ้น                         | เปลี่ยนpackV2เป็น10แล้วแก้24ชิ้นของรายการเก่าเป็น20 |
| วัสดุDEMO 1.250000กิโลกรัม | massV1 1000กรัม/กก. →1250.000กรัม                    | อ้างกฎตัวอย่างว่าเจ้าของรับรองของจริงแล้ว           |
| discrete 0.5ชิ้น           | ปฏิเสธตามscale0ของDEMOunit                           | ปัดเป็น1หรือ0เอง                                    |
| 1/3ชิ้นจาก conversion      | หากtargetscale0/ไม่มีroundingpolicyที่รับรอง →ปฏิเสธ | ใช้binaryfloatหรือปัดเพื่อให้รับเข้าพอดี            |

ทุก transaction/report snapshot ต้อง pin source quantity/unit, conversion version และ target quantity/unit เมื่อใช้การแปลง ห้ามไปหา rate ล่าสุดมาแก้ประวัติ รายงาน group item/warehouse/location/unit ก่อนรวม แสดงต้นทางต่างหน่วยแยก แม้แปลงได้ก็รวมเฉพาะบริบท/รุ่นที่ compatible และ policy อนุญาต ห้ามรวมชิ้นกับกิโลกรัมหรือ currencies ต่างกัน

บท47ยังไม่มี stock movement engine ยอดตัวอย่างใน [inventory-47-plan](fixtures/inventory-47-plan.json) เป็น quantity descriptors ไม่ใช่ opening stock ที่โพสต์แล้ว หากไม่มี movement source ให้หน้าจอแสดงยังไม่มีข้อมูลยอดที่ตรวจสอบได้ ไม่เติม0หรือสร้างmovementจากการเปิดทะเบียน

## 4 ประวัติและการอ่าน

วันได้มา/effective_from/toเป็นDATE ช่วงมีผล [start,end) กับrecorded_at TIMESTAMPTZ แยกกัน UI พ.ศ./Asia/Bangkok ต้องดูได้ ณ valid_at และ known_at การแก้ย้อนหลังเพิ่มรุ่น/replaces/evidence/decision ไม่แก้เนื้อหาเดิม หน้าปัจจุบันเป็น projection ของประวัติที่มีผล ไม่เปิดอนาคตก่อนวันจริง

รหัสประจำชิ้นไม่เปลี่ยนตามชื่อหน่วยงานหรือผู้ถือครองและไม่reuseเมื่อเลิกใช้งาน เอกสารหรือรายงานเก่าคงชื่อหน่วย/ประเภท/ต้นทุน/ที่ตั้งและรุ่นหน่วยที่ใช้อ้างอิง ไม่ใช้ latest join ทับ snapshot เฉพาะข้อมูลที่มี policy อนุญาตจึงส่งให้ DTO; ชื่อผู้รับผิดชอบ ราคา serial แหล่งงบและหลักฐานเป็นข้อมูลภายในตามpurpose/scope

อ่าน [INVENTORY_SCHEMA](INVENTORY_SCHEMA.md) สำหรับ fields/keys/ประวัติที่เสนอ และ [ASSET_REGISTER_WORKSPACE](ASSET_REGISTER_WORKSPACE.md) สำหรับหน้า/QR/การตรวจสิทธิ์ ทุก P47-01–16 **NOT RUN** ทั้งสองเกณฑ์ BLOCKED ไม่เริ่ม48
