# แผนงบ การเสนอ และการตรวจ — บท 42

รุ่น 0.1 | 5 ตุลาคม 2569 (2026-10-05) | source `80e0331` | **Proposal / BLOCKED / PLAN ONLY**

## 1 สิ่งที่ทำได้ในรอบนี้

บท41ยังไม่ผ่าน มีเฉพาะ [โครงสร้าง](BUDGET_SCHEMA.md), [พจนานุกรม](BUDGET_DATA_DICTIONARY.md), [นโยบายเงิน](BUDGET_POLICY_CONFIG.md) ไม่มี BudgetPlan/BudgetLine/AllocationVersion ใน Prisma และไม่มี auth/DAL/workflow/files ที่ทำงานจริง รอบ42 `corepack pnpm db:test` exit1; Docker CLI/socketไม่มี TCPทดลอง5432/5546refused จึงยังไม่มีหน้าร่างแผน การอนุมัติ หรือ ledger ที่ใช้งานได้ เอกสารนี้เป็นข้อกำหนดหน้าจอและบริการเพื่อทบทวน ไม่ใช่ UI ที่สร้างแล้ว

แผนคือสิ่งที่เสนอให้ใช้เงิน ส่วนจัดสรรคืออำนาจใช้เงินที่อนุมัติและมีผลแล้ว การส่งแผนไม่เพิ่มยอดจัดสรร การเพิ่ม ลด หรือโอนใช้คำขอปรับงบที่มีรุ่นและหลักฐาน ไม่แก้ยอดตั้งต้นทับเมื่อมีรายการใช้แล้ว ดู [ALLOCATION_LEDGER](ALLOCATION_LEDGER.md) และ [BUDGET_APPROVALS](BUDGET_APPROVALS.md)

## 2 หน้าจอที่เสนอ — ยังไม่มี routes เหล่านี้

| หน้าเสนอ                              | งานและข้อมูล                                                                                | เงื่อนไขฝั่ง server                                                            |
| ------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `/app/budget/plans`                   | ค้นหน่วยงาน ปีงบ โครงการ แหล่งเงิน สถานะแผนและคำขอ แบ่งหน้า                                 | current read scope; org filter ไม่ให้ grant; private/no-store                  |
| `/app/budget/plans/new`               | เลือกหน่วยงานที่มีสิทธิ์ ปีงบ โครงการ/ปีการศึกษาที่อ้าง แหล่งเงิน ศูนย์ต้นทุน และรุ่นนโยบาย | resolve UUID จากข้อมูลกลาง ตรวจบริบทซ้ำ ไม่เชื่อ org_id จาก client             |
| `/app/budget/plans/{id}/edit`         | รายการรายได้คาดการณ์และรายจ่าย จำนวนเงิน currency เหตุผล ช่วงใช้ เอกสาร                     | maker/editor grant, draft/returned และ expected_revision; ไม่มี float/coercion |
| `/app/budget/plans/{id}/review`       | อ่านรุ่นก่อนหลัง ข้อบกพร่อง ยอดรวมตาม currency ข้อจำกัดแหล่งเงิน เอกสาร                     | reviewer scope + file ACL ปัจจุบัน; read ไม่เท่ากับ approve                    |
| `/app/budget/adjustments/{id}`        | เสนอเพิ่ม ลด โอน ระบุต้นทาง/ปลายทาง เหตุผล หลักฐาน วันมีผล และติดตาม                        | current grants ทั้งสองฝั่ง; TO VERIFY ปิด official; คำขอยังไม่โพสต์เงิน        |
| `/app/budget/reports/plan-allocation` | เปรียบเทียบแผนรายจ่ายที่อนุมัติกับจัดสรรสุทธิ ณ วันที่ และ audit ของทุกรุ่น                 | scope/field/export policy เดียวกับหน้าจอ ไม่มี public budget endpoint          |

ใช้ layouts/tokens/ปุ่ม/ตาราง/ฟอร์มกลางจากบท09เมื่อพร้อม ไม่สร้างหน้าติดต่อ login บัญชี หรือ engine อนุมัติอีกชุด Labels ไทย ฟอร์มมี error summary เชื่อม field ด้วย aria-describedby โฟกัสไปข้อผิดพลาดแรกและคืนโฟกัสหลัง modal ปุ่มไม่พึ่งสีอย่างเดียว จำนวนเงินรับข้อความ แสดง currency ชัด วันที่ พ.ศ. เป็นชั้นแสดงผล Date-only และวันตัดรอบ Asia/Bangkok ตามนโยบาย ตรวจจริง375/768/1024/1440และkeyboardก่อนผ่าน ไม่มีผล browser รอบนี้

## 3 สัญญาข้อมูลที่ต้องเพิ่มผ่าน ADR/migration เมื่อ dependency พร้อม

BudgetPlan/BudgetLine/AllocationVersion จาก41ยังเป็น Proposal ต้องทบทวนพร้อม logical04 ไม่สร้างตารางซ้ำชื่อเพื่อหลบข้อจำกัดเดิม

| Delta เสนอ                                | Fields/keys ที่จำเป็น                                                                                                                                                                                                                                            | หน้าที่                                                                         |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| BudgetEstimateItem / budget_estimate_item | UUID, plan_version_id, organization_id, item_code, kind REVENUE/EXPENSE, project_id, funding_source_id, cost_center_id, category_code_id/code_set, amount NUMERIC(20,2), currency_code, valid_from_on/valid_to_on, row_version, actors/timestamps, evidence refs | รายได้คาดการณ์ไม่เป็นเงินพร้อมใช้; รายจ่ายเป็นวงเงินเสนอ ไม่เป็น ledger balance |
| BudgetPlan review snapshot                | sealed payload/hash, estimate item versions, policy/evidence pins, workflow_instance_id, recorded_at, version_no                                                                                                                                                 | อนุมัติสิ่งที่ตรวจจริง ไม่รับ item แก้ใหม่หลัง seal                             |
| Budget adjustment request                 | UUID, kind INITIAL/INCREASE/DECREASE/TRANSFER/REVERSAL, source/destination line refs, canonical amount, policy version, reason, effective_on, workflow ref, approved hash, row_version, maker                                                                    | คำขอปรับ ไม่ใช่ posted event; fields/constraint ของ ledger อยู่เอกสารร่วม       |

BudgetEstimateItem unique(plan_version_id,item_code); composite FK ผูก plan/org/project/source/currency/category และ parent UNIQUE ตาม41 รายการ EXPENSE ที่ผ่านอนุมัติ map ไป BudgetLine แบบ unique(approved_estimate_item_id) ภายใต้ transaction ที่ตรวจ policy; REVENUE ไม่สร้างงบจัดสรรโดยอัตโนมัติ Category code set แยกและตรวจชนิดตามนโยบาย ไม่ใช้ code_set เดียวโดยเดาว่ารายได้กับรายจ่ายใช้หมวดเดียวกัน

amount เป็น nonnegative finite canonical string ผ่านทุกชั้นและ NUMERIC(20,2) ในฐาน ยอดรวมรายได้กับรายจ่ายแยกต่อ currency/source ไม่ net กันเพื่อเปิดจองงบ รายได้จริง การรับเงิน ภาษี อัตรา หรือ bank integration ไม่อยู่ใน42 การประมาณรายได้1000.00ไม่เป็นหลักฐานว่าแหล่งเงินมีเงินรับรอง1000.00

## 4 การบันทึกและเสนอ

1. server resolve actor/account/current grants ตรวจ plan/item/organization/fiscal year/source/project และวันที่จากฐาน; client IDs เป็นตัวเลือก ไม่เป็น grant
2. validate fields ตามชนิด item และนโยบายมีรุ่น เช่น reason/window/source/currency/category/evidence; draft ขาดข้อมูลได้เฉพาะที่นโยบายอนุญาต ส่งต้องครบและเอกสาร CLEAN/current ACL
3. save draft ใช้ expected_revision และ CAS; stale ให้ conflict พร้อมวิธีโหลดรุ่นล่าสุด ไม่ทับหรือรวมเงินอัตโนมัติ Idempotency receipt เก็บ request hash ไม่เก็บ secret
4. submit seal payload/item versions/policy/evidence hashes สร้าง workflow กลาง เลขติดตามคาดเดาไม่ได้ audit และ outbox ใน transaction เดียว retry key เดิมคืนเรื่องเดิม key เดิมแต่ payloadต่างให้ conflict
5. returned correction เปิด revision ใหม่ ผูก submission ใหม่กับรุ่นเดิม เก็บคำตัดสินเดิม ไม่เปลี่ยนรายการ approved; ต้องตรวจใหม่ก่อนอนุมัติ
6. plan approval ไม่เป็น posting จัดสรรเสมอไป Initial allocation ต้องมีคำอนุมัติที่ครอบคลุมรายการและยอดพร้อมหลักฐานแหล่งเงินตาม config; ไม่ใช้ status approved อย่างเดียวเป็นสิทธิ์จอง

## 5 รายงานที่ตรวจย้อนกลับได้

pin ปีงบ/แผน/รุ่นที่อนุมัติ/โครงการ/แหล่งเงิน/currency/วันอ้างอิงและเวลา recorded_at รายงานแยกยอดรายได้คาดการณ์ แผนรายจ่าย จัดสรรสุทธิ จองคงค้าง ภาระยังไม่จ่าย ค่าใช้จ่ายบันทึกแล้ว และยอดพร้อมใช้ สูตรเดียวกับ BLUEPRINT ไม่รวม snapshot ทุกรุ่นเป็นเงินอีกครั้ง

ส่วนต่างจัดสรรกับแผนรายจ่าย = จัดสรรสุทธิ - แผนรายจ่ายที่อนุมัติ เปรียบเทียบเฉพาะ dimension/currency/window ที่ตรงกัน รายได้คาดการณ์ไม่ใช่ฐานคำนวณยอดพร้อมใช้ รายงาน ณ วันที่ต้องไม่รวม event อนาคต รายงานตามข้อมูลที่ทราบขณะบันทึกแยกจากรายงานย้อนหลังที่รวมรายการแก้ไข recorded_at ภายหลังอย่างชัดเจน

Audit ของการปรับแสดง event id, request/decision, maker/checker, policy/rule version, amount/delta/currency, effective_on, recorded_at, reason, source/destination และ Document/FileVersion/hash ตาม ACL เก็บข้อมูลเท่าที่จำเป็น ไม่ dump payload ส่วนตัว ชื่อเต็ม token หรือ recovery code ใน log Export/print ตรวจสิทธิ์ใหม่ ณ เวลาสร้างและดาวน์โหลด

## 6 วิธีตรวจเมื่อพร้อม

[แผนกรณีตรวจรับ](fixtures/budget-42-plan.json) มี P42-01–18 ทุกกรณี NOT RUN ยังไม่มี executable budget test runner Commands ที่มีจริง: `corepack pnpm db:test`, `corepack pnpm typecheck`, `corepack pnpm lint`, `corepack pnpm build` สามคำสั่งหลัง **NOT RUN รอบ42**; ต้องเพิ่ม smoke/E2E/native concurrency ของงบหลัง implementation ไม่อ้าง `pnpm test` ปัจจุบันทดสอบ ledger นี้แล้ว

ต้องแก้41/DB-06 และส่วนกลาง07–11 ลง ADR/models/migrations/RLS/runtime grants สร้าง DAL/UI/worker ตามสัญญา และได้ผล native DB/API/browser ก่อนเกณฑ์42ผ่าน ยังไม่เริ่ม43
