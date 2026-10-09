# สูตรยอดคงเหลือและการย้ายหมวดเงิน — บท 43

รุ่น 0.1 | 5 ตุลาคม 2569 (2026-10-05) | source `cffecc4` | **Proposal / BLOCKED — ไม่มี budget ledger services จริง**

## 1 สถานะและหลักการ

บท42ยังไม่ผ่าน มี [ALLOCATION_LEDGER](ALLOCATION_LEDGER.md) และ [BUDGET_APPROVALS](BUDGET_APPROVALS.md) เป็นสัญญาเท่านั้น ไม่มี BudgetEvent/Reservation/Obligation/Disbursement/BudgetBalance ใน Prisma ไม่มี authenticated DAL/workflow/files/outbox ที่ทำงานจริง รอบ43 `corepack pnpm db:test` exit1 Docker CLI/socketไม่มี TCPทดลอง5432/5546refused สูตรและตัวอย่างในบทนี้ไม่ทำให้เกณฑ์รับรองบริการหรือ native concurrency ผ่าน

การควบคุมงบติดตามเงินก้อนเดียวว่าอยู่ขั้นใด การเปลี่ยนขั้นย้ายยอดระหว่างหมวดใน transaction เดียว ไม่เพิ่มยอดหักอีกก้อนหนึ่ง ใช้ Organization/FiscalYear/Project/BudgetLine/currency/policy กลางจาก41–42 ไม่สร้างบัญชี login หรือทะเบียนหน่วยงานแยก ไม่โอนเงินธนาคารจริง

## 2 นิยามและสูตร

| ตัวแปร | ความหมาย ณ วันอ้างอิง                  | ขอบเขตที่นับ                                                                                     |
| ------ | -------------------------------------- | ------------------------------------------------------------------------------------------------ |
| A      | จัดสรรสุทธิที่โพสต์แล้วและมีผล         | initial/increase/decrease/transfer/reversal delta; ไม่ sum ยอดเป้าหมาย AllocationVersion ทุกรุ่น |
| R      | ยอดจองคงค้าง                           | จองที่ยังไม่ปลดจองหรือเปลี่ยนเป็นผูกพัน                                                          |
| U      | ภาระผูกพันที่ยังไม่จ่าย                | ตั้งภาระแล้ว หักส่วนยกเลิก/บันทึกจ่าย; ยังรวมส่วนที่รับรองเบิกแต่ยังไม่จ่าย                      |
| P      | ค่าใช้จ่ายที่บันทึกจ่ายแล้วสุทธิ       | หลักฐานจ่ายในระบบ หัก reversal ที่ตรวจแล้ว; ไม่เป็นหลักฐานว่าระบบโอนเงินธนาคาร                   |
| V      | งบพร้อมใช้คงเหลือ                      | A - R - U - P                                                                                    |
| C      | ยอดรับรองเบิกคงค้างที่ยังไม่บันทึกจ่าย | subset ของ U ตาม obligation/voucher ไม่เป็นช่องหักงบที่ห้า                                       |

**V = A - R - U - P** โดย A/R/U/P/V ต้อง finite และไม่ติดลบ C ต้อง 0 <= C <= U ทั้งระดับ line และแต่ละ obligation เงินหลาย currency ไม่รวมกัน เงินในคนละ line/FY/source ไม่ชดเชยกันโดยอัตโนมัติ ยอดรวมเพียง lineไม่พอ ต้องตรวจยอดคงค้างของ reservation/obligation/voucher ต้นเรื่องด้วย

ตัวอย่าง C=5000.00 อยู่ใน U=20000.00แล้ว ถ้าหัก C อีกครั้งจะเหลือ75000.00ผิด ต้องยังเหลือ80000.00 การอนุมัติคำขอรับรองเบิกยังไม่เปลี่ยน P จน posting PAYMENT_RECORD ผ่านครบและ commit

## 3 Delta ต่อเหตุการณ์

amount x รับเป็น canonical positive string ผ่าน exact validation ตาม [BUDGET_POLICY_CONFIG](BUDGET_POLICY_CONFIG.md) Deltaคำนวณฝั่ง serverจากชนิด eventและต้นเรื่อง ไม่รับ bucket vector ที่clientกำหนดเอง

| Event เสนอ           | ΔA                                     | ΔR      | ΔU      | ΔP      | ΔC                      | Guard และผลต่อ V                                                       |
| -------------------- | -------------------------------------- | ------- | ------- | ------- | ----------------------- | ---------------------------------------------------------------------- |
| ALLOCATION           | +x หรือ -x ตามคำอนุมัติ42              | 0       | 0       | 0       | 0                       | initial/increase/decrease/transferผ่าน42; ΔV=ΔA และVต้องไม่ติดลบ       |
| RESERVE              | 0                                      | +x      | 0       | 0       | 0                       | x<=V, approved-effective allocation/current grant; Vลดx                |
| RELEASE_RESERVATION  | 0                                      | -x      | 0       | 0       | 0                       | x<=remainingของ reservation นี้; Vเพิ่มx                               |
| COMMIT_RESERVATION   | 0                                      | -x      | +x      | 0       | 0                       | x<=remainingต้นเรื่องเดียว ช่วง/บริบทตรงกัน; Vเท่าเดิม                 |
| CERTIFY_DISBURSEMENT | 0                                      | 0       | 0       | 0       | +x                      | x<=U-C ของ obligation นี้ มีmaker checker/decision/evidence; Vเท่าเดิม |
| PAYMENT_RECORD       | 0                                      | 0       | -x      | +x      | -x                      | x<=Cคงค้างของ voucher ที่รับรองและUของ obligationนี้; Vเท่าเดิม        |
| REVERSAL             | inverse ของdeltaต้นเรื่องที่ได้รับตรวจ | inverse | inverse | inverse | ตามชนิดที่นโยบายอนุมัติ | postedhistoryคงเดิม; ตรวจdependenciesและnonnegativeทุกช่องก่อนโพสต์    |

ตาราง REVERSALไม่ให้ผู้ใช้ส่งค่าinverseเอง เป็นคำขอใหม่อ้างeventเดิม เก็บreason/evidence/decision/hash และรองรับเพียงรูปแบบที่policyยืนยัน ไม่กลับรายการจองหรือผูกพันที่มีการใช้ต่อแล้วโดยไม่แก้ downstream ก่อน ไม่มีgeneric inverseที่ข้ามกฎ

C เป็น metadata/projectionการรับรองไม่เป็นค่าใช้จ่ายเพิ่ม แต่ต้อง update atomicกับU/Pเมื่อจ่าย ไม่รับรองซ้ำเกินUโดยใช้voucherใหม่ การจ่ายบางส่วนลด certified_remaining ของ voucherนั้นและ obligation_unpaid ใน transactionเดียว การเพิ่มภาระที่ไม่ได้มาจากจองต้อง flow ที่นโยบายยืนยันก่อน ส่วนทดลองนี้ใช้ COMMIT_RESERVATION เท่านั้น

## 4 ตัวอย่างตามเกณฑ์43-01

จำนวนเงินทุกช่องต่อไปนี้เป็น stringสมมติ THB ไม่ใช่รายการเงินจริง

| ขั้นที่โพสต์แล้ว          | A         | R        | U        | P       | C       | V         |
| ------------------------- | --------- | -------- | -------- | ------- | ------- | --------- |
| จัดสรร                    | 100000.00 | 0.00     | 0.00     | 0.00    | 0.00    | 100000.00 |
| จอง20000                  | 100000.00 | 20000.00 | 0.00     | 0.00    | 0.00    | 80000.00  |
| เปลี่ยนจองเป็นผูกพัน20000 | 100000.00 | 0.00     | 20000.00 | 0.00    | 0.00    | 80000.00  |
| รับรองเบิก5000            | 100000.00 | 0.00     | 20000.00 | 0.00    | 5000.00 | 80000.00  |
| บันทึกจ่าย5000            | 100000.00 | 0.00     | 15000.00 | 5000.00 | 0.00    | 80000.00  |

R+U+Pเท่ากับ20000.00ตั้งแต่จองถึงจ่ายบางส่วน ไม่หักRเดิมหลังเปลี่ยนเป็นU และไม่คงU20000.00พร้อมเพิ่มP5000.00 การปลดจองเพิ่มVเฉพาะส่วนที่ยังจองอยู่ ไม่ปลดจองยอดที่เปลี่ยนเป็นภาระแล้ว

ตัวอย่าง [budget-43-plan.json](fixtures/budget-43-plan.json) มีแยกปลดจองบางส่วน/เต็ม รับรองและจ่ายบางส่วน/retryแผนตรวจ/reversal plan ส่วน inverse payment สมมติต้องมีคำอนุมัติเปิดคืนสิทธิ์เบิกของvoucherและหลักฐานตามpolicyก่อนเพิ่มCกลับ ไม่ใช่การคืนเงินจริงหรืออนุญาตจ่ายซ้ำอัตโนมัติ

## 5 การอ่านและตรวจย้อนกลับ

current projectionต้องตรงผลรวม signed ledger eventsที่posted-effectiveในcontextเดียวกัน และผลรวม R/U/P/C ของต้นเรื่องย่อย ถ้าไม่ตรง/ต้นเรื่องหาย/ไม่ทราบยอดใช้ ให้หยุดpostingไม่แก้projectionเป็น0หรือrebuildทับเพื่อซ่อนความต่าง Rebuildต้องพื้นที่ทดลองแยก/ตรวจchecksum/sequenceและaudit ไม่ลบledgerเดิม

effective_on date-only และ recorded_at TIMESTAMPTZแยกกัน UIวันไทย/ปีพ.ศ. ไม่เก็บปีพ.ศ.แทนค่ามาตรฐาน ยอดavailableที่ใช้อนุมัติมาจากprojectionที่lockและrecheckปัจจุบัน ไม่ใช้รายงานย้อนหลังหรืออนาคตเป็นวงเงิน ย้อนวันรายการที่กระทบการใช้เงินแล้วต้องนโยบาย/ผลกระทบก่อน ไม่เปิด backdatingอิสระ บท43DEMOไม่เปิด future spendposting

อ่าน/ส่งออก/พิมพ์/ดาวน์โหลด privateตามcurrent scope/field/filepolicy ไม่ส่งmetadata voucher/evidenceเข้าpublic/HTML/staticassets/cache/logเต็มชุด ดู [BUDGET_LEDGER_SERVICES](BUDGET_LEDGER_SERVICES.md) สำหรับtransaction/guards/แผนตรวจ P43-01–16 ทุกกรณี **NOT RUN**
