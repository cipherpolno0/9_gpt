# ตำแหน่งและประวัติการดำรงตำแหน่ง — แบบเตรียมบท 14

รุ่นเอกสาร 0.1 | 3 ตุลาคม 2569 | **Proposal / BLOCKED — ยังไม่มี services, schema, seed หรือหน้าประวัติตำแหน่งบท14**

บท14ต้องผ่านบท13ก่อน แต่13ยังเป็นแบบเตรียมและติดfoundation12 เอกสารนี้ต่อ [PERSON_FIELDS](PERSON_FIELDS.md) / [JSP_MAPPING](JSP_MAPPING.md) และlogicaldictionary04 ไม่ใช่การรับรองกฎทางการหรือผลruntime

## 1 แนวคิดทีละขั้น

1. Personบอกว่าเป็นใคร PositionAssignmentบอกว่าคนนี้ทำหน้าที่ใดที่หน่วยงานใดในช่วงไหน คนเดียวมีหลายassignmentโดยใช้Personเดิม
2. effective_from/toบอกช่วงที่หน้าที่มีผล ส่วนrecorded_atบอกวันที่ระบบบันทึกข้อมูล เราจึงถามได้ทั้ง “ทำหน้าที่อะไรเมื่อปีก่อน” และ “ตอนนั้นระบบรู้ข้อมูลรุ่นไหน”
3. การยุติหรือแก้ย้อนหลังต้องเก็บรุ่นเก่าและหลักฐานเดิม เพิ่มรุ่นที่แก้พร้อมเหตุผล ไม่ลบหน้าที่ออกจากประวัติทั้งหมด
4. ตำแหน่งในทะเบียนไม่ใช่RoleAssignmentของเว็บไซต์ ต้องมอบgrantแยกตามบท07 ไม่มีสิทธิ์อ่าน/แก้/อนุมัติจากชื่อหน้าที่โดยอัตโนมัติ

## 2 ข้อมูลและสัญญาที่เสนอ

| ส่วน                 | ฟิลด์/ความสัมพันธ์ที่ต้องมี                                                                                   | ข้อจำกัด                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| PositionAssignment   | UUID, logical_assignment_id, person_id, organization_id, position_type_id, policy_version_id, seat_idnullable | FKไปPerson/Organization/PositionTypeกลาง ไม่สร้างทะเบียนคนหรือหน่วยงานซ้ำ                                        |
| ระดับและแผนก         | organizational_level_code / education_branch_id ตามรุ่นmasterที่รับรอง                                        | ระดับตำบล/อำเภอ/จังหวัด/ภาคและ4แผนกตามขอบเขตผู้ใช้; ไม่เชื่อlevel/org_idจากclient ต้องvalidateหน่วยงานฝั่งserver |
| ประเภทการดำรงหน้าที่ | assignment_kind: appointed / acting ตามชื่อในlogicaldictionary                                                | การยุติต้องยังรู้ว่าก่อนหน้านั้นappointedหรือacting ห้ามทับประเภทเดิมด้วยended                                   |
| วันมีผล              | effective_from / effective_to ชนิดdate; [เริ่ม,สิ้นสุด)                                                       | จัดเก็บวันค.ศ.มาตรฐาน; แสดงพ.ศ.ที่UI วันที่อ้างอิงใช้Asia/Bangkok                                                |
| วันบันทึก/รุ่น       | recorded_at / superseded_at / replaces_id / row_version                                                       | instantมาตรฐาน; supersedeกับinsertreplacementในtransactionเดียว                                                  |
| คำสั่งแต่งตั้ง       | order_referenceตามหลักฐาน, appointment_evidence_file_version_id, evidence_hash                                | เลขคำสั่ง/ไฟล์จริงเป็นข้อมูลrestricted ตรวจACLเสมอ devใช้DEMO_ORDERเท่านั้น                                      |
| การยุติ/แก้ไข        | source_request_id, reason_code, termination/correction evidence links                                         | ไม่เขียนทับหลักฐานแต่งตั้ง; evidenceแต่ละlinkมีเวลา/รุ่นของตน                                                    |
| อำนาจและการตรวจ      | authority_evidence_reference, verification_status, verified_by, verified_at                                   | อำนาจต้องตรวจจากหลักฐานที่เจ้าของรับรอง ชื่อผู้ลงนาม/ตำแหน่ง/scanผ่านไม่พิสูจน์อำนาจเอง                          |
| provenance           | actorบัญชีและactorworker, correlation_id, command idempotency key/receipt                                     | ใช้auth/audit/workflowกลางเมื่อพร้อม; ServiceActorcoreไม่ใช่loginหรือgrant                                       |

logical_assignment_idเชื่อมrevisionของการดำรงหน้าที่เดียวกัน ส่วนreplaces_idอ้างrevisionที่แก้ ต้องกำหนดFK/uniqueเพื่อไม่เกิดหลายreplacementในรุ่นเดียวกันเมื่อimplement รายการที่อยู่คนละหน้าที่หรือคนละหน่วยใช้logical_assignment_idต่างกันแม้Personเดียว

Documentcoreปัจจุบันเป็นmetadataเท่านั้น หลักฐานตามสัญญานี้ต้องใช้FileVersion/hash/scan/ACLของบท10ที่ยังไม่สร้าง เลขคำสั่งหรือobjectkeyที่clientส่งมาไม่เป็นสิทธิ์เข้าถึงไฟล์ ไม่เดาอำนาจแต่งตั้งหรืออำนาจวงเงินจริง

## 3 appointed / acting / ended และรายการในอนาคต

เก็บappointed/actingเป็นประเภทของรายการ ไม่ลบข้อมูลประเภทเมื่อสิ้นสุด ส่วนสถานะแสดงคำนวณจากวันอ้างอิงและรุ่นข้อมูล:

| เงื่อนไขวันที่อ้างอิง                     | การแสดงที่เสนอ                             | อยู่ในactive queryหรือไม่                          |
| ----------------------------------------- | ------------------------------------------ | -------------------------------------------------- |
| วันอ้างอิงก่อนeffective_from              | ยังไม่ถึงวันมีผล พร้อมชนิดappointed/acting | ไม่อยู่; ดูได้เฉพาะplanned/historyqueryที่มีสิทธิ์ |
| วันอ้างอิงใน[effective_from,effective_to) | appointedหรือactingตามรายการ               | อยู่เมื่อworkflowทำให้มีผลและหลักฐานผ่าน           |
| วันอ้างอิงตั้งแต่effective_toขึ้นไป       | ended พร้อมคงชนิดเดิมและหลักฐานเดิม        | ไม่อยู่activeของวันนั้น แต่ยังค้นอดีตได้           |

หากrecordเป็นคำขอที่ยังไม่อนุมัติ เก็บในworkflow/requestไม่ใช่ทะเบียนที่มีผล การอนุมัติรายการอนาคตไม่ทำให้activeก่อนวันเริ่ม วันที่คาดการณ์ในอนาคตต้องแจ้งว่าเป็นข้อมูลตามรุ่นที่รู้ในเวลาค้น ไม่รับรองว่าไม่มีการเปลี่ยนภายหลัง

รายการอนาคตที่อนุมัติแล้วให้plannedprojectionอ้างworkflow/scheduledrevisionที่มีหลักฐานจองช่วง แยกจากactiveทะเบียนที่workerทำให้มีผลแล้ว Queryfutureคาดการณ์ต้องแสดงว่าapproved/scheduled ไม่อ้างeffectiveก่อนวันจริง การตรวจcapacityต้องรวมช่วงที่จองเหล่านี้ด้วย แม้ยังไม่อยู่ในactivequeryวันนี้

การยุติใช้วันที่สิ้นสุดแบบexclusiveตามcore contract หากคำสั่งทางการระบุ “วันสุดท้ายที่ยังดำรงหน้าที่” ต้องแปลงเป็นวันสิ้นสุดตามsemanticsที่เจ้าของยืนยัน ห้ามตีความถ้อยคำทางการเอง เวลาตัดรอบวันไทยต่างจากUTC date

## 4 กฎช่วงทับและจำนวนที่นั่ง

| ส่วนconfigurationเสนอ              | กฎ                                                                                                          |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| rule_version / verification_status | pinรุ่นเมื่อทำรายการ; ค่าทางการยังTO VERIFYจนเจ้าของรับรอง                                                  |
| overlap_group                      | ระบุorg/ระดับ/แผนก/ชนิดตำแหน่งหรือกลุ่มชนิดที่ใช้ที่นั่งร่วมตามกฎ ไม่เหมารวมทุกหน้าที่ของPerson             |
| allowed_seat_count                 | จำนวนเต็มบวกที่กำหนดชัดเจน; NULLคือยังไม่รู้ ไม่ใช่ไม่จำกัดหรือdefault1ทางการ                               |
| seat identifiers                   | เมื่ออนุญาตหลายที่นั่งต้องระบุที่นั่งชัดเจนและจำนวนไม่เกินconfiguration                                     |
| appointed/acting coexistence       | กฎแต่ละประเภทว่าจะอยู่ร่วม/แทนกันในที่นั่งใด TO VERIFY ไม่แยกกลุ่มอัตโนมัติเพียงเพราะassignment_kindต่างกัน |
| person compatibility               | ข้อจำกัดการรับหลายหน้าที่ต้องเฉพาะชนิดที่ยืนยัน ไม่unique(person_id)หรือบังคับหนึ่งคนหนึ่งตำแหน่งทั้งเว็บ   |

ตรวจช่วงทุกrevisionที่เป็นcurrentknowledgeและได้รับอนุมัติ รวมรายการในอนาคตที่จองช่วงไว้ ใช้ช่วง[เริ่ม,สิ้นสุด)จึงอนุญาตรายการต่อกันเมื่อรายการก่อนสิ้นสุดเท่ารายการใหม่เริ่ม การแก้ย้อนหลังต้องตรวจช่วงที่แก้ทั้งหมด ไม่เฉพาะวันนี้

การcountช่วงแล้วinsertโดยไม่serializeยังไม่เป็นข้อรับประกันเมื่ออนุมัติแข่ง ข้อเสนอคือFKไปseatในขอบเขตที่รับรองและconstraintช่วงต่อseat พร้อมtransaction/lockingที่รักษาจำนวนตามrule หรือกลไกที่พิสูจน์ได้เทียบเท่า ต้องทดสอบnativePostgreSQLก่อนรับรอง ห้ามนำexclusionkey(person,org,type,kind)จากlogicaldictionary04มาอ้างว่าป้องกันจำนวนคนเกินที่นั่งต่อorgได้แล้ว

ไม่มีการกำหนดจำนวนตำแหน่งทางการในบทนี้ Demoสามารถใช้ruleที่ระบุDEMOชัดเจนเพื่อทดลองcapacity1/2หลังfoundationพร้อม แต่ไม่ใช้ค่าดังกล่าวรับรองเรื่องจริง เมื่อallowed_seat_countหรืออำนาจยังไม่ยืนยันให้ปิดการmakeeffectiveทางการ

## 5 สัญญาqueryณวันอ้างอิงและวันรับรู้

บริการที่เสนอรับeffective_dateและknown_atจากinputที่validateแล้ว อ่านactor/action/scopeปัจจุบันจากserver ไม่ใช้สิทธิ์เก่าของวันที่อ้างอิงเพื่ออนุญาตผู้ใช้ที่หมดสิทธิ์วันนี้

เงื่อนไขรุ่นข้อมูลที่รู้ในknown_at:

```text
recorded_at <= known_at
AND (superseded_at IS NULL OR known_at < superseded_at)
```

เงื่อนไขหน้าที่ที่มีผลในeffective_date:

```text
effective_from <= effective_date
AND (effective_to IS NULL OR effective_date < effective_to)
```

เงื่อนไขเหล่านี้เป็นสัญญาเชิงตรรกะ ไม่ใช่queryที่มีimplementationแล้ว ค่าปริยายknown_atเป็นเวลาserverขณะค้น ไม่ใช่การรวมrecorded_atกับeffective_dateเป็นช่องเดียว Queryhistoryต้องเข้าถึงรุ่น/หลักฐานตามscopeและfieldgrant ณ เวลาค้น และคืนsnapshotของชนิดหน้าที่/หน่วยงาน/แผนก/กฎ/หลักฐานรุ่นที่เลือก ไม่joinmasterล่าสุดจนประวัติเปลี่ยนตามlabelใหม่

หากแก้ข้อมูลวันนี้ย้อนหลังไปปีที่แล้ว ผู้มีสิทธิ์โหมด “ข้อมูลที่แก้แล้ว ณ ปีก่อน” กับโหมด “ข้อมูลที่ระบบรู้ตอนปีก่อน” อาจได้คนละrevision ต้องมีlabelอธิบายและactiongrantแยก หลักฐานแต่งตั้งเดิมคงFileVersionเดิม ส่วนเอกสารแก้ไข/yุติที่บันทึกภายหลังไม่แสดงเป็นหลักฐานที่ระบบรู้ก่อนเวลานั้น

## 6 ตัวอย่างการยุติและแก้ย้อนหลัง — ข้อมูลสมมติในเอกสารเท่านั้น

| เวลา/เหตุการณ์                                | วันมีผล                                  | หลักฐาน/ผลqueryที่คาดหวัง                                                                  |
| --------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------ |
| บันทึกแต่งตั้งสมมติ20ธ.ค.2024                 | เริ่ม1ม.ค.2025; ยังไม่กำหนดสิ้นสุด       | appointmentFileVersion=DEMO_APPOINTMENT_V1                                                 |
| อนุมัติยุติสมมติ3ต.ค.2026                     | สิ้นสุดexclusive3ต.ค.2026ตามตัวอย่างDEMO | supersedeรุ่นเดิมแล้วเพิ่มรุ่นใหม่ช่วง1ม.ค.2025–3ต.ค.2026; เพิ่มDEMO_TERMINATION_V1แยกlink |
| ค้นeffective_date=1ก.ค.2025, known_atหลังยุติ | อยู่ในช่วงหน้าที่เดิม                    | พบPerson/หน้าที่เดิมและDEMO_APPOINTMENT_V1; ไม่แทนไฟล์แต่งตั้งด้วยไฟล์ยุติ                 |
| ค้นeffective_date=3ต.ค.2026, known_atหลังยุติ | สิ้นสุดแล้ว                              | activeไม่มีรายการ; historyแสดงendedและหลักฐานทั้งสองตามสิทธิ์                              |
| ค้นวันเดิมแต่known_atก่อนบันทึกยุติ           | ระบบยังไม่รู้การยุติ                     | ได้revisionที่ยังไม่มีวันสิ้นสุด ไม่เห็นterminationevidenceที่บันทึกทีหลัง                 |

วันที่และรหัสทั้งหมดเป็นscenarioทดลอง ไม่มีคำสั่ง/บุคคลจริง การทำให้ตัวอย่างนี้เป็นseed/testต้องมีfoundationและmigrationก่อน

## 7 แผนseed coverage — ยังไม่ได้สร้างหรือรันseedบท14

รหัสDEMOด้านล่างเป็นinternalkeyเสนอ ไม่ใช่positioncodeทางการ labelsหน้าที่/ระดับมาจากผู้ใช้ ไม่อ้างว่าผู้รับอำนาจหรือจำนวนที่นั่งได้รับการรับรอง

| รหัสfixtureเสนอ                | ระดับ   | หน้าที่พื้นฐานจากผู้ใช้ |
| ------------------------------ | ------- | ----------------------- |
| DEMO_POS_SUBDISTRICT_SECRETARY | ตำบล    | เลขาฯ                   |
| DEMO_POS_SUBDISTRICT_DEPUTY    | ตำบล    | รองเจ้าคณะ              |
| DEMO_POS_SUBDISTRICT_HEAD      | ตำบล    | เจ้าคณะ                 |
| DEMO_POS_DISTRICT_SECRETARY    | อำเภอ   | เลขาฯ                   |
| DEMO_POS_DISTRICT_DEPUTY       | อำเภอ   | รองเจ้าคณะ              |
| DEMO_POS_DISTRICT_HEAD         | อำเภอ   | เจ้าคณะ                 |
| DEMO_POS_PROVINCE_SECRETARY    | จังหวัด | เลขาฯ                   |
| DEMO_POS_PROVINCE_DEPUTY       | จังหวัด | รองเจ้าคณะ              |
| DEMO_POS_PROVINCE_HEAD         | จังหวัด | เจ้าคณะ                 |
| DEMO_POS_REGION_SECRETARY      | ภาค     | เลขาฯ                   |
| DEMO_POS_REGION_DEPUTY         | ภาค     | รองเจ้าคณะ              |
| DEMO_POS_REGION_HEAD           | ภาค     | เจ้าคณะ                 |

| จุดติดตามฝ่ายการศึกษาเสนอ  | แผนกจากผู้ใช้  | ประเภทหน้าที่/รหัสทางการ |
| -------------------------- | -------------- | ------------------------ |
| DEMO_EDUCATION_DHAMMA      | ธรรม           | TO VERIFY ตามJSP_MAPPING |
| DEMO_EDUCATION_PALI        | บาลี           | TO VERIFY ตามJSP_MAPPING |
| DEMO_EDUCATION_GENERAL     | สามัญ          | TO VERIFY ตามJSP_MAPPING |
| DEMO_EDUCATION_SUPERVISION | ปริยัตินิเทศก์ | TO VERIFY ตามJSP_MAPPING |

เมื่อimplementทดลอง ต้องมีassignmentสมมติที่ใช้12combinationครบและcoverage4แผนก โดยใช้Personเดิมร่วมกัน UUIDจากfixturekeyคงที่และidempotenttransaction ไม่เพิ่มPersonตามแต่ละหน้าที่ ให้ประเภทฝ่ายการศึกษาที่ไม่ยืนยันเป็นDEMOทดลองอย่างชัดเจน ไม่อ้างcoverageครบทุกประเภททางการจาก4แถวนี้

ใช้หน่วยงานสมมติ/คำสั่งDEMO/หลักฐานscanผ่านในพื้นที่private ไม่มีเลขบัตร วันเกิด เบอร์โทรหรือที่อยู่จริง seedretryไม่เพิ่มrevision/คำขอ/audit/outboxซ้ำ การนับตารางแผนนี้ไม่ใช่ผลseedผ่านเกณฑ์14-01

## 8 Servicesและหน้าประวัติที่เสนอ — ยังไม่ได้สร้าง

servicesอยู่ในโมดูลpeopleเดียว เช่น position-assignments/position-history เรียกauthz/DAL/documents/workflow/auditกลาง มีcommandsแต่งตั้ง/รักษาการ/ยุติ/แก้ย้อนหลังและqueriesactive/history/plannedตามeffective_date/known_at ทุกmutationต้องตรวจสิทธิ์/authority/evidence/รุ่นกฎ/ช่วงทับในtransactionพร้อมoptimisticversionและidempotency ผู้สร้างห้ามอนุมัติคำขอตนเอง

หน้าประวัติเสนอ `/app/people/[personId]/positions` แสดงวันอ้างอิง โหมดเวลารับรู้ หน่วยงาน ระดับ แผนก ชนิดหน้าที่ สถานะ ช่วงวันมีผล วันบันทึก และลิงก์หลักฐานตามACL ค่าfutureต้องแสดงข้อความยังไม่ถึงวันมีผล และแก้ย้อนหลังต้องแสดงว่าเป็นrevisionใหม่ ไม่ใช้สีเพียงอย่างเดียว

ผู้ใช้directory-onlyไม่เห็นprivatefields/raworders/historyที่ไม่มีgrant ลิงก์เอกสารต้องตรวจACLปัจจุบันทุกครั้ง ไม่ให้objectkeyหรือexport/printหลุดข้ามพื้นที่ หน้าประวัติเป็นserverauthorizedpage ไม่แสดงข้อมูลเพียงเพราะรู้PersonID

## 9 แผนตรวจรับ — ทุกกรณี NOT RUN

| รหัส   | การตรวจ                                                   | ผลที่ต้องได้เมื่อimplementแล้ว                                                             |
| ------ | --------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| P14-01 | seedฐานว่างและretryสองครั้ง                               | assignmentครบ12combination/4แผนกตามDEMO; จำนวนPerson/revision/audit/outboxไม่เพิ่มจากretry |
| P14-02 | ยุติวันนี้แล้วค้นeffective_dateปีก่อน                     | พบหน้าที่และappointmentFileVersionเดิม; วันนี้ended; เอกสารยุติไม่ทับเอกสารแต่งตั้ง        |
| P14-03 | queryก่อนบันทึก/หลังบันทึกแก้ย้อนหลัง                     | known_atต่างกันให้revision/evidenceตามเวลารับรู้ ไม่ปะปนหลักฐานอนาคต                       |
| P14-04 | แต่งตั้งอนาคต / acting / adjacentinterval                 | แยกplannedจากactiveและended; boundaryถูกวันไทยและยังรู้appointmentkindเดิม                 |
| P14-05 | ruleDEMOcapacity1/2และacting/appointedoverlapแข่งพร้อมกัน | ไม่เกินseatที่กำหนด; conflictตามrule ไม่มีconstraintหนึ่งคนหนึ่งตำแหน่งทั่วระบบ            |
| P14-06 | บุคคลหลายหน้าที่/หลายหน่วย และแก้ช่วงย้อนหลัง             | Personเดียว; validrolesอยู่ร่วมได้; invalidoverlapถูกปฏิเสธพร้อมrollback                   |
| P14-07 | เปลี่ยนID/org_id/query/exportและถอนgrantก่อนjob           | DAL/API/page/download/jobdenyตามสิทธิ์ปัจจุบัน ไม่ให้สิทธิ์จากPositionAssignmentเอง        |
| P14-08 | อำนาจไม่ยืนยัน/ไฟล์ไม่scan/approveตนเอง/รุ่นเปลี่ยน       | deny/conflict; ไม่มีassignmentมีผลหรือaudit/outboxสำเร็จจากคำสั่งที่ไม่ผ่าน                |

## 10 Gateและสิ่งที่ต้องยืนยัน

Q001ยืนยันรหัสประเภทฝ่ายการศึกษา, Q002ผังหน่วย/ระดับ/สาย, Q005/Q006ผู้ตรวจและอำนาจแต่งตั้ง/ยุติ, Q024จำนวนที่นั่ง/กลุ่มช่วงทับ/acting/appointedและการตีความวันสิ้นสุด, Q008/Q025fieldallowlist/หลักฐาน/retentionยังเปิด ไม่เดากฎทางการ

ปิดDB-06ตาม [DATABASE](DATABASE.md) และตรวจครบfoundation12/บุคลากร13ก่อนเพิ่มschema/services/page14 ก่อนเขียนโค้ดต้องมีแผนและการอนุมัติตามMASTERข้อ2 ไม่มีผลnativeDB/API/seed/historyUIบท14ในรอบนี้ และไม่เลื่อนไปบท15จากผลตรวจเอกสาร
