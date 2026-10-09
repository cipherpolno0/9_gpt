# ติดตามและแก้ชุดนำเข้าที่ผิด — บท 63

รุ่น 0.1 | 9 ตุลาคม 2569 (2026-10-09) | baseline `65c9296` | **Proposal / BLOCKED — ยังไม่มี monitoring หรือ amendment tools ที่รันได้**

## 1 สถานะและแนวคิดทีละขั้น

อ่าน [IMPORT_IDEMPOTENCY](IMPORT_IDEMPOTENCY.md), [IMPORT_COMMIT_TRANSACTION](IMPORT_COMMIT_TRANSACTION.md), [APPLICATION_STATES](APPLICATION_STATES.md), [SEAT_ALLOCATION](SEAT_ALLOCATION.md), [RESULT_RELEASE_RECOVERY](RESULT_RELEASE_RECOVERY.md) และ [PROGRESS](PROGRESS.md) ร่วมกัน บท62ยังไม่ผ่าน: ไม่มี Application/ImportBatch/CommitReceipt/WorkflowInstance/FileVersion/outbox/บัญชีสิทธิ์ใน Prisma มี19coremodels workerตรวจconnectionเท่านั้น `corepack pnpm db:test` exit1 ไม่มีbusiness transactionในรอบ63

1. การติดตามอ่านสถานะที่บันทึกจากserver แยกงานที่กำลังทำจากใบสมัครที่commitแล้ว
2. Retryทำงานเดิมที่ยังไม่สำเร็จ ไม่สร้างใบสมัครเพิ่มจาก batchที่สำเร็จ
3. แก้ไฟล์เป็นbatchใหม่และแสดงdiff ไม่เขียนไฟล์หรือreceiptเดิมทับ
4. Compensationเป็นคำขอแก้ผลของงานเดิมที่ผ่านตรวจ ไม่ใช่DELETEหรือSQLrollbackของtransactionที่commitไปแล้ว
5. Retentionลดข้อมูลส่วนตัวที่หมดความจำเป็นตามนโยบาย แต่คงหลักฐานธุรกรรมและ legal hold ไม่ให้retryสร้างข้อมูลที่ถูกทำลายกลับขึ้นมา

เอกสารนี้กำหนดสัญญาให้reviewได้ ยังไม่เพิ่มroute/schema/migration/workerจริง ไม่มีการถอนใบสมัคร/ที่นั่ง/คะแนน/ประกาศหรือทำลายไฟล์จริง บท64ยังไม่เริ่ม

## 2 Batch ใหม่และรายการที่เปลี่ยน

Batchเดิม/ทุกrun/sourceFileVersion/checksum/normalizedmanifest/receipt immutable Fileเปลี่ยนต้องบริการDocumentกลางอัปโหลดquarantine/scan/parse/dryrunใหม่ตาม60–61 พร้อม `parent_batch_id`, `root_batch_id`, revision, reason, actor, recorded_at และ sourceversionใหม่ ข้อมูลเหล่านี้เป็นlogical deltaของ ImportBatchเดิมไม่เป็นทะเบียนApplicationใหม่

Parentต้องมีcurrentreadและสร้างchildscopeของหน่วย/typedofferingเดียวกันตามข้อเสนอทดลอง ไม่ให้เปลี่ยนparentข้ามหน่วยเพื่อได้สิทธิ์หรือหนีkey ตรวจไม่self-parent/cycle และgeneration/rootตรงกันก่อนเขียน หลายคนแก้พร้อมกันอาจเกิดbranch ให้แสดงbranchและsourceversionชัด ไม่มี last-write-wins ทับกัน ไม่ถือrevisionสูงสุดเป็นรุ่นที่ได้รับอนุมัติโดยอัตโนมัติ

เปรียบเทียบด้วย stable source row referenceที่ตรวจกับmanifestเดิม และ identity/Application business keyกลางที่verified ไม่จับคู่จากชื่อ ลำดับแถว หรือค่า matched_personที่browserส่ง การจับคู่ไม่แน่ชัดเป็น `UNRESOLVED` ให้ผู้ตรวจเลือกพร้อมหลักฐาน ไม่สร้างPerson/แก้Applicationจากการเปิดdiff แสดงค่าก่อนหลังด้วยDTOที่ปกปิดตามcurrentACLทั้งสองฝั่ง ไม่มีrawidentityในHTML/tooltip/hiddenJSON/export

| ประเภทdiff | ความหมาย                                             | งานที่อนุญาตหลังตรวจ                                                         |
| ---------- | ---------------------------------------------------- | ---------------------------------------------------------------------------- |
| ADDED      | ไม่มีrow/business keyเดิมที่ตรงหลังresolve           | createApplication05ได้เมื่อdryrunผ่านและไม่มีkeyซ้ำ ผ่านcommit62ที่พร้อมจริง |
| MODIFIED   | identity/opportunityเดียวกันแต่fieldหรือevidenceต่าง | request amendment/updateตามสถานะผ่านservice05และCAS ไม่createใบใหม่          |
| REMOVED    | แถวไม่อยู่ในไฟล์ใหม่                                 | เสนอถอนเฉพาะรายการ ไม่ถอนอัตโนมัติจากการลบแถวในExcel                         |
| UNCHANGED  | ค่าnormalizedและevidencebindingตรง                   | อ้างreceiptเดิม ไม่มีregistrymutation                                        |
| UNRESOLVED | row reference/identity/contextไม่แน่ชัด              | หยุดก่อนแก้/สร้าง ตรวจหลักฐานใหม่ ห้ามname merge                             |

Batchลูกที่ทับkeyของbatchcommittedไม่ส่งทั้งไฟล์เข้าcreateDraft62 เพราะจะduplicate/conflict ต้องreviewchangeplanแยกcommandและlineageก่อน ไม่มีskipDuplicatesเพื่อให้ดูเหมือนสำเร็จ ข้อเสนอ63 **ยังปิด mixed create+amendment execution** จน05/62/workflowมีสัญญาtransactionและผลแต่ละcommandชัด ไม่อ้างatomicทั้งไฟล์เมื่อแบ่งหลายคำสั่ง New-onlybatchผ่าน62ได้เมื่อprerequisitesพร้อม; existingdraft/returnedแก้ผ่าน05 version/CAS ส่วนapprovedต้องamendmentที่อนุมัติแล้วเสมอ

## 3 คำขอถอนชุดและผลกระทบ

สร้างคำขอผ่านworkflowกลางพร้อม scope, reason, evidenceFileVersions, exact row→Application/receipt targets, expectedApplicationversions และ pinnedimpactmanifest ห้าม SELECTทุกApplicationที่ชื่อเหมือน/created_byตรงแล้วถอน ต้องมีcurrentauthorityของทุกtargetและตรวจmaker-checkerของคำขอรวมกฎ05ผู้สร้างห้ามอนุมัติงานสำคัญของตนเอง delegationตรวจวันจริง ผู้ดูแลเทคนิคไม่มีสิทธิ์อนุมัติจากชื่อฝ่าย

| ผลกระทบที่ตรวจล่าสุด                                | เส้นทางเสนอ                                                                     | หลักฐานที่คงไว้                                                                                     |
| --------------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| ยังไม่commit / ยังไม่มีApplication                  | ยกเลิกpendingjobเมื่อพิสูจน์ว่าไม่มีtransactionสำเร็จ/ค้าง หยุดgenerationแบบCAS | source/run/failedหรือcancelled historyตามretention ไม่เรียกถอน05                                    |
| draft/submitted/returned ไม่มีseat/score/release    | withdrawal command05หลังworkflowอนุมัติและversionตรง                            | Candidate/Person/Enrollmentเดิม, Application+snapshots, receipt, decision/audit ไม่DELETE           |
| approved แม้ยังไม่มีseat                            | approved amendment05ก่อนwithdraw/change                                         | approvalเดิมและamendmentversion ไม่downgradeเงียบ                                                   |
| มีseat/capacityclaim                                | seat amendment37ตรวจรอบ/สนาม/quota/บัตรและการแจ้ง                               | seatเดิม/history+replacement/currentvalidity ไม่ลบเลขเดิมเพื่อreuseซ่อน                             |
| มีscore batch/รับรอง                                | result correction38และผู้ตรวจตามอำนาจ                                           | คะแนนเดิม/ruleversion/batch/checker+ผลแก้ ไม่ลบหรือแทนด้วยคะแนนฝึกหัด                               |
| มีreleaseเผยแพร่หรือถอนแล้ว                         | release recovery39 รุ่นแก้/เหตุผล/supersession+cacheinvalidation                | ประกาศsnapshotเก่า/decision/lineage retained privately ไม่ยกเลิกทุกคนในreleaseเดียวเพราะrowเดียวผิด |
| ต้นทางimpactadapterอ่านไม่ได้/ไม่พร้อม/ข้อมูลขัดกัน | NOT_READY ไม่ถือว่าจำนวนผลกระทบเป็น0                                            | ห้ามwithdrawจนตรวจครบโดยผู้มีอำนาจ                                                                  |

ตรวจ seat, score draft/staging, certification, releaseทุกรุ่น รวมwithdrawn/superseded/historyและการใช้ร่วมต่างbatch ไม่เช็คแค่currentpublicresult Creator/applicantอาจไม่มีสิทธิ์อ่านคะแนนหรือholdreason รายงานให้เฉพาะfieldที่ได้รับอนุญาต การมีreferenceไม่grantreadหนังสือ/ไฟล์/ผลสอบ

ตรวจimpactใหม่ในtransactionก่อนapply ถ้าseat/score/releaseเกิดหลังreviewหรือversionเปลี่ยนต้องหยุดและเริ่มตรวจrequestรุ่นใหม่ ไม่ข้ามเพราะapprovedแล้ว ตรึงรุ่นที่อนุมัติ คำตัดสินเก่ายังคงอยู่ Compensationแต่ละ05commandมีunique(request version, target Application, command kind)+fingerprint, CAS, audit/outboxในtxเดียว Retrycommandสำเร็จคืนreceiptเดิมไม่withdrawซ้ำ

## 4 สถานะและการกู้คืน

Import batchที่เคยcommittedคงเป็นcommitted และ summary/counts/receiptเดิมไม่เปลี่ยน เพิ่ม recovery stateแยกผ่านrequest/decision/event referencesตามlogical04 `amendment_link` (Application+request_version+previous_commit_receipt) ไม่ใช้compensationstatusเขียนว่าไม่เคยนำเข้า

| recovery stateเสนอ                  | เหตุการณ์                                       | ผลที่แสดง                                                         |
| ----------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------- |
| PROPOSED / REVIEWING / RETURNED     | ขอแก้ ตรวจ ส่งกลับ                              | ยังไม่มีผลต่อApplication                                          |
| APPROVED_PENDING                    | decisionผ่าน แต่dependency/amendmentยังไม่พร้อม | ไม่แสดงว่าถอนสำเร็จ                                               |
| APPLYING                            | commandที่ได้รับอนุมัติกำลังapply               | แยกtargetpending/applied/conflict ไม่รวมเป็นcompleteก่อนครบ       |
| PARTIALLY_APPLIED                   | หลายcommandสำเร็จบางรายการแล้วหยุด              | แสดงactualreceipts; retryเฉพาะunfinishedตามscope ไม่undoโดยdelete |
| COMPLETED                           | ทุกrequiredtargetมีreceiptsที่ตรวจได้           | แสดงwithdrawn/amendedจาก05 ไม่approved/passจากimport              |
| REJECTED / CANCELLED / NEEDS_REVIEW | ปฏิเสธ ยกเลิกก่อนapply หรือสาระ/impactเปลี่ยน   | คงdecision/history ไม่มีการแก้จากแค่ยื่นคำขอ                      |

Multi-modulecompensationอาจใช้หลายapprovedtransactions ไม่อ้างrollbackทั้งหมดหรือatomicทั้งbatch ถ้าpartialต้องแสดงชัดพร้อมคำขอแก้ต่อ การcancelหลังมีบางคำสั่งapplyต้องworkflowแก้ต่อ ไม่กลับสถานะregistryโดยclient state Batchmixedไม่มีdependencyต้องหยุดก่อนapprove/apply Unknowncommitoutcomeค้นdurablereceipt62/05ก่อนretryหรือfailed Leaseหมดไม่พิสูจน์rollback

การขอแก้ใหม่ต้อง referenceคำขอ/decision/eventเดิม ไม่ลบeventที่ผิด ไม่ลบPersonแม้เป็นคนที่สร้างจากimportเพราะอาจมีประวัติอื่น ไม่ลบEnrollmentเพราะimportไม่ได้สมัครเรียนแทน และไม่deleteที่นั่ง/score/release/เอกสารเพื่อถอนทั้งbatch

## 5 เกณฑ์และข้อจำกัด

ดู [monitoring/retention](IMPORT_MONITORING_RETENTION.md), [RECOVERY_CASES](../tests/system09/RECOVERY_CASES.md), [fixture](../tests/fixtures/system09/recovery-plan.json)0.1 PLAN_ONLY เกณฑ์63-01และ63-02 **BLOCKED / NOT_RUN** ไม่มีactualbatch/receipts/downstreamrecordsให้ตรวจ ต้องผ่าน62/shared05/37–39/workflow/files/currentACL/nativePGก่อนimplementation ไม่ใช้testlabelsหรือdocscheckแทนข้อมูลจริง
