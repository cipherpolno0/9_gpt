# วันมีผล การทำให้คำสั่งมีผล และประวัติคำขอ — บท 33

รุ่น 0.1 | 4 ตุลาคม 2569 (2026-10-04) | source `b69dcfb` | **Proposal / BLOCKED — ไม่มี activation service/worker, status projection หรือหน้าติดตามที่ทำงานจริง**

บท 32 ยังไม่ผ่านตาม [REQUEST_REVIEW](REQUEST_REVIEW.md) และ [REQUEST_IMPACT_CHECKS](REQUEST_IMPACT_CHECKS.md) โมดูลคำขอมีเพียง README; schema ไม่พบ RequestVersion, WorkflowInstance, StepDecision, ActivationRecord, StatusEvent, OutboxEvent, FileVersion หรือทะเบียนสนาม/รอบที่ต้องใช้ `worker/index.ts` ตรวจ SELECT1/RedisPING และรอ ไม่ใช่ activation consumer เอกสารนี้เตรียมงาน ไม่ใช่ schema/migration/code หรือผลตรวจรับ

ใช้ [ORG_CENTER_REQUESTS](ORG_CENTER_REQUESTS.md), [ORG_CENTER_REQUEST_SCHEMA](ORG_CENTER_REQUEST_SCHEMA.md), [REQUEST_SUBMISSION](REQUEST_SUBMISSION.md), [WORKFLOW_ENGINE](WORKFLOW_ENGINE.md), [EXAM_SESSIONS](EXAM_SESSIONS.md), [ADDRESS_VALIDATION](ADDRESS_VALIDATION.md) และ [ADR002](ADR/002-core-database.md) เป็นต้นทางเดียว ไม่สร้างบัญชี ทะเบียนใบสมัคร เอกสาร audit หรือ engine อนุมัติอีกชุด

## 1 แยกเวลาและสถานะทีละขั้น

1. approved บอกว่าคำขอรุ่นหนึ่งได้รับอนุมัติ ยังไม่เปลี่ยนทะเบียนจนผ่าน activation และถึงวันมีผล
2. requested_effective_on เป็นวันขอมีผลใน RequestVersion; effective_at ของเหตุการณ์เป็นเวลาที่มีผลตามกฎซึ่งรับรองแล้ว; recorded_at/activated_at บอกเวลาที่ระบบบันทึกและดำเนินการจริง ทั้งสามความหมายต้องไม่ปนกัน
3. Notification มี delivered_at ของตน หากแจ้งช้า การอ่านสถานะทะเบียนและประวัติต้องยังอ้างเหตุการณ์ที่ commit แล้ว ไม่ใช้เวลาส่งแจ้งเตือนแทนวันมีผล
4. วันที่อนาคตใช้ดูแผนที่อนุมัติแล้วในมุมมองแผน แยกจากสถานะมีผลจริง ไม่ใช้ approved หรือวันที่ที่ผู้ใช้ใส่เป็นหลักฐานว่า activation สำเร็จ
5. การแก้คำสั่งผิดต้องรายการแก้ไขที่อ้างเรื่อง/คำตัดสิน/เหตุการณ์เดิม พร้อมเหตุผลและหลักฐาน ไม่แก้ audit หรือประวัติเดิมทับ

เวลาเก็บ Gregorian date/timestamptz ตามชนิดฟิลด์ แสดง พ.ศ. ใน UI ตัดวันด้วย Asia/Bangkok ใช้ helpers กลางใน `src/shared/dates/bangkok.ts` ไม่สร้าง date utility อีกชุด policy ที่เป็น date-only ต้องระบุว่ามีผลต้นวัน/เวลาอื่น ไม่เดาว่าทุกแบบทางการใช้เที่ยงคืน; DEMO เสนอเริ่ม00:00ไทยเมื่อ config ระบุชัด

| ตัวอย่าง DEMO วันมีผล 2026-10-05               | ความหมาย                        | ผลที่ต้องบังคับ                                                         |
| ---------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------- |
| 2026-10-04T16:59:59.999Z                       | 4ต.ค.2569 เวลา23:59:59.999ไทย   | ยังไม่ถึงวัน ไม่activate/เปลี่ยนprojectionจริง                          |
| 2026-10-04T17:00:00.000Z                       | 5ต.ค.2569 เวลา00:00ไทย          | ถึงวันแล้ว แต่ต้องผ่านapproval/authority/impact/version transactionก่อน |
| activationcommitแล้ว แต่notificationยังpending | ทะเบียนมีผลแล้วจากcommit        | query/status/historyอ่านเหตุการณ์จริง ไม่ย้อนapprovedรอมีผล             |
| ถึงวันแต่activationไม่สำเร็จ                   | ถึงกำหนดแล้ว ยังไม่ได้ดำเนินการ | แสดงรอดำเนินการ/ติดเงื่อนไขตามสิทธิ์ ไม่อ้างeffective                   |

## 2 สัญญาบริการและข้อมูลที่เสนอ

ต่อ ActivationRecord/StatusEvent/OperationReceipt กลางในแบบ04/11/30 ไม่เพิ่มสำเนาในโมดูล4 ใช้ typedFK และ composite ownership กับ approved RequestVersion/decision/resource ไม่รับ JSON model/table/objectkey หรือ org_id จากclientเป็นอำนาจ

| Service ref | บริการเสนอ — ยังไม่มีไฟล์จริง | หน้าที่                                                                                                                                                       |
| ----------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S33-01      | activateApprovedRequest       | คำสั่งจาก verifiedserver actor หรือ worker มี request/version/effect ref, expected versions, operation key; ตรวจเงื่อนไขและเขียนผ่านเจ้าของในtransactionเดียว |
| S33-02      | claimDueActivations           | อ่านdue taskจากoutbox/workflowกลางภายใต้currentjobpolicy; lease/token/available_at; ไม่ตีbodyจากqueueเป็นgrant                                                |
| S33-03      | queryRegistryAsOf             | อ่านสถานะ/ที่ตั้ง ณ business date และ knowledge cutoffตามpolicy จากประวัติที่มีผลจริงและได้commitแล้ว                                                         |
| S33-04      | getOwnerTracking              | signed-in owner/delegatedstaffด้วยcurrentDAL; แยกrequest/approval/effect/notification; fieldและfileACLต่างกัน                                                 |
| S33-05      | getPublicTracking             | allowlistของรายการที่อนุญาตเผยแพร่/พิสูจน์สิทธิ์ตามpolicyเท่านั้น; policyขาดdeny; เลขtrackingไม่capability                                                    |

ActivationRecordเสนอมี id, approved_request_version_id, terminal_decision_id, effect_code, typedactualtarget bindings, before/after sourceversions, status_event refs, requested_effective_on, effective_at, activated_at, recorded_at, actor/systemauthority refs, evidence/order FileVersion refs, correlation และ operation receipt ทุกfieldสัมพันธ์ต้องbase/schemaกลางรับรองก่อนmigration

uniqueต่อ approved RequestVersion + effect_code เป็นข้อเสนอ business receipt กันเปลี่ยนoperationkeyแล้วทำeffectเดิมซ้ำ คำขอหลายผลย่อยต้องตรึงeffectmanifestและมี uniquechild bindingsภายใต้หนึ่งatomicactivation ไม่ใช้unique(request_id)จนคำขอแก้ไขหรือประวัติรุ่นใหม่ใช้ไม่ได้ การเลือกexact naturalkey/หนึ่งหรือหลายeffectsต้องADRตามQ024ก่อนDDL

## 3 Activation transaction เสนอ

1. ตรวจ verified actor/job identity, current account/job permission, action/resource/scope/เวลาและ authority policy ที่pin ไม่ใช้สิทธิ์เทคนิค/service credentialหรือcreatorเป็นอำนาจธุรกิจ workerไม่อนุมัติแทนchecker
2. เปิดtransactionในฐานกลางเดียว Lockคำขอ/workflow/approvedversion/authority guards/typedtargetและdependency guardsตามลำดับร่วม32 ทุกowner serviceต้องรับtransaction contextเดียว ไม่commitย่อยหรือเรียกremote side effectในtransactionแล้วอ้างatomic
3. ตรวจlease/tokenของงานถ้ามาจากworker และcurrentrightsหลังได้lock ใช้เวลาserver ณจุดตรวจ; policyต้องบอกว่าคำอนุมัติที่เคยมีอำนาจยังมีผลหรือถูกเพิกถอนอย่างไร และใครมีอำนาจดำเนินการปัจจุบัน ไม่บังคับให้ผู้อนุมัติยังครองหน้าที่เดิมตลอดกาลโดยเดาเอง หากpolicyไม่พร้อมให้NOT_READY
4. ตรวจOperationReceipt/ActivationRecord: effectที่commitแล้วและbinding/payloadตรงคืนreceiptเดิมภายใต้currentreadpolicy ไม่เขียนทะเบียนซ้ำ; keyเดิมpayloadต่าง conflict event/payloadคนละapprovedversionไม่ใช้receiptเดิม
5. ตรวจcanonical workflow approved, terminaldecisionครบตามกฎ32, maker-checker provenance, sealedversion/manifest/evidence hashตรงรุ่น เอกสารผ่านscanและACL/retentionตามpolicy คำสั่งไม่ถูกถอนหรือsupersede; latestdraftไม่ใช่รุ่นที่อนุมัติ
6. ตรวจdueด้วยserverclockและวันไทยตามconfig ตรวจtarget row_version/context/identity/code/plannedtimeline conflict และimpact4ด้าน/แผน/งานค้างใหม่ตาม32 missingadapterไม่count0 อย่าเปลี่ยนexpectedversionอัตโนมัติเพื่อactivateบนทะเบียนที่ผู้ตรวจไม่เคยเห็น
7. owner servicesตรวจbusiness invariantsแล้วเขียนActivationRecord, StatusEvent, ประวัติ/ที่ตั้งและprojectionปัจจุบันที่จำเป็น, workflow effective, receipt, audit_logs และoutboxในtransactionเดียว บันทึกactualtargetจากESTABLISH/OPENเมื่อสร้างได้จริง ไม่แก้sealedproposalให้เป็นข้อมูลคนละรุ่น
8. ตรวจCAS/affectedrowsและuniqueconstraints ถ้าส่วนใดล้ม rollbackทั้งหมด ไม่มีpartialeffective; commitแล้วจึงreturnreceiptและให้workerackตามtoken หากACKหาย replayกลับมาพบreceipt ไม่activateใหม่

StatusEventต้องผูกentity/contextจริงตามowner ไม่ใช้enumสถานะเดียวเปลี่ยนOrganization/CenterSession/requestพร้อมกัน อนุมัติแต่activateไม่ผ่านให้คงapprovedและเก็บvalidation/operationaleventว่าอะไรค้างภายในสิทธิ์ ไม่ปลอมsuccessfulstatus event ทะเบียน/application/RoleAssignmentไม่ถูกลบหรือโยกอัตโนมัติ

## 4 Worker, retry และลำดับงาน

scheduledtask/outbox type/version ใช้ตัวรันกลาง11 พร้อม lease_token/lease_until/attempts/available_at/errorcodeและdeadletter กลไกclaimต้องatomicและcommitก่อนประมวลผล งานหลายworkerใช้queue lockingที่เลือกและพิสูจน์native PostgreSQL ไม่ถือdistributedlockRedisเป็นหลักฐานexactlyonce

ถ้าใช้ `FOR UPDATE SKIP LOCKED` ใช้เฉพาะclaimqueue ไม่ใช้ตอนอ่านhistory/impactเพราะอาจข้ามข้อมูลที่กำลังlock ทุกต่อlease/ack/effectต้องตรวจtokenล่าสุดในtransaction งานจากworkerเก่าที่leaseหมดไม่มีสิทธิ์เขียนต่อ leaseไม่แทนcurrentbusinesspolicy

หยุดก่อนdomaincommit: transactionrollbackแล้วworkerใหม่retryได้ หยุดหลังdomaincommitก่อนack: retryค้นActivationRecord/receiptคืนผลเดิม กดretryด้วยkeyใหม่ยังชนbusinessuniqueหนึ่งeffect; audit/outboxsuccessไม่ซ้ำ Notificationตามuniqueevent/recipient/channel/devsinkของ11 ไม่มีคำรับรองว่าการส่งนอกระบบทำได้exactlyonceโดยไม่มีprovidercontract

เรียงtaskตามdueและstableidช่วยทำงาน แต่ห้ามพึ่งลำดับรับqueueอย่างเดียว: มีOPEN/CLOSE/MOVEหลายคำสั่งบนtargetเดียวต้องตรึงtimeline/predecessorตาม30และตรวจในownertransaction หากงานใหม่มาถึงก่อนงานเก่าที่จำเป็น ให้พักdependency ไม่activateสลับจนทะเบียนผิด งานsuperseded/stale/deadletterไม่มีeffectและมีเหตุการณ์ให้ผู้รับผิดชอบตามscopeแก้ไข

## 5 Projection และการค้นย้อนหลัง/อนาคต

StatusEvent/history ที่commitเป็นต้นทางจริง materialized currentprojectionเป็นข้อมูลสำหรับอ่านเร็ว ไม่ใช้notificationackเป็นwatermark Projectionต้องมีlastapplied event/version/checkpointและrebuildจากประวัติที่verified; การแก้projectionโดยไม่มีeventห้ามใช้เป็นประวัติ

สำหรับข้อมูลบังคับการรับสมัคร/สถานะใช้งานจริง ให้ownertransactionเขียนcurrentprojectionที่เกี่ยวข้องพร้อมeventตามข้อ3 ถ้าทำreadmodel async ต้องfallback queryประวัติและเปิดเผยstale watermarkก่อนให้บริการตัดสิน ไม่คืนสถานะเก่าจากcacheแล้วให้รับสมัครต่อเมื่อcloseมีผลแล้ว Sharedpubliccacheเก็บได้เฉพาะDTOที่approved ไม่มีเหตุผล/หลักฐาน/privatedata; cacheนอกฐานที่ยังอาจเก่าต้องมีinvalidation/expiryตามpolicyและห้ามเป็นauthority

queryกำหนด `valid_at` (วันมีผลที่ต้องการดู) และ optional `known_at` (ข้อมูลที่ระบบรับรู้ ณเวลาใด) ให้ชัด:

- มุมประวัติตามหลักฐานที่ทราบปัจจุบัน: ใช้effectiveinterval/eventsที่valid_atพร้อมcorrections/supersedesที่บันทึกแล้ว ไม่joinชื่อ/ที่อยู่latestไปทับเอกสารเก่า
- มุมว่าระบบทราบอะไรในอดีต: จำกัดrecorded_at/recorded supersessionด้วยknown_at ไม่ใช้คำแก้ไขที่บันทึกภายหลังแอบเปลี่ยนรายงานเดิม
- มุมวันอนาคต: แสดงeffectivehistoryที่มีหลักฐานอยู่และapproved plansแยกคอลัมน์ “แผนรอมีผล” ไม่มีguaranteeอนาคตและไม่publishprivatependingrequest
- กรณีworkeractivationล่าช้า: ห้ามqueryแปลงapprovedที่dueแล้วเป็นactualeffectiveเอง หากต้องบันทึกeffective_atย้อนหลังตามคำสั่ง ต้องpolicyและหลักฐานยืนยันความชอบ/เงื่อนไขณวันนั้นผ่านowner ไม่ถือว่าผลimpactวันนี้พิสูจน์อดีต; recorded_atเป็นเวลาบันทึกจริงเสมอ

late-recording/retroactivecorrection policyยังTO VERIFY; ทดลองต้องกำหนดpolicyชัด ค่าเริ่มต้นที่ยังไม่รับรองคือพักและให้ผู้มีอำนาจจัดการ ไม่backdateเงียบ ๆ เกณฑ์33-02เรื่องnotificationล่าช้าไม่ให้ข้ามactivationguardหรือเปลี่ยนเวลาบันทึก

MOVEสร้างOrganizationLocation/AddressVersion/history bindingตาม20หรือCenterSessionlocationตามROUNDpolicy ไม่updateที่อยู่เก่าทับ Versionedaddress/sourceFileVersionของเอกสารจัดส่ง/คำสั่งปีเก่ายังอ้างรุ่นเดิม Query/planและactivationไม่autoเลือกPersonผู้รับข้อสอบหรือเพิ่มสิทธิ์พื้นที่จากที่อยู่ใหม่

## 6 คำสั่ง เอกสาร และการแจ้งหน่วยงาน

Order/noticeอ้างDocument + FileVersionกลาง10 พร้อมversion/hash/owner/evidence และlinkไปapproveddecision/activation ไม่คัดลอกไฟล์ไปpublic folderหรือstorageชุดใหม่ การเชื่อมสารบรรณ8ใช้typedreference/adaptorเมื่อพร้อม ไม่สร้างเลขหนังสือหรือลายมือชื่อทางการโดยไม่มีpolicy

outboxหลังactivationอยู่transactionเดียวกับevent เนื้อหาขั้นต่ำevent code/resource ref/correlation/templateversion ผู้รับresolveจากcurrentassignment/หน่วยที่เกี่ยวข้องและpolicyล่าสุด ไม่ใส่เหตุผล/PII/ที่อยู่/ไฟล์เต็มลงmessagebody ลูกข่ายยังต้องcurrentDALเมื่อเปิดลิงก์ โหมดdevส่งเฉพาะsinkกลาง ไม่ส่งemail/ข้อความจริง

สิทธิ์ผู้รับถูกถอน/งานจัดส่งหรือบุคลากรเปลี่ยน: workerพักหรือresolveตามpolicyที่รับรอง เก็บreceipt/เหตุการณ์ ไม่เลือกคนแทนเอง Notificationfailureไม่ย้อนactivation ไม่เปลี่ยนeffective_atหรือsnapshotเอกสารเก่า

## 7 Tracking และ field privacy

ใช้tracking_refเดียวกับ31และRequestVersion/activationกลาง ไม่สร้างstatusstoreอีกชุด เลขคาดเดายากไม่ใช่สิทธิ์เข้าถึง อ่านทุกครั้งตรวจcurrentpolicy query/count/export/print/download/RSC/notification/cacheเหมือนกัน

| Audience                                | DTOเสนอ                                                                                                  | ข้อบังคับ                                                                                                     |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| เจ้าของเรื่องที่ยืนยันบัญชี/bindingแล้ว | ประเภท/เป้าหมาย/รุ่น/สถานะขอ วันขอมีผล ผลดำเนินการ วันมีผลจริง/วันบันทึก เหตุผลและหลักฐานเฉพาะที่มีgrant | ownerproofจากserver ไม่รับperson_id/creatorจากURLเป็นproof; field/ไฟล์แต่ละรายการตรวจแยก                      |
| เจ้าหน้าที่/ผู้ตรวจสอบ                  | history/correlation/impact/order refsตามภารกิจและscope                                                   | read/export purposeและauditตามpolicy ไม่ได้สิทธิ์เพราะรู้tracking_ref                                         |
| public                                  | เฉพาะpublicapprovedprojection: ประเภท/สถานะ/วันมีผลและข้อมูลเป้าหมายที่อนุญาต                            | ไม่เปิดrequester/approver/personชื่อเต็ม เหตุผล/opinion/ใบสมัคร/PII/filekey/หลักฐานภายใน/รายละเอียดแผนpending |

publicproof/publicationpolicyของQ008/Q025ยังขาด จึงdefaultsigned-inตาม31 ส่วนpublicต้องdeny/ข้อความทั่วไปจนpolicyรับรอง ไม่ทำtrackingด้วยDOB/เบอร์โทรหรือloginใหม่ แม้หนังสืออนุญาตpublicก็ต้องFileVersionเผยแพร่ที่scanผ่านและACL/publicationตรง ไม่ให้publicดูprivateไฟล์ผ่านfilenameหรือobjectkey

หน้าติดตามเสนอมีrequest timeline, approval timeline, registryeffect timeline และnotificationdeliveryแยกกัน แสดงloading/empty/hidden404/forbidden/conflict/pendingeffect/blocked/staleพร้อมข้อความ ไม่ใช้สีอย่างเดียว keyboard/focus/labels/4viewportต้องทดสอบเมื่อมีหน้าเว็บจริง

## 8 Failure และ recovery

| Failure ref | กรณี                                               | Recoveryที่เสนอ                                                                                  |
| ----------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| F33-01      | ยังไม่ถึงวันไทย/workerclockหรือclientclockผิด      | server due guard; available_atตามconfig ไม่applyก่อนวัน                                          |
| F33-02      | ไม่มีauthority/ถอนคำสั่ง/สิทธิ์หมด/หลักฐานไม่พร้อม | deny/พักภายในscope; ไม่ใช้workercredentialแทนคำอนุมัติ                                           |
| F33-03      | targetversion/impact/แผน staleหรือadapterขาด       | conflict/NOT_READY; ตรวจใหม่/คำขอแก้ไขตาม32 ไม่ปรับpinsอัตโนมัติ                                 |
| F33-04      | processหยุดก่อนcommitหรือowner writeบางส่วนล้ม     | rollbackทั้งหมด retrykeyเดิม ไม่มีpartialeffective                                               |
| F33-05      | commitแล้วackหาย/workerซ้ำ/keyใหม่                 | receipt+businessuniqueคืนผลเดิม ไม่สร้างevent/projection/audit/outboxsuccessซ้ำ                  |
| F33-06      | leaseหมดแล้วworkerเก่ากลับมา                       | fence tokenในtransaction denywrite/ackของworkerเก่า                                              |
| F33-07      | notification/dependentreadmodelล่าช้า              | event/ownerhistoryเป็นauthority; reportdeliverypending/fallbackstaleprojection ไม่เปลี่ยนวันมีผล |
| F33-08      | งานfuture/หลายeffectมาผิดลำดับ                     | ตรวจtargettimeline/predecessorและatomicmanifest พักงานที่ยังไม่ครบ                               |
| F33-09      | คำสั่งผิดหรือพบประวัติผิดหลังeffective             | newcorrectionrequest/decision/effectอ้างต้นทาง เก็บaudit/eventเดิม ไม่backdateเอง                |
| F33-10      | publictracking/fileACLถูกเปลี่ยน                   | currentdeny/projectionใหม่/gatewayตาม10; ไม่กล่าวsignedURLที่ออกแล้วrevokeทันที                  |

## 9 แผนตรวจรับ — ทุกกรณี NOT RUN

ใช้Person/Organization/ExamType/AcademicYear/Userกลางสมมติจากdependencyเมื่อพร้อม ไม่มีseedหรือactorloginชุดใหม่ใน33 ทุกC30-01–10ต้องตรวจtypedtarget/effectที่ตรงชนิดและปี/รอบ ไม่ใช้ผลหนึ่งประเภทแทนทั้งหมด

| Case ref | การทดสอบที่ต้องรันจริง                                                                         | หลักฐานที่ต้องได้                                                                            |
| -------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| P33-01   | ไม่มีapproval/makerผิด/versionผิด/rejected/cancelled/returnedหรือfutureก่อนวัน เรียกAPI/jobตรง | deny; actualtarget/status/address/application/roleไม่เปลี่ยน                                 |
| P33-02   | ขอบวันไทย16:59:59.999Z→17:00Z และdate-onlyinvalid/พ.ศ./serverclockหลังlock                     | ก่อนdueไม่effective ถึงdueต้องครบguards เก็บGregorianและrecordedจริง                         |
| P33-03   | duplicateevent/keyเดิม/keyใหม่/ACKหายหลังcommit                                                | ActivationRecord/StatusEvent/projection/receipt/audit-outboxsuccessหนึ่งชุดต่อapprovedeffect |
| P33-04   | สองnativePostgreSQLconnectionsพร้อมbarrieractivateeffectเดียวกัน                               | onecommit/อีกreceiptหรือconflictตามcontract ไม่มีdoubleeffect                                |
| P33-05   | killก่อนcommit/ระหว่างownerwrites/หลังcommitก่อนack/restart                                    | rollbackหรือreceiptครบ ไม่มีpartialeffective/eventหาย                                        |
| P33-06   | workerเก่าleaseหมด งานถูกclaimใหม่แล้วเก่ากลับมา                                               | fence denyเก่า ไม่มีstaleack/effectซ้ำ                                                       |
| P33-07   | revoke/suspend/คำอนุมัติถอน/เอกสารquarantineหรือACLถอนหลังenqueue                              | currentpolicydeny/พัก ไม่ถือoutboxbody/sessionclaimเป็นgrant                                 |
| P33-08   | ผู้สมัครใหม่/targetversionใหม่/ปลายทางเต็ม/แผนค้าง/missingadapterระหว่างรอactivate             | STALE/BLOCKED/NOT_READY ไม่unknown0 ไม่มีลบ/autoย้ายคน                                       |
| P33-09   | ACTUALhistoryอดีต ปัจจุบัน futureplan ก่อน/หลังactivationและnotificationล่าช้า                 | requested/actual/recorded/deliveredแยก แผนไม่actual notifierไม่แก้วันมีผล                    |
| P33-10   | projectionstale/rebuild/checkpoint/cache กับdecisionและregistrationread                        | ตรงcommittedownerhistory ไม่รับสมัครด้วยstaleauthority/privatecache                          |
| P33-11   | MOVEและคำขอแก้ไขย้อนหลัง valid_at/known_at/oldaddressdocuments                                 | คำสั่ง/ที่อยู่เดิมยังอ่านได้ตามวันที่; knowledgecutoffไม่รับcorrectionอนาคต ไม่มีลบaudit     |
| P33-12   | delayedactivation/deadletter/งานtimelineสลับ OPEN-CLOSE-MOVE                                   | ไม่autoapprove/backdate/predecessorskip; ระบุoverdueและrecoveryตามpolicy                     |
| P33-13   | ทุกC30-01–10 แยกOrganizationType/ExamType/Session/year/ROUND/effectmanifest                    | nativeFK/uniques/ownertransactionครบ ไม่เปลี่ยนอีกปี/ประเภท/แม่บทนอกแผน                      |
| P33-14   | owner/public/stafftrackingเปลี่ยนID/query/URL/filekey/export/HTML/RSC/cache/notif/PIIcanary    | privatefields/หลักฐานไม่ออกpublic; currentACL/field policyตรงทุกentrypoint                   |
| P33-15   | order/noticeFileVersion/scan/ACL/snapshot/devoutboxduplicate/recipientrevoke                   | เอกสารกลางเดิม/ไม่มีofficialcontentเปิด/notifydevsinkdedupe ไม่แก้snapshotเก่า               |
| P33-16   | keyboardThaiIME/historydatefilters/focus/status/error/375-768-1024-1440                        | หน้าติดตามใช้ได้ตามสิทธิ์ labelsชัด ไม่พึ่งสีหรือclientstate                                 |

เกณฑ์33-01ผูกP33-03–06/10; เกณฑ์33-02ผูกP33-02/09/11/12/15 **BLOCKED / NOT RUN** ต้องnativeDBfault/concurrency/worker/historyและbrowserจริง ไม่ใช้เอกสาร/SELECT1หรือdatehelperassertionsแทนหลักฐานสองเกณฑ์

## 10 Versions ผลตรวจ และ gate

app/schema0.6.0; Prisma7.10.0; Next16.3.8; pnpm11.28.2; lockfile9; core19models/213scalarfields/migration1 `20261003130000_core_foundation` SHA256 `04a149fcd349f0ac3f1b5929cfcf571f8b0880541e84a40ad929054b67d72756` ไม่มีschema/migration/seed/runtimeใหม่

วันที่4ตุลาคม2569ตรวจsourceb69dcfb: `corepack pnpm db:test` exit1 safeerrorไม่แยกenv/connection; `corepack pnpm worker:check` exit1ข้อความไม่แสดงcredential DockerCLI/socketไม่มี loopback5432/5546ConnectionRefusedError จึงDB-06/Q027 และ DOCKER-05/Q026ยังไม่ผ่าน

รัน `node --import tsx --input-type=module` ตรวจhelpersเดิมจริง7assertions: dueinstant/datekeysก่อน-หลังเที่ยงคืนไทย/boundarycomparison/แสดง2569/วันที่ไม่มีจริง ผ่าน เป็นเพียงcalendarcheck ไม่มีactivation/history/notification/retrytest33ที่รัน ไม่มีAPI/workerbusiness/browser/concurrency/typecheck/lint/buildของ33ผ่าน

ต้องตรวจรับ32และต้นทางส่วนกลาง/ทะเบียนก่อนimplementation33 แล้วมีแผนโค้ดตาม [MASTERข้อ2](../00_MASTER_PROMPT.md) แผน07ที่อนุมัติแล้วไม่ต้องขอซ้ำ การอนุมัติแผนไม่ทำให้prerequisiteผ่าน บท34ยังไม่เริ่ม ไม่เดาขอบเขต ไม่push/deployหรือแก้production

แหล่งเทคนิคที่อ่าน4ตุลาคม2569: [PostgreSQL18 Current Date/Time](https://www.postgresql.org/docs/18/functions-datetime.html#FUNCTIONS-DATETIME-CURRENT) แยกเวลาเริ่มtransactionจากclock_timestampที่เดินจริง และ [PostgreSQL18 SELECT Locking](https://www.postgresql.org/docs/18/sql-select.html#SQL-FOR-UPDATE-SHARE) อธิบายSKIP LOCKEDสำหรับqueueและข้อจำกัดการอ่าน ข้อเสนอactivation/policy/keys/lateeffectข้างต้นเป็นแบบของโครงการ ยังต้องADR/migration/ผลทดสอบจริง ไม่ใช่กฎหรือคำสั่งทางการที่ยืนยันแล้ว
