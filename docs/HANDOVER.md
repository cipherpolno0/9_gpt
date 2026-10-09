# แผนส่งมอบ คู่มือตามบทบาท และรายการค้าง

รุ่น 0.1 | บท72 | 9 ตุลาคม 2569 | **HANDOVER_PENDING / ไม่ได้รับรองรับมอบ**

อ่าน [GO_LIVE](GO_LIVE.md), [TRACEABILITY](TRACEABILITY.md), [release-plan](../tests/fixtures/release/release-plan.json) และ [UAT_SIGNOFF_TEMPLATE](UAT_SIGNOFF_TEMPLATE.md) คู่มือเดิมเป็น flowเสนอ หน้าจอธุรกิจยังไม่มี จึงไม่เขียนว่าผู้ใช้กดปุ่มใดได้จริงหรือฝึกอบรมแล้ว

## 1 เจ้าของงานและช่องทางติดต่อชุดเดียว

| Roleเสนอ | หน้าที่                                                   | บุคคลที่แต่งตั้ง / scope / เวร / หลักฐาน               |
| -------- | --------------------------------------------------------- | ------------------------------------------------------ |
| C01      | เจ้าของโครงการ ประสานอำนาจ/หน่วยนำร่อง ปล่อยรุ่นและรับงาน | `[TO_VERIFY_C01]` / ยังไม่ยืนยัน                       |
| C02      | เทคนิค security CI/deploy/monitoring/backup/recovery      | `[TO_VERIFY_C02]` / ยังไม่ยืนยัน                       |
| C03      | ผู้รับผิดชอบนโยบายข้อมูล/ข้อวินิจฉัยที่หน่วยงานแต่งตั้ง   | `[TO_VERIFY_C03]` / ยังไม่ยืนยัน                       |
| C04      | เนื้อหา ข่าว ดาวน์โหลด และติดต่อกลาง                      | `[TO_VERIFY_C04]` / ยังไม่ยืนยัน                       |
| O01–O09  | เจ้าของกฎ/UAT/ข้อมูลแต่ละระบบตาม Charter                  | `[TO_VERIFY_O01]` ถึง `[TO_VERIFY_O09]` / ยังไม่ยืนยัน |

ช่องทางกลางเสนอ `/contact` ตาม BLUEPRINT ยังไม่มีหน้าใช้งานจริง C04ต้องยืนยัน contactrecordกลางเพียงชุดเดียว: displayname, officialsupportchannel, hours, incidentroute, contentversionและหลักฐานอนุมัติ ค่าทั้งหมดว่าง ไม่ใส่หมายเลข อีเมลหรือรายชื่อจริงจากการเดา ทุกโมดูลใช้ทางลัดกลับต้นทางนี้ ประชาชนไม่ถูกขอ password/token/เลขบัตรหรือหลักฐานส่วนตัวผ่านข้อความสาธารณะ การ escalationใช้ internalroutingของช่องทางเดียว ไม่เพิ่ม helpdeskสาธารณะต่อระบบ

## 2 REQ → implementation → tests → UAT → คู่มือทั้ง9ระบบ

READMEที่ระบุด้านล่างเป็น **moduleplaceholder/สัญญาแผน ไม่ใช่ implementationธุรกิจ** ทุกระบบ UATเป็น BLOCKED ไม่มี executedbusinesscasesหรือ signedhandover มีเพียง corePerson/Organization/ปี/Documentmetadataและ starterตามผลจริง Implementationgapถูกบันทึกเป็นค่าว่างใน release-plan ไม่แทนด้วย pathไปไฟล์ที่ไม่มี

| REQ / UC               | Sourceที่มีและส่วนขาด                                                                                      | Test specification                               | UAT                       | คู่มือ                                   |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------- | ---------------------------------------- |
| REQ-S01 / UC-S01-01–02 | [people README](../src/modules/people/README.md); corePerson, ขาดroles/historyworkflow/currentDAL          | [cases01](../tests/system01/ACCEPTANCE_CASES.md) | [UAT01](UAT_SYSTEM_01.md) | [บุคลากร](MANUAL_PEOPLE.md)              |
| REQ-S02 / UC-S02-01–02 | [organizations README](../src/modules/organizations/README.md); coreOrganization, ขาดcenter/session/impact | [cases02](../tests/system02/ACCEPTANCE_CASES.md) | [UAT02](UAT_SYSTEM_02.md) | [หน่วยและสนาม](MANUAL_ORGANIZATIONS.md)  |
| REQ-S03 / UC-S03-01–02 | [learning README](../src/modules/learning/README.md); ขาดattempt/lesson/manualgrading                      | [cases03](../tests/system03/ACCEPTANCE_CASES.md) | [UAT03](UAT_SYSTEM_03.md) | [ผู้สอนและเรียน](MANUAL_LEARNING.md)     |
| REQ-S04 / UC-S04-01–02 | [requests README](../src/modules/requests/README.md); ขาดwizard/decision/activation                        | [cases04](../tests/system04/ACCEPTANCE_CASES.md) | [UAT04](UAT_SYSTEM_04.md) | [คำขอ](MANUAL_REQUESTS.md)               |
| REQ-S05 / UC-S05-01–03 | [exams README](../src/modules/exams/README.md); ขาดApplication/seat/score/release                          | [cases05](../tests/system05/ACCEPTANCE_CASES.md) | [UAT05](UAT_SYSTEM_05.md) | [สมัครและผลสอบ](MANUAL_EXAMS.md)         |
| REQ-S06 / UC-S06-01–02 | [budget README](../src/modules/budget/README.md); ขาดledger/approval/disbursement                          | [cases06](../tests/system06/ACCEPTANCE_CASES.md) | [UAT06](UAT_SYSTEM_06.md) | [การเงิน](MANUAL_BUDGET.md)              |
| REQ-S07 / UC-S07-01–02 | [inventory README](../src/modules/inventory/README.md); ขาดstock/asset/custody                             | [cases07](../tests/system07/ACCEPTANCE_CASES.md) | [UAT07](UAT_SYSTEM_07.md) | [คลังและผู้ถือครอง](MANUAL_INVENTORY.md) |
| REQ-S08 / UC-S08-01–02 | [correspondence README](../src/modules/correspondence/README.md); ขาดrouting/receipt/retention             | [cases08](../tests/system08/ACCEPTANCE_CASES.md) | [UAT08](UAT_SYSTEM_08.md) | [สารบรรณ](MANUAL_EOFFICE.md)             |
| REQ-S09 / UC-S09-01–02 | [exam-imports README](../src/modules/exam-imports/README.md); ขาดboundedparse/staging/commitworker         | [cases09](../tests/system09/ACCEPTANCE_CASES.md) | [UAT09](UAT_SYSTEM_09.md) | [Excel](MANUAL_IMPORT.md)                |

REQ-C01–C20และREQ-N01–N06รวมกับREQ-S01–S09เป็น35ข้อ เชื่อม UC/TCจาก TRACEABILITYต้นฉบับใน release-plan พร้อมสถานะช่องว่าง ไม่เพียงนับว่าลิงก์ครบแล้วรับรอง AC72-01 อ่าน [TEST_MATRIX](TEST_MATRIX.md), [TEST_RESULTS](TEST_RESULTS.md), [UAT_MASTER](UAT_MASTER.md), [INTEGRATION_MAP](INTEGRATION_MAP.md) เพิ่มเติม Nativeconcurrency/Playwright/สามbusinessflows/recoveryยังไม่ผ่าน

## 3 คู่มือเริ่มต้นตามกลุ่มผู้ใช้ — ใช้เมื่อ runtimeและสิทธิ์พร้อม

| ผู้ใช้                           | ขั้นตอนที่ต้องสอน/ฝึกในข้อมูลสมมติ                                                                                      | เกณฑ์ฝึกผ่านและเอกสาร                                                                                                                           |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| ประชาชน                          | อ่านเฉพาะข่าว/ทะเบียน/ผลที่อนุญาต เลือกปีและอ่านชื่อsnapshot ติดตามคำขอเฉพาะข้อมูลเปิดเผย ใช้ช่องทางกลางรายงานข้อมูลผิด | draft/withdrawn/privateไม่ปรากฏ; อ่าน [RESULT_PUBLICATION_POLICY](RESULT_PUBLICATION_POLICY.md), [PERSON_VISIBILITY](PERSON_VISIBILITY.md)      |
| ผู้เรียน                         | ใช้บัญชีร่วม เข้าเนื้อหาที่เปิด pre→lesson→post ดูคะแนนฝึก/ความก้าวหน้า แจ้งเนื้อหาผิดจากช่องทางกลาง                    | คะแนนฝึกไม่เป็นผลสอบทางการ ข้อเขียนใช้ผู้ตรวจ; อ่าน [LEARNING_FLOW](LEARNING_FLOW.md), [MANUAL_LEARNING](MANUAL_LEARNING.md)                    |
| ผู้สอน/ผู้ตรวจเนื้อหา            | ตรวจสิทธิ์เนื้อหาและรุ่น/rubric review/publish ตรวจข้อเขียนตามกระบวนการ ไม่ส่งคำตอบลับผ่าน public                       | เนื้อหายังTO_VERIFYไม่ออกเป็นรับรอง; คู่มือเรียนและ [QUESTION_REVIEW](QUESTION_REVIEW.md)                                                       |
| เจ้าหน้าที่พื้นที่/เจ้าของข้อมูล | ค้นเฉพาะscopeและเวลา เสนอแก้คน/หน้าที่/คำขอ แนบหลักฐานกลาง ดูrevision/วันมีผล/ประวัติ                                   | พื้นที่Bและหมดหน้าที่อ่าน/แก้/exportไม่ได้; คู่มือบุคลากร/คำขอ/หน่วยงาน                                                                         |
| สำนักเรียน/สถานศึกษา/สนาม        | เลือกปี/รอบ/ประเภท/ระดับ กรอกเว็บหรือExcel ตรวจerror→ส่ง→checker→seat ติดตามbatch/reportจากApplicationเดียว             | ผิดปี/นอกเวลา/หลักฐานขาด/สนามปิดถูกปฏิเสธ retryไม่สร้างซ้ำ; คู่มือสอบ/Excel/หน่วยงาน                                                            |
| การเงิน                          | ร่าง→เสนอ→checker→อนุมัติ จอง→ผูกพัน→จ่ายบางส่วน reconcile/ปิดงวด/reversal                                              | exactยอดไม่ทับ ไม่อนุมัติตนเอง ไม่โอนธนาคารจริง; MANUAL_BUDGET                                                                                  |
| พัสดุ/ผู้ถือครอง                 | ขอซื้อ/งบ→รับบางส่วน/ตรวจรับ→เบิก/โอน→ยืมคืนซ่อม→นับ/จำหน่าย เก็บevidence/custody                                       | ไม่มีstockติดลบ/loanซ้ำ ไม่ลบประวัติ; MANUAL_INVENTORY                                                                                          |
| สารบรรณ/ผู้รับ                   | ร่างรุ่น→review→approve→number→deliver→กดยืนยันรับ→มอบหมาย/ปิด อ่านตามACL/hold                                          | เปิดnotificationไม่เท่ารับทราบ assignmentไม่ให้สิทธิ์ไฟล์ลับเอง; MANUAL_EOFFICE                                                                 |
| ผู้ดูแลเทคนิค                    | ตรวจhealth/queue/alerts CI/migration/backup/restore/incidentในtargetแยก                                                 | ไม่มีbusinesswildcard ไม่อ่านทุกหนังสือ ไม่ใส่secretในticket; [DEPLOYMENT](DEPLOYMENT.md), [BACKUP_RESTORE](BACKUP_RESTORE.md), SUPPORT_RUNBOOK |

ไม่มี training sessionหรือผู้เข้าอบรมจริงในรอบนี้ แผนฝึก: นัดเจ้าของแต่ละกลุ่มหลัง stagingพร้อม ใช้ TEST_ และ actorcreator/checker/approverคนละคน ฝึก negativeและrecovery เก็บ courseversion/commit/fixture/ผู้ฝึก/ผู้ทดสอบ/เวลา/ผล/หลักฐานprivate เมื่ออบรมไม่ผ่านให้อยู่ใน trainingbacklog ไม่ถือเซ็น attendanceแล้วใช้ข้อมูลจริงได้ ทุกคู่มือต้องทบทวนภาพ/URL/คำอธิบายจากหน้าจอจริงและ accessibilityก่อนรับมอบ

## 4 Backlog พร้อม owner และวันเป้าหมายเสนอ

วันที่ด้านล่างเป็น **กำหนดแก้เสนอหรือส่งแผนแก้ตาม scopeที่ระบุ ยังไม่เป็นคำมั่นของบุคคลจริง** C01ต้องยืนยันผู้รับ/ทรัพยากรและกำหนดที่ตกลงก่อนเริ่มงาน รายการ implementationขนาดใหญ่กำหนดส่งแผนงาน ไม่อ้างว่าจะเขียนครบตามวันที่นี้ fields appointedowner/agreed_due_at/closureevidenceยังว่างใน release-plan ทุกข้อ OPEN/BLOCKED ไม่มี releasecalendarที่อนุมัติ

| ID     | ปัญหาและงานที่ต้องส่ง                                                            | Ownerเสนอ               | วันเป้าหมายเสนอ Asia/Bangkok                   | เกณฑ์ปิด                                                                          |
| ------ | -------------------------------------------------------------------------------- | ----------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------- |
| B72-01 | แต่งตั้งowners/ผู้ปล่อยรุ่น/หน่วยนำร่อง/ช่องทางกลาง                              | C01+C04                 | 12 ต.ค.2569 ยืนยันแผนและผู้รับ                 | authority/contact/pilotที่ได้รับอนุมัติพร้อม scopeไม่ใช่placeholder               |
| B72-02 | policy/forms/basis/minors/retention/อำนาจวงเงินยังTO_VERIFY                      | C03+O01–O09             | 16 ต.ค.2569 ส่งdecisionplanรายfeature          | actualevidence/version/deciderและruntimegateก่อน officialunlock                   |
| B72-03 | Auth/currentDAL/FileVersion/scan/workflow/outboxและบริการธุรกิจทั้ง9ระบบยังไม่มี | C02+O01–O09             | 19 ต.ค.2569 ส่งimplementationและdependencyplan | implementationและnegative/native testsจริง ไม่มีอีกregistry/login                 |
| B72-04 | nativePG/Redis/clean install/staging/workerยังไม่ผ่าน71                          | C02                     | 23 ต.ค.2569 ส่งสาเหตุและแผน environment/CI     | cleancheckoutติดตั้งและstage9smokes/workerจริงผ่าน                                |
| B72-05 | coherentbackup/isolatedrestore/RPO/RTOยังไม่มี                                   | C02+O05/O06/O07/O08/O09 | 26 ต.ค.2569 ส่งdrillplanและscope               | คืนDB/files/keys/identityพร้อมcounts/checksums/timings/reconcileและownerรับรอง    |
| B72-06 | unit/bootstrapไม่แทนnative/E2E/UATทั้ง9ระบบ                                      | C02+O01–O09             | 26 ต.ค.2569 ส่งtestexecutionplan               | nativeconcurrency/3flows/recovery/UAT/signoffsรุ่นเดียวจริง                       |
| B72-07 | security/advisory/log/privatecache/capacity/a11ycoverageยังขาด                   | C02+C03                 | 23 ต.ค.2569 ส่งriskremediationplan             | ปิดrelease riskตาม70พร้อม runtime/evidence ไม่scannercertification                |
| B72-08 | training/support/on-call/monitoring/alertsและmanualscreensไม่ทดสอบ               | C04+C02+owners          | 26 ต.ค.2569 ส่งtraining/supportplan            | syntheticcompetency/alertdelivery/recipientauthorizationและรับงานจริง             |
| B72-09 | centralaccount/menu/contact/Application05/09ยังไม่พิสูจน์จริง                    | C02+C04+O05/O09         | 26 ต.ค.2569 ส่งacceptanceplan                  | หนึ่งบัญชี/ข้อมูล/เมนู/contactและcentralfile refsจากUI/API/testsจริง              |
| B72-10 | ไม่มีdeploymentauthorizationหรือsignedhandover                                   | C01+C02+C03+owners      | 30 ต.ค.2569 ทบทวนNO_GOและรายการค้าง            | G72ครบ/authority/approvedrelease+artifact+scope+signedhandover ไม่กำหนดliveโดยเดา |

เมื่อเลยวันเป้าหมายยังไม่ปิด ต้องบันทึก overdue/เหตุผล/วันเสนอใหม่/ผู้ตัดสิน ไม่เปลี่ยนเกณฑ์หรือลบแถว ผู้รับงานตรวจวันและscopeเอง ยังไม่มีการส่งticket/นัดหมาย/ติดต่อบุคคลจริงจากเอกสารนี้

## 5 หลักฐานรับมอบที่ต้องมี

Releaseid/commit/image digest/lock checksum/schema/migrations/rule/template/policyversions, appointed ownersและaccess rosterตามscope, UATcaseids+results+privateFileVersionหลักฐาน, trainingcompetency, monitoringalerttest, coherentbackup/restoredrill, openrisks/followupdates, supporthours/contactrecord และผู้รับมอบ/ผู้ส่ง/เวลา/decision/signature ทุกค่าapprovalจริงยัง PENDING ไม่เติมชื่อหรือเซ็นแทน ไม่เก็บpassword/token/dumpใน handoverpack

รอบ72ส่งเอกสารที่ตรวจทานได้เท่านั้น ไม่ได้ส่งมอบบริการที่เปิดใช้งาน ปัจจุบันเก้าระบบมีแผนคู่มือ แต่ AC72ทั้งสองยัง BLOCKED
