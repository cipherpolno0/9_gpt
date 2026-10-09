# Routing และ receipt contracts — บท 55

รุ่น 0.1 | 8 ตุลาคม 2569 (2026-10-08) | source `968bb59` | **Proposal / BLOCKED — ไม่ใช่ Prisma/SQL/API implementation**

ใช้ [DOCUMENT_DELIVERY](DOCUMENT_DELIVERY.md), [workflow11](WORKFLOW_ENGINE.md), [approval54](CORRESPONDENCE_FLOW.md), [schema53](E_OFFICE_SCHEMA.md) และ [file ACL53](RECORD_DOCUMENT_ACCESS.md) ร่วมกัน ไม่สร้างบัญชี/เอกสาร/workflow/outboxอีกชุด

## 1 Identity และ storage guards ที่ต้อง reconcile

| Resource เสนอ                | ข้อมูลสำคัญ                                                                                                                                                    | Unique/guard ที่เสนอและยังต้องพิสูจน์                                                                                                                       |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RoutingIntent                | UUID, approved_snapshot/record_version/file refs, approved_plan_version, confirmed recipient digest, sender, accepted_at, row_version, immutable send manifest | business unique(initial approved_snapshot_id,intent_revision); command key actor/action/intent; FK/version/hash exact; dispatchไม่ allocate register number |
| ResolvedRecipientSnapshot    | routing_id, immutable account/verified Person/org/context, member valid+recorded revision, origin direct/group refs, resolved_at                               | unique(routing_id,account_id,context_id); composite context/account-person-org check; immutable after seal ไม่copyไฟล์                                      |
| PortalDelivery + InboxEntry  | resolved_snapshot_id, record_version_id, delivery_event_id, delivered_at, current access hold แยก                                                              | unique(routing_id,resolved_snapshot_id)และ InboxEntry unique(delivery_id); typed FKsame route/version; no endpoint recompute                                |
| Receipt                      | delivery_id, ackactor/method/policy/evidence refs, acknowledged_at, recorded_at, operation_receipt_id                                                          | unique(delivery_id), unique(operation_receipt_id); delivered prerequisite; expected version; actorcurrentauthority; correctionappendไม่updateเดิม           |
| Assignment + AssignmentEvent | record/parent_delivery, assigner/assignee/context, task discriminator, due_at/due_revision, accessbinding, task status/evidence                                | task businesskey explicitไม่unique(version,account)ทั้งงาน; unique(parent_task,task_key)ตาม policy; CAS/stateevent immutable; supersedes history            |
| Reminder/Portal Notification | task/delivery pointer, due_revision/window/channel/recipient_context, event businessid, policyversion                                                          | unique(target,due_revision,window_code,recipient_context,channel); currentdue/status/grant fence; seen_atไม่Receipt                                         |

column/type/enum/FKและnamespaceของlogical04ยังต้อง ADR ถ้ากำหนด composite-key หรือ non-overlap guardใหม่ต้อง migration ไม่พึ่ง hidden runtimecheckฝ่ายเดียว การจัดส่งเริ่มจาก approved routing intent เท่านั้น keyใหม่/payloadเดิมของ initialintentต้องคืน routeเดิมหลัง currentauthตรวจไม่สร้าง routeเพิ่ม การ resend/supplemental delivery ต้อง explicit intentใหม่พร้อมอำนาจ/เหตุผล/approvedrecipientplan ไม่ใช้ keyใหม่เป็นข้อยกเว้น silently

## 2 สัญญา services/server actions

| Service เสนอ                  | Inputที่ยอมรับ                                                                                                  | ตรวจ/ผล                                                                                                                                             |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| previewDispatchRecipients     | approved_snapshot_id, expected_root_revision, resolver_plan_version                                             | current sender scope/file/approval guard; server resolve/return private paged recipients + confirmation digest ไม่ grant/queue                      |
| enqueueApprovedDispatch       | approved_snapshot_id, intent_revision, expected_root_revision, confirmation digest, command idempotency key     | ห้าม body/file/template/accountsอิสระ; verify54และ current membership revisionในtransaction; return opaque routing receipt ไม่ delivery/human ack   |
| readInbox/readSentOutbox      | server-boundactor + allowlisted filters/cursor/limit                                                            | scopeก่อนfilter/count/pageและ current fieldpolicy; no client org_id grant; ไม่ allocateเลข/send/ackจากGET                                           |
| acknowledgeDelivery           | delivery_id, expected_receipt_revision, method, evidence refsตามpolicy, key                                     | self currentverified account/contextและrecord/source/file grants/scan/delivered; CSRF; serverclock; receiptunique; return current-authorizedreceipt |
| propose/activate/reassignTask | parentdelivery/task_id, verified target/context, task payload, due/revision, evidence/approved access refs, key | pending_accessไม่มี confidential data; assignedเมื่อทุกpolicyผ่าน; revision conflict; history+audit/outbox                                          |
| completeTask                  | task_id/expected revision, completion evidence, key                                                             | currentassigneeหรือdelegationเฉพาะ/correctversion/CLEAN/evidence/verificationตามpolicy; ไม่auto receipt/close siblings                              |
| planReminder/replayDelivery   | server authority/target revision/previous event/เหตุผล                                                          | scopedworker delegation/currentgrant/currentdue; businessdedupe/old lease fence; no actual email without verified channel                           |

การ retry command ตรวจ currentauthก่อนอ่าน operation receipt ถ้า grantถูกถอนคืน forbiddenแบบไม่เผยpayloadเดิม/subject/recipient แม้เคยสำเร็จ ไม่ให้ keyเดิม payloadใหม่ทับคำสั่งเก่า ใช้ conflictข้อความไทยและ correlation minimum ไม่ log full subject/body/member list/driversecret

## 3 Atomic send และ portal worker

Enqueue transactionต้อง serialize การถอนสิทธิ์/แก้ approved permit/เปลี่ยน membershipกับ send ร่วม protocol07/11/54 อ่าน root/version/approval/recipient policy/member revision/file ACL/CLEAN/hash จากserver ตรวจ confirmeddigest และ current record/source/file permissionของทุกendpointตาม approved sharing plan (DEMO rejectทั้งintentถ้าไม่ครบ) แล้วเขียน routing+resolvedsnapshot+operationreceipt+queued event+audit+outboxทั้งหมดหรือ rollback ไม่เปิด queuedจาก browserstate ถ้า approvalhold/version/sourceเปลี่ยนต้อง409/deny ไม่ authorizeชุดใหม่อัตโนมัติ

ชื่อ `outbox` ในหน้า userคือหนังสือที่ตนส่ง ส่วน durable OutboxEvent11เป็นกลไก internal ไม่ให้ผู้ใช้เลือก recipient/job payloadเพื่อข้ามสิทธิ์ sharedoutboxต้องมี target/event discriminator ให้ fanoutรายendpointได้โดยไม่ชน unique(operation_receipt,event_code)เดิม หากengine11ยังไม่รองรับให้blockและ ADR ไม่สร้างอีกengine

Workerclaim atomic leaseToken/expiry/attempt-historyตาม11 ก่อนbusinesscommitตรวจlatest fence + current initiatorหรือexplicit system delegated authority + approval permitสำหรับงานที่ยังไม่ส่ง + currentrecipient/record/source/file/CLEAN/hash จากนั้นสร้าง InboxEntry/deliveryevent/notificationขั้นต่ำและ consumer dedupe sinkในtransactionเดียวกับ perendpoint outcome/lease progress ก่อน ack jobต้องทุกendpoint successหรือblocked outcomeตามpolicy ไม่สรุปกลุ่ม deliveredถ้าแค่claimqueue

กรณี workerA leaseหมดแล้วworkerBได้ใหม่ workerAห้ามเขียน sink/event/ack แม้payloadเดิมถูกต้อง fenceต้องตรวจในDB transactionเดียวกับ effectsถ้าผล portalอยู่ฐานเดียว ไม่อ้างว่า fencingกัน external emailที่ส่งไปแล้วได้ Failก่อนcommit rollbackหมด; failหลังcommitแต่ก่อนตอบ retryอ่านbusinessdedupeคืนเดิมโดยไม่เปลี่ยน delivered_at/actorหรือ humanreceipt

Partialfanoutต้องเก็บ endpoint outcome/event/reasonขั้นต่ำ เขียนสำเร็จของAไม่ลบเมื่อBblocked; retryBใช้ frozenendpointเดิม ตรวจgrantsใหม่ ไม่resolveเพิ่มสมาชิกC ไม่สร้างAซ้ำ Holdหลังแก้หนังสือหยุด unsent endpointเดิม แต่ delivered evidenceที่เคยcommitยังคงอยู่และcurrentACLบังคับการอ่าน ไม่ลบ/แก้ประวัติย้อนหลังว่าที่ส่งจริงไม่เคยส่ง การ recall/order correctionเป็นคำสั่งใหม่ตามpolicy ไม่ทำล่วงหน้าใน55

## 4 Assignment access และ external boundary

Read/preview/search/file/download/exportของผู้รับ/assigneeต้องมี identity eligibility (frozenendpointหรือexplicit approvedaccessbindingสำหรับassignment)+current record action+scope+source ACL+file ACL+clearance+CLEAN+versionhash ครบ ไม่มี OR fallbackจากsameorg/task/notification/link/servicecredential currentmembershipของคนใหม่ไม่แทน frozenendpoint

Policyที่ให้เพิ่ม task accessต้องชื่อผู้อนุมัติ/แหล่งอำนาจ/ช่วง/purpose/record-file-source refs/evidenceและ maker checker ทุกส่วน Workerไม่ mint permissionจากบทบาทtechnicalหรือ assignment status แค่ส่ง assignmentproposal pending_accessเข้า queueตรวจที่ผู้มีอำนาจเห็น ผู้ถูกเสนอเห็นได้เฉพาะข้อความขั้นต่ำถ้า fieldpolicyอนุญาต ห้ามส่งชื่อหนังสือ/เหตุผลลับ/attachmentชื่อไฟล์ไป notification/mail

Portal effectsในฐานเดียวพิสูจน์ transactional idempotencyได้เมื่อ native constraintsพร้อม ส่วน email/providerอยู่นอก transaction ต้อง config/runtime authorization/provider idempotency/effect reconciliation/ambiguous-outcome protocol หากไม่ยืนยัน provider outcomeให้ hold/reconcile ไม่ retry blindlyแล้วอ้างไม่ซ้ำ email acceptedไม่humanackและไม่PortalDelivery ไม่มี provider/recipientจริง/อีเมลส่งใน55

## 5 Protocol การตรวจรับ

P55-02/05/06/09ต้องใช้ PostgreSQLจริงอย่างน้อยสองconnections+barrier+observer currentlimitedroles+revocation actor ไม่ใช่ทำ reference dictสองรอบแล้วอ้าง concurrency วัด rowcounts routing/endpoint/inbox/deliveryevent/receipt/task/notification/operationreceipt/audit/outbox และ immutable file refsก่อนหลัง failpoints explicit SQLSTATE/receipt/event lineage มี timingทั้งก่อนcommit/หลังcommit-response-loss/stalelease/currentrevoke/groupchange

P55-12–14/17–18ต้องโจมตี API/route/filegateway/export/cacheโดยผู้ต่างหน่วย/taskonly/source-deny/file-deny/revoked/newmember ตรวจ responseไม่มีbody/subject/filename/PII ทั้ง statuses/404และnotificationไม่บอกว่ามีเรื่อง สถานะ planในfixtureเป็น NOT_RUN ไม่มี endpoint/servicesให้executeและไม่เลื่อนไป56
