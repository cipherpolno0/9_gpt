# ยืม คืน ซ่อม และส่งมอบครุภัณฑ์ — บท 50

รุ่น 0.1 | 8 ตุลาคม 2569 (2026-10-08) | source `3441054` | **Proposal / BLOCKED: ยังไม่มี services, UI หรือ migration ของวงจรครุภัณฑ์**

บท49ยังไม่ผ่าน คำสั่ง `corepack pnpm db:test` รอบ50จบด้วย exit1 และยังไม่มีทะเบียนครุภัณฑ์/current Auth-DAL/files/workflow ธุรกิจ จึงจัดทำสัญญาและ [ข้อมูลสมมติ](fixtures/asset-lifecycle-50-plan.json) เท่านั้น อ่าน [INVENTORY_SCHEMA](INVENTORY_SCHEMA.md), [STOCK_LEDGER](STOCK_LEDGER.md), [ประวัติผู้รับผิดชอบ](ASSET_CUSTODY_HISTORY.md) และ [หน้าและแผนตรวจรับ](ASSET_LIFECYCLE_WORKSPACE.md) ร่วมกัน ไม่มีการสร้างทะเบียนหรือบัญชีอีกชุด

## 1 แนวคิดทีละขั้น

1. **เจ้าของทรัพย์สิน** คือ Organization ตามทะเบียน47 ส่วน **ผู้รับผิดชอบหลัก** คือ Person ตาม AssetAssignment ไม่จำเป็นต้องเป็นคนที่ถือของอยู่ขณะนี้
2. **ผู้ยืม** ถือของชั่วคราวผ่าน Loan การยืมไม่เปลี่ยนเจ้าของหรือผู้รับผิดชอบหลักโดยปริยาย ส่งมอบจริงจึงบันทึกผู้ถือของและที่ตั้งใหม่
3. **ได้รับของคืน** ยังไม่เท่ากับ **ตรวจผ่านและพร้อมยืม** ระหว่างรอตรวจต้องปิดการให้ยืม หากเสียหายให้ติดตามการซ่อมและข้อเรียกร้องแยกกัน
4. **ราคาซ่อม** แยกราคาประมาณ ค่าใช้จ่ายตรวจรับ และยอดจ่ายจริง การกรอกค่าซ่อมหรือปิดงานซ่อมไม่สร้างการเบิกจ่ายเอง

## 2 Models และการใช้ตารางเดิม

ทั้งหมดเป็นข้อเสนอ private/RLS deny by default ใช้ UUID, row_version, Person/Organization/StockLocation หรือ OrganizationLocation ที่มีหลักฐาน, Document/FileVersion กลาง และ FK แบบ RESTRICT ตรวจ context ฝั่งserverและDBเมื่อสร้างจริง

| Model / table เสนอ                                   | ข้อมูลและข้อบังคับที่ต้องพัฒนา                                                                                                                                                                |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AssetAssignment / asset_assignment เดิม              | asset/person/org/assignment_kind/ช่วงวันมีผล/วันบันทึก/คำอนุมัติ/หลักฐาน/รุ่นและรายการแทน; PRIMARY_CUSTODIAN ของ DEMOมีได้หนึ่งคนต่อช่วง ไม่ใช้ key(asset,person) อ้างว่ากันสองคนแล้ว         |
| Loan / loan เดิม                                     | asset/borrower Person/borrower Organization/วัตถุประสงค์/due_at/status/approved_revision/hash/reserved_at/handed_over_at/return_received_at/closed_at/evidence; ใช้บัญชีกลางและworkflow11     |
| Return / asset_return ใหม่                           | loan/asset/received_by/received_at/ที่ตั้งรับคืน/สภาพ/อุปกรณ์ประกอบ/ผลตรวจ/ผู้ตรวจและผู้รับรอง/หลักฐาน/รุ่น/blocking_case_state/resolution_version; แยกรับคืนทางกายภาพจากตรวจรับสมบูรณ์       |
| Maintenance / maintenance เดิม                       | asset/request/status/condition/ผู้รับผิดชอบ/ผู้ให้บริการ Supplier48/start/expected_end/actual_end/ราคาประมาณและรับรอง/currency/FY/budget refs/evidence; ค่าไม่ทราบเป็นNULL+เหตุผล ไม่กรอก0แทน |
| AssetLocationHistory / asset_location_history ใหม่   | asset/typed place ref/physical holder Personหรือcustody purpose/ช่วงมีผล/recorded_at/replaces/evidence/source event; pinชื่อและที่ตั้งรุ่นที่ใช้ ไม่เดาที่อยู่หรือสร้างคลังปลอม               |
| AssetLifecycleEvent / asset_lifecycle_event ใหม่     | เหตุการณ์ immutable ตาม source/version/วันมีผล/วันบันทึก/ผู้กระทำ/เหตุผล/หลักฐาน/correlation; แก้ด้วยเหตุการณ์ใหม่                                                                            |
| AssetOperationReceipt / asset_operation_receipt ใหม่ | actor/action/idempotency key/request hash/result refs และ unique business-operation binding; receiptธุรกิจใช้ร่วม protocol11/47/49 ไม่เป็นทะเบียนใหม่                                         |

logical04มี asset_assignment/loan/maintenance แต่ยังไม่มี Return/AssetLocationHistory/events/receipts จริง ต้อง ADR reconcile ก่อนเพิ่ม schema/migrations โดยเฉพาะ loanเดิม unique(asset_id) WHERE returned_at IS NULL AND is_active ไม่รู้จัก draft/reservation/คืนรอตรวจ ห้ามใช้ returned_at หรือ soft inactive ปลดล็อกของที่ยังค้างส่งมอบ ส่วน maintenanceเดิมยังไม่มีช่วงเวลาหรือcross-state guardครบ

## 3 คำขอกับการครอบครองจริง

| ขั้น                               | การกระทำเสนอ                                                                  | ผลต่อความพร้อมของชิ้น                                                          |
| ---------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| DRAFT / SUBMITTED / RETURNED       | ร่าง ส่งตรวจ หรือส่งกลับแก้ผ่าน workflowกลาง/CAS                              | ยังไม่ส่งมอบ ไม่มีผู้ยืมถือของจากการกดส่ง                                      |
| APPROVED_RESERVED                  | ผู้มีอำนาจต่างจากผู้สร้างอนุมัติรุ่นที่ตรวจแล้ว พร้อม claimชิ้นใน transaction | ปิดการอนุมัติยืมซ้ำ; reservation timeout/cancel ต้องคำสั่งหรือกฎที่ยืนยัน      |
| HANDED_OVER                        | ผู้มีสิทธิ์ส่งมอบและผู้รับยืนยัน หลักฐานCLEAN                                 | Loan active และที่ตั้ง/physical holderเปลี่ยน ผู้รับผิดชอบหลักคงเดิม           |
| RETURN_RECEIVED_PENDING_INSPECTION | รับคืนทางกายภาพและบันทึกสภาพเบื้องต้น                                         | ยังยืมไม่ได้; ผู้รับคืนดูแลของในที่ตั้งรับคืน ไม่ถือว่าผู้ยืมยังถือของอยู่     |
| CLOSED หลังตรวจ                    | ตรวจครบและผู้รับรองยืนยันผล/ผู้รับของ/ที่ตั้ง                                 | Loanทางกายภาพจบ แต่ของเสียหาย/ข้อเรียกร้อง/repair holdยังห้ามยืม               |
| REJECTED / CANCELLED ก่อนส่งมอบ    | บันทึกเหตุผลและปลด reservationตามคำอนุมัติ                                    | ไม่ลบหลักฐาน; ถ้าส่งมอบแล้วต้องใช้ return/recovery ไม่cancelให้เหมือนไม่เคยยืม |

ค้างคืนคำนวณจากเวลาของserver: handed_overแล้ว ยังไม่received_return และ now>due_at ต้องแสดงข้อความพร้อมวันครบกำหนด ไม่เปลี่ยนของให้พร้อมยืมเพราะหมดกำหนด เมื่อรับคืนแล้วแสดงรอตรวจแทนค้างส่งคืน ส่วนภาระเสียหาย/ข้อเรียกร้องเป็นอีกสถานะใน Return case พร้อมรายการ resolutionที่ได้รับอนุมัติ ไม่จบเพราะ Loan CLOSED และไม่สร้างหนี้หรือผู้รับผิดชอบชดใช้จาก flagนี้เอง

ผู้ยืมไม่มีบัญชีใช้อ้าง Person กลางที่ยืนยันแล้ว พร้อมผู้ทำรายการที่มีอำนาจแทนตามpolicy ไม่สร้าง login จากชื่อผู้ยืม การย้าย ลาออก หรือบัญชีถูกระงับแจ้งผู้มีหน้าที่ให้จัดการส่งมอบ/ติดตามคืน ไม่สร้างการคืนหรือผู้รับผิดชอบใหม่เอง หากผู้ยืมหมดสิทธิ์เว็บให้ผู้รับคืนที่ยังมีอำนาจดำเนินการตามหลักฐานได้

## 4 ป้องกันยืมซ้ำและงานแข่ง

ความพร้อมต้อง derive จากทะเบียน/sourceเหตุการณ์ที่มีผล: ชิ้นactive/สภาพพร้อม ไม่มี reservation หรือ Loanค้าง ไม่มี returnรอตรวจ maintenance/repair hold ข้อเรียกร้องที่ปิดความพร้อม หรือสถานะจำหน่ายที่มีผล ไม่ใช้ checkbox AVAILABLE จากclient และไม่เปิดยืมชิ้นจำหน่ายแล้วแม้ Loanเก่าปิด บท50อ่าน disposal status47ตามหลักฐานเท่านั้น ไม่ implementการจำหน่ายล่วงหน้า

ทุก writer ใช้ assetแถวกลางเป็นจุดlockเดียว รวม approve/reserve, handover, return, inspect, start/end/release repair, change custody/location และการอ่านสถานะจำหน่ายที่ยืนยัน ห้ามใช้checkข้ามตารางใน CHECK constraint ต้องเลือก scoped transaction + DB guards/limited writer และnative proofผ่านADR

ข้อเสนอDB: unique(asset_id) สำหรับ Loanที่ยังถือ claimในสถานะ APPROVED_RESERVED/HANDED_OVER/RETURN_RECEIVED_PENDING_INSPECTION ไม่รวม draft/rejected/cancelled/closed; timelineของprimary custodyต้องไม่ทับที่ asset+assignment_kind ไม่ใช่ asset+person ตลอดช่วงcurrent knowledge ห้ามใช้ now() เป็นpartial-index predicateเพื่อปลด overdue

การยืมกับซ่อมคนละตารางต้อง lockassetเดียวกันก่อนอ่านcurrentstateแล้วเขียน และยืนยันทุกช่องทาง direct limitedSQL/worker ไม่มีสิทธิ์ข้าม service protocol UniqueLoanอย่างเดียวไม่กันmaintenanceแข่ง การซ่อมของที่ยังอยู่นอกสถานที่ต้อง intake/return/recoveryที่มีหลักฐาน ไม่ซ่อนผู้ถือครองเดิมด้วยสถานะซ่อม

ใช้global lock orderเดียวกับ43/44/45/48/49เมื่อแตะงบ/order/source แล้ว lockasset IDsเรียงลำดับ; reread state/version/current account/grants/delegation/filesหลังlock transactionเดียวบันทึกdecision/source claim/loan/return/maintenance/custody/location/events/projection/operationreceipt/audit/outboxที่เกี่ยวข้อง ถ้าfailก่อนcommitไม่มีผลบางส่วน ถ้าcommitแล้วresponseหาย retryคืนreceiptเดิมตามสิทธิ์อ่านปัจจุบัน ต่างhashconflict และnewkeyไม่สร้างbusiness operationเดิมซ้ำ

maker checkerตรวจผู้สร้าง/ผู้แก้สาระสำคัญ/ผู้ตรวจ/ผู้อนุมัติตามpolicyที่มีรุ่น เทคนิคไม่เป็นผู้อนุมัติธุรกิจ current permission/scopeตามเวลาใช้กับ read/edit/approve/export/download และworkerทั้งต้นทางปลายทาง หลักฐานต้องCLEAN+ACLของรุ่นที่อนุมัติ ไม่ถือว่าอ่านassetได้แล้วอ่านเอกสารทุกใบได้

## 5 ซ่อมและเชื่อมงบ

Maintenance แยก REQUESTED/APPROVED_HOLD/IN_PROGRESS/RETURNED_PENDING_INSPECTION/CLOSED โดย repair holdปิดการยืม การคืนจากผู้ซ่อมหรือถึง expected_end ไม่ปลด holdเอง ต้องตรวจสภาพและยืนยันคืนความพร้อมจากserver หากมี open claim/conditionไม่ผ่านให้ยังUNAVAILABLE แม้เวลา actual_endบันทึกแล้ว

เก็บ estimated_cost/accepted_cost/paid_refs แยกกัน เงินเป็น exact NUMERIC(20,2)/canonical decimal string และcurrency/rounding policy41; ตัวอย่าง1200.50+299.50=1500.00 ไม่มี binaryfloat ภาษี/วงเงิน/ความรับผิดชอบค่าเสียหายยังTO VERIFY ไม่เดาว่าผู้ยืมต้องจ่ายเอง

รายจ่ายที่ได้รับอนุมัติอ้าง procurement48→reservation/obligation43→claim/certification/payment44 และงวด45 รวม due dates/source hashes/evidence ไม่สร้างledgerเงินในmaintenance และไม่สร้างpaymentจากGET/repair status การรับคืนจากซ่อมกับวันจ่ายยังเป็นคนละเหตุการณ์ Unknownauthority/policyหรือadapterยังไม่พร้อมปิดการpostงบ แต่เก็บdraftคำขอได้ตามสิทธิ์

## 6 เวอร์ชันและขอบเขตตรวจรับ

package/schema0.6.0 Prisma7.10.0 Next16.3.8 pnpm11.28.2 lockfile9 core19models/213scalarfields migrationเดียว `20261003130000_core_foundation` SHA256 `04a149fcd349f0ac3f1b5929cfcf571f8b0880541e84a40ad929054b67d72756` คงเดิม ไม่มีmodels/migrations/seed/RLS/services/UIใหม่ ไม่มีธนาคาร NBMS หรือ e-GP integration

แหล่งเทคนิคออกแบบ: [PostgreSQL18 constraints](https://www.postgresql.org/docs/18/ddl-constraints.html) สำหรับ partialunique/cross-tableข้อจำกัด และ [row locking](https://www.postgresql.org/docs/18/explicit-locking.html) สำหรับการserializeการเปลี่ยนชิ้นเดียวกัน ไม่ใช่ผลทดสอบของแอป

ทุก P50-01–18 **NOT RUN** เกณฑ์50ทั้งสอง **BLOCKED** ต้อง49/47/ส่วนกลาง/ADR/nativeDB/บริการจริงและนโยบายก่อนตรวจรับ ไม่เริ่มบท51
