# ส่งหนังสือ รับทราบ และมอบหมายงาน — บท 55

รุ่น 0.1 | 8 ตุลาคม 2569 (2026-10-08) | source `968bb59` | **Proposal / BLOCKED — สัญญาการทำงาน ยังไม่มี routing/inbox/receipt services จริง**

อ่าน [BLUEPRINT](../BLUEPRINT.md), [MASTER](../00_MASTER_PROMPT.md), [PROGRESS](PROGRESS.md), [workflow11](WORKFLOW_ENGINE.md), [schema53](E_OFFICE_SCHEMA.md), [file access53](RECORD_DOCUMENT_ACCESS.md) และ [approval54](CORRESPONDENCE_FLOW.md) ก่อนออกแบบ บท54ยังไม่ผ่าน core0.6.0มี19models Documentเป็นMETADATA_ONLY ไม่มีFileVersion/ACL/Auth/DAL/shared workflow/outbox consumer คำสั่ง `corepack pnpm db:test` รอบ55 exit1 จึงไม่มีระบบส่งหรือหลักฐานรับจริง เอกสารนี้ไม่สร้างทะเบียนหรือ workflow ทดแทนบริการกลาง

## 1 อธิบายทีละขั้น

1. การอนุมัติหนังสือตรึงเนื้อหา ผู้ลงนาม ผู้รับ และไฟล์เฉพาะรุ่นตามบท54 ยังไม่ใช่การส่ง
2. ผู้ส่งตรวจรายชื่อผู้รับจริงและสิทธิ์ก่อนยืนยัน ระบบจึงบันทึกงานส่งและ snapshot สมาชิก ณ เวลา server รับคำสั่งส่ง
3. Worker สร้างรายการในกล่องรับของผู้รับแต่ละรายอย่างทนต่อ retry การส่งถึงใน portal ไม่พิสูจน์ว่าคนนั้นอ่านแล้ว
4. ผู้รับกดรับทราบหนังสือรุ่นนั้นโดยชัดเจน หรือใช้หลักฐานรับชนิดที่นโยบายรับรอง การเปิดแจ้งเตือนหรือ preview ไม่สร้าง receipt
5. ผู้มีอำนาจมอบหมายงานได้เมื่อสิทธิ์ครบ งานที่เสร็จมีหลักฐานของงานเอง ไม่ทำให้ผู้รับคนอื่นรับทราบหรือเสร็จงานแทน

## 2 สถานะเป็นคนละมิติ

| คำแสดงสถานะ  | ความหมายที่เสนอ                                                                 | หลักฐานที่ต้องมี                                                 | สิ่งที่ห้ามอนุมาน                                              |
| ------------ | ------------------------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------- |
| queued       | รับคำสั่งส่งที่ผ่าน guard และบันทึก routing/snapshot/outbox ใน transaction แล้ว | routing intent + operation receipt + queued event                | ยังไม่ delivered/acknowledged และไม่เพิ่มสิทธิ์อ่าน            |
| delivered    | มี durable InboxEntry ของ endpoint ที่ตรวจสิทธิ์ ณ commit แล้ว                  | delivery event/endpoint/record version/portal commit time        | ไม่ใช่ email sent/read หรือ human acknowledgement              |
| acknowledged | ผู้รับที่ระบุตัวตนยืนยันรับทราบเฉพาะรุ่น หรือมีหลักฐานตาม policy                | receipt actor/method/evidence/policy/acknowledged_at/recorded_at | ไม่เกิดจากเปิด notification, เปิดไฟล์, assigned หรือ completed |
| assigned     | งานเฉพาะรายการมีผู้รับมอบหมายที่ผ่าน current task/record/source/file policy     | assignment/version/assigner/assignee/context/due/history         | ไม่ grant ไฟล์ลับ และไม่ทำให้คนอื่นรับทราบ                     |
| completed    | งานรายการนั้นผ่านเงื่อนไขเสร็จและหลักฐานตาม policy                              | completion event/actor/time/evidence/verification เมื่อจำเป็น    | ไม่ปิดทุกงานหรือหนังสือทั้งเรื่องโดยอัตโนมัติ                  |

เสนอ delivery_state=queued/delivered และ exception_code/hold แยก, receipt_state=unacknowledged/acknowledged, task_state=pending_access/assigned/in_progress/completed/cancelled โดยค่าเหล่านี้เป็น namespace configuration ของโมดูล ไม่ enum กลางปนกัน หน้าเรื่องแสดง badge ทั้งสามมิติและผู้รับรายคน ไม่ใช้สถานะสูงสุดคนหนึ่งแทนทั้งกลุ่ม delivered อาจยังไม่รับทราบและงานอาจ assigned ก่อน acknowledge ถ้า policy อนุญาต DEMOไม่ถือ assigned/completed เป็น acknowledgement

## 3 สัญญาข้อมูลและการเชื่อม logical04

[DELIVERY_ROUTING_CONTRACT](DELIVERY_ROUTING_CONTRACT.md) ระบุข้อมูล/unique/CAS/worker protocol เพิ่มเติม ทุกตารางที่เสนอเป็น private/RLS deny by default, UUID/FKแบบtyped/RESTRICT, current verified account provenance, effective_at/recorded_at และ audit/outbox ใน transaction ต้อง migration ใหม่หลัง ADR ไม่แก้ migration06หรือสร้างตารางจริงในบทนี้

| ส่วนเสนอ                         | ต้นทางเดิม                          | หน้าที่และข้อจำกัด                                                                                                                                                                   |
| -------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| RoutingIntent / Routing          | routing04 + approved snapshot54     | หนึ่งการส่งที่ผู้ส่งยืนยัน ผูก approved record/file/recipient-plan digest ไม่รับ body/file/template ใหม่จาก client                                                                   |
| ResolvedRecipientSnapshot        | recipient_snapshot04 ต้อง reconcile | intent recipient เป็น Person/Organization/group plan ส่วน endpoint เก็บ account+verified Person+org context+membership provenance ณ send เป็นคนละชั้น ไม่ทำ snapshot สมาชิกปีหลังทับ |
| PortalDelivery / InboxEntry      | routing04 + outbox11                | หนึ่ง inbox entry ต่อ dispatch/endpoint; delivery evidence แยก human Receipt                                                                                                         |
| Receipt                          | receipt04 + operation_receipt กลาง  | unique delivery endpoint และ operation receipt; org representative policy ต้อง explicit ไม่เปลี่ยนทุกสมาชิกเป็นรับทราบ                                                               |
| TaskAssignment / AssignmentEvent | assignment04 + workflow11           | assigned_to/context/due revision/parent link/approved access binding/history; งานหลายเรื่องย่อยให้ account เดิมได้ ไม่ใช้ unique(record_version,assigned_to)ปิดทุกงาน                |
| Notification / Reminder          | notification/outbox11               | pointerขั้นต่ำและ dedupe ตาม business target; seen_at ไม่เป็น acknowledgement                                                                                                        |

logical04 receipt unique(recipient_snapshot_id) ของผู้รับองค์กรคนเดียวไม่พอสำหรับติดตามสมาชิกแต่ละคน ต้อง ADR typed resolved endpoint และแยก representative receipt จาก personal receipt; routing unique(record_version,outbox)ไม่กัน send command ที่เปลี่ยน key ต้อง business unique สำหรับ intent; notification unique(account,outbox)และ assignment unique(version,account)ต้อง reconcile ให้รองรับหลาย endpoint/context/งานย่อยอย่างชัดเจน ยังไม่มี SQL proof

## 4 การยืนยันส่งและ snapshot กลุ่มผู้รับ

ก่อนส่งตรวจ current sender action/scope/session/time/delegation และ guard54 `authorizeApprovedDispatch` โดยใช้ approved snapshot ID/root revision/canonical digest/active permit/current source-record-file ACL/CLEAN/hash/official policy ถ้าแก้หลังอนุมัติหรือมี hold ห้าม enqueue ใหม่ ก่อน enqueue ต้องตรวจสิทธิ์รับงานและ record/source/file policy ของทุก endpoint ด้วย DEMOเริ่มส่งเมื่อครบทุกคน ถ้าไม่ครบให้rejectทั้ง intentก่อนqueued; partialblockedที่ workerเกิดจากสิทธิ์เปลี่ยนหลังenqueue ไม่ใช่ส่งให้คนที่ไม่ผ่านตั้งแต่แรก การส่งไม่สร้าง Correspondence/FileVersion/เลขทะเบียนซ้ำ ไม่เปลี่ยนทะเบียนบุคคลหรือข้อมูล approval เดิม

ผู้รับ Person ต้องมีบัญชีที่เชื่อมตัวตนผ่านนโยบายกลางแล้ว ไม่สร้างบัญชีจากชื่อ/เบอร์ Org recipient ต้องมี versioned resolver plan ที่อนุมัติว่าใครเป็นผู้รับงานสารบรรณ ไม่ถือทุก account ใน org เป็นผู้รับทุกชั้นความลับ DEMOใช้สมาชิกสมมติเท่านั้น ผู้ไม่มีบัญชีหรือไม่มี endpoint ที่ยืนยันให้ blocked พร้อมเหตุผลขั้นต่ำ ไม่ส่ง emailแทนเอง

Group plan ต้องอยู่ใน recipient intent ที่อนุมัติใน54และมี resolver policy ที่อนุญาต send-time expansion หาก approved intent ไม่มีแผนนี้ต้องตรวจ54ใหม่ เมื่อส่ง resolve สมาชิก effective ณ server accepted_at พร้อม membership revision/valid-known-at/context/policy; แสดง count/list/digest ให้ผู้ส่งยืนยันในขอบเขตที่อ่านได้ ก่อน commit resolve/revalidate revision อีกครั้ง ถ้าเปลี่ยนคืน conflict เพื่อยืนยันใหม่ ไม่ใช้ cached/browser list

ข้อเสนอ endpoint dedupe key=(dispatch_id, recipient_account_id, recipient_context_id) โดย context ผูก Organization และverified Person อย่างชัดเจน Direct+group ที่ชี้ endpointเดียวรวมหนึ่ง delivery พร้อม origin refs ทั้งคู่ Accountเดียวคนละ context ยังคง endpointแยก receipt ไม่ข้ามบริบท ต้อง ADR business keyกับเจ้าของงานก่อน native tests

สมาชิกเพิ่มภายหลังไม่มี InboxEntry/receiptหรือ read entitlement ของ dispatchเก่า แม้มี org roleใหม่ Snapshotเก่าเป็น historical identity ไม่เป็นสิทธิ์ถาวร ผู้ที่ออกกลุ่ม/ถูกถอน grant ต้องถูกปฏิเสธตาม current policy โดยคงประวัติส่งไว้ Supplemental recipient หรือการเปลี่ยนผู้รับต้องเป็น intentใหม่ที่ได้รับอนุมัติตาม54/นโยบาย พร้อมเหตุผล ไม่ mutate snapshotเก่าหรือเลือกคนแทนอัตโนมัติ

## 5 การรับทราบและมอบหมาย

`acknowledgeDelivery` ต้องเป็น POST ที่ตรวจ session/CSRF/current action/endpoint ownerหรือ delegationแบบเฉพาะ/record-source-file ACL/CLEAN/delivered version และ expected receipt revision ใช้เวลา server; browser time เป็นข้อมูลประกอบที่ไม่กำหนด acknowledged_at ตรวจ policy method/evidence FileVersion/hash ถ้ารับทราบแทนองค์กรต้อง actor/delegation evidence/method/recipient context และ labelว่าใครรับแทน ไม่มีการอ้างว่าสมาชิกทุกคนรับทราบ

DEMOให้ personal endpoint ยืนยันด้วยตนเองเท่านั้น representative/evidence-import/offline acknowledgement ปิดจน policy และหลักฐานยืนยัน Unique(delivery_id) ป้องกัน receipt ซ้ำแม้เปลี่ยน idempotency key; receiptกับaudit/outbox/operation receipt atomic ตรวจสิทธิ์ปัจจุบันก่อนคืนผล retry เช่นเดียวกับ commandsอื่น ไม่รับ forged recipient_account_id หรือ notified/seen flag เป็นหลักฐาน การแก้ receipt ผิดต้อง correction event ที่มีอำนาจและหลักฐาน ไม่เขียนทับ actor/timeเดิม

`proposeAssignment` ตรวจ assigner action/scope/เวลาและ target verified account/context งานที่สิทธิ์ไฟล์ยังไม่ครบเป็น pending_access proposal เท่านั้น ไม่มี confidential body/ไฟล์ส่งให้ target; `activateAssignment` เป็น assigned ได้เมื่อ policyอนุญาตและ current task+record+source+file ACL+CLEAN+clearanceครบ การมี task linkหรืออยู่ orgเดียวไม่พอ ถ้าต้องเพิ่มสิทธิ์ ให้ workflowกลางตรวจ AccessBinding/approved sharing plan แบบเฉพาะงาน/รุ่น/เวลาแยก maker checker ไม่ grant จากคำว่า assignee

บัญชีที่เพิ่มหลัง send อาจได้รับการมอบหมายแบบ explicit เมื่อมี supplemental access ที่ผ่าน policyครบ ไม่เข้ากลุ่ม snapshotเก่าโดยอัตโนมัติ การเปลี่ยนผู้รับผิดชอบเก็บ assignment supersession/event และ handover evidence ไม่ลบคนเดิม อ่าน/download/completeหลัง revokeต้องปฏิเสธ แม้มีประวัติ assignment; worker/reminderตรวจซ้ำด้วย ส่งงานให้คนอื่นไม่สรุปว่า personนั้นรับทราบหนังสือ

Completion ใช้ evidence/เงื่อนไขงานตาม policyไม่จากเวลาค้างหน้าเว็บ งานหลักที่มีงานย่อยยังคงรายการค้างตาม policyและรายงานแยก ไม่ปิดเรื่องจาก completedรายการเดียว ผู้สร้างคำอนุมัติเพิ่มสิทธิ์หรือ completion verificationที่เป็นงานสำคัญไม่ approveเอง

## 6 Inbox outbox ติดตาม และ reminder

[DELIVERY_WORKSPACE](DELIVERY_WORKSPACE.md) เสนอ private inbox/outbox ผู้ส่งกับ durable outbox ของ11เป็นคนละหน้าที่ ค้น/กรอง/หน้า/งานครบกำหนดตรวจ current scope/field policyก่อน pagination/count ไม่มี public trackingที่เผย subject/recipient/ack/comments ชื่อเต็มหรือเนื้อหาไม่เข้า search log; stale notification pointerต้องตรวจสิทธิ์ก่อนเปิดเรื่อง

Reminder policyมีรุ่น/timezone/calendar/interval/backoff/attempt limits TO VERIFY เวลา server UTCและแสดง พ.ศ./AsiaBangkok Dedupตาม assignment_id+due_revision+window_code+recipient_context+channel ทำงานผ่าน outbox11 ตรวจ current due/task/access/worker delegation ก่อน enqueueและcommit งาน completed/cancelled/เปลี่ยน dueหรือ revokeให้ mark obsolete/hold ไม่ส่งจากคิวเก่า เปิด reminderไม่ ack/complete และไม่สร้างหนังสือใหม่

workerใช้ lease fencing/unique sink+InboxEntry+DeliveryEvent+Notification ใน transactionเดียวตาม11 ข้อรับประกันคือผล portalไม่ซ้ำตาม business keys ไม่อ้างว่าประมวลผลครั้งเดียวหรือ external exactly-once partial group failuresแสดงผู้ส่งราย endpoint กลุ่มสมาชิกไม่ re-resolveตอน retry

Email default disabled ไม่มี provider/channel/consent/verified purpose-address/evidence/signoffจริง ถ้าพัฒนาต่อ ต้องมี approved channel config/verified business address/current recipient rights/ข้อความขั้นต่ำและ portal link ไม่ส่งไฟล์ลับหรือเนื้อหาใน emailจากการมี task/linkอย่างเดียว Provider accepted/bounceไม่เป็น portal deliveredหรือhuman acknowledgement ต้อง receipt/idempotency-provider/reconcile ambiguous outcomes ไม่มีการส่งอีเมลหรือข้อความจริงในรอบ55

## 7 Acceptance ที่ต้องรันจริง

| Case   | หลักฐานที่ต้องได้จริง                                                                  | สถานะ   |
| ------ | -------------------------------------------------------------------------------------- | ------- |
| P55-01 | approved manifest guard/current sender/files/hold/version/forged inputก่อน enqueue     | NOT RUN |
| P55-02 | send retry/keyใหม่/command fingerprint ไม่สร้างเรื่อง/dispatch/เลขซ้ำ                  | NOT RUN |
| P55-03 | send-time group snapshot/direct duplicate/accountหลายcontext/confirmation conflict     | NOT RUN |
| P55-04 | สมาชิกเพิ่มทีหลังไม่มี old inbox/read; สมาชิกถูกถอน current deny/historyยังอยู่        | NOT RUN |
| P55-05 | native worker duplicate/expired lease fence หนึ่ง InboxEntry/eventต่อ endpoint         | NOT RUN |
| P55-06 | crash before commit/after commit response loss/reclaim/replay receiptเดิม              | NOT RUN |
| P55-07 | partial group delivery+blocked endpoint ติดตามรายคน retryไม่ resolveใหม่               | NOT RUN |
| P55-08 | notification seen/preview/download/provideraccepted ไม่สร้าง human receipt             | NOT RUN |
| P55-09 | acknowledge explicit current owner/server time/retry/new key unique receipt            | NOT RUN |
| P55-10 | forged recipient/peer/orgdelegate unverified/no delivered/CSRF ack deny                | NOT RUN |
| P55-11 | representative receipt policy/evidence distinct ไม่รับแทนทุกคน; DEMOdisabled           | NOT RUN |
| P55-12 | assignment pending access ไม่มี body/file; currentครบจึง assigned                      | NOT RUN |
| P55-13 | assignee file/source/clearance/scan revoke API/download/cache/worker deny              | NOT RUN |
| P55-14 | supplemental assignee explicitapprovedaccess/history ไม่ย้อนหลัง group auto grant      | NOT RUN |
| P55-15 | reassignment/due revision/completion evidence/child outstanding/historyไม่หาย          | NOT RUN |
| P55-16 | reminders business dedupe/due changed/completed/revoked/old leaseไม่ส่ง                | NOT RUN |
| P55-17 | inbox/outbox/search/count/pagination/exports currentscope fieldprivacy logminimization | NOT RUN |
| P55-18 | private tracking guessed UUID/search/cache/notification ไม่เปิดเรื่องหรือไฟล์          | NOT RUN |
| P55-19 | emaildisabled/unknownconfig/provider ambiguous ไม่actualsendหรือhumanack               | NOT RUN |
| P55-20 | Thai keyboard/empty/conflict/status5ความหมาย/4viewports ไม่ใช้colorอย่างเดียว          | NOT RUN |

[fixture55](fixtures/document-delivery-55-plan.json) เป็น PLAN_ONLY expected events/predicates/constraintsเท่านั้น actual=NULL/executed=false หลักฐาน nativeสองconnections/barrier/faults/SQLSTATE/DBversions/migrationhash/actor/currentpolicy/sink/API/UIต้องเติมจาก runtime ที่พร้อม เกณฑ์55-01 mapP55-01–11/15–16/19 และ55-02 mapP55-01/04/10–14/17–18 ทั้งคู่ **BLOCKED / NOT RUN** ไม่มี portal delivery/receipt/assignment/reminder จริง ไม่เริ่ม56
