# Mapping จศป. และ “ทุกแท่ง” — แบบเตรียมบท 13

รุ่นเอกสาร 0.1 | 3 ตุลาคม 2569 | **Proposal / TO VERIFY / implementation BLOCKED ตาม foundation12**

เอกสารนี้เก็บคำตามพรอมป์ต์ผู้ใช้ ไม่ขยายคำย่อ “จศป.” ไม่ตีความ “ทุกแท่ง” เป็นรายชื่อตำแหน่งหรือจำนวนที่แต่งขึ้น ขอบเขตที่ยืนยันได้มีเพียงต้องรองรับแผนกธรรม บาลี สามัญ และปริยัตินิเทศก์ ไม่มีหลักฐานรหัสทางการ/รายชื่อประเภทครบจากเจ้าของงานในrepository

## 1 ตาราง mapping ที่รอหลักฐาน

แต่ละแถวเป็นจุดติดตามแผนก ไม่ได้หมายความว่าแต่ละแผนกมี จศป. เพียงประเภทเดียว รหัสDEMOด้านล่างเป็นข้อเสนอภายในที่ไม่ถูกseedหรือสร้างเป็นmasterจริง ไม่มีgrantหรือสิทธิ์เผยแพร่เกิดจากรหัสนี้

| รหัสติดตามภายในสมมติ   | คำต้นทาง      | แผนกจากผู้ใช้  | รหัสทางการ / ประเภท / labelที่เจ้าของรับรอง | ช่องข้อมูลปลายทางเสนอ                                                          | scope/actionที่รับรอง         | หลักฐาน/วันมีผล | สถานะ     |
| ---------------------- | ------------- | -------------- | ------------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------- | --------------- | --------- |
| DEMO_UNVERIFIED_JSP_01 | จศป.; ทุกแท่ง | ธรรม           | NULL / ยังไม่ยืนยัน                         | education_branch_id + position_type_id + person_id/organization_idในassignment | ยังไม่ยืนยัน; deny by default | ยังไม่มี        | TO VERIFY |
| DEMO_UNVERIFIED_JSP_02 | จศป.; ทุกแท่ง | บาลี           | NULL / ยังไม่ยืนยัน                         | education_branch_id + position_type_id + person_id/organization_idในassignment | ยังไม่ยืนยัน; deny by default | ยังไม่มี        | TO VERIFY |
| DEMO_UNVERIFIED_JSP_03 | จศป.; ทุกแท่ง | สามัญ          | NULL / ยังไม่ยืนยัน                         | education_branch_id + position_type_id + person_id/organization_idในassignment | ยังไม่ยืนยัน; deny by default | ยังไม่มี        | TO VERIFY |
| DEMO_UNVERIFIED_JSP_04 | จศป.; ทุกแท่ง | ปริยัตินิเทศก์ | NULL / ยังไม่ยืนยัน                         | education_branch_id + position_type_id + person_id/organization_idในassignment | ยังไม่ยืนยัน; deny by default | ยังไม่มี        | TO VERIFY |

NULLหมายถึงยังไม่รู้ ไม่ใช่รหัสทางการว่างที่ผ่านvalidation ตารางนี้ยังไม่พิสูจน์ “ครอบคลุมทุกประเภท” ต้องขอรายการประเภททั้งหมดจากเจ้าของ แล้วเพิ่มแถวต่อประเภทตามหลักฐาน โดยไม่จำกัดไว้4แถวหรือใช้รหัสที่เดา

## 2 สัญญา configuration ที่เสนอ

| กลุ่ม             | ช่องที่ต้องเก็บเมื่อimplement                                                                              | วิธีตรวจ                                                                                               |
| ----------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| ตัวคำต้นทาง       | literal_term, source_context, owner_confirmed_meaning                                                      | เก็บข้อความต้นฉบับ; meaningยังNULLจนเจ้าของยืนยัน                                                      |
| แผนก              | education_branch_id, internal_code, label_th, verification_status                                          | labelsสี่แผนกมาจากผู้ใช้ แต่internalcodeไม่ใช่officialcode                                             |
| ประเภท/รหัสทางการ | position_type_id, official_code, issuer_namespace, official_label, mapping_version                         | FKไปmasterที่รับรอง; uniqueตามnamespace+code+versionที่เจ้าของยืนยัน ไม่ใช้NULLmatchเป็นประเภทเดียวกัน |
| ช่องข้อมูล        | target_resource_kind, validated_field_mapping                                                              | เลือกจากregistryฝั่งserverที่กำหนดไว้ ไม่รับSQL/ชื่อmodelอิสระจากclient                                |
| เขตหน้าที่/อำนาจ  | authority_line, resource_scope_kind, permitted_actions, assignment_period                                  | ผ่านauthz07และหลักฐานสาย/การมอบหมาย; ห้ามderivegrantจากชื่อแผนก/ตำแหน่งอย่างเดียว                      |
| หลักฐานและเวลา    | evidence_file_version_id, evidence_hash, effective_from/to, recorded_at, confirmed_by, verification_status | หลักฐานscan/ACLผ่าน10และผู้รับรองมีอำนาจ; ไม่ใช้Documentmetadataเดิมแทนไฟล์ผ่านตรวจ                    |

configurationนี้ยังไม่ใช่schema เลือกFK/model/constraintsจริงหลังfoundationผ่านและรับแผนโค้ด ห้ามเก็บpassword/token/ข้อมูลส่วนบุคคลในJSONconfiguration unknownfieldsต้องปฏิเสธเมื่อรับinput

## 3 วิธีปิด TO VERIFY

1. O01/C01ที่เสนอในCharterขอเจ้าของงานยืนยันคำว่า จศป., “ทุกแท่ง” และรายการประเภทครบทุกแผนก ไม่แต่งชื่อผู้รับผิดชอบจริง
2. ขอเอกสารบัญชีรหัส รุ่น วันที่มีผล ความหมายแต่ละประเภท และฟิลด์ทะเบียนที่ต้องมี บันทึกissuer/sourceและhashของหลักฐาน
3. O02/C02กับเจ้าของเรื่องยืนยันสาย/หน่วยงาน/พื้นที่และช่วงมอบหมาย ส่วนอำนาจอนุมัติให้ผู้รับผิดชอบQ006รับรอง ไม่ใช้ลำดับองค์กรหรือชื่อหน้าที่แทนอำนาจ
4. ตรวจmappingที่อ้างPerson/Organizationกลางและหลายหน้าที่ ไม่สร้างPersonใหม่ตามรหัสประเภท อำนาจroleแยกจากPositionType
5. บันทึกรุ่นใหม่พร้อมเหตุผล/ผู้รับรองในworkflow/audit เมื่อmappingเก่าถูกใช้แล้วรักษารุ่นนั้นไว้สำหรับประวัติ ไม่เปลี่ยนผลย้อนหลังด้วยการแก้labelหรือcodeตรง
6. แยกการรับรองรหัส/ความหมายออกจากการอนุญาตเผยแพร่ ต้องมีQ008/Q025 fieldallowlistก่อนแสดงทำเนียบpublic ไม่ถือว่าVERIFIEDแล้วเผยแพร่ได้ทุกช่อง

## 4 หลักฐานที่ยังขาดและผลกระทบ

| คำถามเดิม                   | หลักฐานที่ต้องได้รับ                                                | ผลถ้ายังไม่ครบ                                      |
| --------------------------- | ------------------------------------------------------------------- | --------------------------------------------------- |
| Q001                        | นิยามและบัญชีประเภท/รหัสของ จศป. “ทุกแท่ง” พร้อมวันมีผล             | mappingและcoverageทางการยังยืนยันไม่ได้             |
| Q002                        | ผังสาย/สังกัด/พื้นที่จริงและตัวอย่างscope                           | ไม่เปิดgrantตามพื้นที่จริง                          |
| Q005/Q006                   | เจ้าของ/ผู้ตรวจและอำนาจ/ช่วงมอบหมายที่รับรอง                        | ไม่เปิดอนุมัติหรือมอบสิทธิ์ธุรกิจจริง               |
| Q008/Q025                   | purpose/classification/allowlist/การเปิดเผยและวิธีเก็บข้อมูลอ่อนไหว | ไม่เปิดpublicหรือdirectoryprojectionที่ยังไม่รับรอง |
| Q027/DB-06 และ foundation12 | ผลnativeDBพร้อมauthz/files/workflow/outboxที่ผ่าน                   | ไม่เพิ่มmigrationหรือserviceบุคลากรบท13ในรอบนี้     |

## 5 แผนตรวจ mapping — NOT RUN

เมื่อimplementแล้วต้องตรวจconfigunknowncode/unknownfieldถูกปฏิเสธ, TO_VERIFYไม่ใช้รับรองงานทางการหรือมอบgrant, คนเดียวมีหลายประเภทโดยPersonเดียว, mappingrevisionไม่เปลี่ยนassignmentเก่า และทุกread/export/jobตรวจscope/fieldgrantจริง ไม่มีการรับรองmappingนี้ด้วยการตรวจรูปแบบMarkdownเท่านั้น

อ่านคู่กับ [PERSON_FIELDS](PERSON_FIELDS.md), [OPEN_QUESTIONS](OPEN_QUESTIONS.md), [DATA_CLASSIFICATION](DATA_CLASSIFICATION.md) และ [FOUNDATION_ACCEPTANCE](FOUNDATION_ACCEPTANCE.md)
