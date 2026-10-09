# ตรวจรับคำขอหน่วยงาน สนามสอบ และการกู้คืน — บท 34

รุ่น 0.1 | 4 ตุลาคม 2569 (2026-10-04) | source `9a13448` | **BLOCKED — ยังไม่ผ่านการตรวจรับระบบ 4**

อ่าน BLUEPRINT/MASTER/PROGRESS/DECISIONS และแบบบท30–33แล้ว ผลอ่านไฟล์จริง: `src/modules/requests` มี README เท่านั้น ไม่มี schema/service/pages ของคำขอ คิวตรวจ activation หรือ tracking พื้นที่ `/app` เป็น starter403 ไม่ใช่การตรวจ scope/maker-checker ของระบบจริง จึงยังรัน flow และการกู้คืนตามบทนี้ไม่ได้

## 1 สถานะและสิ่งที่ขาด

PASS ต้องมี execution/assertion/หลักฐานจริง; FAIL คือรันแล้วผลไม่ตรง; BLOCKED คือ dependency ขาด; NOT RUN คือกรณียังไม่ได้รัน; TO VERIFY คือหลักฐานกฎ/ผู้มีอำนาจยังไม่ยืนยัน ไม่ใช้ skipped/mockedALLOW หรือการตรวจเอกสารแทน PASS

| บท  | สิ่งที่มี                                       | Runtimeที่ยังขาด                                                                 | สถานะ   |
| --- | ----------------------------------------------- | -------------------------------------------------------------------------------- | ------- |
| 30  | ORG_CENTER_REQUESTS / ORG_CENTER_REQUEST_SCHEMA | typed requests/targets/form configuration/schema/migration/owner services        | BLOCKED |
| 31  | REQUEST_WIZARD / REQUEST_SUBMISSION             | draft/returned revision/receipt/actions/fileupload/tracking                      | BLOCKED |
| 32  | REQUEST_REVIEW / REQUEST_IMPACT_CHECKS          | queue/currentauthority/delegation/terminaldecision/impact adapters               | BLOCKED |
| 33  | REQUEST_EFFECTIVE_RULES                         | activation transaction/worker/status projections/history/public-private tracking | BLOCKED |

ส่วนกลางตาม [FOUNDATION_ACCEPTANCE](FOUNDATION_ACCEPTANCE.md) ยังขาด Auth/session/DAL/files/workflow/outbox; DB-06/Q027 และ DOCKER-05/Q026ยังเปิด `Application`/`PositionAssignment` ยังไม่มี จึงจำลองผู้สมัคร/หน้าที่ค้างได้เพียงแผน fixture ไม่ได้พิสูจน์ข้อมูลไม่หายจากการยุบ/ปิด

## 2 สิ่งส่งมอบจริง

- [ACCEPTANCE_CASES](../tests/system04/ACCEPTANCE_CASES.md): specification22กรณี พร้อมขั้นทำซ้ำและassertions เป็น **แผนทดสอบ ไม่ใช่ executable tests**
- [coverage-plan.json](../tests/fixtures/system04/coverage-plan.json): plan10ประเภท/3branch/ข้อมูลสมมติสำหรับสร้างfixturesภายหลัง `seeded=false` ไม่มีบัญชี ใบสมัคร หรือหน้าที่ที่สร้างจริง
- [MANUAL_REQUESTS](MANUAL_REQUESTS.md): คู่มือเตรียมใช้งานและflowแก้/เพิกถอนคำสั่ง ไม่ใช่คำรับรองว่าUIหรืออำนาจทางการพร้อม

root command `corepack pnpm test` ใช้ `tests/*.test.ts` ไม่รัน specification ใน `tests/system04` ไม่มี `test:system04` หรือ E2E runnerเพิ่มในบทนี้ ไม่สร้างฐาน/login/engineอีกชุดเพื่อให้testดูเหมือนผ่าน

## 3 Coverage lifecycle10ประเภท

ใช้C30 refsจาก [ORG_CENTER_REQUESTS](ORG_CENTER_REQUESTS.md) ทุกแถวแยก OrganizationType/ExamType/Session/year/ROUND ตามต้นทาง ไม่ใช้ชื่อระดับตรี/โท/เอกเป็นประเภทสอบ

| Coverage ref | ประเภท                | ร่าง    | ส่งกลับ | อนุมัติ | ปฏิเสธ  | ยกเลิก  | มีผล    | กฎ/อำนาจทางการ |
| ------------ | --------------------- | ------- | ------- | ------- | ------- | ------- | ------- | -------------- |
| C30-01       | จัดตั้งสำนักเรียน     | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | TO VERIFY      |
| C30-02       | ยุบสำนักเรียน         | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | TO VERIFY      |
| C30-03       | จัดตั้งสำนักศาสนศึกษา | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | TO VERIFY      |
| C30-04       | ยุบสำนักศาสนศึกษา     | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | TO VERIFY      |
| C30-05       | เปิดสนามนักธรรม       | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | TO VERIFY      |
| C30-06       | ปิดสนามนักธรรม        | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | TO VERIFY      |
| C30-07       | ย้ายสนามนักธรรม       | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | TO VERIFY      |
| C30-08       | เปิดสนามธรรมศึกษา     | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | TO VERIFY      |
| C30-09       | ปิดสนามธรรมศึกษา      | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | TO VERIFY      |
| C30-10       | ย้ายสนามธรรมศึกษา     | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | TO VERIFY      |

60ช่องเป็นcoverageของสถานะ ไม่ใช่60executions ต้องรัน3branchแยกกันต่อประเภท: (A) draft→submitted→reviewing→returned→แก้/resubmit→reviewing→approved→effective, (B) draft→submitted→reviewing→rejected, (C) draft→cancelled และช่วงอื่นที่policyอนุญาต ไม่ต่อapproved→rejected/cancelledเป็นflowที่engine11ไม่รองรับ

ใช้UAT34-T01–04กับทุกแถว ขอยุบ/ปิด C30-02/04/06/09 ต้องT08–11/T17เพิ่มเติม MOVE C30-07/10 ต้องT20 และการกู้คืน T12–16/T18–19 กับประเภทที่configurationรองรับ ขาดfixture/rule/adapterให้BLOCKED ไม่skipแล้วอ้างครบทุกประเภท

## 4 การจำลองผลกระทบและข้อมูลไม่หาย

fixtureplanกำหนดผู้สมัครสมมติสองรายการในปี/ประเภท/รอบเดียวกับสนาม และหนึ่งรายการในอีกประเภท/ปีเพื่อจับการเปลี่ยนข้ามบริบท มีบุคคลกลางหนึ่งคนถือหน้าที่ค้าง/หน้าที่อื่นที่ไม่เกี่ยวข้อง และคำสั่ง/ที่อยู่จัดส่งรุ่นเดิมกับหลักฐานprivateที่scanผ่าน ต้องสร้างจริงผ่านsharedseed/owner servicesของdependency ไม่ใส่สำเนาใบสมัครในระบบ4

ก่อนทำเรื่องเก็บmanifestจากnativeDBที่มีข้อมูลจริงในฐานทดลอง: identity sets, status/version, FK bindings, document/FileVersion/hash refs, address snapshot, assignment/history/sourceorder, audit/activation refs และจำนวนรายการ ต้องassertfixturesไม่ว่างก่อน test ไม่ใช้ `count=0`/ตารางไม่มีเป็นหลักฐานไม่สูญหาย

เปรียบเทียบหลัง rejected/cancelled/pendingapproval/blockedactivation ต้องทะเบียนและsnapshotเดิมตรง; หลังeffectiveclose/dissolve อาจเปลี่ยนสถานะที่อนุมัติแต่ identity/document/historyที่ต้องรักษายังอยู่ ไม่มีcascade harddelete/autoย้ายคน การย้ายที่ได้รับอนุมัติแยกบริการระบบ5 ต้องmanifestการเปลี่ยน/ต้นทางปลายทางครบ ไม่บังคับทุกfieldเหมือนเดิมจนstatusถูกต้องกลับถูกมองเป็นผิด

## 5 Flowแก้ไขหรือเพิกถอน — Proposal

การแก้คำสั่งเป็นคำขอใหม่ผ่านworkflow11/โมดูล4 อ้างคำขอรุ่นเดิม terminaldecision, activation/status events, คำสั่งFileVersion และเหตุผล/หลักฐานที่มีACL ไม่สร้างengineหรือแก้eventเดิม คำว่า AMEND/REVOKE ด้านล่างเป็น intentภายในทดลอง ไม่ใช่รหัสแบบทางการหรือenumที่สร้างแล้ว ต้องQ006/Q024รับรองschema/bindings/rulesก่อนmigration

1. ผู้มีสิทธิ์ระบุคำสั่งต้นเรื่องและscope ระบบอ่านต้นทางพร้อมhistory/ผลกระทบปัจจุบัน ถ้ารู้เพียงIDแต่ไม่มีสิทธิ์ให้denyโดยไม่เผยเหตุผล
2. ยื่นเรื่องใหม่ด้วยreason/evidenceและdeltaที่เสนอ ระบุว่าจะหยุดคำสั่งที่ยังไม่effective หรือแก้ผลที่effectiveแล้ว ห้ามกดcancelธรรมดาเพื่อล้างคำสั่งapproved/effective
3. ผู้ตรวจคนละmakerตรวจ4ด้านและรายการที่ต้องตามแก้ ผู้อนุมัติตรวจอำนาจ/delegation/เวอร์ชันและวันตามpolicy ขาดruleหรือplanให้NOT_READY
4. returnedแก้เป็นrevision/cycleใหม่ของคำขอแก้ไข; rejected/cancelledคำขอแก้ไขไม่มีผลต่อคำสั่งเดิม และไม่เปลี่ยนสถานะว่าคำสั่งเดิมถูกเพิกถอน
5. เมื่อคำขอแก้ไขapprovedและถึงวัน ผ่านactivation33จึงappendเหตุการณ์แก้ไข/เพิกถอนที่เชื่อมต้นทาง ปรับprojectionตามdeltaที่ตรวจแล้ว เก็บrecorded_atจริงและvalid_atตามpolicy
6. การเพิกถอนคำสั่งที่ยังไม่effectiveต้องมีrevocation referenceที่activationguardตรวจได้ ส่วนeffectiveแล้วต้องowner correction effects ไม่ย้อนฐานทั้งหมดกลับsnapshotเก่า หากมีคำสั่งใหม่ที่ถูกต้องแทรก ต้องตรวจdependency/rebaseโดยผู้มีอำนาจ ไม่ล้างผลใหม่เหล่านั้น
7. outboxแจ้งหน่วยเกี่ยวข้องตามcurrentrights/devsink แสดงรายการผลกระทบที่แก้แล้ว/ค้าง โดยไม่ถือส่งแจ้งเตือนเท่ากับแก้ทุกงานสำเร็จ

ไม่เลือกการกระทำกลับด้านอัตโนมัติ เช่นเพิกถอนCLOSEไม่ได้แปลว่าREOPENได้ทุกกรณี ผู้สมัคร/ที่นั่ง/จัดส่ง/บุคลากรที่ได้รับผลไปแล้วต้องเจ้าของรับรองแผน ไม่มีการคืนสิทธิ์พื้นที่หรือย้ายคนกลับเอง รายการแก้ต่อที่ยังค้างต้องมีผู้รับผิดชอบ หลักฐาน วันกำหนด และเงื่อนไข ไม่ซ่อนว่าแก้แล้วจากการcommitคำสั่งเดียว

## 6 หลักฐานและการรับรอง

เกณฑ์34-01เชื่อมUAT34-T12–16/18–19: ต้องqueryต้นทาง correction→sourceRequestVersion→decision→activation/status→FileVersion/hashและเหตุผลที่มีสิทธิ์อ่านได้จริง เกณฑ์34-02เชื่อมT08–11/17/20: identity/document/history manifestsหลังflowและretryต้องคงครบ ไม่มีorphan/harddelete/snapshotทับ

หลักฐานแต่ละexecutionเก็บsource/migration/fixture/type/branch/rule/actor/authority/serverclock/HTTP/nativebefore-after/CAS/receipt/outbox/trace refsในพื้นที่private พร้อมผู้ตรวจและวันที่ ไม่commitcredentials/token/เหตุผลเต็ม/เอกสารส่วนตัว/networktraceที่มีsecret อำนาจรับรองต้องQ005/Q006ยืนยันผู้รับงานจริง C02ทดสอบซอฟต์แวร์ไม่แทนผู้อนุมัติธุรกิจ

## 7 Commandsและผลที่รันจริง

| คำสั่ง/การตรวจ                                                            | ผลจริง4ตุลาคม2569                                                                                     | ขอบเขต                                                       |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| git status/log และอ่านschema/services/package/worker                      | source9a13448 clean; requestsREADME-only; 19coremodels requiredrequest/application/position modelsขาด | prerequisite check ไม่ใช่UATflow                             |
| Python read-only inventory/Docker/TCP/checksum                            | DockerCLI/socketไม่มี loopback5432/5546ConnectionRefusedError migrationchecksumเดิม                   | ไม่ตรวจcredentials/เริ่มdaemon/แตะproduction                 |
| `corepack pnpm test`                                                      | PASS17/17 exit0 ไม่มีskip                                                                             | starter/corehelpersเท่านั้น ไม่รันระบบ4spec                  |
| `corepack pnpm db:test`                                                   | exit1 safeerrorไม่แยกenv/connection                                                                   | DB-06/Q027ยังBLOCKED ไม่เดาสาเหตุย่อย                        |
| `corepack pnpm worker:check`                                              | exit1 safeerror                                                                                       | ไม่มีDB/Redispositiveหรือscan/activation/outboxworkerผ่าน    |
| nativeDB/API/E2E/recovery/concurrency/workerbusiness/browser/UAT34-T01–22 | NOT RUN                                                                                               | dependency30–33ขาด ไม่ใช้17unitPASSหรือstarter403แทนสองเกณฑ์ |
| typecheck/lint/build/SQLWASM                                              | NOT RUNในบท34                                                                                         | ไม่มีruntimeเปลี่ยน ไม่อ้างผลบทเก่าเป็นการตรวจรับรอบนี้      |

ขั้นตรวจหลังdependencyพร้อม: (1) ตั้งdevตามREADME/DATABASEโดยไม่ใช้production (2) ตรวจรับDB-06/ส่วนกลางและ30–33 (3) สร้างsharedfixturesจริงตามplan10ประเภท (4) ต่อexecutabletestsกับservices/runnerที่เลือกและตรวจสิทธิ์ทุกentrypoint (5) รัน22กรณีตามparameterizationพร้อมnativefault/concurrencyและbrowser (6) ให้O04/O02/O05/O01/O08ตรวจmanifest/รายการค้าง/อำนาจก่อนลงรับรอง ห้ามอ้างคำสั่งtest:system04จนเพิ่มและรันจริง

app/schema0.6.0 Prisma7.10.0 Next16.3.8 pnpm11.28.2 lockfile9 core19models/213scalarfields/migration1 `20261003130000_core_foundation` SHA256 `04a149fcd349f0ac3f1b5929cfcf571f8b0880541e84a40ad929054b67d72756` ไม่เปลี่ยน ไม่มีschema/seed/runtimeใหม่

## 8 ข้อสรุปการตรวจรับ

ทั้งสองเกณฑ์ **BLOCKED / NOT RUN** ไม่มีการรับรองระบบ4ใช้ได้จริงหรือคำสั่งทางการพร้อม ต้องปิด30–33และต้นทางก่อนรับรอง บท35ยังไม่เริ่มและไม่เดาขอบเขต ไม่มีpush/deploy/productionเปลี่ยน การลงมือโค้ดต้องแผนตามMASTERข้อ2 แผน07เดิมที่อนุมัติยังใช้ได้ ไม่ขอซ้ำหรือถือการอนุมัติแทนผลทดสอบ

## 9 ผลตรวจสิ่งส่งมอบบท34

| คำสั่ง/การตรวจ                                                                                                                                                                                                           | ผลจริง                                                                                                                                   | ขอบเขต                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Python inlineตรวจspec/JSON/IDs/local links/traceability/status/เทียบschema-package-lock-workerกับHEAD                                                                                                                    | PASS: 22cases/10types/3branches/60ช่องNOT RUN/8actor refs/26local links/9files/หัวข้อ28/DEC144–147; core19models/1migration/checksumเดิม | document/fixtureplan check ไม่executeUAT             |
| `corepack pnpm exec prettier --ignore-path /dev/null --check docs/UAT_SYSTEM_04.md docs/MANUAL_REQUESTS.md tests/system04/ACCEPTANCE_CASES.md tests/fixtures/system04/coverage-plan.json src/modules/requests/README.md` | exit0                                                                                                                                    | Markdown/JSON5ไฟล์นี้                                |
| `git diff --check` / `git diff --cached --check`                                                                                                                                                                         | exit0                                                                                                                                    | working/staged9ไฟล์                                  |
| `corepack pnpm secrets:check` หลังstage                                                                                                                                                                                  | exit0                                                                                                                                    | ตามแพตเทิร์นและไฟล์ที่Gitเห็น ไม่รับรองsecretทุกชนิด |

ชื่อcommitรอบนี้ “บทที่ 34: เตรียม UAT และคู่มือกู้คืนระบบ4ที่ยังติด dependency” ไม่มีexecutabletests/seed/runtimeระบบ4เพิ่ม ทุกUAT34และสองเกณฑ์ยังBLOCKED/NOT RUN ไม่push/deploy
