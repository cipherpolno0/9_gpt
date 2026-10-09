# ตรวจรับสมัครสอบผ่าน Excel ครบวงจร — บท 64

รุ่น 0.1 | 9 ตุลาคม 2569 (2026-10-09) | baseline `eb50a0d` | **BLOCKED — ยังไม่ผ่าน UAT ระบบ 9**

## 1 สิ่งที่ตรวจได้และ dependency ที่ขาด

อ่าน BLUEPRINT/MASTER/PROGRESS/DECISIONS และ59–63ก่อนแก้ ไม่มี Application/Candidate/FormTemplateRegistry/ImportBatch/FileVersion/WorkflowInstance/RoleAssignment/outbox ใน Prisma มี19coremodels โมดูลexams/exam-importsมีREADME workspaceตอบ403 workerตรวจconnectionเท่านั้น ยังไม่มีupload/dryrun/commit/monitoring/approval/seatและE2E runner `corepack pnpm db:test` exit1 จึงไม่สร้างbackendจำลองหรือทะเบียนสมัครอีกชุดเพื่อให้ดูเหมือนผ่าน

แนวคิดตรวจรับทีละขั้น: เริ่มจากไฟล์และรุ่นที่ถูกต้อง → ตรวจserverโดยไม่เขียนทะเบียน → commitเข้าทะเบียน05เดียว → ตรวจ/อนุมัติแยกจากนำเข้า → ออกที่นั่งตาม37 → ตรวจว่าbatchreceiptและบัญชี05อ้างApplicationเดียวกัน การตรวจโครงสร้างไฟล์สำเร็จไม่เป็นหลักฐานว่าขั้นถัดไปผ่าน

| prerequisites  | สิ่งที่มีจริง                                    | สิ่งที่ยังขาด                                                            |
| -------------- | ------------------------------------------------ | ------------------------------------------------------------------------ |
| 59             | XLSXทดลอง3ไฟล์ schema/registryเอกสาร             | download/generator/FormTemplateRegistryในแอป/แบบทางการยืนยัน             |
| 60             | boundedparsing/upload/normalization contracts    | privateupload/scanner/parser/isolationworker                             |
| 61             | staging/dryrun/errors35codes specifications      | staging/DAL/eligibility/identity/report services                         |
| 62             | atomiccommit/idempotency/shared05 contracts      | testedcommitprofile/transaction/Person-Applicationwriter/receipts/outbox |
| 63             | monitoring/lineage/recovery/retention contracts  | UI/actions/amendment/impact/hold/currentACLจริง                          |
| 35–39 และ07–11 | centraldomain/authority/files/workflow contracts | บัญชี05/approval/seat/score/releaseและcentralruntimeตามscope             |

## 2 Coverage และเส้นทางครบวงจร

รองรับขอบเขตนักธรรม3คู่และธรรมศึกษา9คู่ รวม12คู่ ไม่เรียก12คู่เป็น9กลุ่มธรรมศึกษา ต้องทดสอบแต่ละคู่สองปีการศึกษาสมมติ TEST_AY_2569/TEST_AY_2570 รวม24runs **PLAN_ONLY ทั้งหมด** ไม่อ้างว่าเป็นประเภทหรือคุณสมบัติทางการที่ได้รับรับรอง

| exam_type   | level | stage     | จำนวนrunsสองปี / ผลจริง |
| ----------- | ----- | --------- | ----------------------- |
| NAKTHAM     | TRI   | NONE      | 2 / NOT_RUN             |
| NAKTHAM     | THO   | NONE      | 2 / NOT_RUN             |
| NAKTHAM     | EK    | NONE      | 2 / NOT_RUN             |
| DHAMMASTUDY | TRI   | PRIMARY   | 2 / NOT_RUN             |
| DHAMMASTUDY | THO   | PRIMARY   | 2 / NOT_RUN             |
| DHAMMASTUDY | EK    | PRIMARY   | 2 / NOT_RUN             |
| DHAMMASTUDY | TRI   | SECONDARY | 2 / NOT_RUN             |
| DHAMMASTUDY | THO   | SECONDARY | 2 / NOT_RUN             |
| DHAMMASTUDY | EK    | SECONDARY | 2 / NOT_RUN             |
| DHAMMASTUDY | TRI   | HIGHER    | 2 / NOT_RUN             |
| DHAMMASTUDY | THO   | HIGHER    | 2 / NOT_RUN             |
| DHAMMASTUDY | EK    | HIGHER    | 2 / NOT_RUN             |

หนึ่งrunต้องดาวน์โหลดmachine templateรุ่นจากRegistry05 → กรอก/save/reopen → เลือกorg/year/typedofferingที่มีสิทธิ์ → uploadquarantine/CLEAN → boundedparse → dryrunallrows → แก้errorเป็นchildbatch/dryrunใหม่ → ackwarnings → confirm/workerrevalidate/commit62 → อ่านApplication05และsnapshot → reviewmaker-checker → approve/allocate37 → อ่านบัญชี/บัตร/แบบexportตามregistry05 → monitoring63/actualrowreceipts ครบทุกcheckpoint ห้ามใช้browserstateแทนserverguard

ไฟล์valid59รวม12คู่เป็นตัวอย่างรูปแบบออฟไลน์ **ไม่ใช่ไฟล์ที่eligibleต่อselectedofferingเดียวใน61** ต้องเตรียมinputต่อrunและcontextจริงจากtestservicesเมื่อพร้อม ไม่อัปโหลดmixedgroupsแล้วคาดว่าผ่านสิทธิ์ทั้งไฟล์ ไม่ใช้mockidentity/evidence referencesเป็นverifiedจริง

## 3 หลักฐานที่ต้องมีจาก runner จริง

เก็บsourceFileVersion/bytechecksum/parsergeneration/normalizedmanifest/dryrun/report/template/eligibility/identity/evidencepolicies, actor+currentassignment, servertime, actualPerson/Candidate/Application IDs, snapshotrevision, operation/commitreceipt, workflowdecision, seatnamespace/number/capacityและoutbox references แบบmasked ไม่ใส่เลขบัตร/วันเกิด/ชื่อเต็มลงlogs/jobpayload

เปรียบเทียบก่อนหลังระหว่างwebกับExcelด้วยApplicationbusinesskey `(candidate_id,session_offering_id,registration_slot)` และCandidateuniquePersonจาก05 ช่องทางไม่สร้างkeyใหม่ Account/FormTemplateRegistry/Documentเดียวกัน ตรวจexportผูกregistryversion/purpose/fieldsและApplicationSnapshotเดียวกัน **machineuploadschemaแยกจากdisplayform** ไม่เปรียบเทียบPDFกับXLSXว่าlayoutเหมือนกัน

Snapshotปีเดิมคงชื่อ/สังกัดก่อนเปลี่ยนปีถัดไป practiceattemptระบบ3ไม่ให้approve/seat/officialscore ตรวจpermissionsทุกread/edit/export/download/approve/worker โดยnegativecasesด้วยบัญชีคนละscope/หมดเวลา/revokeและmaker-checker ไม่ใช้17bootstrapunitจากบทก่อนแทนE2E64

## 4 ผลที่รันจริงรอบ64

[verification](fixtures/excel-import-64-verification.json)0.1 บันทึกread-onlyPythonstdZIP/XMLกับ3trustedfixturesเดิม ตรวจCRC/header21+5columns/หลายsheet/formula tags/externalrelationships และvalid12pairs/Thai text/NFC/leadingzero TEXT ไม่สร้างหรือแก้workbook ไม่เรียกserverparser/scanner/eligibility

| trustedfixture | file bytes | expanded bytesที่อ่านในออฟไลน์ | rows / pairs | ผลขอบเขต                                                                |
| -------------- | ---------- | ------------------------------ | ------------ | ----------------------------------------------------------------------- |
| blank          | 10469      | 51128                          | 0 / 0        | โครงสร้างheader/CRCผ่าน                                                 |
| valid          | 11645      | 61062                          | 12 / 12      | ชื่อไทย12แถว/รหัสTEXTศูนย์นำหน้า/ไม่มีformula tagsผ่าน                  |
| invalid        | 11826      | 62053                          | 12 / 12      | โครงสร้างผ่าน พบidentifierชนิดตัวเลข1cell; ไม่ได้รันValidationIssueจริง |

การตรวจชั่วคราวครั้งแรกassertผิดว่าTEXTต้องเฉพาะs/inlineStr พบXMLจริงใช้strซึ่งเป็นliteraltextด้วย จึงแก้assumptionตัวตรวจและรันใหม่ผ่าน ไม่แก้XLSX ทดสอบนี้ไม่malware/ZIPbomb/formula-uploadrejection/Excelnativeopen-save-reopen/securityloadproof

`corepack pnpm db:test` exit1 ข้อความsafeerror ไม่มีbusinesscasesเริ่ม Read-onlyprobeไม่พบpostgres/dockerPATH/dockersocket loopback5432/5546connect_ex111 API/UI/workerbusiness/nativePG/concurrency/P64-01–26/24runs/loadtest/rootunit/lint/typecheck/build **NOT_RUN** ไม่อ้างemptytablesหรือfixturepassเป็นUATpass

## 5 เพดานไฟล์และการเปิดใช้

`proven_production_file_limits=null`, `tested_commit_profile=null`, runtimecommitและofficialissuanceยังไม่พร้อม เพดาน10MiB/2000แถว/ZIP256entries/expanded40MiBและเวลา-memoryตาม [XLSX_PARSING_LIMITS](XLSX_PARSING_LIMITS.md) เป็นProposal template59ยัง20แถว ไม่มีการยกเพดานหรืออ้างว่า12แถวที่ตรวจพิสูจน์ความจุบริการ

ก่อนเปิดใช้ต้องวัดboundariesต่ำกว่า/เท่ากับ/เกินทุกlimitของprofile60/62 บนdeployment-equivalenthardware PostgreSQLจริง hardRSS/deadline/queueconcurrency/DBlockwait/fault-retry/outbox และisolatedparser รวมmalformedinputsและwebavailability ใช้20/21แถวของtemplate59ก่อน ส่วน2000/2001ต้องregistryversionที่อนุญาตและtestedprofileจริง Benchmark reportต้องมีhardware/runtime/policy versions/datasetchecksums/maxrows-cells-bytes/decompressionratio/latency-memory/rollbackcounts ไม่กรอกค่าที่ไม่วัดเป็น0/PASS

## 6 เกณฑ์และ exit gate

| เกณฑ์                                                       | กรณีหลัก                         | ผลจริง            |
| ----------------------------------------------------------- | -------------------------------- | ----------------- |
| AC64-01 บัญชีเว็บกับimportเป็นApplication/registryชุดเดียว  | P64-01/02/03/13/14/20/24 +24runs | BLOCKED / NOT_RUN |
| AC64-02 formula/invalidbatchไม่commit errorreportไม่PIIleak | P64-05–08/15–19/26               | BLOCKED / NOT_RUN |

ดู [ACCEPTANCE_CASES](../tests/system09/ACCEPTANCE_CASES.md), [coverage-plan](../tests/fixtures/system09/coverage-plan.json), [MANUAL_IMPORT](MANUAL_IMPORT.md), [UAT_SYSTEM_05](UAT_SYSTEM_05.md) ต้องแก้prerequisites/runner/nativeacceptanceและผู้รับผิดชอบยืนยันpolicyก่อนรับรอง ไม่startบท65จากเอกสารครบ ไม่มีการรับรองแบบศ.3/eligibility/อำนาจทางการจากsoftwaretests
