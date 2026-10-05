# ตรวจรับทะเบียนหน่วยงานและสนามสอบ — บท23

รุ่น0.1 | 4ตุลาคม2569 | sourceก่อนแก้ `2b38596` | **BLOCKED — ไม่ผ่านเกณฑ์ระบบ2 ไม่พร้อมrelease**

บท23ต้องผ่าน19/20/21/22ก่อน ทั้งสี่มีแบบเอกสารเท่านั้น ไม่มีservices/หน้ารายการ/สนามรายรอบ/appointments/รายงานจริง รันได้เฉพาะrootunitของstarter/corehelpers ไม่ใช้ผลนี้หรือofflinefixtureแทนการตรวจรับองค์กร/สนามทั่วประเทศ

## 1 วิธีอ่านผล

PASSต้องมีexecution/commands/actualassert/evidenceตามscope BLOCKEDคือdependencyขาด NOT RUNคือcaseไม่ทำ TO VERIFYคือกฎ/แหล่ง/อำนาจยังไม่รับรอง แยกผลตรวจเอกสาร/JSONออกจากการนำเข้าstagingจริง

“ทั่วประเทศ”หมายถึงขอบเขตที่สถาปัตยกรรม/ข้อมูลอ้างอิง/บริการต้องรองรับหลังตรวจรับ ไม่อ้างว่ามีหน่วยงานจริงครบหรือระบบรองรับscaleประเทศผ่านแล้ว พื้นที่DEMO A/Bไม่ใช่จังหวัดจริงหรือจำนวนพื้นที่ทั้งหมด และไม่ใช้เป็นรายการhardcodedที่serviceอนุญาตเท่านั้น

## 2 Prerequisite และ coverageประเภท

| บท  | สิ่งที่พบจริง                                                  | สิ่งที่ยังไม่มี                                                      | ผล      |
| --- | -------------------------------------------------------------- | -------------------------------------------------------------------- | ------- |
| 19  | ORGANIZATION_TYPES0.1 + coreOrganization/Type/namehistory      | Relation/temporalgraph/services/UI                                   | BLOCKED |
| 20  | ADDRESS_VALIDATION0.1 + coreAddressVersion/OrganizationContact | Location/search/contactpurpose/verification/publicmap/sourceflow     | BLOCKED |
| 21  | EXAM_SESSIONS0.1 + coreYear/Type/Level                         | Center/Session/statusadapter/capacity/applicationconditionservice/UI | BLOCKED |
| 22  | EXAM_CONTACT_VISIBILITY0.1                                     | Appointment/dispatchsnapshot/report/privatefileACL                   | BLOCKED |

foundation12ยังไม่มีauthz/session/files/workflow/outboxruntimeตาม [FOUNDATION_ACCEPTANCE](FOUNDATION_ACCEPTANCE.md) organizationsมีREADMEเท่านั้น ไม่มีimport adapter/DQevaluator/staging modelของ23 ข้อผิดพลาดเชิงองค์กรที่แก้เฉพาะจุดจากruntimeยังตรวจไม่ได้ เพราะไม่มีruntimeเป้าหมาย

| ประเภทจากผู้ใช้ | datafixturecoverage                   | schema/service/UI/flowใช้งานได้จริง                                    | ผล                |
| --------------- | ------------------------------------- | ---------------------------------------------------------------------- | ----------------- |
| วัด             | DEMO_ORG_TYPE_TEMPLE                  | มีgenericOrganization/TypeFKcoreเท่านั้น ไม่ได้seedประเภทนี้หรือมีflow | BLOCKED / NOT RUN |
| สำนักเรียน      | DEMO_ORG_TYPE_STUDY_BUREAU            | เช่นเดียวกัน                                                           | BLOCKED / NOT RUN |
| สำนักศาสนศึกษา  | DEMO_ORG_TYPE_RELIGIOUS_STUDY_UNIT    | เช่นเดียวกัน                                                           | BLOCKED / NOT RUN |
| องค์กร          | DEMO_ORG_TYPE_ORGANIZATION            | เช่นเดียวกัน ไม่ถือlabelDEMOในfixtureเป็นmasterใช้จริง                 | BLOCKED / NOT RUN |
| สถานศึกษา       | DEMO_ORG_TYPE_EDUCATIONAL_INSTITUTION | เช่นเดียวกัน                                                           | BLOCKED / NOT RUN |

ขอบเขตเพิ่มเติมสนามแม่บท/รอบ/ประธาน/ผู้รับ/ผู้ประสานงานยังมีlogicalcontract21/22ไม่ใช่model/หน้าที่ใช้ได้ กฎประเภทเพิ่มเติมที่ไม่มีหลักฐานไม่เดาหรืออ้างว่ามีครบแล้ว

## 3 สิ่งส่งมอบรอบนี้

- [DATA_QUALITY_RULES](DATA_QUALITY_RULES.md): กฎ16ข้อ/tri-stateunknown/ผลกระทบและสัญญาprivateimport-staging-diff-review-apply แบบเตรียม
- [ACCEPTANCE_CASES](../tests/system02/ACCEPTANCE_CASES.md): test specification18กรณี **ไม่ใช่ executable tests** ทุกUAT23-TยังNOT RUN
- [legacy-organizations-plan.json](../tests/fixtures/system02/legacy-organizations-plan.json): 10source rows/5type refs/6Geographyrefs/targetregistryหนึ่งแถวสมมติ ตั้งข้อผิดพลาดเพื่อทดสอบ ไม่มีข้อมูลจริง/โทรศัพท์/พิกัดจริง
- [expected-quality-focus.json](../tests/fixtures/system02/expected-quality-focus.json): ผลที่คาดหวังแบบmanualfocus10แถว **ไม่ใช่รายงานจากadapterและไม่exhaustive** ไม่แสดงrowPASS
- [MANUAL_ORGANIZATIONS](MANUAL_ORGANIZATIONS.md): คู่มือบำรุงรักษาฉบับเตรียม ไม่มีชื่อปุ่ม/URLหรือการลงนามที่อ้างว่าระบบทำงานแล้ว

ไม่มีsourcefileจริงถูกอัปโหลด ไม่มีJSONเข้าDBstaging ไม่มีloader/schema/migration/apply/merge evaluator23ถูกสร้างหรือข้อมูลกลางถูกเปลี่ยน ฟิลด์/refsในfixtureเป็นแผนไม่ใช่UUIDFKจริง และsource_label/data_labelแสดงDEMO/NOT_STAGEDชัดเจน

## 4 Acceptance matrix

ขั้นทำซ้ำและassertอยู่ในtestspec ปฏิบัติเมื่อผ่านdependency/nativePGและมีapprovedDEMOconfigurationพร้อมactor/scopesจริง ไม่ใช้mockALLOWทุกaction/skiptestsแทนระบบ

| กรณี         | ข้อกำหนด/งาน                                                               | ผลจริง  |
| ------------ | -------------------------------------------------------------------------- | ------- |
| UAT23-T01    | ทุก5ประเภท schema/UI/flowกลาง                                              | NOT RUN |
| UAT23-T02–06 | adapterstaging/retry/DQduplicate/address/Geo/cycle/roles/contactdue/no-map | NOT RUN |
| UAT23-T07–09 | diff/humanlink-merge/evidence/makerchecker/versions/apply/crashreceipt     | NOT RUN |
| UAT23-T10–11 | ไทย/ชื่อเดิม/รหัส/พื้นที่/chain/pagination/keyboard/history/snapshots      | NOT RUN |
| UAT23-T12–15 | crossscope/fieldprivacy/publiccanary/export/job/revoke/FileVersionACL      | NOT RUN |
| UAT23-T16–17 | ไม่มีพิกัด/providerล่ม/Personstatusreplacement/queue retry                 | NOT RUN |
| UAT23-T18    | coverage/DEMOlabel/maintenance/unknownไม่ใช่clean/retention                | NOT RUN |

manifestพิสูจน์ประวัติไม่หายต้องเทียบUUID/historyrevision/interval/recorded_at/known_at/name-address-contact/issuedFileVersionhash/ต้นทางก่อนหลังภายใต้ACL ไม่ใช้rowcount/รูปจอเดียว และไม่เผยmanifestจริงในpublicrepo

## 5 คำสั่งและผลที่รันจริง

| ตรวจ                    | คำสั่ง/วิธี                                                                            | ผลและขอบเขต                                                                                                                                                        |
| ----------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| source                  | git status/log, schema/model/files/packageอ่านจริง                                     | ก่อนแก้2b38596 clean organizationsREADME-only มีcore19modelsแต่ไม่มี19–22runtime                                                                                   |
| environment             | Pythonuid_map/DockerCLI/socket + TCPconnect127.0.0.1:5432/5546                         | uid0/mapping0:0:1 ไม่มีDockerCLI/socket ConnectionRefusedErrorทั้งสองพอร์ต; DB-06/Q027และDOCKER-05/Q026ยังเปิด                                                     |
| unit                    | `corepack pnpm test`                                                                   | exit0 tests17/pass17/fail0/skipped0 รวมdatehelpers3กรณี ไม่รันUAT23/DQ/staging/merge/organization APIs                                                             |
| JSON/Markdown integrity | Pythonตรวจrefs/counts/expectedfocus/test-rule IDs/local links และPrettierเฉพาะไฟล์ใหม่ | PASS: 10rows/5types/6Geographyrefs/10manualfocus/16ruleIDs/18caseIDs/49local links และ Prettierผ่าน เป็น structural validation ไม่ใช่ DQ evaluation หรือ DB import |
| Git/secret              | `git diff --cached --check`, `corepack pnpm secrets:check`                             | PASS: working/staged diff check และ secrets check ผ่าน ตัวตรวจ secret ครอบคลุมแพตเทิร์นที่รองรับเท่านั้น                                                           |

ไม่รันinitdb/nativePrisma/db:test/SQLWASM/lint/typecheck/build/browser/API/staging/merge/worker23 เพราะไม่มีruntime/schemaเปลี่ยนหรือDBพร้อม ไม่มีproduction/databaseจริงถูกแก้ ผลเดิมstarterในFOUNDATION_ACCEPTANCEยังไม่ปิดเกณฑ์scope/fieldprivacy/หลายประเภท/searchflow

## 6 เกณฑ์ผู้ใช้และข้อค้าง

| เกณฑ์23                                    | ผล                                                                                                    |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| ทุกประเภทที่ระบุมีschema/หน้าจอ/flowใช้ได้ | **BLOCKED** ไม่มีruntime19–22 ไม่ใช้5fixturelabelsแทน                                                 |
| ทั่วประเทศเป็นขอบเขตข้อมูลไม่อ้างมีจริงครบ | ระบุจริงในUAT/กฎ/คู่มือ/fixturelabelsแล้ว แต่nationaldata/coverage/loadcapabilityยัง **NOT VERIFIED** |

app/schema0.6.0 Prisma7.10.0 Next16.3.8 core19models/213scalarfields/migration1 SHA256 `04a149fcd349f0ac3f1b5929cfcf571f8b0880541e84a40ad929054b67d72756` ไม่เปลี่ยน ไม่มีmigration/seed23เพิ่ม

Q002/Q024ต้องcodebook/type/Geography/temporalparent/sourceissuer/mergeimpact/cardinality; Q005/Q006ต้องผู้ตรวจ/อำนาจ/หลักฐาน; Q008/Q025/Q016ต้องstaging/report/purpose/retention; Q011/Q023ต้องworker/currentgrant/RLS/adapter/applicationintegration; Q018/Q019/Q021ต้องUIจริง และQ014ต้องvolume/loadระดับประเทศที่มีข้อมูล/เป้าหมายรับรอง

ขั้นต่อไปปิดDB-06→foundation06–12→13–17→ตรวจรับ18→implementation/รับรอง19–22ก่อนadapter/evaluator/integration/browser/UAT23ตามแผนและการอนุมัติMASTER ไม่มีผู้ลงนามรับรองreleaseหรือข้อมูลจริงครบประเทศ ไม่เลื่อนไป24จากผลตรวจเอกสาร

## 7 หลักฐานตรวจไฟล์รอบนี้

`corepack pnpm exec prettier --ignore-path /dev/null --check` โดยระบุเอกสารใหม่3ไฟล์ test specification, JSON2ไฟล์ และ organizationsREADME ผ่านทั้งหมด Pythonตรวจ JSON/refs/catalog/caseIDs/local linktargets ผ่าน49ลิงก์ ตรวจ core19models/213scalarfieldsรวม scalar array และ migration1/checksumเดิม ข้อมูลที่ผิดตั้งใจยังคงไว้ไม่ได้แก้ให้สะอาดเพื่อผ่าน checker

utilityตรวจครั้งแรกหยุดด้วย KeyError เพราะใช้ชื่อ keyผิด (`relation_proposals` แทน `relations_proposal`) ครั้งถัดไปนับ212เพราะไม่รวม String[] แก้ utility แล้วตรวจผ่าน213 ไม่มีการแก้ schema หรือรายงานว่าข้อผิดพลาดเหล่านี้เป็น defect ของระบบ2

| fixture                        | SHA256 หลังจัดรูปแบบ                                               |
| ------------------------------ | ------------------------------------------------------------------ |
| legacy-organizations-plan.json | `b8d275320be9d99979556c6b4b3150c56abef8976b841bbc3b0f0d0be4b9c825` |
| expected-quality-focus.json    | `f7157a8b6df69778350ed807813f2b177964eaf9685188b315c8ede3cb429ed7` |

ผลนี้พิสูจน์เพียงโครงสร้างไฟล์และความสอดคล้องของเอกสาร ไม่พิสูจน์ DQ findings, staging retry, merge, schema/UIครบประเภท, scope/export/ประวัติ หรือความพร้อมระดับประเทศ UAT23ยัง18กรณี NOT RUN
