# ตรวจรับบัญชีผู้สมัครและผลสอบนักธรรม–ธรรมศึกษา — บท 40

รุ่น 0.2 | เพิ่มcross-systemบท64วันที่9ตุลาคม2569 (2026-10-09) | baseline `eb50a0d`; ข้อกำหนดเดิมบท40 source `37a30c0` | **BLOCKED — ยังไม่ผ่านการตรวจรับระบบ 5**

## 1 สิ่งที่มีจริงกับสิ่งที่ยังเป็นแผน

อ่าน BLUEPRINT/MASTER/Charter/PROGRESS/DECISIONS/OPEN_QUESTIONSและ35–39ก่อนแก้ ทั้งห้าบทBLOCKED ยังไม่มี Enrollment/Candidate/Application/Snapshot/Eligibility/Seat/ScoreBatch/ResultDraft/Release/Publication/FormTemplateRegistry หรือAuth/DAL/Files/Workflow/Outboxที่รันflowได้ โมดูลexamsและexam-importsมีREADME ไม่มีE2E runnerในpackage หน้าเว็บจริงมี `/`, not-foundและ`/app/[[...path]]`bootstrap403เท่านั้น

เพิ่ม [ACCEPTANCE_CASES](../tests/system05/ACCEPTANCE_CASES.md)0.1และ [coverage-plan](../tests/fixtures/system05/coverage-plan.json)0.1เป็น**PLAN ONLY** ไม่มีexecutabletests/mockbackend/account/seedใหม่ ไม่มีการถือabsenceoftablesหรือ17unitstarterเป็นofficialgatePASS ไม่สร้างทะเบียน/ฐาน/loginแยกเพื่อให้ดูผ่าน

| ต้นทาง | สัญญาที่ต้องเป็นimplementationและผ่านก่อน E2E | รอบ40 |
| --- | --- | --- |
| 35 | [APPLICATION_SCHEMA](APPLICATION_SCHEMA.md), [APPLICATION_STATES](APPLICATION_STATES.md), [FORM_TEMPLATE_REGISTRY](FORM_TEMPLATE_REGISTRY.md) | BLOCKED |
| 36 | [ELIGIBILITY_RULES](ELIGIBILITY_RULES.md), [ROSTER_WORKSPACE](ROSTER_WORKSPACE.md), [APPLICATION_EXPORT](APPLICATION_EXPORT.md) | BLOCKED |
| 37 | [SEAT_ALLOCATION](SEAT_ALLOCATION.md), [APPLICANT_REVIEW_IMPACT](APPLICANT_REVIEW_IMPACT.md), [EXAM_ADMISSION_OUTPUTS](EXAM_ADMISSION_OUTPUTS.md) | BLOCKED |
| 38 | [GRADING_RULES](GRADING_RULES.md), [SCORE_IMPORT_REVIEW](SCORE_IMPORT_REVIEW.md), [RESULT_CERTIFICATION](RESULT_CERTIFICATION.md) | BLOCKED |
| 39 | [RESULT_PUBLICATION_POLICY](RESULT_PUBLICATION_POLICY.md), [RESULT_SEARCH_CONTRACT](RESULT_SEARCH_CONTRACT.md), [RESULT_RELEASE_RECOVERY](RESULT_RELEASE_RECOVERY.md) | BLOCKED |

## 2 Coverage matrix — 12กลุ่ม ไม่ใช่ผล E2E

ทุกแถววางแผนสองAcademicYearสมมติ2025/2026 (แสดง2568/2569) และสองidentityscenarios มี/ไม่มีเลขไทย รวม4runsต่อกลุ่ม ใช้DEMOreferencesไม่เลขประชาชน/เบอร์/ที่อยู่จริง ไม่มีfixtureseededในฐาน นักธรรมมี3ระดับโดยไม่ใช้stageธรรมศึกษา; ธรรมศึกษามี3ช่วงชั้น × 3ระดับ รวม9กลุ่ม ไม่อ้างว่าเป็นกลุ่มที่กฎทางการอนุญาตครบจนผู้เชี่ยวชาญรับรอง

| Group | ประเภท | ช่วงชั้น | ระดับ | จำนวนแผนruns | ผลจริง |
| --- | --- | --- | --- | --- | --- |
| G40-01 | นักธรรม | ไม่ใช้ | ตรี | 4 | NOT RUN |
| G40-02 | นักธรรม | ไม่ใช้ | โท | 4 | NOT RUN |
| G40-03 | นักธรรม | ไม่ใช้ | เอก | 4 | NOT RUN |
| G40-04 | ธรรมศึกษา | ประถม | ตรี | 4 | NOT RUN |
| G40-05 | ธรรมศึกษา | ประถม | โท | 4 | NOT RUN |
| G40-06 | ธรรมศึกษา | ประถม | เอก | 4 | NOT RUN |
| G40-07 | ธรรมศึกษา | มัธยม | ตรี | 4 | NOT RUN |
| G40-08 | ธรรมศึกษา | มัธยม | โท | 4 | NOT RUN |
| G40-09 | ธรรมศึกษา | มัธยม | เอก | 4 | NOT RUN |
| G40-10 | ธรรมศึกษา | อุดม | ตรี | 4 | NOT RUN |
| G40-11 | ธรรมศึกษา | อุดม | โท | 4 | NOT RUN |
| G40-12 | ธรรมศึกษา | อุดม | เอก | 4 | NOT RUN |

48runrefsใช้24personrefsร่วมข้ามปี เพื่อassertPerson/Candidateไม่ซ้ำ การเลือกสถานะบรรพชิต/คฤหัสถ์/ชนิดหลักฐาน/ประโยคเดิมและsafe identityfixtureadapterต้องผู้รับผิดชอบยืนยันก่อนexecute descriptorมีเลขไทยในJSONไม่พิสูจน์ว่าตรวจเลข/ตัวตนได้แล้ว ไม่บังคับบัตรไทยทุกคน และไม่mergeจากชื่อ/DOB

## 3 เกณฑ์หลักและหลักฐานที่จะรับ

| เกณฑ์ | Cases | หลักฐานที่ต้องได้จริง | ผลรอบ40 |
| --- | --- | --- | --- |
| 40-01 result lineage | P40-01/04/12/13/15/18/19/20/23 | executionmanifestต่อผลที่ตรวจFK/pins/scorebatch/rule/checker/publisher/approvedrevision/hash/effective-recorded time/เอกสารต้นเรื่อง พร้อมold-new correction | BLOCKED / NOT RUN |
| 40-02 official gates | P40-05/06/08/14/16/17/21/22/26 | nativeAPI/worker/export/render/currentDALปฏิเสธTO VERIFY; verifiedsource/rules/policy/authority/formscopeถูกต้องก่อนpositiveOFFICIAL | BLOCKED / NOT RUN |

ผลหนึ่งต้องย้อน release item→certified draft/item→accepted score rows→score batch/sourcefilehash+lockedmanifest→gradingrule/algorithm→seat/application/snapshot→Person/Organization/year/session และdecisionผู้อนุมัติapplication/คะแนน/เผยแพร่ที่แยกกันตามหน้าที่ Sourceเดิมกับamendmentต้องคงอยู่ ไม่มีตัดสินว่าครบจากJSONlogที่clientส่ง

ArtifactของE2Eภายหลังเก็บprivateตามscope: runcommit/environment/rule/template/policyversions, dataset refs, steps/expected/actual, responsesที่ลดข้อมูล, transaction/receipt/dedupe proofs, checksum, reviewer และissue list ไม่commitsecret/คะแนนคนจริง/เอกสารสมัคร/รายชื่อเต็ม Screenshotและexportต้องผ่านACL/retention ไม่แปะข้อมูลจริงในissueสาธารณะ

## 4 UAT แบบฟอร์มและผู้เชี่ยวชาญ

แบบศ.1/2/3/4/5/6/8ในregistryเอกสาร0.2ยังTO VERIFYทั้งหมด ไม่มีmeaning/edition/purpose/layout/field/type-stage/rights/approvalที่ครบ ผู้ใช้เคยมีไฟล์ชื่อ “แบบรายงานผลสำหรับธรรมศึกษา69.pdf” ตรวจพบmetadataปัจจุบันชื่อเดียวกันขนาด79,639bytes แต่พยายามดึงเนื้อหาสองครั้งได้HTTP502 **ไม่ได้อ่านเนื้อหา/ดูlayout/hash** จึงไม่จับคู่ศ.4/8หรือแบบใดจากชื่อ ไม่กล่าวว่าไม่มีไฟล์ที่เคยแนบ และไม่ใช้metadataเป็นหลักฐานรับรอง

ไฟล์ต้นฉบับไม่copyเข้าrepository/publicassets ไม่มีการจัดประชุมเจ้าหน้าที่/ผู้เชี่ยวชาญหรือsignoffเกิดขึ้นในรอบ40 เมื่อไฟล์เข้าถึงได้ ให้รับผ่านเอกสารกลางprivate/scan/ACL เก็บhash/issuer/sourceedition/effectivescope แล้วทำขั้นตอนต่อไป:

1. O05/O09และเจ้าของแบบที่ยืนยันเทียบcode/meaning/purpose/type/level/stage/year/fieldrequirements ไม่อนุมานศ.3หรือlayoutจากเมนู
2. เจ้าหน้าที่ใช้DEMOข้อมูลไทย/รหัสDEMOทดสอบHTMLprint/PDF/Excel/A4/Thai font/reference strings หน้าแรก/ท้าย/หลายหน้า/ข้อมูลขาด เปรียบเทียบrenderกับsourceจริงทุกหน้าที่ใช้
3. ผู้เชี่ยวชาญแยกตรวจeligibility/วิชา/คะแนน/ข้อเขียน/rubric/rounding/ผลผ่าน/เงื่อนไขปีจาก software assertions ไม่อ้างการรับรองทางธรรมจากtestผ่าน
4. C03/O05รับรองfield/purpose/เด็ก/retention/publicationpolicy ผู้มีอำนาจจริงในQ005/Q006รับรองgrant/delegationและmaker checker
5. เก็บUATprotocol: templateversion/sourcehash/rule/policy/context/runrefs/expected-actual/issues ผู้ตรวจ/เวลา/การตัดสิน/เงื่อนไขค้าง การรับแบบหนึ่งไม่verifyแบบอื่นหรือทุกปี
6. failed/unknownscope→คงOFFICIALBLOCKED ลงissueและretestเฉพาะที่แก้; DEMOไม่เป็นfallbackofficial คงhistoryและapprovedamendmentเมื่อแก้

ยังไม่มีแบบใดผ่านUAT/ไม่มีผู้เชี่ยวชาญรับรอง ไม่มีชื่อผู้ตรวจจริงที่เดาขึ้น อ่านขั้นตอนเจ้าหน้าที่ใน [MANUAL_EXAMS](MANUAL_EXAMS.md)

## 5 ผลตรวจจริงและข้อจำกัด

วันที่5ตุลาคม2569 ใช้package/schema0.6.0; Prisma7.10.0; Next16.3.8; pnpm11.28.2; lockfile9; core19models/213scalarfields migrationเดียว20261003130000_core_foundation SHA256 `04a149fcd349f0ac3f1b5929cfcf571f8b0880541e84a40ad929054b67d72756` ไม่มีschema/migration/seed/package/lock/runtimeใหม่

| คำสั่งรอบ40 | ผลจริง | พิสูจน์เฉพาะ |
| --- | --- | --- |
| corepack pnpm test | exit0 17ผ่าน/0fail/0skip | bootstrap/localguards/dates/โครงสร้าง ไม่ใช่ระบบ5 |
| corepack pnpm typecheck | exit0 | โค้ดที่มีอยู่ typecheckได้ ไม่ใช่flowที่ยังไม่มี |
| corepack pnpm lint | exit0 | eslintโค้ดที่มีอยู่ |
| corepack pnpm build | exit0 | สร้างหน้าแรก/not-found/privatecatchallได้ ไม่สร้างหน้าexam/publicresults |
| corepack pnpm smoke | exit0 27HTTPchecks | หน้าแรก/CSS/ฟอนต์/bootstrap403ทุกmethod/404 ไม่ได้loginหรือสมัครจริง |
| corepack pnpm db:test | exit1 safeerrorไม่เปิดcredentials | gateฐานทดลองไม่สำเร็จ ไม่เดาsubcauseจากข้อความgeneric |
| DockerCLI/socket/TCPprobe | CLI/socketไม่มี; 127.0.0.1:5432/5546 connect_ex111 refused | devnativeDBปัจจุบันไม่พร้อม; DB-06/DOCKER-05เปิด |
| ตรวจfixture/เอกสาร/links/versions/format/secret/whitespace | PASS 12groups/48runrefs/24sharedpersonrefs/26NOT RUNcases/7forms/174links/2JSONpaths/4headers/10files/protectedcore; Prettier/secret/whitespaceexit0ตามPROGRESS | แผนข้อมูล ไม่ใช่executionของ48flowsหรือ26cases |
| P40-01–26, nativeธุรกิจ/concurrency/cache/privacy, browser/E2E/UAT/officialrender/workerbusiness | NOT RUN | ขาดprerequisitesและหลักฐานรับรอง ไม่สร้างskippedPASS |

**ยังไม่ตรวจรับระบบ5** ต้องส่วนกลางพร้อม ผ่าน35–39จริง ได้source/rules/authorityและนโยบายที่รับรอง แล้วimplement/runcases/จัดUATจนได้actualevidence ผู้ทดสอบต้องรายงานfail/blockerตรงตามจริง ห้ามใช้17/27starterchecksเป็นผลผ่านเกณฑ์40 ไม่เลื่อนไป41หรือเดาขอบเขต ไม่push/deploy

## ตรวจร่วมระบบ 9 — บท64 (9 ตุลาคม 2569)

ส่วนเพิ่มนี้ปรับเอกสารเป็น0.2 ไม่เปลี่ยนผลP40จากNOT_RUNเป็นPASS [UAT_SYSTEM_09](UAT_SYSTEM_09.md), [ACCEPTANCE_CASES09](../tests/system09/ACCEPTANCE_CASES.md) และ [coverage09](../tests/fixtures/system09/coverage-plan.json)0.1 เสนอ12pairsสองปี=24runs ทุกrunNOT_RUN ไม่มีApplication/registry/approval/seatservicesจริง

| จุดตรวจระบบ05ร่วม09                                      | Traceability / หลักฐานที่ต้องมี                                                              | ผลจริง          |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------- | --------------- |
| Person/Candidate/Applicationopportunitykeyร่วมทุกchannel | P40duplicate/identity +P64-02/03/09/11/13 actualIDs/uniques/tx counts                        | BLOCKED_NOT_RUN |
| roster/snapshot/exportregistryเดียว                      | P64-01/02/20 web/importApplicationSnapshot+template purpose/version ไม่machine=displaylayout | BLOCKED_NOT_RUN |
| ตรวจอนุมัติ/seatตามscope makerchecker/capacity           | P64-01/14/24 decision/seatnamespace/number/receiptจริง importไม่approved                     | BLOCKED_NOT_RUN |
| amendment/score/releaseไม่ลบหลังwithdrawbatch            | P64-21/23 +37–39 originalsource/rule/decision/releaseversions retained                       | BLOCKED_NOT_RUN |
| privacy/TO_VERIFYofficialguard/learningboundary          | P64-08/19/20/24 maskedDTO/revoke/export practiceไม่official                                  | BLOCKED_NOT_RUN |

Offline09อ่านtrustedXLSX3ไฟล์ผ่านเฉพาะCRC/headers/text/groupvalues ไม่ตรวจ05writer/registry/eligibility/approval/serviceprivacy NativeDBรอบ64exit1 actualrefsยังว่าง sharedschema0.6.0/migration1เดิม ไม่สร้างทะเบียนหรือLoginใหม่ ไม่อ้างว่าสมัครจริงได้
