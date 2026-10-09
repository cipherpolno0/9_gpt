# ทะเบียนแบบบัญชีและการยืนยันแหล่งทางการ — บท 35, 39 และ 59

รุ่น 0.3 | 9 ตุลาคม 2569 (2026-10-09) | baseline `9931480` | **Proposal / BLOCKED — มี XLSX ทดลองออฟไลน์ ยังไม่มี registry/generator/issuance guard ในแอป**

ต่อFormTemplateRegistryกลางจากlogical04ตาม [APPLICATION_SCHEMA](APPLICATION_SCHEMA.md) ไม่สร้างทะเบียนแบบแยกในimporter/แต่ละโมดูล Registryเก็บรหัสแบบ รุ่น ความหมาย purpose/type/level/stage mappings และหลักฐาน ไม่ใช่Application/Candidateทะเบียนใหม่

## 1 Requirementกับข้อมูลตัวอย่างที่ยังไม่รับรอง

หลักฐานแถว“หน้าตัวอย่าง”ด้านล่างคือข้อความที่ผู้ใช้ระบุในพรอมป์ต์บท35 ไม่ใช่การตรวจหน้าเว็บล่าสุดหรือไฟล์ทางการที่ได้รับแล้ว ไม่มีsourceURL/ไฟล์ฉบับรับรองแนบมาสำหรับบทนี้ จึงไม่สรุปว่าชื่อบนเมนูเป็นใบสมัครหรือแบบที่พิมพ์ได้จริง

| Ref    | รหัสที่ต้องรองรับ | ข้อมูลหน้าตัวอย่างตามพรอมป์ต์           | ความหมาย/การจับคู่ทางการ                                                         | Modeทางการขณะนี้ |
| ------ | ----------------- | --------------------------------------- | -------------------------------------------------------------------------------- | ---------------- |
| F35-01 | ศ.1               | ระบุสำหรับนักธรรมตรี                    | TO VERIFY: ขอชื่อเต็ม purpose issuer/edition/type-levelและfilelayout             | BLOCKED          |
| F35-02 | ศ.2               | ระบุสำหรับนักธรรมโท/เอก                 | TO VERIFY: ต้องดูว่าใช้หนึ่งlayout/สองmappingและเงื่อนไขรุ่นใด                   | BLOCKED          |
| F35-03 | ศ.3               | ข้อกำหนดขอรองรับ แต่ไม่ให้ความหมาย/ไฟล์ | TO VERIFY: ไม่มีpurpose/type/level/ช่วงชั้น ไม่เดาว่าเป็นใบสมัครและไม่aliasศ.1/2 | BLOCKED          |
| F35-04 | ศ.5               | ระบุสำหรับธรรมศึกษา                     | TO VERIFY: purpose/type/level/stage/รุ่นที่ใช้ยังต้องไฟล์                        | BLOCKED          |
| F35-05 | ศ.6               | ระบุสำหรับธรรมศึกษา                     | TO VERIFY: ไม่เดาว่าคือระดับใดหรือเลือกแทนศ.5ได้                                 | BLOCKED          |

ความต่างที่ต้องบันทึก: BLUEPRINTต้องรองรับขอบเขตศ.1–ศ.3กับศ.5–ศ.6; ข้อมูลหน้าตัวอย่างตามพรอมป์ต์ให้mappingบางส่วนเฉพาะศ.1/ศ.2/ศ.5/ศ.6 ไม่ให้ความหมายศ.3 ความขาดนี้ไม่ใช่หลักฐานให้ตัดศ.3ออกหรือแต่งความหมาย ศ.4/ศ.8ที่เคยอ้างในBLUEPRINTไม่อยู่ขอบเขตimplementation35 ไม่ขยายแบบจากการเดา

## 2 Contractหนึ่งregistryหลายรุ่น

FormTemplateRegistryเสนอnamespace/template_code/version, official_form_reference, verification_status, meaning/purpose, issuer/source edition/published/effective window, evidence Document/FileVersion/hash, content/schema/layout version/rights, verifier/checker/provenanceและrecorded_at เมื่อใช้กับApplicationSnapshot/ImportBatchต้องpinFKรุ่น ไม่ใช้filename/URLล่าสุดเป็นเวอร์ชัน

typedmappingต่อExamType/ExamLevel/StageOffering/AcademicYearหรือช่วงที่sourceรับรอง ไม่มีmappingด้วยfree-textชื่อประเภทหรือJSONที่clientสั่งเลือกbusinessserviceเอง รหัสเครื่องschema/layoutแยกจากรหัสแบบทางการ หลายlayoutต่อรหัสหรือหลายประเภทในรุ่นเดียวต้องexplicitbindingsและuniquesที่validateได้ ไม่uniqueformcodeทั่วทุกปีจนเพิ่มรุ่นไม่ได้

sourceverificationมีscope: ผู้รับรองตรวจชื่อ/ความหมาย/ฟิลด์/รุ่น/ประเภท/ระดับ/ช่วงชั้น/purpose/ปีที่ใช้ ชุดที่ไม่อยู่ในscopeไม่inheritverifiedรุ่นอื่น “VERIFIED”ไม่แปลว่ามีสิทธิ์เผยแพร่ ข้อมูลในเอกสารหรือไฟล์ทุกชุดต้องACL/scan/rights/retentionตามpolicy

O05รับรองbusiness/formmeaning/type mapping O09รับรองmachine-schema/ตัวอย่างนำเข้า C03รับรองpurpose/visibility/retention C02ดูแลguardและversions ผู้สร้างรุ่นไม่เป็นcheckerของรุ่นนั้น อำนาจบุคคลจริง/sourceทางการยังQ003/Q005/Q006/TO VERIFY

## 3 Officialissuance guardเสนอ

ทุกprint/download/export/renderและjobต้องcurrentaccount/action/resource/scope/fieldACL พร้อมpolicy/formrules และตรวจserver-side:

1. modeOFFICIALต้องรุ่นVERIFIEDที่meaning/type/level/stage/purpose/year/windowตรงcontext โดยverifiedactor/evidenceที่รับรอง ไม่รับclient `verified=true`/`official=true`
2. officialsourceFileVersionยังใช้ได้และผ่านscan/ACL/สิทธิ์ใช้เนื้อหา; มีlayout/machine-schemaรุ่นที่reviewแล้วกับrequiredfieldsครบ ไม่fallbackDEMOแทนofficialเมื่อหาlayoutไม่พบ
3. ApplicationSnapshot/approval/sourcefieldsตรงรุ่นและpurposeที่มีสิทธิ์ออก; templateverifiedไม่ทำให้draftใบสมัครผ่านอนุมัติหรือเป็นผลสอบทางการ
4. ความหมายศ.3หรือmappingขาดให้FORM_NOT_VERIFIED/NOT_READYและsafeerror ไม่มีoutputofficialผ่านAPI/workerแม้ซ่อนปุ่มบนหน้าเว็บแล้ว
5. withdrawal/supersededtemplateต้องpolicyระบุว่าจะออกซ้ำเอกสารเก่าได้หรือไม่และใช้รุ่นใด คงpins/history ไม่แทนlatestเงียบ ๆ; jobqueuedต้องตรวจซ้ำตอนทำ/ดาวน์โหลด

ขณะนี้ทุกF35-01–05ขาดไฟล์ทางการ จึงต้องปิดofficialissuanceทั้งหมดในการimplementationภายหลัง ไม่อ้างว่ามีguardที่รันทดสอบแล้วในบทนี้

## 4 DEMOlayout contract — ไม่ใช่แบบ ศ.ใด

layoutสมมติใช้code `DEMO_APPLICATION_LAYOUT_V1` แยกnamespace/modeDEMO ไม่ตั้งชื่อ“ศ.3สมบูรณ์”หรือใส่ตรา/ลายมือชื่อ/เลขแบบทางการเพื่อให้เข้าใจผิด ไม่มีrenderer/ไฟล์HTML/PDFสร้างในบท35

| ส่วนเสนอ      | ข้อมูลสมมติ/แหล่งที่ใช้                                   | เงื่อนไข                                                |
| ------------- | --------------------------------------------------------- | ------------------------------------------------------- |
| หัวเอกสาร     | “ตัวอย่างสมมติสำหรับทดลอง — ไม่ใช่แบบหรือเอกสารทางการ”    | ติดป้ายทุกหน้า/print/export/download ไม่ใช้สีอย่างเดียว |
| ตัวตน         | candidate/application reference และชื่อสมมติจากSnapshot   | ไม่มีบัตรประชาชน/วันเกิด/เบอร์/ที่อยู่จริง              |
| บริบท         | ปีการศึกษา ประเภท รอบ ระดับและช่วงชั้นที่DEMOconfigกำหนด  | ไม่ปีงบ/คะแนนฝึก/แบบทางการ                              |
| สังกัด        | ชื่อหน่วยสมมติตอนสมัครและsourceversion ref                | ไม่joinlatestมาทับปีเก่า                                |
| ข้อมูลตรวจสอบ | snapshotversion/captured_at/mode/layoutversion/statusคำขอ | ไม่privateauditreason/ลายเซ็นทางการ/secret              |

fixture/layoutcontractสมมติพัฒนาต่อได้เมื่อdependencyพร้อม ไม่ถือว่าrenderได้จริงหรือofficialgateผ่านจากตารางนี้ ภายหลังต้องทดสอบP35-08/09/10ทั้งAPI/job/render/privatecache รวมclientmode tampering

## 5 วิธีรับรองแหล่งทางการ

ขอไฟล์ฉบับที่หน่วยงานรับรองสำหรับแต่ละรหัส ระบุsource/issuer/edition/purpose/effective scope และผู้ตรวจ Storeผ่านเอกสารกลาง10 private quarantine/scan/ACLก่อนpreview ตรวจfield/layoutคู่กับmachine-schemaเก็บhashและtypedmapping ต่อรุ่นแล้วreviewคนละcreatorก่อนเปิดเฉพาะscopeที่รับรอง

ไม่เก็บไฟล์ผู้สมัครหรือข้อมูลจริงในrepository ไม่ใช้เว็บตัวอย่างแทนใบอนุญาต/กฎทางการ ไม่สร้างเอกสารจริงจากข้อสันนิษฐาน ทุกF35/P35ยังTO VERIFYหรือNOT RUN คู่มือกฎสมัครเรียน/สอบอยู่ [APPLICATION_STATES](APPLICATION_STATES.md) schema/migration/coreversionsยังเดิมตามAPPLICATION_SCHEMA บท36ยังไม่เริ่ม

## 6 เพิ่มขอบเขตแบบผลสอบจากบท39 — ยังไม่ใช่ DB registry

รุ่น0.1บท35อ้างsource `fb346a0` สำหรับศ.1/2/3/5/6; รุ่น0.2เพิ่มสองรายการความต้องการจากพรอมป์ต์39ต่อregistryเดิมตาม [RESULT_PUBLICATION_POLICY](RESULT_PUBLICATION_POLICY.md) ไม่เปลี่ยนmappingเดิม ไม่สร้างrenderer/registryrows/ไฟล์แบบทางการ และไม่อ้างว่าทั้ง7รหัสได้รับรับรองแล้ว

| Ref | รหัส | ข้อมูลที่ได้รับ | ยังต้องตรวจจากหลักฐาน | สถานะ/การออกจริง |
| --- | --- | --- | --- | --- |
| F39-01 | ศ.4 | ผู้ใช้ระบุเป็นแบบบัญชีผลสอบ ไม่มีไฟล์แนบ | ชื่อเต็ม purpose issuer edition effective year/type/level/stage fields/layout/source hash/checker/rights | TO VERIFY / OFFICIAL BLOCKED |
| F39-02 | ศ.8 | ผู้ใช้ระบุเป็นแบบบัญชีผลสอบ ไม่มีไฟล์แนบ | รายการเดียวกัน ต้องตรวจแยก ไม่อนุมานmappingนักธรรม/ธรรมศึกษาจากรหัสหรือชื่อเมนู | TO VERIFY / OFFICIAL BLOCKED |

FormTemplateRegistryเมื่อสร้างจริงต้องpinรุ่นกับrelease/source snapshot/policy ไม่ใช้versionlatestอัตโนมัติ หลักฐานfileต้องscan/ACL/สิทธิ์ใช้ผ่าน10 ผู้ตรวจต่างจากcreator อนุมัติtemplateไม่อนุมัติเปิดข้อมูลผู้เยาว์หรือprivatefields ศ.4/8 officialissuance guardใช้กฎร่วมข้อ3และcurrentpublicationgate39 ทั้งAPI/job/render/download การถอนประกาศต้องปิดdownloadแม้templateยังverified

ทดลองภายหลังใช้ `DEMO_RESULT_LAYOUT_V1` มีข้อความ “ตัวอย่างสมมติสำหรับทดลอง — ไม่ใช่แบบหรือผลสอบทางการ” ทุกหน้า ไม่มีตรา/ลายมือชื่อทางการ ไม่เรียกว่าlayoutศ.4/8 ไม่มีlayout/PDF/Excelใหม่สร้างในรอบ39 ตรวจจริงตามP39-14เมื่อprerequisiteพร้อม; ตอนนี้ NOT RUN

## 7 Machine upload template จากบท 59

เพิ่มข้อเสนอ binding `DEMO_EXAM_UPLOAD@0.1.0` ใน registry กลางเดิม purpose `EXAM_APPLICATION_UPLOAD` mode DEMO official_form_reference null verification TO_VERIFY official_issuance_enabled false ไม่เพิ่มทะเบียนใบสมัครหรือ registry DB ระบบ 09 อีกชุด รหัสแบบ ศ.1/2/3/5/6 และ ศ.4/8 ข้างต้นยังขาด source ที่รับรอง ไม่เปลี่ยนสถานะเป็น VERIFIED จากการสร้าง XLSX ได้

Machine schema 0.1.0 มี header row 4 / data row 5 / typed TEXT / ISO Gregorian text date / 21 field ผู้สมัคร + 5 field หมายเหตุ ครอบคลุม NK 3 และ DS 9 กลุ่ม ใช้ remark mapping `DEMO_REMARKS_0.1.0` หลายแถวต่อ row_id โดย free text ไม่อนุมัติ แยก schema อัปโหลดจาก display form/layout แบบพิมพ์และ source edition ทางการ เสนอ pin immutable รุ่นกับ import batch ภายหลัง

[Configuration](fixtures/excel-template-59-plan.json), [generator contract](EXCEL_TEMPLATE_CONTRACT.md), [คู่มือ](EXCEL_IMPORT_GUIDE.md) และ XLSX เปล่า/ถูก/ผิดใน [outputs/lesson59](../outputs/lesson59) เป็นไฟล์สมมติออฟไลน์ ไม่ใช่ production generator/ExcelJS adapter หรือ authenticated download endpoint ทดสอบ roundtrip ไทย/ศูนย์นำหน้าและ blank fill ได้ตาม [verification](fixtures/excel-template-59-verification.json) แต่ official guard/DB registry/ACL/worker/import ยัง NOT RUN prerequisites35/58 BLOCKED ไม่ migration และไม่เริ่ม60
