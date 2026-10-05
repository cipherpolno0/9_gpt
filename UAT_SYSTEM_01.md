# ตรวจรับระบบ 1 บุคลากรคณะสงฆ์และการศึกษา — บท18

รุ่นเอกสาร0.1 | 4ตุลาคม2569 | sourceก่อนแก้ `f4f0e8a` | **BLOCKED — ไม่ผ่านเกณฑ์ระบบบุคคลและไม่พร้อมrelease**

บท18ต้องผ่าน13/14/15/16/17ก่อน ทั้งห้าบทมีเพียงแบบเอกสาร ไม่พบservices/หน้าบุคคล/workflow/grants/sessionจริง จึงจัดเตรียมfixture CSV, acceptance matrix และคู่มือ โดยไม่มีผลทดสอบระบบบุคคลผ่าน ไม่ใช้ผลstarterหรือเอกสารแทนruntime

## 1 วิธีตรวจรับทีละขั้น

1. ตรวจimplementationและdependencyก่อน หากยังไม่มีระบบที่จะทดสอบ ให้ระบุBLOCKED ไม่สร้างmockที่ตอบผ่านแทนบริการจริง
2. สร้างฐานdev/testใหม่แยกproduction โหลดข้อมูลสมมติที่ระบุชัดและกฎDEMOมีรุ่น ผ่านloaderที่ต้องสร้างเมื่อdependencyพร้อม
3. รันcaseด้วยactor/scope/เวลาที่กำหนด เก็บผลactualและหลักฐาน แล้วตรวจทั้งหน้าจอ/API/service/export/job ไม่ถือการซ่อนเมนูเป็นauthorization
4. เทียบmanifestประวัติและหลักฐานก่อน/หลังการเปลี่ยนและcorrection ตรวจต้นทางด้วยeffective_date/known_at รวมการรับeventซ้ำ
5. ผู้ตรวจรับเจ้าของงานรับรองเฉพาะกรณีมีหลักฐานจริง ส่วน จศป. ที่ไม่มีรหัส/ประเภท/อำนาจรับรองยัง TO VERIFY

PASSต้องมีexecution ID/command/actualassert/evidence; BLOCKEDคือdependencyขาด; NOT RUNคือcaseยังไม่ทำ; TO VERIFYคือกฎหรือmappingที่ยังไม่มีหลักฐาน ตารางข้อมูลสมมติครบไม่ได้ทำให้caseเป็นPASS

## 2 Prerequisite และขอบเขตที่มีจริง

| บท  | พบจริงจากsource                             | สิ่งที่ยังไม่มี                                                  | ผล      |
| --- | ------------------------------------------- | ---------------------------------------------------------------- | ------- |
| 13  | PERSON_FIELDS/JSP_MAPPING0.1 + Personcore06 | EducationBranch/PositionType/search/fieldDAL                     | BLOCKED |
| 14  | POSITION_RULES0.1                           | PositionAssignment/services/historyquery/assignmentseed/หน้า     | BLOCKED |
| 15  | PERSON_VISIBILITY0.1                        | ค้นหา/self/verifiedbinding/publicDTO/export                      | BLOCKED |
| 16  | PERSON_CHANGE_WORKFLOWS0.1                  | request/forms/tracking/activation                                | BLOCKED |
| 17  | PERSON_CHANGE_RECOVERY0.1                   | eventhandlers/receipts/grant-accountsync/correction/impactreport | BLOCKED |

foundation12ยังBLOCKED: ไม่มีauthz/auth/FileVersion/scan/workflow/outboxจริง เอกสาร [FOUNDATION_ACCEPTANCE](FOUNDATION_ACCEPTANCE.md) เก็บผลstarterและnativeDB/workerที่แยกขอบเขตไว้แล้ว โมดูลpeopleยังREADME-only ไม่มีระบบบุคคลให้login/UAT

ตรวจenvironmentใหม่รอบ18: uid0และuid_map0:0:1 ไม่พบDockerCLI/socket loopback5432/5546ได้ConnectionRefusedError ไม่รันinitdbหรือสร้างฐาน ไม่แตะproduction DB-06/Q027และDOCKER-05/Q026ยังไม่ปิด ไม่มีข้อผิดพลาดruntimeของระบบบุคคลที่แก้ได้จากผลนี้ เพราะยังไม่มีimplementation

## 3 ข้อมูลสมมติที่เตรียมจริง

- [people-plan.csv](../tests/fixtures/system01/people-plan.csv): 14Personrefsสมมติ ใช้ชื่อที่ขึ้นต้นDEMO ไม่มีเลขประจำตัว วันเกิด โทรศัพท์ ที่อยู่ หรืออีเมลจริง
- [coverage-plan.csv](../tests/fixtures/system01/coverage-plan.csv): 16แถวครอบคลุม12คู่ระดับ–หน้าที่และ4จุดติดตามแผนก Person01ใช้refเดียวในC01/C07/C13เพื่อวางscenarioหลายหน้าที่ ไม่สร้างPersonซ้ำ
- ทั้งสองเป็นUTF-8 deterministic ไม่มีวันที่ปัจจุบัน/ค่ารandom รหัสองค์กรและmappingเป็นrefเตรียมทดสอบ **ยังไม่ถูกseed** ไม่มีOrganization/Assignment/RoleAssignmentใช้จริงถูกเพิ่ม ไม่มีDBloaderของ18

ไม่มีofficialcodes/evidenceที่เดาขึ้น การนำเข้าในอนาคตต้องresolveconfirmedconfigurationหรือDEMOconfigurationที่แยกจากทางการ มีUUID/FKและhistoryตามschemaจริง ห้ามสร้างgrantจากcoverage-plan หรือใช้การผ่านvalidationCSVแทนconstraintDB

### Matrixระดับและหน้าที่

ชื่อหน้าที่ในตารางเป็นขอบเขตที่ผู้ใช้สั่ง ไม่ยืนยันอำนาจ จำนวนที่นั่ง หรือรหัสทางการ ทุกกรณีค้น/history/policyต้องทดสอบแยกcaseและscopeที่อนุญาต

| ระดับ   | เลขาฯ     | รองเจ้าคณะ | เจ้าคณะ   | ผลruntime |
| ------- | --------- | ---------- | --------- | --------- |
| ตำบล    | UAT18-C01 | UAT18-C02  | UAT18-C03 | NOT RUN   |
| อำเภอ   | UAT18-C04 | UAT18-C05  | UAT18-C06 | NOT RUN   |
| จังหวัด | UAT18-C07 | UAT18-C08  | UAT18-C09 | NOT RUN   |
| ภาค     | UAT18-C10 | UAT18-C11  | UAT18-C12 | NOT RUN   |

### Matrixการศึกษาและ จศป.

| จุดติดตาม | แผนกตามผู้ใช้  | mappingrefภายใน        | ประเภท/รหัส/หลักฐานทางการ | ผลruntime |
| --------- | -------------- | ---------------------- | ------------------------- | --------- |
| UAT18-C13 | ธรรม           | DEMO_UNVERIFIED_JSP_01 | TO VERIFY / ยังไม่มี      | NOT RUN   |
| UAT18-C14 | บาลี           | DEMO_UNVERIFIED_JSP_02 | TO VERIFY / ยังไม่มี      | NOT RUN   |
| UAT18-C15 | สามัญ          | DEMO_UNVERIFIED_JSP_03 | TO VERIFY / ยังไม่มี      | NOT RUN   |
| UAT18-C16 | ปริยัตินิเทศก์ | DEMO_UNVERIFIED_JSP_04 | TO VERIFY / ยังไม่มี      | NOT RUN   |

ตาม [JSP_MAPPING](JSP_MAPPING.md) แถวสี่แผนกไม่ได้หมายถึงมีเพียงสี่ประเภท จศป. ไม่ขยายคำย่อหรือแปล“ทุกแท่ง”เอง ปัจจุบันยังไม่มีรายการประเภทเพิ่มเติมที่เจ้าของรับรอง จึงไม่สร้างชื่อประเภทเพิ่มหรืออ้าง“ครบตามโครงสร้างทางการ” เมื่อได้รายการจริงต้องเพิ่มmapping/fixture/caseต่อทุกประเภทและpinหลักฐานก่อนรับรอง

## 4 Acceptance matrix และสถานะการรัน

รายละเอียดขั้นและassertที่ทำซ้ำได้อยู่ใน [ACCEPTANCE_CASES](../tests/system01/ACCEPTANCE_CASES.md) **ไฟล์นี้เป็น test specification ไม่ใช่ executable tests** ไม่มีUAT18entrypointในpackage scripts ชุดtestrootไม่รันcasesด้านล่าง

| เรื่อง                                                         | Case        | อ้างแบบบท       | ผลจริง                       |
| -------------------------------------------------------------- | ----------- | --------------- | ---------------------------- |
| fixture/retry/12combination/4แผนก                              | T01/C01–C16 | P13/P14         | NOT RUN                      |
| ไทย/ฉายา/ชื่อเดิม/filter/pagination                            | T02         | P13/P15         | NOT RUN                      |
| อดีต/ปัจจุบัน/อนาคต/known_at/หลายหน้าที่/overlapcapacity       | T03–T06     | P14             | NOT RUN                      |
| ย้าย/ลาออก/เสียชีวิต/ลาสิกขา draft→returned→approved→effective | T07–T10     | P16/P17         | NOT RUN                      |
| rejected/cancelled/makerchecker/conflict/วันไทย                | T11–T12     | P16/P17         | NOT RUN                      |
| correctionทั้ง4ชนิด/approvedgrant/retry/crash/ordering         | T13–T14     | P17             | NOT RUN                      |
| ข้ามscope/fieldprivacy/publiccanary/export/job/download        | T15–T17     | P15/P16         | NOT RUN                      |
| verifiedbinding/self/sessionexpiry/revoke/suspend              | T18–T19     | P15/07/08       | NOT RUN                      |
| FileVersion/scan/ACL/impactadapters                            | T20–T21     | 10/P16/P17      | NOT RUN                      |
| keyboard/ThaiIME/375/768/1024/1440                             | T22         | P15/09          | NOT RUN                      |
| originmanifest/history/filehash/examresults                    | T23         | P14/P17         | NOT RUN                      |
| ประเภทเพิ่มเติมที่เจ้าของรับรอง                                | T24         | P13/JSP_MAPPING | NOT RUN / รอรายการ TO VERIFY |

Test IDsใช้prefixUAT18-Tเต็มในไฟล์case การใช้ช่วงT01–T24ในตารางเป็นการย่ออ้างอิงไม่ใช่ผลทดสอบผ่าน หลักฐานประวัติไม่หายต้องตรวจrefs/revisions/known_at/hash/immutableaudit ไม่ใช้จำนวนrowหรือภาพจอเดียวแทน

## 5 คำสั่งและผลที่ตรวจได้ในรอบ18

| ตรวจ                       | คำสั่ง/วิธีจริง                                                                                | ขอบเขตผล                                                                                       |
| -------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| baseline                   | git status/log + rgไฟล์/model + ตรวจpackage/schema/migration                                   | sourcef4f0e8aก่อนแก้ peopleREADME-only core19models/213scalarfields/migration1 ไม่มีโดเมน13–17 |
| localservices              | Python socketconnect loopback5432/5546 และตรวจCLI/socket/uid_map                               | ConnectionRefusedErrorทั้งสองพอร์ต ไม่มีDocker ไม่มีnativeDBtestใหม่                           |
| unitที่มีอยู่              | `corepack pnpm test`                                                                           | บันทึกผลจริงหลังคำสั่งเสร็จในหัวข้อผลตรวจท้ายเอกสาร ชุดนี้ไม่รันUAT18-T                        |
| fixture/spec/doc integrity | Python csvreaderตรวจrefs/14คน/12คู่/4แผนก/label/caseIDs/local links; PrettierเฉพาะMarkdownใหม่ | บันทึกผลจริงท้ายเอกสาร ไม่ใช่DBseed/runtimeUAT                                                 |
| Git/secret                 | `git diff --cached --check`, `corepack pnpm secrets:check`                                     | บันทึกผลจริงท้ายเอกสาร ตัวตรวจsecretครอบคลุมแพตเทิร์นที่รองรับเท่านั้น                         |

ไม่รันlint/typecheck/build/SQLWASM/nativePrisma/API/browser/OIDC/workerretryในรอบนี้ ไม่มีruntime/schemaเปลี่ยน ไม่มีคำสั่งใหม่ที่อ้างว่าทดสอบระบบบุคคลได้จากREADME ไม่มีหลักฐานPASSของUAT18-Tหรือโมดูลผู้รับเอกสาร/ผลสอบที่ยังไม่สร้าง

## 6 การเก็บหลักฐานและการลงนาม

ผลruntimeในอนาคตต้องมีexecution ID, commit/lockfile/migration/fixture/ruleversion, timestampและtestclock, actor ref/scope/action, command/ขั้นUI, expected/actual/assert, faultpoint และartifactreferencesที่ACLเหมาะสม ไม่commitlog/manifestที่มีPIIจริง/secret ข้อมูลบัญชีทดลองไม่เก็บpassword/token/recoverycodeในผลตรวจ

O01รับรองกฎ/รายการประเภท/ผลธุรกิจ C02ตรวจauthorization/transaction/coverage C03ตรวจfieldprivacy/purpose C01ประสานผู้ตรวจตามQ005 ทั้งหมดเป็นหน้าที่เสนอไม่ใช่แต่งตั้งบุคคลจริง ไม่มีลายเซ็นรับรองหรือreleaseapprovalเกิดขึ้นในบทนี้

## 7 เกณฑ์บท18 และ gate ถัดไป

| เกณฑ์ผู้ใช้                                  | ผล                                                                        |
| -------------------------------------------- | ------------------------------------------------------------------------- |
| แสดงกรณีสำคัญผ่านและไม่มีประวัติหาย          | **BLOCKED / NOT RUN** ไม่มีระบบบุคคลให้ทดสอบ ไม่อ้างunithelper/CSVแทน     |
| ระบุ จศป. TO VERIFYไม่อ้างโครงสร้างทางการครบ | ระบุในmatrix/configrefs/คู่มือจริงแล้ว; officialcoverageยัง **TO VERIFY** |

app/schema0.6.0 Prisma7.10.0 Next16.3.8 core migration `20261003130000_core_foundation` SHA256 `04a149fcd349f0ac3f1b5929cfcf571f8b0880541e84a40ad929054b67d72756` ไม่มีmigration/seed18เพิ่ม

ขั้นต่อไปยังปิดDB-06และตรวจfoundation06–12 จากนั้นimplementation/รับรอง13–17 แล้วสร้างtestloader/integration/browser18ด้วยแผนและการอนุมัติตามMASTER ไม่เลื่อนไปบท19จากการจัดทำเอกสาร คู่มือ [MANUAL_PEOPLE](MANUAL_PEOPLE.md) เป็นคู่มือเตรียมใช้ ยังไม่มีหน้าจอ/ปุ่มที่รับรองว่าใช้งานได้

## 8 ผลตรวจที่รันจริงรอบ18

- `corepack pnpm test`: exit0, tests17/pass17/fail0/skipped0 รวมdatehelpers3กรณี ไม่มีUAT18-Tถูกเรียก ไม่ใช้ผลนี้รับรองประวัติบุคคล/session/authorization
- PythonตรวจCSV/spec: PASS 14Personrefsไม่ซ้ำ 16coveragecases/FKrefsในชุดแผนตรงกัน ครบ12คู่และ4แผนก Person01ใช้refเดียว3แถว มี24caseIDsไม่ซ้ำ Labelsทั้งหมดFICTIONAL_NOT_SEEDED/TO_VERIFY เป็นการตรวจไฟล์ไม่ใช่seed/FKฐาน
- PythonตรวจlocaltargetsในUAT_SYSTEM_01/MANUAL_PEOPLE/ACCEPTANCE_CASES/peopleREADME/TRACEABILITY: PASS ไม่มีลิงก์ไฟล์ขาด
- `corepack pnpm exec prettier --ignore-path /dev/null --check docs/UAT_SYSTEM_01.md docs/MANUAL_PEOPLE.md tests/system01/ACCEPTANCE_CASES.md src/modules/people/README.md`: PASS ตรวจเฉพาะ4Markdownที่ระบุ เพราะdocsเดิมถูกignoreในคำสั่งformatทั่วไป
- `git diff --cached --check` และ `corepack pnpm secrets:check`: PASS ตามขอบเขตแพตเทิร์นที่รองรับ ไม่พบ.envจริงในไฟล์Gitเห็น
- ตรวจschema/migration/package: core19models/213scalarfields/migration1/checksumเดิม app0.6.0/Prisma7.10.0/Next16.3.8 ไม่เปลี่ยน peopleยังREADME-onlyและไม่มีmodels prerequisiteที่ต้องใช้

Checksumไฟล์ข้อมูลสมมติรุ่นนี้: people-plan.csv SHA256 `2c330397942101d382163acfdb16e217439dd35da93aac247b1f19dea608f10e`; coverage-plan.csv SHA256 `7169b2db5b3b2423a7eca91169a40c5081a0e0ddcf409c5d5b2cb401656d4eed` ไม่มีloaderหรือคำสั่งseed18ถูกสร้าง ผลruntimeของT01–T24ยังNOT RUNทั้งหมด
