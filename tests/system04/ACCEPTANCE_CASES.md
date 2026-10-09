# Specification การตรวจรับระบบ 4 — บท 34

รุ่น 0.1 | 4 ตุลาคม 2569 | **PLAN ONLY / ทุกกรณี NOT RUN**

เอกสารนี้ไม่มีexecutabletests/runner ใช้ร่วม [UAT_SYSTEM_04](../../docs/UAT_SYSTEM_04.md), [fixtureplan](../fixtures/system04/coverage-plan.json), [REQUEST_REVIEW](../../docs/REQUEST_REVIEW.md), [REQUEST_IMPACT_CHECKS](../../docs/REQUEST_IMPACT_CHECKS.md) และ [REQUEST_EFFECTIVE_RULES](../../docs/REQUEST_EFFECTIVE_RULES.md) ไม่มีmockALLOWหรือskippedPASS `pnpm test` ไม่รันMarkdownนี้

## 1 Setupที่ต้องมีจริงก่อนexecute

ใช้devPostgreSQLกลางที่แยกจากproductionและผ่านmigration/seed/currentDAL/RLS/files/workflow/outbox/owner services30–33 บัญชี/Person/Organization/ExamCenter/Session/application/ตำแหน่ง/เอกสารใช้ต้นทางกลางเดียว

actor refsในplanเป็นชื่อสมมติ ไม่ใช่บัญชีที่มีgrantแล้ว ให้fixtureเลือก currentassignmentsในพื้นที่A/B ผู้ยื่น ผู้ตรวจ ผู้อนุมัติสองคน ผู้รับมอบอำนาจ ผู้ตรวจสอบ ผู้ดูแลเทคนิคและpublicแต่ไม่มีPII/phone/addressจริง การเตรียมข้อมูลต้องassertคนเดียว/identityrefs/FKs/sourceversionsและcasecontextตรง configurationทุกtype หากschemaหรือfixtureขาดให้BLOCKED ไม่สร้างตารางแทนเพื่อให้ทดสอบผ่าน

ใช้ฐานทดลองใหม่ต่อrunผ่านsafetyguard และresetเฉพาะfixtureที่ได้รับอนุญาต; ไม่เปลี่ยนprod URLหรือtruncateฐานร่วม ช่วงเวลาในtestsควบคุมผ่านserverclock injectionเฉพาะtestrunnerที่approved ไม่ใช้clientclockเป็นสิทธิ์ งานแข่งใช้สองnativeconnections/barrier งานหยุดใช้faultpointsก่อน/หลังcommitและfencingตามworkerจริง เก็บprivateexecutionmanifestไม่logtoken/fullbody

## 2 Casesและassertions

| Case ref  | ขั้นทำซ้ำเมื่อruntimeพร้อม                                                                                 | Assertที่ต้องได้                                                                                                             |
| --------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| UAT34-T01 | ทุกC30-01–10 branchA เริ่มdraft/save/reload/retry/submit และcomplete serverrequirements                    | header/intent/receiptไม่ซ้ำ ชนิด/target/type/year/รหัสครบ scanACLก่อนseal; activeทะเบียนยังเดิม                              |
| UAT34-T02 | ผู้ตรวจส่งกลับพร้อมเหตุผล ผู้ร้องแก้/resubmitแล้วตรวจ/อนุมัติ/activateเมื่อdue                             | header/instanceเดิม cycle/versionใหม่ immutableรุ่นเก่า ไม่reuseoldapproval ผลเฉพาะapprovedversion                           |
| UAT34-T03 | ทุกtype branchB submit/review/rejectพร้อมเหตุผล แล้วreplaysubmit/activationevent                           | rejectedไม่มีregistryeffect/activation ไม่เผยเหตุผลแก่คนไม่มีสิทธิ์ ไม่มีประวัติหาย                                          |
| UAT34-T04 | ทุกtype branchC canceldraft และสถานะอื่นตามpolicy ลองcancelapproved/effectiveตรง                           | allowedcancelไม่มีeffect; directcancelที่ไม่รองรับdeny ต้องnewcorrectionไม่ล้างapproval/event                                |
| UAT34-T05 | requester/maker/techadmin/reviewer-only เรียกdecision API/action/jobโดยตรง/เพิ่มrole/bodyclaim             | deny ไม่มีterminaldecision/receiptsuccess/outboxsuccess makercheckerไม่หายเพราะหลายrole                                      |
| UAT34-T06 | เปลี่ยนURL/target/query/export/filekeyไปพื้นที่B/อีกสาย; delegationก่อน-หลังช่วง/withdraw/suspendขณะรอlock | currentDAL/fieldACLทุกread-mutate-job deny; counts/error/cache/notifไม่เปิดข้อมูลนอกscope                                    |
| UAT34-T07 | สองapproversอ่านversionเดียว ใช้nativebarrierพร้อมกัน/แก้revisionหรือevidenceระหว่างตรวจ                   | terminalหนึ่งชุด successหนึ่ง/409หนึ่ง; newkeyไม่เลี่ยงCAS ข้อมูลใหม่ต้องตรวจใหม่                                            |
| UAT34-T08 | C30-06/09 สนามมีผู้สมัครสองรายการและอีกรอบ/ประเภทหนึ่งรายการ ไม่มีแผนแล้วapprove/activate                  | PLAN_REQUIRED/BLOCKED ไม่มีeffect ไม่มีautoโยก/ลบใบสมัคร anothercontextไม่เปลี่ยน                                            |
| UAT34-T09 | C30-02/04 หน่วยงานมีPositionAssignment/affiliation/ผู้รับเอกสารค้าง ไม่มีแผน                               | guardไม่ผ่าน ไม่harddeletePerson/org/assignment/history ไม่autoเลือกคนแทน                                                    |
| UAT34-T10 | ยุบ/ปิดแผนจัดการผ่านผู้รับรองและownerบริการที่จำเป็นครบ ส่งคืนตรวจก่อนeffective                            | เงื่อนไขค้าง/manifestตรง actualeffectเฉพาะdeltaที่รับรอง application/roleไม่ย้ายเอง                                          |
| UAT34-T11 | missingadapter/timeout/partialsource ผู้สมัครใหม่หลังimpact report หรือปลายทางเต็มก่อนactivation           | NOT_READY/STALE/BLOCKED ไม่unknown0; plannedmanifestไม่grantliveactivation ไม่มีสูญหาย                                       |
| UAT34-T12 | คำสั่งeffectiveผิด ยื่นcorrectionใหม่พร้อมsourceRequestVersion/decision/activation/orderFileVersion/reason | FK/ownershipครบ sourceimmutable ยังอ่านต้นเรื่อง/เหตุผลตามgrantได้ ไม่มีharddeleteevent                                      |
| UAT34-T13 | correctionreturned→แก้/resubmit→approve→effective และตรวจUI/query/workerทุกขั้น                            | รุ่นแก้ไขใหม่/ผู้ตรวจคนละmaker กฎpinsครบ appendreplacement/linkedevent ไม่มีeffectiveก่อนdue                                 |
| UAT34-T14 | correctionrejectedหรือcancelled แล้วอ่าน/worker replayทั้งต้นเรื่องและเรื่องแก้                            | ต้นเรื่องยังสถานะเดิม ไม่มีrevoked/แก้projectionเพราะเพียงยื่นเรื่อง เหตุผล/decisionเก่ายังอยู่                              |
| UAT34-T15 | หลังคำสั่งผิดมีคำสั่งใหม่ที่ถูกต้องบนtargetแล้ว เสนอแก้/เพิกถอนต้นเรื่อง                                   | conflict/impact/reviewdeltaใหม่ ไม่rewindทั้งprojectionกลับsnapshotเก่าหรือundoคำสั่งใหม่ที่ถูกต้อง                          |
| UAT34-T16 | ต้นเรื่องapprovedยังไม่effective มีrevocationrequestใหม่ที่ผ่านตรวจ; queuedactivationเก่ากลับมา            | guardตรวจrevocationที่มีผลตามpolicy denyoldtask ไม่มีeffectใหม่จากstaleevent ไม่cancelเงียบ ๆ                                |
| UAT34-T17 | nativebefore-afteridentity/FK/hash/snapshot manifestsไม่ว่าง ก่อน/หลังยุบปิด/retry/correction              | identity/application/document/FileVersion/historyครบ ไม่มีcascade/orphans/fulladdressoverwrite ค่าที่เปลี่ยนตรงapproveddelta |
| UAT34-T18 | duplicatecorrectionevent/keyเดิม/keyใหม่/ACKหาย สองworkersแข่ง/leaseเก่ากลับมา                             | onebusiness effect receiptตามpolicy status/audit/outboxsuccessไม่ซ้ำ fenceปฏิเสธworkerเก่า                                   |
| UAT34-T19 | killก่อนcommit/ระหว่างownerwrites/หลังcommitก่อนack restartและปล่อยnotificationช้า                         | atomicrollbackหรือreceiptครบ noeventlost domainhistoryไม่ขึ้นกับnotification; devsinkdedupe                                  |
| UAT34-T20 | MOVEทั้งนักธรรม/ธรรมศึกษาและcorrectionอ่านvalid_at/known_at/futureday/ที่อยู่เอกสารเก่า                    | dateไทย/recordedจริง แผนอนาคตไม่actual oldorder/address/phoneversionไม่ตามlatest ค่าretroactiveตามpolicyเท่านั้น             |
| UAT34-T21 | public/owner/staff tracking/status/export/print/RSC/cache/notif/evidence/IDtamper privatecanaries          | allowlist/currentproof/fieldACLไม่เผยPII/reason/plan/filekeys; publicpolicyขาดdeny ไม่เลขเป็นgrant                           |
| UAT34-T22 | keyboardThaiIME/draft-review-history-errors-focus-conflict/375-768-1024-1440                               | labels/ข้อความสถานะไม่ใช้สีอย่างเดียว empty/error/recoveryชัด ไม่มีautoapproveจากclientstate                                 |

T01–04ต้องexecution3branchต่อ10type; T08/T09/T10/T11/T17ตามcasebindingในUAT; T12–16/T18–19 parameterizeintentsและtypesที่configurationรองรับ ไม่มีofficialpolicyต้องDEMOที่กำหนดและติดProposal ไม่claimรองรับrecoveryทุกtypeจากตัวอย่างหนึ่งcase

## 3 Evidence oracle

PASSต้องมีnative manifestsที่assertrequiredsetsไม่ว่าง ใช้stableIDs/FKs/hashes/row_versionsและqueryธุรกิจตามdate/context ไม่พึ่งcountsอย่างเดียว เปรียบเทียบsourceevent/decision/order refsคงเดิมและcorrection linksมีจริง คำตัดสินใหม่ต้องpolicy/action/scope/วันที่ผู้อนุมัติจริงในexecution ไม่เชื่อfixturelabelหรือเพียงเห็นปุ่ม

เกณฑ์34-01: T12–16/18–19 querychainและเหตุผล/docACL; เกณฑ์34-02: T08–11/17/20 nonemptybefore-afteridentity/historicalFK ไม่มีตาราง/rowsให้BLOCKED ไม่PASSด้วยsetว่าง ไม่มีผลรันกรณีใดในเอกสารนี้
