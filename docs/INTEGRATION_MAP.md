# เชื่อมเหตุการณ์และเอกสารทั้งเก้าระบบ — บท 65

รุ่น 0.1 | 9 ตุลาคม 2569 (2026-10-09) | baseline `a809bcc` | **Proposal / BLOCKED — ยังไม่มี integration handlers ที่รันจริง**

## 1 สถานะและแนวคิดทีละขั้น

อ่าน [BLUEPRINT](../BLUEPRINT.md), [WORKFLOW_ENGINE](WORKFLOW_ENGINE.md), [PERMISSIONS](PERMISSIONS.md), [UAT_SYSTEM_09](UAT_SYSTEM_09.md) และ [PROGRESS](PROGRESS.md) ก่อนใช้ บท64ยังไม่ผ่าน ไม่มีApplication/ExamCenter/FileVersion/RoleAssignment/outbox/inboxreceipt/businessservicesในPrisma มี19coremodels Documentเป็นmetadata WorkerมีSELECT1/RedisPINGเท่านั้น `corepack pnpm db:test` exit1 ไม่ได้รันintegrationtransactions

1. เจ้าของข้อมูลรับคำสั่ง ตรวจสิทธิ์ และบันทึกทะเบียนกลางของตน ไม่มีconsumerตั้งทะเบียนคน/หน่วยงาน/ใบสมัครใหม่
2. Eventบอกสิ่งที่commitแล้ว ไม่เป็นคำอนุมัติหรือสิทธิ์เข้าอ่านข้อมูล
3. Outboxบันทึกeventกับธุรกรรมต้นทาง Workerหยุดแล้วข้อมูลธุรกิจยังอยู่
4. Consumerอ่านข้อมูลกลางตามสิทธิ์ปัจจุบัน และจดreceiptกับผลของงานในtransactionเดียว Retryต้องไม่ทำผลข้างเคียงซ้ำ
5. รายงานหรือnotificationล้มให้กู้เฉพาะconsumer ไม่สั่งต้นทางทำธุรกรรมเดิมอีกครั้ง

OwnerO01–O09/C02/C03ด้านล่างเป็นบทบาทเสนอ ไม่ใช่บุคคลหรืออำนาจที่ได้รับแต่งตั้ง ไม่มีruntime/migration/seedหรือการส่งข้อความจริงในรอบ65 ไม่อ้างครบเอกสารเท่ากับเชื่อมระบบจริงครบ

## 2 เจ้าของข้อมูลและจุดเชื่อม

| ระบบ / ownerเสนอ     | เจ้าของการเขียน                                                     | อ่านอ้างข้อมูลกลาง / เหตุการณ์                                                      | ข้อบังคับ                                                                           |
| -------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 1 บุคคล / O01        | Person/PositionAssignment/สถานะบุคคลและประวัติ                      | PersonChanged → currentACL invalidation/impact02/07/08                              | ไม่grantสิทธิ์ใหม่จากชื่อหน้าที่หรือevent ไม่แก้snapshotปีเก่า                      |
| 2 หน่วยและสนาม / O02 | Organization/ExamCenter/CenterSession/Address/ExamCenterAppointment | OrganizationStatusEffective, ExamCenterChanged; Person01/FileVersionกลาง            | request04เป็นคำสั่งที่อนุมัติแล้วให้service02ตรวจและเขียน ไม่เขียนregistryสำเนาใน04 |
| 3 การเรียน / O03     | Curriculum/QuestionVersion/Attempt/Progress                         | Person/Org/Document referencesตามscope                                              | progressprivate/คะแนนฝึกหัดแยกofficial05 ไม่เพิ่มlearningeventในcatalog7ชนิดบทนี้   |
| 4 คำขอ / O04         | Request/RequestVersion/approvedactivation references                | ส่งapprovedcommandเข้าowner02; อ้างworkflow/เอกสารกลาง                              | ยื่นหรือapproveก่อนวันมีผลไม่เท่ากับregistryeffective                               |
| 5 สมัครและผล / O05   | Candidate/Enrollment/Application/Snapshot/seat/score/release        | ApplicationCommitted จาก05ทั้งwebและExcel; อ่านcenter02/evidenceกลาง                | businesskeyและregistry05เดียว importedไม่approved/seat/pass                         |
| 6 งบ / O06           | FiscalYear/BudgetLine/immutablebudgetledger                         | BudgetReserved; procurement07/Organization/เอกสารกลาง                               | exactdecimal/ledger receipts ไม่จ่ายเพราะรับGoodsReceived                           |
| 7 พัสดุ / O07        | Procurement/Order/GoodsReceipt/inspection/stock/Asset/custody       | BudgetReservedอ่านreservation06; GoodsReceivedหลังinspection+stockpost              | รับบางส่วนไม่ปิดorder/ภาระหรือจ่ายเงินอัตโนมัติ                                     |
| 8 สารบรรณ / O08      | Correspondence/RecordVersion/delivery/ack/task                      | RecordDelivered; FileVersion/hashกลาง+decisionrefsจาก01/04/06/07                    | deliveredไม่acknowledged linkไม่grantACL ทุกผู้รับตรวจสิทธิ์                        |
| 9 Excel / O09        | ImportBatch/Row/Issue/CommitReceipt/AmendmentLink                   | เรียกApplication05ภายในsharedtransaction; consumeApplicationCommittedเป็นmonitoring | ไม่producerApplicationอีกชุด ไม่Personจากชื่อ ไม่copyทะเบียน05                      |

บัญชี/สิทธิ์/PolicyVersion/Document/FileVersion/Workflow/Audit/OperationReceipt/Outboxเป็นบริการกลางC02+C03ตามเจ้าของนโยบาย ไม่ทำlogin/ไฟล์/approvalengineแยก9ชุด Coreบางmodelมีจริง แต่ชื่อmodeldomainในตารางนี้ยังเป็นlogicalcontractsตามบทก่อน

## 3 Catalog เหตุการณ์ที่ผู้ใช้กำหนด

| event_type                  | producer / aggregate_kind                       | ออกเมื่อใด                                                                                 | consumerเสนอ / ผลที่อนุญาต                                                                                                         |
| --------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| PersonChanged               | people01 / Person                               | เปลี่ยนข้อมูล/หน้าที่/สถานะที่มีผลแล้วจากowner commit; pendingrequestไม่emitแบบeffective   | AUTH_IMPACT, RECORD_ACCESS_RECHECK, CENTER_CUSTODY_IMPACT; recheck/invalidate/สร้างงานให้ผู้มีอำนาจ ไม่silentgrant/autoแต่งตั้งแทน |
| OrganizationStatusEffective | organizations02 ผ่านactivation04 / Organization | approvedversionถึงวันและผ่านเงื่อนไข activate33พร้อมstatus event+registryprojection+outbox | ORGANIZATION_REPORT_REFRESH, CENTER_READINESS_RECHECK; ไม่applyคำขอซ้ำจากevent                                                     |
| ExamCenterChanged           | organizations02 / ExamCenter                    | centralcenter/version/effectiveprojectionเปลี่ยนจริง                                       | CENTER_APPOINTMENT_IMPACT, IMPORT_CONTEXT_RECHECK; ไม่autoPersonแทนผู้รับข้อสอบ/ไม่เปิดรับสมัครจากnotification                     |
| ApplicationCommitted        | exams05 / Application                           | Application+Snapshot+rowreceipt/summary62+outboxในtxเดียว                                  | IMPORT_MONITORING, APPLICATION_REPORT_REFRESH; ไม่approve/allocate/สร้างApplicationเพิ่ม                                           |
| BudgetReserved              | budget06 / BudgetLine                           | ledger reservationผ่านapprovedcommand/invariantsและcommitจริง                              | PROCUREMENT_BUDGET_LINK, BUDGET_REPORT_REFRESH; อ่านreceipt06 ไม่จองอีกจากevent                                                    |
| GoodsReceived               | inventory07 / GoodsReceipt                      | inspectionผ่านและacceptedquantity/stockledgerpostedจริง ไม่ใช่draftหรือใบส่งของ            | STOCK_REPORT_REFRESH, RECORD_LINK_RECONCILE; ไม่รับstockหรือcharge/payซ้ำ                                                          |
| RecordDelivered             | correspondence08 / RecordDelivery               | portal deliveryต่อผู้รับของรุ่นที่อนุมัติและreceiptพร้อมcommit                             | INBOX_NOTIFICATION, DELIVERY_REPORT_REFRESH; ไม่ACK/assigned/completedอัตโนมัติ                                                    |

ชื่อservice/handler/type0.1เป็นProposal ไม่ติดตั้งจริง ownerต้องรับรอง typedFK/aggregateversion semantics/provenanceก่อนmigration ใช้ [EVENT_CONTRACTS](EVENT_CONTRACTS.md) และ [INTEGRATION_HANDLERS](INTEGRATION_HANDLERS.md) กับlogical04outbox/operationreceipt/11OutboxEvent ไม่สร้างสองoutboxเพียงเพราะชื่อไม่ตรง

## 4 สามสถานการณ์และเอกสารร่วม

### S65-01 เปลี่ยนหน้าที่ สิทธิ์ และสารบรรณ

คำขอบุคคล01 → workflowกลางอนุมัติรุ่น+หลักฐาน → owner01มีผลและเขียนPerson/Assignment history+audit/outbox → PersonChangedทำimpactและinvalidateauthorization/projections → currentDALตรวจeffectiveassignment/grantsโดยตรง → records08recheckผู้รับ/ไฟล์ของหน้าที่ที่พ้นและเสนอhandoverใหม่

Eventล่าช้าไม่ทำให้เจ้าหน้าที่พ้นหน้าที่อ่านได้ต่อด้วยcachedgrant สิทธิ์ใหม่ต้องexplicitapprovedassignment/delegationไม่roleชื่ออย่างเดียว การปิดสิทธิ์ไม่ลบdelivery/auditเก่าและไม่grantคนรับแทนจากชื่อคล้าย หนังสืออ้าง FileVersionและdecisionของคำสั่งเดิมผ่านACLintersection ไม่copyไฟล์เข้าระบบ08ใหม่เพื่อหลบสิทธิ์ ตาม [PERSON_CHANGE_WORKFLOWS](PERSON_CHANGE_WORKFLOWS.md), [RECORD_ACCESS_CONTROL](RECORD_ACCESS_CONTROL.md), [DOCUMENT_DELIVERY](DOCUMENT_DELIVERY.md)

### S65-02 เปิดสนาม ผู้รับข้อสอบ และสมัคร Excel

คำขอ04+approvedversion+FileVersionคำสั่ง08 → ถึงวัน/conditions33 → owner02เปิดcenter-session/statusprojectionและemitOrganizationStatusEffective/ExamCenterChangedตามaggregateที่เปลี่ยนจริง → ตรวจAppointments22ต่อPerson01/ปี/รอบ/ช่วงมอบหมายพร้อมshipping snapshot → Excel09ทำupload/dryrun/revalidate/commitเข้าระบบ05 → ApplicationCommittedใช้ติดตามreceipt/batch → approve/seat37เป็นขั้นแยก

ถ้าไม่มีประธาน/ผู้รับข้อสอบหรือบุคคลยุติหน้าที่ สร้างimpactให้สนามแต่งตั้งใหม่ ไม่เลือกแทนอัตโนมัติ centeropenไม่พิสูจน์registrationwindow/eligibility/appointmentready ทุกคำสั่งสมัครตรวจserverล่าสุด CSV/publictrackingไม่เผยprivatecontacts/ข้อสอบทางการ ตาม [REQUEST_EFFECTIVE_RULES](REQUEST_EFFECTIVE_RULES.md), [EXAM_CONTACT_VISIBILITY](EXAM_CONTACT_VISIBILITY.md), [IMPORT_IDEMPOTENCY](IMPORT_IDEMPOTENCY.md), [SEAT_ALLOCATION](SEAT_ALLOCATION.md)

### S65-03 ขอซื้อ งบ ตรวจรับ และหนังสือ

Request07อ้างbudgetline06/project/fiscalyear+approvaldocument → approvedreserveผ่านservice06ในsharedtx48 → BudgetReservedอ้างreservationreceipt → Order07convertreserveเป็นcommitmentในtxเดียว → partialreceipt+inspection49 → stockpostแล้วGoodsReceivedอ้างstockreceipt/commitment → records08เชื่อมเอกสารรับรุ่นเดิมที่ได้รับอนุมัติ → payment44ดำเนินต่างหากเมื่อผ่านevidence/authority/invoiceguards

BudgetReservedconsumerไม่reserveใหม่ GoodsReceivedไม่convertcommitment/payอีก หน่วยquantity/conversionรุ่นเดิมและexactdecimalต้องตรง หนึ่งAcademicYearผูกหลายFiscalYearได้ไม่รวมยอดข้ามความหมาย Documentscentralเดียวทุกขั้นแต่linkไม่เพิ่มread ACL ตาม [PROCUREMENT_BUDGET_FLOW](PROCUREMENT_BUDGET_FLOW.md), [STOCK_LEDGER](STOCK_LEDGER.md), [DISBURSEMENT_WORKFLOW](DISBURSEMENT_WORKFLOW.md), [APPROVAL_EVIDENCE_CONTRACT](APPROVAL_EVIDENCE_CONTRACT.md)

ทั้งสามเป็น **สถานการณ์ที่ผู้ใช้กำหนดและแผนจำลองTEST\_ ยังไม่รันกับข้อมูลหรือบริการจริง** Actualaggregate/document/decision/event/receiptrefsว่างใน [fixture](../tests/fixtures/integration/integration-plan.json) ไม่สร้างGUIDตัวอย่างแล้วอ้างว่าลิงก์กลางจริง

## 5 Cross-module invariant และ recovery

| invariant                                     | หลักฐานที่ต้องตรวจ                                                  | เมื่อconsumer/report/notificationล้ม                                              |
| --------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| canonicalPerson/Organization/Applicationเดียว | typedsourceFK/centralIDs/sharedbusinesskeys/rowversions             | retryprojection/report ไม่recreateต้นทาง                                          |
| effectivedate+approval+currentrights          | valid_at/known_at, decisionversion, currentDAL/ACL                  | delayednotificationไม่ย้อนstatus/ให้oldgrant futureก่อนactivationไม่แสดงeffective |
| Documentรุ่นเดียวที่อนุมัติ                   | FileVersion exacthash/CLEAN/approvedversion/currentACL              | reportเก่าstale; rebuildจากversionเดิมภายใต้currentpolicy ไม่สลับไฟล์ใหม่         |
| financial/stockamountsไม่ซ้ำ                  | reservation/commitment/stock/paymentreceiptsจากownerและexactdecimal | retrylink/report ไม่reserve/stockpost/payจากevent                                 |
| importer→05และlearningboundary                | Application05/snapshot/registry/receipt IDs ไม่มีofficialscoreจาก03 | reportfailureไม่rollbackAppหรือapproveเพราะconsumerสำเร็จ                         |
| deliveredไม่acknowledged                      | version+recipientreceipt และexplicitACKevidence                     | notifyretryไม่duplicatebook/delivery/ACK                                          |

ความสดรายงานแสดงsourceversion/as_of/last_success/reconciliationstatus ไม่อ้างupdateทันถ้าqueueค้าง Reportfailedไม่มีexportsuccessartifact Consumer poison/gap/conflictไปrecoveryqueueตามscope ไม่ลบevent/receipt ไม่dropcursorเพื่อreplaymutation แก้ต้นทางต้องapprovednewcommand/amendment ไม่rewriteeventเก่า บท66ยังไม่เริ่ม เกณฑ์65ทั้งสองBLOCKED_NOT_RUN
