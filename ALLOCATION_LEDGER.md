# Ledger จัดสรรและข้อบังคับการโอน — บท 42

รุ่น 0.1 | 5 ตุลาคม 2569 (2026-10-05) | source `80e0331` | **Proposal / BLOCKED — ไม่มี model, migration, RPC หรือ posting service จริง**

## 1 แยกสัญญาแต่ละชั้น

[แผนงบ](BUDGET_PLANNING.md) เป็นสิ่งที่เสนอ [คำอนุมัติ](BUDGET_APPROVALS.md) อนุมัติ payload รุ่นหนึ่ง Ledger บันทึกผลปรับที่โพสต์จริง ส่วน projection เก็บยอดจากเหตุการณ์เพื่อใช้ตรวจ transaction บท41 AllocationVersion เป็นยอดเป้าหมายทั้งก้อน เช่น100.00→120.00; ledger event เป็น delta +20.00 ไม่โพสต์ +120.00 ซ้ำกับ +100.00 และไม่ sum snapshots เป็น220.00

allocation ใน logical04 อ้าง budget_event ต้องทบทวนให้ทำหน้าที่ delta posting ไม่สร้าง ledger ซ้อนที่นับเงินสองครั้ง budget_posting/period_close/reservation/obligation/disbursement ยังไม่มี runtime; รอบ42กำหนด interface ใช้ยอดใช้เงินเดิม ไม่สร้างระบบจอง/เบิก/บัญชีทางการล่วงหน้า

## 2 Data contract เสนอ

| Model/ตารางเสนอ                | Fields และ keys                                                                                                                                                                                                                     | การเปลี่ยนแปลงที่อนุญาต                                                                  |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| BudgetEvent / budget_event     | UUID, org/FY/currency context, request/version/hash, workflow decision, kind, policy/version, effective_on DATE, recorded_at TIMESTAMPTZ, maker/checker refs, reason, evidence file/version/hash, correlation_id, reverses_event_id | append posted event; unique(approved_request_version_id); update/delete posted ต้อง deny |
| AllocationPosting / allocation | UUID, event_id, line_id, leg_no, signed delta NUMERIC(20,2), currency_code, allocation_version_id                                                                                                                                   | unique(event_id,leg_no), composite context FK; transfer มีสอง legs เท่านั้นและผลรวม0     |
| BudgetBalance / budget_balance | line_id PK, context/currency, allocated_net, reserved_open, obligated_unpaid, spent_recorded NUMERIC(20,2), row_version, ledger_sequence                                                                                            | projection ที่ rebuild/reconcile จาก immutable ledger ได้; update เฉพาะ posting boundary |
| BudgetOperationReceipt         | actor/action/idempotency_key, request_hash, event_id/result ref, recorded_at                                                                                                                                                        | unique(actor,action,idempotency_key); receipt/event/audit/outbox atomic                  |
| Future activation record       | approved_request_version_id unique, effective_on, activation event ref                                                                                                                                                              | เมื่อถึงวันจริงค่อยโพสต์; approved future request ยังไม่เป็น current balance             |

ทุก UUID/FK อ้าง Person/Organization/FiscalYear/PolicyVersion/Document/บัญชี/decision กลาง composite UNIQUE ต้องอยู่ parent ก่อน FK ไม่มี schema/DDL จริงในเอกสารนี้ AllocationPosting.delta ยอมลบได้เฉพาะ signed delta; user amount ยังคง positive canonical string/ขอบเขต41 ค่า0เป็น no-op ที่ไม่โพสต์ event; amounts ต่าง currency หรือ overflowต้อง reject

Projection buckets nonnegative และ finite; available = allocated_net - reserved_open - obligated_unpaid - spent_recorded >= 0 ไม่หักจองที่เปลี่ยนเป็นผูกพันซ้ำ source amount ต้อง <= available ที่ตรวจภายใต้ lock ไม่ใช่ยอดแสดงในหน้า รายได้คาดการณ์ไม่รวม allocated_net ข้อมูลการใช้ที่ไม่ทราบ/ยัง reconcile ไม่ได้ต้อง deny การลดหรือโอน ไม่สมมติว่าใช้เงินเป็น0

## 3 ข้อบังคับบริการและฐานข้อมูลที่ต้องสร้างจริง

| Ref    | ข้อบังคับเสนอ                                                                                                                                       | หลักฐานตรวจที่ต้องได้                                                   |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| K42-01 | canonical scale/currency/range ก่อน cast; signed delta จาก server ไม่รับ arbitrary legs จาก client                                                  | API และ restricted SQL writer ปฏิเสธ bypass                             |
| K42-02 | unique request version→event, receipt key→request hash, event+leg                                                                                   | retry/concurrent duplicate มี event เดียว                               |
| K42-03 | composite org/FY/source/line/currency/decision/hash context และ current approval/policy                                                             | เปลี่ยน ID/body ข้ามบริบทโพสต์ไม่ได้                                    |
| K42-04 | CHECK finite/nonnegative projection buckets และ available>=0; typed amount bounds                                                                   | SQL write เกินยอดผิด constraint แม้ serviceมีbug                        |
| K42-05 | deferred constraint trigger/controlled DB posting routine ตรวจ leg cardinality/context/conservation และ sealed payload                              | transfer มีสองlegs -amount/+amount sum0; incomplete legs rollback       |
| K42-06 | posting routine lock balance/approval state ของทุก line ตาม UUID ลำดับเดียว ตรวจ current state ใหม่ แล้ว ledger+balance+receipt+audit+outbox atomic | nativeหลายconnections/barrier ไม่มี write skew/overdraw/partial posting |
| K42-07 | posted history immutable, compensation reference, unique reversal authorization; ไม่มี cascade delete                                               | เพิ่ม event ใหม่ยังอ่านหลักฐานเดิมได้                                   |
| K42-08 | runtime rolesไม่มี direct INSERT/UPDATE/DELETE ledger/projection; RLSทุกตาราง; RPC ตรวจ actor/current business scope/action/delegation              | direct SQL/worker/service credentialsไม่เพิ่ม grantเอง                  |

CHECK หนึ่งแถวไม่สามารถใช้รับประกันผลรวมของหลาย posting แถวได้ จึงต้องมี transaction boundary และการตรวจ cross-row ในฐานด้วย ดู [PostgreSQL18 Constraints](https://www.postgresql.org/docs/18/ddl-constraints.html) และ [Explicit Locking](https://www.postgresql.org/docs/18/explicit-locking.html) Proposalนี้ไม่ใช่ผลพิสูจน์ native constraints

หากใช้ SECURITY DEFINER ต้อง fixed safe search_path/schema-qualified refs, ownerที่ไม่ใช่ runtime, REVOKE PUBLIC execute และสิทธิ์เฉพาะ routine/actor ที่จำเป็น verified request contextต้องไม่ปลอมได้ด้วยการ SET user_id เอง DB bypassRLSไม่เป็นธุรกิจ grant routineต้องตรวจ account/current roles/current approvalใหม่ งานอื่นที่แก้ balance/status/revoke ต้องใช้ lock protocol เดียวกัน หรือเลือก SERIALIZABLEพร้อม bounded full-transaction retry ตาม ADR ไม่ให้ service กับ routine ต่างถือ lock orderกัน

## 4 Transaction และการกลับรายการ

1. ตรวจ actor account/grants/current policy และ request sealed hash ฝั่ง server; idempotency receipt เดิมจะคืนได้ต่อเมื่อ actor ยังอ่านผลนั้นได้ ไม่ใช้ receipt หลบ revoke
2. เปิด transaction จอง receipt แบบ unique/ตรวจ request hash; lock shared authorization/approval state และ line balance ทุกตัวตาม global order เมื่อรอ lockแล้วตรวจ revision/current constraints ใหม่
3. ตรวจ approved effective plan และ allocation version, funds restrictions, evidence CLEAN/ACL, effective_on และต้นทางปลายทางทั้งหมด ไม่มี fallback unknown policy ผู้สร้าง/ผู้ยื่น/ผู้แก้สาระสำคัญไม่ approve
4. initial/increase เพิ่ม delta ตามคำอนุมัติ; decrease ลดได้ไม่ต่ำกว่ายอดใช้คงค้าง; transfer debit/credit amountเดียวใน context ที่policyอนุญาต default deny cross-FY/cross-source/cross-currency/cross-org ไม่มี conversion หรือย้ายยอดใช้ตามไปเงียบ ๆ
5. INSERT event/legs อัปเดต projection CAS/sequence ตรวจ constraints เขียน audit/outbox/receipt และ commit ครั้งเดียว failureใด rollbackทั้งสองฝั่ง ไม่ส่งแจ้งเตือนก่อน commit
6. conflict เปลี่ยนยอด/รุ่นระหว่างตรวจให้409ภาษาไทยและโหลดยอดใหม่ การ retry deadlock/serialization ต้องทั้ง transaction key/hashเดิม bounded ไม่ auto-approve payload ที่เปลี่ยนหรือ retryข้อห้ามธุรกิจ
7. worker activation/outbox ตรวจสิทธิ์ปัจจุบัน/คำอนุมัติ/วันที่/หลักฐานอีกครั้ง receipt dedupe แม้หยุดก่อนack notification sinkdevไม่มีส่งออกจริง

อนุมัติไม่ได้เท่ากับใช้เงินได้: ต้องถึง effective_on และโพสต์สำเร็จ future approval ยังไม่เพิ่ม current available queryอนาคตเป็นรายการอนุมัติที่คาดว่าจะมีผลแยกจากยอดใช้ได้จริง ห้ามแสดงวงเงินอนาคตเป็นเงินพร้อมจอง jobล่าช้าต้องแสดงรอ activation ไม่backdateแล้วอ้างว่าเงินจริงพร้อมก่อน commit

กลับรายการใช้คำขอ REVERSAL ใหม่ maker checker/หลักฐาน อ้าง event เดิมและเหตุผล อาจต้องจัดการผลกระทบก่อนถ้าเงินฝั่งรับถูกใช้แล้ว ให้denyการคืนที่ทำ availableติดลบ ไม่ restore ทุกยอดหรือสิทธิ์อัตโนมัติ ไม่ลบ eventผิด ไม่แก้ recorded_atเดิม

## 5 ตัวอย่างสมมติและข้อจำกัด

[budget-42-plan.json](fixtures/budget-42-plan.json) ไม่ใช่ seed หรือ runtime config มีต้นทางจัดสรร100.00 จองคงค้าง20.00 available80.00 และปลายทาง0.00 โอน60.00ได้ต้นทาง40.00/available20.00 ปลายทาง60.00/available60.00 โอนอีก30.00ต้องdeny; ยอดใช้20.00คงเดิม อีกตัวอย่างสองคำขอโอน60.00แข่งกันจากavailable80.00ได้เพียงหนึ่งคำขอ ตัวอย่างลำดับนี้ไม่พิสูจน์ concurrencyจริง ต้อง nativeDBหลายconnection

การลด10.00เป็น90.00ไม่แก้ initial event100.00 ยอดใหม่มาจากdelta-10.00 SnapshotAllocationVersion90.00เป็นหลักฐานยอดเป้าหมาย ไม่เป็นposting+90.00 รายงาน sum eventsตามวันมีผล/recorded window/currency ไม่ sum version targets

ไม่มี migration ledger/RPC/RLS/API/service/UI จริง เกณฑ์โอนพร้อมกันและโอนเกินยอด **BLOCKED / NOT RUN** DB-06และ41ต้องพร้อมก่อน จอง/ผูกพัน/เบิกบริการจริงยังขาดและไม่เปิดให้ใช้ mock zero ยอดแทน
