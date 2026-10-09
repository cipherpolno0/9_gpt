# สัญญา generator และ registry version — บท 59

รุ่น 0.1 | 9 ตุลาคม 2569 (2026-10-09) | **Proposal / runtime NOT IMPLEMENTED**

ใช้ [FormTemplateRegistry กลาง](FORM_TEMPLATE_REGISTRY.md) ระบบ 05 ไม่สร้าง registry DB อีกชุดให้ระบบ 09 [fixture รุ่น 0.1.0](fixtures/excel-template-59-plan.json) เป็น configuration เสนอ ไม่ใช่ rows ที่ apply ลง DB และไม่มี actual registry/source FileVersion/application IDs

## การแยกสิ่งที่เปลี่ยนรุ่น

| สิ่งที่ต้อง pin         | รุ่นทดลอง                | ความหมาย                                                                                          |
| ----------------------- | ------------------------ | ------------------------------------------------------------------------------------------------- |
| Template code/version   | DEMO_EXAM_UPLOAD / 0.1.0 | กลุ่มที่รองรับและ schema ที่ใช้สร้างไฟล์                                                          |
| Machine schema          | 0.1.0                    | หัวแถว 4, data แถว 5, typed TEXT, 21 field + 5 field remarks, ISO Gregorian text date, empty/null |
| Remark/evidence mapping | DEMO_REMARKS_0.1.0       | allowlist รหัสและหลักฐาน หลายรายการต่อ row; free text ไม่มีผลอนุมัติ                              |
| Official source edition | ไม่มี / TO VERIFY        | ต้องอ้าง Document/FileVersion/hash/rights/ผู้ตรวจ/ขอบเขตและวันมีผลที่รับรอง                       |
| Display form/layout     | ไม่มีแบบทางการ           | แยกจาก machine schema; ไม่ใช้หน้าตา XLSX ทดลองเป็น layout ศ.ใด                                    |

เปลี่ยน required field/type/header/date/group/mapping ให้สร้างรุ่นใหม่และตรึงรุ่นเดิมกับ batch ไม่แก้ตารางรุ่นเก่าหรือใช้ latest แทนโดยเงียบ ๆ การเพิ่มชนิดตัวตนต้องผ่านนโยบายหลักฐานจากระบบ 05 ไม่เปลี่ยนชื่อ Person จากไฟล์อัตโนมัติ

## Generator service ที่ต้องสร้างเมื่อ prerequisites พร้อม

Input เสนอ: current account/request context, registry version ID, selected Organization/ExamCenter/AcademicYear/ExamSession IDs, exam type/level/stage และ output kind BLANK/DEMO_VALID/DEMO_INVALID บริบทเลือกได้เฉพาะ scope ที่มีหน้าที่และวันมอบหมายอยู่ ใช้ทะเบียนและ policy เดียวกับระบบ 05 ไม่รับ client-supplied scope/verified flags

ลำดับ: ตรวจสิทธิ์ → resolve immutable version → ตรวจ mode/verification/coverage/window/rights/source CLEAN ACL → สร้างจาก schema/mapping ที่ pin → เก็บ manifest/sha256/ผู้สร้าง/เวลาบันทึก/audit ตามนโยบาย → download ตรวจสิทธิ์ซ้ำ ใช้ private/no-store ตามข้อมูล ผลต้องไม่มี applicant PII ถ้าเป็น public DEMO และไม่มีข้อมูลจริงหลงลงไฟล์ตัวอย่าง

OFFICIAL ขาดไฟล์หรือ meaning/mapping ใดคืน FORM_NOT_VERIFIED/NOT_READY โดยไม่สร้าง output ไม่ fallback แบบ DEMO แล้วตั้งชื่อทางการ official verified template ไม่ทำให้ผู้สมัคร approved หาก template ถูกถอนให้ queued job/download recheck ตาม current policy และแสดงเหตุผลปลอดข้อมูลส่วนตัว

**ยังไม่มี implementation service หรือ route ตามลำดับนี้** MASTER ข้อ 2 กำหนด “ก่อนเริ่มเขียนโค้ด สรุปแผนเป็นไทยไม่เกิน 10 บรรทัดแล้วรอคำว่า ‘ตกลง’” และยังไม่มีการอนุมัติแผน application runtime บท 59; prerequisites 35/58 ไม่พร้อมตาม schema และ db:test หลักฐาน จึงส่งมอบ offline XLSX กับ contract แยกจาก production generator ไม่ติดตั้ง ExcelJS/สร้าง auth, workflow หรือไฟล์กลางอีกชุด

## ชนิดเซลล์และการตรวจย้อน

Identifiers/codes/date protocol เป็น string และ number format `@` ห้ามแค่ใส่ number format กับค่า numeric แล้วถือว่ารักษาศูนย์ได้ Invalid example จงใจมี numeric J7 = 3 เพื่อทดสอบ CELL_MUST_BE_TEXT ไม่มีสูตรแม้ validation list จะมี formula1 XML เป็นค่ารายการ ไม่ใช่ cell formula `f` ชุดตัวอย่างสำรองช่อง text 20 แถว (5–24) ต้อง reject ข้อมูลเกินขอบเขต ไม่อ่านข้ามแล้วทิ้งเงียบ ๆ การกำหนดเพดานใช้จริงต้อง schema version/config/load test แยก

ชีตนำเข้าห้าม merge/hide cells/header เปลี่ยน; blank และ optional fields อาจคืน `null` หลัง XLSX export/import ต้อง normalize เฉพาะ empty ไม่ normalize invalid ID โดยเติมศูนย์ เปรียบเทียบชื่อภาษาไทยและรหัสแบบ exact ก่อนทำ business matching กำหนด normalization สำหรับทะเบียนจริงใน policy version ภายหลัง ไม่รวมคนตามชื่อเหมือน

Generator แบบแอปให้ใช้ ExcelJS ตาม MASTER เมื่ออนุมัติและพร้อม ส่วนไฟล์ตัวอย่างรอบนี้สร้างด้วย @oai/artifact-tool ในเครื่องมือ authoring แล้ว import กลับและตรวจ XML อิสระ ไม่เพิ่ม package runtime หรืออ้างว่า ExcelJS adapter ผ่านแล้ว

## กลับไป Application service เดียวกัน

การอ่าน/upload/ตรวจผ่านไม่สร้างคำตัดสิน commit ผ่านระบบ 05 ตรวจ code/scope/ปี/รอบ/natural key/คุณสมบัติ/current evidence/window อีกครั้งใน transaction/idempotency/unique constraints snapshot pin ชื่อสังกัด ณ สมัคร ใช้ central Person และ Candidate เดิม ไม่สร้าง Candidate สำรองให้ importer ไม่ upsert ทับ approved/submitted ไม่ออก seat/certified score/result release จาก remark หรือข้อความในไฟล์

## เกณฑ์ตรวจรับและข้อจำกัด

| เกณฑ์                                             | ผลออฟไลน์                                                                              | สิ่งที่ต้องพิสูจน์บนระบบจริง                                                                           |
| ------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 59-01 ดาวน์โหลดกรอกและอ่านกลับชื่อไทย/ศูนย์นำหน้า | ตรวจสาม XLSX และอ่าน text คืนได้; blank fill simulation ในความจำไม่สร้างไฟล์เพิ่ม      | authenticated generator/download + upload parser + private field scope + Excel Desktop UAT ยัง NOT RUN |
| 59-02 ไม่มี form verified ไม่สร้างแบบทางการผิด    | 3 ไฟล์ติดป้าย DEMO ไม่มีเลขแบบ/ตรา/ลายมือชื่อ; official reference null/config disabled | server official guard/API/worker ต้องปฏิเสธจริง ไม่อ้างว่า JSON false เท่ากับ guard                    |

หลักฐานไฟล์ [verification](fixtures/excel-template-59-verification.json) ความครบ fields ทางการ/remark mapping/บุคคลผู้รับรอง/แบบต้นฉบับยัง TO VERIFY; native db:test exit 1 บท 35/58 BLOCKED บทถัดไป 60 ระบุไว้เพื่อวางลำดับเท่านั้น ยังไม่เริ่ม
