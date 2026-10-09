# สถานะใบสมัครและสัญญาร่วมเว็บกับExcel — บท 35

รุ่น 0.1 | 4 ตุลาคม 2569 (2026-10-04) | source `fb346a0` | **Proposal / BLOCKED — ไม่มีapplication/workflowบริการจริง**

ใช้ [APPLICATION_SCHEMA](APPLICATION_SCHEMA.md), [FORM_TEMPLATE_REGISTRY](FORM_TEMPLATE_REGISTRY.md), [EXAM_SESSIONS](EXAM_SESSIONS.md) และ [WORKFLOW_ENGINE](WORKFLOW_ENGINE.md) ใบสมัครระบบ5มีสถานะตามผู้ใช้6ค่า ไม่ใช่สถานะEnrollment, Candidate, Person หรือผลสอบ/ที่นั่ง/คำขอเปิดปิดสนาม

## 1 สถานะและownership

| State ref | สถานะApplication | ความหมายที่เสนอ                                                                        |
| --------- | ---------------- | -------------------------------------------------------------------------------------- |
| A35-01    | draft            | ร่างยังไม่ส่ง incompleteบางช่องได้ตามpolicy แต่target/person/contextต้องมีสิทธิ์       |
| A35-02    | submitted        | ส่งรุ่นที่sealแล้วอยู่ในworkflowตรวจ ไม่เท่ากับapproved/มีเลขที่นั่ง                   |
| A35-03    | returned         | ส่งกลับแก้พร้อมเหตุผล ต้องเพิ่มrevision/cycleก่อนส่งใหม่ ไม่ลบSnapshotเก่า             |
| A35-04    | approved         | รุ่นที่ตรวจผ่านeligibility/อำนาจตามconfiguration ไม่ใช่ผลสอบผ่านหรือpublished          |
| A35-05    | rejected         | รุ่นคำขอถูกปฏิเสธพร้อมreasonที่มีACL; เก็บhistoricalrecords                            |
| A35-06    | withdrawn        | ถอนโดยpolicy/ผู้มีอำนาจที่ยืนยัน เก็บเหตุผล/รุ่น/ผลกระทบ ไม่ลบใบสมัครหรือผลที่อ้างแล้ว |

request/workflowstatusesกลาง11ยังแยกsubmitted/reviewing ส่วนApplicationแสดงsubmittedขณะreviewingตามmappingรุ่นที่รับรอง ไม่เพิ่มreviewingลงenumผู้ใช้หรือสร้างapprovalengineอีกชุด Applicationapprovedต้องอ้างcanonicalterminaldecisionรุ่นเดียว statusไม่เป็นแหล่งอนุมัติอิสระ

Enrollmentมีenrollment_statusของการเรียนตามกฎที่รับรอง ไม่ใช้application_statusไปยุติการเรียน Personเปลี่ยนชื่อ/สถานะไม่autoถอนใบสมัคร Candidateไม่approvedทุกปีอัตโนมัติ คะแนนฝึกระบบ3ไม่eligibility/officialresultระบบ5 เว้นกฎเจ้าของที่มีหลักฐานและอยู่ในscopeรับรอง ซึ่งปัจจุบันยังไม่มี

## 2 Transition tableเสนอ

| Transition ref | จาก→ไป              | Actorและguardsที่ต้องตรวจ                                                                   | ผลที่ต้องรักษา                                                                     |
| -------------- | ------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| T35-01         | draft→draft         | saveสิทธิ์ปัจจุบัน typedtarget/people/context/fieldvalidation+expectedrevision              | IDเดิม CAS/receipt ไม่lastwritewins ไม่createCandidateบนGET                        |
| T35-02         | draft→submitted     | ผู้ยื่น/ตัวแทนที่รับรอง account/personbinding/scope window/eligibility/evidence/contextครบ  | sealSnapshot + workflowbinding + receipt/audit/outbox atomicไม่มีdoubleapplication |
| T35-03         | submitted→returned  | ผู้ตรวจcurrentstep/type/พื้นที่/วันและmakercheckerพร้อมreason                               | เก็บdecision/Snapshotรุ่นเดิม ไม่เปลี่ยนประวัติPerson/Enrollment                   |
| T35-04         | returned→returned   | ผู้มีสิทธิ์แก้ draftrevisionใต้Applicationเดิม                                              | acceptedrevision/receipt ไม่editsealedsnapshot                                     |
| T35-05         | returned→submitted  | completeness/eligibility/วันที่/target/scanACL/rulewithdrawalตรวจใหม่                       | Snapshotversion/cycleใหม่ ไม่ใช้approvalรอบเก่า ไม่สร้างworkflowอีกengine          |
| T35-06         | submitted→approved  | ผู้อนุมัติcurrentgrant/delegation/makerchecker/invariants พร้อมpinnedรุ่นและCAS             | terminaldecision/Snapshotที่ตรวจ + audit/outbox ไม่seat/resultpublishจากstatusเอง  |
| T35-07         | submitted→rejected  | ผู้มีอำนาจตามstep พร้อมreason/CAS                                                           | เก็บต้นเรื่อง/รุ่น/id ไม่ย้ายหรือลบPerson/Enrollment                               |
| T35-08         | draft→withdrawn     | withdrawalpolicy/currentownergrantและreasonตามชนิด                                          | คงbusinesskey/receipt/history ไม่ลบdraftเพื่อสมัครใหม่หลบkey                       |
| T35-09         | returned→withdrawn  | withdrawalpolicy/currentownergrant/CAS                                                      | reason/decisionและsnapshotเก่าคงอยู่                                               |
| T35-10         | submitted→withdrawn | withdrawalauthority/reviewstate/ผลกระทบ/วันและscopeที่รับรอง                                | workflowtransitionร่วมatomic คิวตัดสินเก่าไม่อนุมัติย้อนหลัง                       |
| T35-11         | approved→withdrawn  | Proposal: ต้องwithdrawalamendmentที่ตรวจผลที่นั่ง/คะแนน/เอกสาร/ประกาศผ่านownerก่อนตามpolicy | ไม่directstatusupdateหรือdelete downstream; หากpolicyขาดNOT_READY                  |

rejected/withdrawnไม่กลับdraftด้วยPATCH ถ้ากฎอนุญาตสมัครใหม่ต้องserver-issuedregistration_slotและเรื่องใหม่/authorizationที่มีหลักฐานตามAPPLICATION_SCHEMA เก็บCandidateเดิมและใบเก่า ไม่ปล่อยpartialuniqueเฉพาะactiveแล้วถือถอนคือสมัครซ้ำได้เสมอ

workflow11เดิมไม่มีwithdrawn และapprovedไม่cancelตรง ต้องtypedapplicationadapter/mapping/withdrawalamendmentrulesรับรองก่อนmigration อย่าmapwithdrawnกับcancelledแล้วกล่าวแก้approvedได้ทั้งหมดโดยไม่ตรวจผลที่นั่ง/คะแนน/ประกาศ Policyที่ยังไม่ยืนยันอยู่Q004/Q006/Q024 ใช้DEMOflowที่explicitเมื่อruntimeพร้อม

## 3 Shared serviceกับimporter

web/Excel/workerใช้canonicalbusinesskey/validatedinput/currentscope/personresolution/serviceเดียวกัน Importrow stagingยังไม่เป็นsubmitted/approved Application ต้องdryrun/recheck/commitตามกฎระบบ9ในบทที่จะพัฒนา ไม่สร้างPerson/Candidateจากชื่อ/วันเกิดหรือถือorg_id/role/templateverifiedจากไฟล์เป็นgrant

retrykeyเดิมpayloadเดิมคืนOperationReceiptเดิมภายใต้currentgrant keyเดิมpayloadต่างconflict Keyใหม่businesskeyเดิมไม่สร้างอีกใบและไม่overwriteข้อมูล ถ้าไม่ให้actorอ่านใบเดิม returnsafeissueไม่เปิดชื่อ/เลข/เหตุผล การแก้ใบเดิมใช้authorizedcommand+expectedrevisionเฉพาะสถานะที่ยอมรับ ไม่upsertimportทับsubmitted/approved

ทุกmutationtransaction resolveverifiedactor/currentaccount-grant/typedcontext lock/CASกับsharedworkflow/owner guardและnaturaluniques sealpins/receipt/audit/outboxในฐานกลางเดียว หากส่วนใดfailrollback ห้ามpartialCandidate/Application/Snapshotสำเร็จเฉพาะบางส่วน ServiceActor06หรือprivilegedworkercredentialไม่เป็นอำนาจธุรกิจ

scopeตรวจทั้งPerson/Candidate/Enrollment/Organization/รอบ-สนาม-ประเภทจากresourceฝั่งserver lineageที่ยืนยันและช่วงมอบหมาย ทุกread/detail/list/count/export/print/download/action/jobใช้currentDAL/fieldACL ไม่pagegate/ปุ่มซ่อน/บัญชีเทคนิค approveงานตน Creator/amender/provenanceและprincipalการมอบอำนาจตรวจmakerตามpolicyกลาง

## 4 Failureและrecovery

| Failure ref | กรณี                                                                  | พฤติกรรมเสนอ                                                                              |
| ----------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| E35-01      | businessduplicateจากเว็บ/Excelหรือเปลี่ยนchannel/org/center/key       | onebusinessidentityหรือsafeconflictไม่สร้างใบ/คนใหม่ ไม่เผยข้อมูลนอกscope                 |
| E35-02      | revision/decisioncycleเปลี่ยนระหว่างตรวจ                              | 409ข้อความไทยให้ตรวจรุ่นใหม่ ไม่autoapprove/เพิ่มversionให้เอง                            |
| E35-03      | window/status/capacity/eligibility/impactหรือfieldrequirementsเปลี่ยน | ตรวจrule/window/owner guardsใหม่ในtransaction หยุดเมื่อไม่พร้อม ไม่ใช้old dryrunเป็นgrant |
| E35-04      | formmeaning/layout/mappingยังTO VERIFY                                | officialblockedไม่fallbackDEMOหรือautoaliasศ.3                                            |
| E35-05      | credential/scopeถอนหลังenqueue/uploadยังquarantine                    | currentdeny/พักงาน ไม่มีpreview/submit/printprivateจากfilekey                             |
| E35-06      | ACKหายหรือfaultกลางtransaction                                        | receiptเดิมเมื่อcommitแล้ว หรือrollbackทั้งชุด ไม่Candidate/Application orphan            |
| E35-07      | notificationล้มหลังcommit                                             | outbox11retry/currentrecipient/devsink ไม่ย้อนdomaincommitหรือส่งซ้ำตามdedupe             |
| E35-08      | ข้อมูลหลังapprovedต้องแก้/ถอนและมีdownstream                          | amendmentผ่านowner/authority ใหม่ เก็บhistory/pins/audit/ผลสอบ ไม่silentupdate/ลบ         |

ความจุ/ที่นั่งใช้contracts21และownerbusinesskey ไม่สร้างseatallocation/resultengineใน35 ก่อนกฎรับรอง การเก็บstateenumไม่พิสูจน์ว่าtransitionทำงานแล้ว ต้องP35-06/07/11 nativeและdirectentrypointจริง

## 5 สถานะตรวจรับ

ทั้งสองเกณฑ์35และP35-01–12ในAPPLICATION_SCHEMAยัง **BLOCKED / NOT RUN** ไม่มีtransitions/unique/officialguard/DEMOrendererที่รันทดสอบแล้ว schema/migration/appversionsเดิม ไม่มีimplementation/stateenumจริงในบทนี้ ต้องปิด34และdependencyก่อนลงมือและตรวจ บท36ยังไม่เริ่ม
