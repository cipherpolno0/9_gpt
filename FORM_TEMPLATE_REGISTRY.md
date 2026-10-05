# ทะเบียนแบบบัญชีและการยืนยันแหล่งทางการ — บท 35

รุ่น 0.1 | 4 ตุลาคม 2569 (2026-10-04) | source `fb346a0` | **Proposal / BLOCKED — ยังไม่มีregistry/renderer/issuanceguardจริง**

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
