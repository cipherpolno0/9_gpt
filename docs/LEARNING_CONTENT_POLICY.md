# นโยบายเนื้อหาการเรียนและคลังข้อสอบ — บท 24

รุ่น0.1 | 4 ตุลาคม 2569 | **Proposal / BLOCKED — ยังไม่มี implementation การเผยแพร่**

บท23ไม่ผ่านตาม [UAT_SYSTEM_02](UAT_SYSTEM_02.md) แบบ24ประกอบด้วย [CURRICULUM_SCHEMA](CURRICULUM_SCHEMA.md) และ [CURRICULUM_COVERAGE](CURRICULUM_COVERAGE.md) ทั้ง9กลุ่มเป็นขอบเขตผู้ใช้ การรับรองเนื้อหา สิทธิ์และมาตรฐานตรวจข้อเขียนยัง Q007 TO VERIFY ไม่สร้าง login/ทะเบียนผู้เรียน/เอกสาร/CMS/workflow ใหม่

## 1 ตรวจแหล่งก่อนใช้เนื้อหา

ตรวจเว็บต้นทางวันที่ 4 ตุลาคม 2569 ได้แหล่งผู้เผยแพร่ดังนี้ ไม่ดาวน์โหลดหรือคัดลอกหนังสือ/คลังข้อสอบเข้า repository ไม่ scrape เว็บตัวอย่างหรือ fetch URL ที่ผู้ใช้ส่งเข้ามาในเนื้อหาโดยอัตโนมัติ

| Ref      | URLต้นทางและสิ่งที่ตรวจได้                                                                                                                                                                                                                                                                                             | สิ่งที่ยังไม่รับรอง                                                                                                                                      |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SRC24-01 | [หน้าหนังสือธรรมศึกษา9กลุ่ม กองเทคโนโลยีสารสนเทศ สำนักงานแม่กองธรรมสนามหลวง](https://it.gongtham.net/2026/03/19/download-dhamma-suksa-textbooks-pdf/) เปิดอ่านหน้าเผยแพร่วันที่19มีนาคม2026และรายการกลุ่มได้                                                                                                           | ไม่รับรอง edition/fileversion/สิทธิ์คัดลอก/ความเป็นรุ่นที่ต้องใช้ในโครงการจากหน้าindex                                                                   |
| SRC24-02 | [PDFขอบข่ายธรรมศึกษา2564 บนgongtham.net](https://gongtham.net/docs/2565/%E0%B8%82%E0%B8%AD%E0%B8%9A%E0%B8%82%E0%B9%88%E0%B8%B2%E0%B8%A2%E0%B8%98%E0%B8%A3%E0%B8%A3%E0%B8%A1%E0%B8%A8%E0%B8%B6%E0%B8%81%E0%B8%A9%E0%B8%B22564.pdf) เครื่องมืออ่านรายงาน41หน้า; ตรวจ excerpt หน้าลำดับPDF5/6/8ที่มีหัวข้อวิชาและข้อเขียน | ไม่อ่าน/รับรองครบทุกหน้า ไม่ตรวจchecksumไฟล์จริง ไม่ใช้ปีในURLหรือชื่อไฟล์เป็นหลักฐานว่าปัจจุบันยังใช้ ต้อง source-currentapplicability/ประกาศและผู้ตรวจ |
| SRC24-03 | [หน้าดาวน์โหลดระบบธรรมศึกษา](https://dhammastudy.org/site/download) เปิดหน้าได้ มีรายการคู่มือและหลักสูตร                                                                                                                                                                                                              | ไม่ดึงข้อสอบ/เฉลย ไม่ถือ listing หรือการดาวน์โหลดสาธารณะเป็นใบอนุญาตใช้ต่อ                                                                               |

ข้อมูลจาก SRC24-02 แสดงว่าชื่อหมวดและชื่อวิชาที่ใช้จริงต้องตรวจรายกลุ่ม จึงคง Subjectหมวดจากผู้ใช้แยกจากชื่อ Course ที่ map ตามต้นฉบับ การมองเห็นหัวข้อข้อเขียนไม่รับรอง rubric/คะแนนหรือกฎสอบรุ่นปัจจุบัน

Source register เสนอเก็บ issuer/title/URL/documentdate/edition/language/fileversion/hash/page-or-section/applicablegroup/validity/checked_at/checked_by/evidence ที่ตรวจได้ แยก checked_at ออกจาก created_at ถ้ายังไม่มีข้อมูลให้ NULLพร้อมTO VERIFY ไม่แต่งค่า hash/สิทธิ์/ผู้ตรวจหรือปีฉบับปัจจุบัน

## 2 สิทธิ์ใช้เนื้อหาและการตรวจ

rights register ต้องมีผู้ให้สิทธิ์ หลักฐาน license/permission รุ่น ขอบเขตกลุ่มภาษา วัตถุประสงค์ที่อนุญาต เช่น link-only/reproduce/adapt/display/export ข้อกำหนด attribution วันมีผล-สิ้นสุด และผู้ตรวจ C03/O03 Linkหรือไฟล์อ่านฟรีไม่ทำให้ reproduce/adapt/export ผ่านโดยอัตโนมัติ เกณฑ์ legal/fair use ไม่เดา

การรับรองแต่ละบทเรียนต้องมี reviewer_account_id จากบัญชีกลาง ช่วงมอบหมาย กลุ่ม/วิชาที่ตรวจได้ content/source/rights hash ที่ตรึง เหตุผลและหลักฐานการตัดสินผ่าน workflowกลาง ผู้สร้างห้ามรับรองงานสำคัญของตนเอง ผู้อนุมัติเนื้อหาไม่ได้สิทธิ์ publishโดยอัตโนมัติ และเทคนิค adminไม่ได้อำนาจผู้เชี่ยวชาญจาก roleชื่อเดียว

ตัวอย่างที่แต่งใหม่ติดป้าย “DEMO เนื้อหาทดลอง ยังไม่ผ่านผู้เชี่ยวชาญรับรอง ไม่ใช่ข้อสอบหรือผลสอบทางการ” บนหน้าหลักสูตร/บทเรียน/แบบฝึก/ส่งออกทุกแห่งเมื่อมีจริง แยกป้าย DEMO จาก approved status; อนุมัติ prototypeไม่ทำให้เนื้อหากลายเป็นทางการ

## 3 วงจรเผยแพร่และไฟล์

draft → review → approved → scheduled/published → withdrawn เป็นสถานะเนื้อหาที่เสนอ การตัดสิน review ใช้สถานะ workflowกลาง11 ไม่สร้าง enumเดียวแทนทุกสถานะ และไม่เปิด publicทันทีที่ approved

เผยแพร่ต้อง scope/actionปัจจุบัน หลักฐานสิทธิ์/ผู้ตรวจครบ รุ่นตรึง ไฟล์ผ่าน scan และ window [publish_from, publish_until) ด้วย serverclockมาตรฐาน/AsiaBangkok ช่วงสิทธิ์ใช้เนื้อหาหรือคำสั่งถอนที่หมดก่อนต้องหยุดเผยแพร่ก่อนตาม policy ไม่มีนโยบายที่ยืนยันให้ deny ไม่ตั้ง public=trueเอง worker/retryตรวจซ้ำ ไม่ปล่อย scheduled jobจากสิทธิ์เดิม

ไฟล์ทั้งหมดเริ่ม private upload quarantine ตรวจเนื้อหา MIME/นามสกุล/ขนาด/scan ตามบท10 Previewแยกสิทธิ์ ไม่เอาไฟล์ต้นฉบับ/เฉลย/คำตอบผู้เรียนไป public folder การเผยแพร่ไฟล์ต้อง policyเฉพาะและ gateway/CDN cacheที่รองรับการถอนตามข้อกำหนด ไม่อ้างลิงก์ signedที่ออกแล้วเพิกถอนได้ทันที

body_th/links/media ต้อง sanitization/allowlist ไม่รับ active HTML/script/unsafe URLs/embedตามใจผู้เขียน ตรวจ attributionและข้อมูลส่วนตัวในภาพ/metadataด้วย ถ้าไฟล์ยังscanpendingหรือสิทธิ์ไม่ยืนยัน preview/download/publishต้องถูก deny

## 4 Public DTO และข้อมูลผู้เรียน

ใช้ baseline DATA_CLASSIFICATION: public_ref, title_th, learning_group_label_th, version_no, approved_lesson_content เท่านั้นเมื่อ publicationผ่าน Approvedเนื้อหาอย่างเดียวไม่พอ window/rights/currentwithdrawalยังต้องผ่าน ป้าย DEMO/แหล่งอ้างอิงแบบปลอดภัยต้องอยู่ใน projectionเนื้อหาที่รับรอง ไม่เพิ่ม raw evidence/filekey/account fields ด้วย include

answer_key/solution/เกณฑ์ลับ/คำตอบผู้เรียน/คะแนนส่วนตัว/attempt IDs/private objectkeys/reviewerข้อมูลส่วนตัว ไม่ออก publicDTO/HTML/RSC/cache/static/search/facets/export/logs การเผย feedbackหลังส่งต้องเป็น policyของ assessmentมีรุ่นและ self/gradergrant ไม่ถือส่งคำตอบแล้วอนุญาตเผย answer keyทุกข้อ โดยเฉพาะข้อที่ยังใช้สอบหรือมี attemptอื่น

การอ่าน progress/attempt ต้อง User-Person bindingที่ยืนยัน และ currentscope/enrollment/group grant ไม่ใช้ชื่อ/emailจาก clientเชื่อมเอง คะแนนฝึกแยกจาก official SubjectScore/ResultReleaseระบบ5 Export/worker/downloadตรวจ currentfieldpolicyเช่นเดียวกับจอ ข้อมูลผู้เยาว์/purpose/retentionยัง Q008/Q025/Q016

## 5 ข้อเขียนและการรักษารุ่น

OBJECTIVE ตรวจได้เฉพาะ itemชนิดปรนัยตามคำตอบรุ่นที่ตรึง MANUAL_WRITING/กระทู้ใช้ผู้ตรวจที่ได้รับมอบหมายและ rubricรุ่นที่อนุมัติ สถานะรอตรวจแยกจากได้คะแนน0 AIหรือ similarityช่วยเสนอได้เฉพาะเมื่อมี policyรับรอง ไม่ใช้แทนคำตัดสินผู้ตรวจที่ผู้ใช้กำหนด

Curriculum/LessonVersion/Course/Topicและmanifestที่ sealหรือมีattemptอ้างอิงห้ามแก้เนื้อหาทับ การเปลี่ยนหลักสูตรสร้างรุ่นใหม่ การแสดงหรือให้คะแนน attemptเก่าต้องใช้ references/hash/blueprint/rubricที่ตรึง ไม่ join latest การปรับคะแนนสร้าง revisionมีหลักฐาน ไม่แก้ audit และไม่เขียนผลสอบทางการ ดูขั้นตอนข้อ5ของ CURRICULUM_SCHEMA

withdrawalไม่ลบประวัติและไม่รับประกันว่าเนื้อหาต้องถูกเปิดย้อนหลังเสมอ Retention/คำขอปกปิด/legal holdต้องได้รับการรับรองก่อนงานข้อมูลจริง Auditเก็บ IDs/action/version/hash/reasoncode/evidence/correlation/เวลา หลีกเลี่ยง rawคำตอบ เนื้อหาเต็ม ชื่อผู้เรียน password/token/recoverycode/เฉลย

## 6 เกณฑ์และข้อจำกัด

เกณฑ์9คู่ผ่านเฉพาะการตรวจตารางเอกสารเมื่อรายงานผลท้ายบท ยังไม่ใช่9หน้าหลักสูตร/schema/flowจริง เกณฑ์ attemptรุ่นเก่าไม่เปลี่ยนยัง NOT RUN เพราะไม่มี attempt engine/manifest/immutablegrading runtime P24-01–09ทั้งหมด NOT RUN

ต้องปิด23/foundationก่อน implementation24; Q007ต้องหลักสูตรฉบับที่ใช้/rights/rubric ผู้ตรวจและmappingรายกลุ่ม; Q005/Q006ต้อง authority; Q017ต้องเวลาช่วงเผยแพร่ที่รับรอง; Q023/Q011ต้องcurrent DAL/RLS/files/job/auditoutbox; Q024ต้องkeys/manifest/gradingbinding; Q008/Q025/Q016ต้องpublication/ผู้เยาว์/retention ไม่เพิ่ม migration/seedหรือเลื่อนไป25ในรอบนี้

## 7 ผลตรวจจริงรอบเอกสาร24

| การตรวจ                                                                                                                                                                            | ผลจริงและขอบเขต                                                                                                                                                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Python inline: อ่านตารางและ schema inventory                                                                                                                                       | PASS: 9คู่สองแกนไม่ซ้ำ/9refs/9codes, 7model contractsแบบเสนอ, P24ครบ9case IDs, 38local linksไม่ขาด; coreยัง19models/213scalarfields/migration1 checksumเดิม learningREADME-only |
| `corepack pnpm exec prettier --ignore-path /dev/null --check docs/CURRICULUM_SCHEMA.md docs/CURRICULUM_COVERAGE.md docs/LEARNING_CONTENT_POLICY.md src/modules/learning/README.md` | PASS เฉพาะ4ไฟล์ที่ระบุ ไม่reformatเอกสารสถานะเดิมทั้งเล่ม                                                                                                                       |
| `git diff --check` / `git diff --cached --check` / `corepack pnpm secrets:check`                                                                                                   | PASS ไม่มีwhitespaceerror/รูปแบบsecretที่ตัวตรวจรองรับ ไม่ใช่รับรองความปลอดภัยครบ                                                                                               |
| ค้นเว็บและเปิด SRC24-01/02/03                                                                                                                                                      | เปิดได้และเก็บURL/ขอบเขตที่อ่าน ไม่รับรองrights/currentedition/หนังสือครบหรือcopyเนื้อหา                                                                                        |
| nativeDB/FK/API/9pages/attemptv1-v2/publishworker                                                                                                                                  | NOT RUN ไม่มีimplementation24 prerequisite23ยังBLOCKED                                                                                                                          |

ไม่ได้รันunit/lint/typecheck/build/SQLWASM/environmentprobeใหม่ ผล17unitใน23เป็นประวัติ ไม่ประกาศว่ารันใน24 ไม่มีproduction/ข้อมูลจริง/แพ็กเกจ/schema/migration/seedถูกแก้ ขั้นต่อไปปิด23และdependencyเดิมก่อน implementation24และตรวจ P24-01–09 ไม่เลื่อนไป25จากเอกสาร
