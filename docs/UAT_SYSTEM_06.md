# ตรวจรับระบบ 6 งบประมาณ — บท 46

รุ่น 0.1 | 7 ตุลาคม 2569 (2026-10-07) | source `eed9af6` | **BLOCKED — ยังไม่ผ่านการตรวจรับระบบจริง**

## 1 สิ่งที่มีจริงและสิ่งที่ยังไม่มี

บท 41–45 เป็นสัญญาการออกแบบและข้อมูลตัวอย่าง ยังไม่มี budget models, ledger services, authenticated DAL, สิทธิ์การเงิน, scan worker, workflow/outbox ธุรกิจ, รายงาน/export หรือ period close ที่ทำงานจริง `src/modules/budget` มี README เท่านั้น ไม่สร้างฐาน บัญชี หรือ engine อนุมัติทดแทนส่วนกลางเพื่อให้ตรวจผ่าน

รอบ 46 ทำ [test specification](../tests/system06/ACCEPTANCE_CASES.md), [coverage-plan](../tests/fixtures/system06/coverage-plan.json) และ [คู่มือเตรียมใช้งาน](MANUAL_BUDGET.md) เป็นสิ่งส่งมอบจริง ไม่มี executable tests ของระบบ 6 หรือ runner ที่อ่านแผนนี้ ทุก P46-01–28 เป็น **NOT RUN** ตัวอย่างไม่ถูก seed และไม่มีการปิดงวด/จ่ายเงินจริง

| ขอบเขต                                            | ความพร้อมรอบ 46                                                               |
| ------------------------------------------------- | ----------------------------------------------------------------------------- |
| โครงเว็บและข้อมูลกลาง                             | package/schema 0.6.0, Prisma 7.10.0, Next 16.3.8, pnpm 11.28.2; ยังติด DB-06  |
| แผน/จัดสรร/ledger/เบิกจ่าย/รายงาน/ปิดงวด          | มี contracts 41–45; ไม่มีบริการและ UI จริง                                    |
| Auth/DAL/RLS ของบัญชีและงบ/เอกสาร/workflow/outbox | ยังไม่พร้อมสำหรับ finance flow; bootstrap ปิด workspace ไม่ใช่ login          |
| PostgreSQL แบบ server                             | ไม่พบ Docker/postgres/initdb/pg_ctl/psql, socket ไม่มี; TCP 5432/5546 refused |
| ธนาคาร / NBMS / e-GP                              | ไม่มี adapter/API/อำนาจหรือผลตรวจการเชื่อมต่อที่ยืนยัน                        |
| กฎ/วงเงิน/close/reopen/refund/carry/แบบทางการ     | TO VERIFY; ไม่มีผู้รับผิดชอบการเงินลงผลตรวจนโยบายหรือ UAT                     |

## 2 เกณฑ์และหลักฐานที่ต้องได้รับ

| เกณฑ์                                    | Cases                        | หลักฐานเมื่อระบบพร้อม                                                                                                                                  | ผลรอบ 46          |
| ---------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- |
| 46-01 ย้อนยอดและไม่ติดลบจากงานแข่ง       | P46-02–10/15/16/18–24/28     | PostgreSQL หลาย connection, ledger/ต้นเรื่อง/projection/report manifest ตรงกัน; FK/hash/decision/evidence/receipt; ไม่มี partial commit หรือ overspend | BLOCKED / NOT RUN |
| 46-02 ไม่ใช้ software PASS รับรองระเบียบ | P46-11/26 และ protocol ข้อ 4 | เจ้าของนโยบายตรวจรุ่น/แหล่ง/อำนาจ/เงื่อนไขแยกจาก QA; gate ทางการปฏิเสธส่วน TO VERIFY                                                                   | BLOCKED / NOT RUN |

ยอดแต่ละรายงานต้องย้อนถึง report version → event manifest → budget event/typed deltas → reservation/obligation/voucher/invoice/payment reference → allocation/plan version → approval decision → Document/FileVersion/hash และผู้กระทำ/วันมีผล/วันบันทึก/correlation ตามสิทธิ์จริง ข้อมูลรหัสใน JSON ไม่เป็น FK หรือหลักฐานที่ได้รับอนุมัติแล้ว

## 3 ตรวจยอดโดยไม่ซ้ำหมวด

Ledger เป็นแหล่งจริง คำนวณใหม่จากเหตุการณ์ที่โพสต์ในบริบทเดียวกัน แล้วเทียบ projection, ยอดต้นเรื่องย่อย, หน้าจอ และ export ที่ใช้ manifest เดียวกัน ใช้ **V = A − R − U − P**; A จัดสรรสุทธิ, R จองคงค้าง, U ภาระยังไม่จ่าย, P จ่ายแล้วสุทธิ, C รับรองเบิกคงค้างซึ่งเป็นส่วนหนึ่งของ U จึงไม่หัก C เพิ่ม อ่าน [สูตรยอด](BUDGET_BALANCE_FORMULA.md) และ [reconciliation](BUDGET_RECONCILIATION.md)

ตัวอย่างสมมติ: A 100000.00 → จอง 20000.00 เหลือ 80000.00 → เปลี่ยนจองเป็นภาระ 20000.00 ยังเหลือ 80000.00 → จ่าย 5000.00 เหลือ U 15000.00 และ V 80000.00 การปลดภาระหลังจ่ายต้องปลดเฉพาะ unpaid ที่อนุมัติ ไม่ล้าง P หรือประวัติเดิม

แผนข้อมูลมีเส้นทางปลดจอง, ปลดภาระ, โอนสอง legs และกลับการโอน, correction ของบันทึกจ่ายที่มีคำอนุมัติเปิดคืน voucher **สมมติเท่านั้น** ไม่ถือว่า refund มี delta เดียวกับ correction ใช้จำนวนเต็มสตางค์ตรวจตัวอย่าง ไม่ใช้ float และไม่อ้างว่าแทน NUMERIC/transaction/concurrency ของระบบจริง

## 4 Protocol ให้ผู้รับผิดชอบการเงินตรวจ

ไม่มีการส่งข้อความ นัดประชุม หรือสมมติชื่อ/คำอนุมัติให้เจ้าหน้าที่ในรอบนี้ เตรียมเอกสารให้ตรวจเมื่อเจ้าของงานยืนยันผู้รับผิดชอบ O06 และอำนาจตาม Q005/Q006/Q019:

1. รับแหล่งนโยบายผ่านเอกสารกลาง private พร้อมรุ่น/hash/ผู้ออก/ขอบเขต/วันเริ่มสิ้นสุดและหลักฐานสิทธิ์ใช้ ตรวจ funding restrictions, currency/rounding, ปีงบ, วงเงินสะสม, delegation, ปิด–เปิดงวด, คืนเงิน และรายการค้าง ไม่เดาระเบียบจากชื่อฝ่าย
2. ผู้รับผิดชอบการเงินแยกตรวจตัวอย่าง A/R/U/P/C/V และเอกสารแต่ละขั้น รวมกรณีโอน ปลดภาระ และกลับรายการ บันทึกว่าตรวจเฉพาะ policy scope ใด การรับตัวอย่างหนึ่งไม่รับรองทุกแหล่งเงินหรือทุกปี
3. ผู้เสนอ ผู้ตรวจ และผู้อนุมัติทดสอบด้วยบัญชีสมมติที่มีสิทธิ์จริงตาม config รุ่นที่ตรวจแล้ว ใช้สามคนตามบท 44; ผู้ดูแลเทคนิคไม่ข้ามอำนาจธุรกิจ
4. QA execute P46 พร้อม expected/actual, native transaction/fault/retry proofs, policy versions, report/evidence hashes และความต่าง ส่งผลให้ผู้รับผิดชอบตรวจ แยกผล software กับการรับรองนโยบายคนละช่อง
5. แบบบันทึก UAT ต้องมี run_id/source commit/environment, ผู้ตรวจที่ยืนยันตัวตน, หน้าที่และอำนาจ, source/policy/rule/period versions, cases, expected/actual, issue refs, ข้อเสนอแก้, เวลา, ผลตัดสินและเงื่อนไขค้าง ช่องเหล่านี้ยัง **ไม่ได้กรอก/ไม่ได้ลงนาม**
6. กฎไม่ทราบ/เอกสารไม่ผ่าน scan/อำนาจไม่ครบ → คง official gate ปิด ลง issue และตรวจซ้ำหลังแก้ ไม่ใช้ DEMO เป็น fallback ทางการ software PASS ไม่เป็นการรับรองกฎหมาย/บัญชี/ระเบียบการเงิน

ไม่มีการเชื่อมธนาคาร NBMS หรือ e-GP การบันทึกจ่ายคือบันทึกหลักฐาน ไม่ใช่โอนเงินจริง ขอบเขตเชื่อมต่อเพิ่มเติมต้องมี API สิทธิ์และอำนาจที่ยืนยันก่อนออกแบบ/ตรวจรับ

## 5 ผลรันจริงและวิธีตรวจเมื่อพร้อม

รอบนี้ `corepack pnpm db:test` exit 1 พร้อมข้อความผิดพลาดที่ไม่เผย credential ไม่แยกสาเหตุย่อยจาก error ทั่วไป การ probe ไม่พบ native PostgreSQL/บริการทดลองตามข้อ 1 ดังนั้นไม่มี migration/seed/native finance tests ผ่าน `node --import tsx --test tests/*.test.ts` ผ่าน 17/17 เฉพาะ bootstrap/local guards/โครงสร้าง/วันไทย ไม่รัน Markdown หรือ JSON ระบบ 6

รายละเอียดการตรวจตัวอย่าง ลิงก์ รูปแบบและ secrets บันทึกใน [PROGRESS](PROGRESS.md) เฉพาะคำสั่งที่รันจริง typecheck/lint/build/browser/API/Excel/PDF/native concurrency/worker faults/financial UAT **NOT RUN รอบ 46** ไม่ยืมผลบทก่อนมาเป็นผลนี้

เมื่อ prerequisite และ ADR พร้อม ใช้ฐานทดลองแยกจาก production ตาม [DATABASE](DATABASE.md) และ README ตรวจเริ่มจาก empty PostgreSQL; scripts `db:test` ปัจจุบันทดสอบเฉพาะ core06 และตรวจ migration เดียว จึงต้องปรับ harness ตาม ADR เพื่อรองรับ migrations ของ budget ก่อนรัน P46 ไม่ใช้ script เดิมอ้างว่า finance ผ่าน ไม่ reset/drop ฐานร่วม ไม่เปลี่ยน safety guard ให้รับ production

Schema ยัง 19 models/213 scalar fields มี migration เดียว `20261003130000_core_foundation` SHA256 `04a149fcd349f0ac3f1b5929cfcf571f8b0880541e84a40ad929054b67d72756`; ไม่มี schema/migration/seed/dependency/runtime ใหม่ บทถัดไปยัง **ไม่เริ่ม 47** จนแก้ blocker และตรวจรับระบบ 6 จริง
