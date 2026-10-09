# สัญญาส่งออกบัญชีสมัคร PDF และ Excel — บท 36

รุ่น 0.1 | 5 ตุลาคม 2569 (2026-10-05) เวลาไทย | source `47632bf` | **Proposal / BLOCKED — ยังไม่มี form export adapter หรือ renderer จริง**

ใช้ [FORM_TEMPLATE_REGISTRY](FORM_TEMPLATE_REGISTRY.md), [APPLICATION_SCHEMA](APPLICATION_SCHEMA.md), [APPLICATION_STATES](APPLICATION_STATES.md), [ELIGIBILITY_RULES](ELIGIBILITY_RULES.md) และ [สถานะส่วนกลาง](PROGRESS.md) บท10ยังBLOCKED ไม่มี FILE_STORAGE หรือบริการเอกสาร/scan/gateway จริง ทุกศ.1/2/3/5/6ยังTO VERIFY ไม่มีแบบทางการฉบับรับรองสำหรับบทนี้ ไม่เดา mapping/ขนาดช่อง/ตราหรือความหมายศ.3

## 1 ขั้นตอน adapter ที่เสนอ

| ขั้น             | Contract                                                                                                                                                  |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| X36-01 Authorize | verified actor/current account/grant/action/purpose/resource/scope/field policy ก่อน query; URL/query/selected IDs ทุกแถวต้องตรวจ                         |
| X36-02 Resolve   | server resolve context/template mode/typed mapping/official source verified scope และ file scan/rights/ACL ไม่ client verifiedหรือtemplate codeอย่างเดียว |
| X36-03 Pin       | manifest ตรึง application IDs + sealed snapshot IDs/versions + rule/template/layout/machine-schema versions + hash/order/context/created_at               |
| X36-04 Project   | สร้าง purpose-specific DTO จาก snapshot เดียวกันให้ PDF/Excel; allowlist ไม่มี private identity/contact/evidence/reason จาก joinล่าสุด                    |
| X36-05 Render    | HTML print/A4ตาม MASTER และฟอนต์ไทยที่ตรวจจริง; ExcelJS typed cells เมื่อเลือกเวอร์ชัน/ติดตั้งในบทลงมือแล้ว ไม่ generic dumpทุกคอลัมน์                    |
| X36-06 Deliver   | private artifact/manifest/hash/retention; recheck current grant/source withdrawal/ACL ตอน worker และ download พร้อม audit/outbox/receipt ตามขอบเขตงาน     |

manifestเป็น contract ไม่ใช่modelใหม่ที่สร้างแล้ว การเลือกจำนวนมากต้องเพดาน/งานคิวที่รับรอง ถ้า selected IDใดไม่ผ่านให้ safe failure ไม่มี partial output หรือ countบอกผู้สมัครนอกพื้นที่ ผลค้นที่เคยได้ไม่เป็น grantส่งออกครั้งถัดไป

บัญชีหลายแถวให้ตรึงสมาชิกและลำดับใน read transaction/consistent snapshot พร้อม source version refs ไฟล์ต้องตรง manifest ทั้งสอง format ไม่รัน queryชุดใหม่ให้ Excelแล้ว PDFมีคนอีกชุด ใช้ DTO revisionเดียวของแถวหรือ export batchที่ตรึงไว้ ไม่เก็บ latest name/organization แทนปีเก่า

## 2 Official และ DEMO ต้องแยก

OFFICIAL ต้อง registryรุ่นที่ meaning/type/level/stage/purpose/year/windowตรง และมี source/form/layout/schema/rights/checker ที่รับรอง พร้อม application state/approval snapshotที่นโยบายอนุญาตออก ไม่มี sourceหรือกฎพร้อมให้ NOT_READY/FORM_NOT_VERIFIED ไม่ fallbackเป็นDEMOแล้วตั้งชื่อทางการ

DEMOใช้ `DEMO_APPLICATION_LAYOUT_V1` ตามบท35 ทุกหน้า/ทุกsheetติด “ตัวอย่างสมมติสำหรับทดลอง — ไม่ใช่เอกสารทางการ” ชื่อ/referenceสมมติ ไม่มีบัตรประชาชน/เบอร์/ที่อยู่จริง ไม่ใช้ตรา/ลายเซ็น/แบบศ.3ปลอม หากร่างยังไม่sealed อาจแสดงตัวอย่างDEMOได้เฉพาะ policyที่รับรองและ pin draft revision แยก purpose ห้ามอ้างว่าคือ snapshotที่อนุมัติแล้ว

template verifiedไม่เท่ากับ applicant approved การเปลี่ยนรุ่น/ถอน templateต้อง policyระบุสิทธิ์ออกซ้ำปีเก่า เก็บ pinsเดิมไม่ join latestและไม่ overwriteartifactเดิม การอนุมัติไฟล์แม่แบบไม่อนุญาตเผยแพร่ใบสมัครที่กรอกแล้วให้ public

## 3 PDF ภาษาไทยและ A4

MASTERเลือก HTML printแล้วบันทึก PDFจาก browser ไม่เพิ่ม jsPDF/บริการ PDFอีกชุดในบทนี้ ใช้ Sarabunที่ล็อก5.3.0 และ font assetsกลาง; productionที่มี export jobต้องเลือก renderer/sandboxตาม ADRและสิทธิ์ก่อนใช้ ขณะนี้ยังไม่มี print route/renderer/ไฟล์ PDFตัวอย่างจริง

ใช้ A4ตามแบบทางการที่ได้รับ เมื่อยังไม่มีแบบทดลองด้วย A4ทั่วไปติดป้ายDEMOเท่านั้น ไม่เดาระยะช่อง/จำนวนแถวของแบบจริง ต้องรอ fontsพร้อมก่อน print และตรวจว่าไฟล์สุดท้ายมีฟอนต์ไทย/สระวรรณยุกต์เรียงถูก หลายหน้าไม่ตัดชื่อ/เลขอ้างอิงหรือทับ footer หัวตารางซ้ำและเลขหน้า/manifest referenceไม่เปิด PIIเพิ่ม

แสดงวันที่ พ.ศ.โดยไม่เปลี่ยน stored instant ปีศึกษาไม่ใช่ปีงบ เลขอ้างอิงเป็นข้อความ ไม่แปลงเลขยาวให้ scientific notation PDF testต้องตรวจภาพทุกหน้าและเทียบข้อความ/เลขอ้างอิงจากไฟล์จริง ไม่ถือ font-familyใน CSSหรือการอ่านtextผ่านเพียงอย่างเดียวว่า PDFสมบูรณ์

## 4 Excel ตัวอักษรและความปลอดภัย

ExcelJSตามMASTERยังไม่อยู่ใน package.json/lockfile ต้องเลือกและล็อกเวอร์ชันจากเอกสารทางการเมื่อถึงimplementation ไม่อ้างว่าติดตั้งหรือใช้ adapterแล้ว

name/reference cellsเป็น typed string เก็บ Unicode/ศูนย์นำหน้า/เลขยาวเกิน15หลักตรง ไม่ parseInt/Number และไม่ลบวรรณยุกต์ อักขระแรก `= + - @` ต้องคงเป็นข้อความ ไม่ formula/hyperlink/external reference ไม่แก้ค่าต้นฉบับด้วยการเติม quoteแบบที่อ่านกลับผิด มี machine-schema version/table headersจาก registryที่ pinไว้

ตัวอย่างตรวจเมื่อ runtimeพร้อม: “ผู้สมัครสมมติ ก01”, “ทดสอบสมมติ เกื้อกูล”, “00001234567890123456”, “DEMO-REF-000001”, “=DEMO_TEXT” เป็นข้อมูลจำลองเท่านั้น ต้อง read-backเป็นข้อความตรง ไม่มี hidden sheet/column/comment/metadataที่เปิด identity/privatephone/evidence/เหตุผลละเอียด ไม่ใช้ workbookจากผู้สมัครที่มี macro/external linksเป็น template และไม่สร้าง CSV fallbackในบทนี้

ถ้าคอลัมน์อ่อนไหวจำเป็นต้องมี purpose/fieldgrantที่รับรอง ไม่ใช้คำว่าinternalเพื่อ exportทุกฟิลด์ ผลส่งออกมีนโยบาย retention/currentdownload ACL ไม่เก็บไฟล์จริงใน public folder/repository

## 5 การถอนสิทธิ์ retry และหลักฐาน

requestExport/worker/render/downloadต้องตรวจcurrentaccount/roleassignment/time/scope/fileACL การเก็บผลไฟล์ไว้ไม่ให้ actorที่ถูกถอนสิทธิ์เข้าถึง แยก job receiptจาก download grant; retry payload/manifestเดิมคืนงานเดิมเมื่อยังมีสิทธิ์ keyเดิมpayloadต่างconflict keyใหม่ไม่ overwriteไฟล์หรือประวัติเดิม

กรณีต้อง revokeทันทีใช้ gatewayที่ตรวจทุกrequest ตามบริการเอกสาร10 ไม่อ้างว่า signed storage linkที่ออกไปแล้วเพิกถอนได้ทันที ไม่ถือ recheckตอนสร้างอย่างเดียวพอ Workerตรวจ actor/recipientรวมสิทธิ์พื้นที่และfieldpolicyปัจจุบัน ไม่ส่งไฟล์/ข้อมูลส่วนตัวออกnotification โหมดdevไปsinkเท่านั้น

auditเก็บ actor/action/manifestref/hash/context/recorded_at/correlation/dedupeโดยไม่ชื่อผู้ค้นเต็มชุด password/token/recoveryหรือไฟล์เนื้อหา ทดสอบ response HTML/RSC/cache/assets/artifact metadata/errorsพร้อม canaryสมมติ ไม่ส่งข้อมูลเกินallowlistลง browserแล้วซ่อนคอลัมน์

## 6 Gate และตรวจรับ

เกณฑ์36-02ผูกP36-08/10–13ในELIGIBILITY_RULES และ X36-01–06 ทุกกรณี **BLOCKED / NOT RUN** ยังไม่มี PDF/Excel/file artifactให้ตรวจชื่อไทยหรือเลขอ้างอิงจริง ไม่มี scoped export/currentrevoke/API/workerผ่านจากเอกสารนี้

ไม่มี package/schema/migration/runtimeเพิ่ม ต้องผ่าน35และAuth/DAL/registry/snapshot/FileVersion/scan/workflow/outboxก่อน implementation ไม่แตะ production ไม่push/deploy บท37ยังไม่เริ่ม
