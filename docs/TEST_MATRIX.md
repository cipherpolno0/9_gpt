# Matrix ตรวจหน่วยและบริการ — บท 67

รุ่น 0.1 | 9 ตุลาคม 2569 (2026-10-09) | baseline `ac22bdd` | **Proposal / BLOCKED — prerequisite66 และบริการธุรกิจยังไม่พร้อม**

อ่าน [BLUEPRINT](../BLUEPRINT.md), [MASTER](../00_MASTER_PROMPT.md), [TEST_RESULTS](TEST_RESULTS.md), [DATABASE](DATABASE.md), [PERMISSIONS](PERMISSIONS.md) ก่อนใช้ มี core19models/migration1 แต่ไม่มี User/RoleAssignment/Application/ExamCenter/seat/ledger/stock/import/outbox/FileVersion/report services ทั้ง9modulesเป็นREADME-only `/app`ตอบ403ทุกmethod ไม่ใช่negative authorization ที่มีpositive flowจริง

## 1 วิธีสอนและชั้นของการทดสอบ

1. Unit ตรวจผลกฎจาก input ที่ทราบคำตอบโดยไม่ใช้ฐาน เช่น ขอบเขตวันไทย ไม่คัดสูตรใน production helper มาใช้เป็นคำตอบเดียวกัน
2. Integration ตรวจบริการกับ PostgreSQL serverจริง รวม constraint/transaction/context หลายconnectionและงานแข่ง ห้ามใช้ SQLite หรือฐานหน่วยความจำเป็นหลักฐาน lock
3. API/worker ตรวจผู้ใช้จริงที่มีสิทธิ์และไม่มีสิทธิ์ รวม snapshotของฐานก่อนหลัง ไม่ถือ403ทั้งหมดว่าระบบสิทธิ์สมบูรณ์
4. Report แยก PASS ของชุดที่รันจาก BLOCKED/NOT_RUN ของชุดที่ยังไม่มี ทุกกรณีต้องมีคำสั่ง backend รุ่น จำนวนทดสอบ และข้อจำกัด
5. กฎทางการ/นโยบายยัง TO VERIFY ผลซอฟต์แวร์ไม่รับรองอำนาจหรือเกณฑ์ทางกฎหมาย

## 2 Inventory ที่มีจริง

| ชุดเดิม                                                                                            | ขอบเขตที่มีจริง                                      | คำสั่งเดิม / ข้อจำกัด                                                              |
| -------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [dates](../tests/dates.test.ts)                                                                    | 3 unit: UTC→Bangkok/พ.ศ., ช่วงวัน, วันที่กำกวม       | อยู่ใน pnpm test; ไม่พิสูจน์ temporal assignment authorization                     |
| [database-safety](../tests/database-safety.test.ts)                                                | 2 unit: guardฐานทดลอง/fixture key                    | ไม่เชื่อมฐาน ไม่พิสูจน์ import identity หรือPerson dedupeจริง                      |
| [bootstrap](../tests/bootstrap.test.ts)                                                            | 9 checks: closedworkspace/localservice configuration | workspace403/no-store ไม่เป็น401/session/role/scope/maker-checker9systems          |
| [structure](../tests/structure.test.ts)                                                            | 3 structural checks                                  | รุ่น/โครงสร้าง ไม่ใช่กฎธุรกิจ ไม่เพิ่มสำเนาใน tests/unitเพื่อทำยอดtestให้มากขึ้น   |
| [core.integration](../tests/database/core.integration.ts)                                          | PostgreSQL core06 parent+12subtestsที่เขียนไว้       | pnpm db:test เดิมตรวจschema/seed/history/FK/RLS core แต่รอบ67 exit1 ก่อนsuiteเริ่ม |
| [sql-wasm](../tests/database/sql-wasm.test.ts)                                                     | parent+11subtests SQL coreกับ PGlite                 | pnpm db:test:sql เป็นsupplementary ไม่server/Prisma/requestAuth/concurrency        |
| [unit plans](../tests/unit/UNIT_CASES.md) / [service plans](../tests/integration/SERVICE_CASES.md) | U67-01–06 / D67-01–12 specifications                 | ไม่มีexecutableใหม่ ไม่มีpnpm test:unit67/test:integration67 ในpackage             |

สเปกทุกระบบเดิมใช้ [system01](../tests/system01/ACCEPTANCE_CASES.md), [02](../tests/system02/ACCEPTANCE_CASES.md), [03](../tests/system03/ACCEPTANCE_CASES.md), [04](../tests/system04/ACCEPTANCE_CASES.md), [05](../tests/system05/ACCEPTANCE_CASES.md), [06](../tests/system06/ACCEPTANCE_CASES.md), [07](../tests/system07/ACCEPTANCE_CASES.md), [08](../tests/system08/ACCEPTANCE_CASES.md), [09](../tests/system09/ACCEPTANCE_CASES.md) กับ [integration65](../tests/integration/INTEGRATION_CASES.md) / [reporting66](../tests/reporting/REPORTING_CASES.md) ไม่ย้ายไฟล์เดิมให้ glob pnpm test เปลี่ยนโดยเงียบ

## 3 Negative authorization ครบ9ระบบ — 54 case families ยังNOT_RUN

รหัส N67-Sxx-R/M/E/F/W/J คือ read, mutate, export, file preview/download, workflow/approve และ worker แต่ละช่องต้องมี positiveในscope และ variantsตามหัวข้อ4กับ actualresource IDs/currentgrants/DBcounts ไม่ใช่54 executabletestsหรือ54PASS ทุกช่องเป็น **PLAN_ONLY/NOT_RUN** Route/actionจริงต้องownerรับรองก่อนimplementation

| ระบบ / ทรัพยากรเฉพาะ                 | read      | mutate    | export    | file download | workflow  | worker    |
| ------------------------------------ | --------- | --------- | --------- | ------------- | --------- | --------- |
| 01 Person/Assignment/history         | N67-S01-R | N67-S01-M | N67-S01-E | N67-S01-F     | N67-S01-W | N67-S01-J |
| 02 Org/Center/session/appointment    | N67-S02-R | N67-S02-M | N67-S02-E | N67-S02-F     | N67-S02-W | N67-S02-J |
| 03 QuestionVersion/Attempt/progress  | N67-S03-R | N67-S03-M | N67-S03-E | N67-S03-F     | N67-S03-W | N67-S03-J |
| 04 Request/version/activation        | N67-S04-R | N67-S04-M | N67-S04-E | N67-S04-F     | N67-S04-W | N67-S04-J |
| 05 Enrollment/App/seat/score/release | N67-S05-R | N67-S05-M | N67-S05-E | N67-S05-F     | N67-S05-W | N67-S05-J |
| 06 Budget/ledger/disbursement        | N67-S06-R | N67-S06-M | N67-S06-E | N67-S06-F     | N67-S06-W | N67-S06-J |
| 07 Order/stock/custody/disposal      | N67-S07-R | N67-S07-M | N67-S07-E | N67-S07-F     | N67-S07-W | N67-S07-J |
| 08 Record/version/recipient/receipt  | N67-S08-R | N67-S08-M | N67-S08-E | N67-S08-F     | N67-S08-W | N67-S08-J |
| 09 Batch/row/report/sharedApp05      | N67-S09-R | N67-S09-M | N67-S09-E | N67-S09-F     | N67-S09-W | N67-S09-J |

Workflow03รวม content maker-checker และ pretest→lesson→posttest sequencing; workflow09ใช้confirmation/recovery/amendmentกับ05/กลาง ไม่สร้างapprovalengineใหม่ ส่วนworkerอ่าน/เขียนต้องcapabilityเฉพาะงาน+scope+เวลาปัจจุบันและsourceACL ไม่ใช้produceractor/sessionเก่าให้สิทธิ์

## 4 Variants และ assertions ร่วม

| variant                                               | ใช้เมื่อใด                                                     | assertionที่ต้องได้                                                                                                  |
| ----------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| V01 unauthenticated/invalid session                   | private HTTP R/M/E/F/W                                         | 401 ตามAuth contractกลาง ไม่มีpayload/mutation; public endpointsที่อนุมัติไม่เอามาปนกับcaseนี้                       |
| V02 authenticated wrong action/scope                  | ทุกช่อง                                                        | HTTP403หรือsafe404ตามexistence policy; workerDENIED ไม่ใช่HTTP401 ไม่มีbusiness effects                              |
| V03 IDOR เปลี่ยนresource/target/file/version/manifest | ทุกช่อง                                                        | Aไม่อ่าน/แก้B ไม่มีcount/facet/snippet/error/body/header/filename/URL/exportsของB ไม่ถือรู้UUIDเป็นgrant             |
| V04 maker-checker                                     | approval/significant mutate/workflow และworkerที่applydecision | ผู้สร้างไม่อนุมัติตน รวมบัญชีหลายหน้าที่ที่ผูกตัวตนเดียว; currentdecision/version/authorityต้องตรง ไม่มีsourceeffect |
| V05 expired/revoked/not-yet-effective assignment      | ทุกช่อง                                                        | เริ่มรวมสิ้นสุดไม่รวม currentserverclock; queuedก่อนหมดไม่ให้worker/ดาวน์โหลดหลังหมด ไม่รอeventเพื่อdeny             |
| V06 file status/ACL/hold                              | F และpathอื่นที่ใช้เอกสาร                                      | quarantine/scanfailed/รุ่นเปลี่ยน/holdตามpolicy ไม่read/preview/exportผิดgrant ลิงก์ข้ามระบบไม่grantอัตโนมัติ        |
| V07 technicaladmin/serviceprincipal/clientforgery     | ทุกช่อง                                                        | roleชื่อadmin/ฝ่าย/actorในpayload/allowed=true/clientscore/clienttimeไม่เพิ่มอำนาจ ไม่มีPIIในlog/jobpayload          |

V04ใช้เฉพาะtransitionที่ต้องแยกผู้สร้าง ไม่สมมติว่าการอ่านต้องmaker-checker Workerทดสอบการปฏิเสธภายในและdispatch HTTPถ้ามี แยกworkerresultจากHTTPstatus ไม่อ้างทุกช่องต้องคืน401/403แม้ไม่เป็นHTTP

## 5 Isolated PostgreSQL และ deterministic fixtures/time — ยังไม่จัดตั้งจริง

ปัจจุบัน scripts/database.mts กับ assertLocalDatabase ยอมรับเฉพาะ loopback prefix sangha_ch06_test และ migrationcore06หนึ่งชุด ไม่รองรับ67domainmigration จึงไม่เปลี่ยนชื่อฐานหรือข้ามguardเพื่อรัน suiteใหม่

Profileเสนอเมื่อruntimeพร้อม: ephemeral databaseต่อrun/workerหรือschemaที่แยกและพิสูจน์ isolation โดยใช้ migrationจริงครบและruntime limitedrole/RLS/requestcontext แยกmigrationrole ห้ามฐานdev/prod/ชื่อpostgres/templateทั่วไป ฝั่งrunnerตรวจrun marker+expectedschema+localhost+allowlistednameก่อน create/teardown ชื่อเสนอ sangha_ch67_test_<run_slug> ต้องADR/guardที่อนุมัติใหม่ ไม่ใช่ชื่อฐานที่ถูกสร้างแล้ว รอบนี้ไม่เปิดdaemon/reset/dropฐาน

Fixtures TEST_ deterministic UUIDผ่านcentralfixture provider และ Person/Organization/Application/Documentกลางเดียว ระบุowner/key/ruleversion/evidenceCLEANตามสิ่งสมมติที่สร้างจริงเมื่อมีบริการ ห้ามใช้mockALLOW/ไฟล์bytesไม่มีscanเป็นCLEAN proof หรือใช้Personชื่อคล้ายเป็นคนเดียว ก่อนแต่ละcaseจับcounts/versions/source receipts/audit/outbox/key/ledger snapshot; clearเฉพาะisolatedrunที่พิสูจน์ownership ไม่ลบธุรกรรมจริง

Businessclockเสนอ T0=2026-10-09T03:00:00Z ใช้trustedtestadapterในtest-onlyservercontext ไม่รับHTTPheader/clienttimeให้overrideproduction บันทึก recorded_at ตามจริงแยกeffective_as_of Boundaryเริ่ม/สิ้นสุดทดสอบ ±1ms ตามdatatypeprecision ที่ยืนยัน ถ้าบริการใช้DB CURRENT_TIMESTAMP ต้องทบทวนclock seamหรือfixtureเทียบtransaction_timestampจริงก่อน ไม่อ้างfreezetimeได้จากmonkeypatchDateฝั่งbrowser

Concurrencyใช้สองหรือมากกว่าconnections ตรวจ pg_backend_pid ต่างกันจริง barriers/faultpointsและboundedwholetransactionretry ไม่Promise.allในconnectionเดียว ไม่sleepแล้วเดาว่าแข่ง Checkfinalpersistedstateหลังallworkersจบด้วย independent oracleรวมconstraints/sourceevidence ไม่บังคับว่าactorใดต้องชนะ ใช้samekeyretryและchangedpayloadconflictต่างcase ไม่มีskipแล้วนับPASS

## 6 Gate

AC67-01 BLOCKED_NOT_RUN: ยังไม่มีnegative9systemsหรือnative seats/budget/stock concurrencyจริง AC67-02รายงานตามผลจริงและไม่เพิ่มtautologicaltests แต่businesssuiteยังไม่มีให้ตรวจครบ จึงไม่ประกาศบท67ผ่าน ต้องปิด66/DB-06/currentAuth/files/owners/outboxก่อนแผนruntimeและnativeacceptance บท68NOT_STARTED
