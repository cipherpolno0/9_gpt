# ตรวจรับพัสดุร่วมกับงบประมาณ — บท 52

รุ่น 0.1 | 8 ตุลาคม 2569 (2026-10-08) | source `5c52d0d` | **BLOCKED — prerequisite47–51/43–46/ส่วนกลางยังไม่ผ่าน**

## 1 สิ่งที่ตรวจพบจริง

อ่าน BLUEPRINT/00_MASTER_PROMPT/AGENTS/PROGRESS/DECISIONS/OPEN_QUESTIONS/Charter และสัญญา47–51ก่อนแก้ inventory/budgetมีREADMEเท่านั้น ไม่มี services/models/migrations/UI ของพัสดุหรือ ledgerงบ Auth/DAL/workflow/businessoutbox/scanยังไม่พร้อม ServiceActorของcoreเป็น provenance ไม่เป็นloginหรืออำนาจธุรกิจ ยังไม่มี runner E2E ระบบ7

รอบ52 `corepack pnpm db:test` exit1 ข้อความฐานทดลองไม่สำเร็จโดยไม่เผยcredential ไม่อนุมานสาเหตุย่อยจากข้อความทั่วไป Probeไม่พบ docker/postgres/initdb/pg_ctl/psql หรือ Docker socket; localhost5432/5546 connect_ex111 ไม่มีnativeDBที่พร้อมใช้ ไม่ใช้PGlite/WASM/mocksแทนหลักฐาน concurrency

Schema/package0.6.0 Prisma7.10.0 Next16.3.8 pnpm11.28.2 lockfile9 core19models/213scalarfields migrationเดียว `20261003130000_core_foundation` SHA256 `04a149fcd349f0ac3f1b5929cfcf571f8b0880541e84a40ad929054b67d72756` ไม่มี runtime/schema/migration/package/lockfileเปลี่ยน ไม่มีExcelJSติดตั้ง/Excel/PDFจริง

## 2 ชุดตรวจรับและความครอบคลุม

[ACCEPTANCE_CASES](../tests/system07/ACCEPTANCE_CASES.md) และ [coverage-plan](../tests/fixtures/system07/coverage-plan.json)0.1 เป็น specification/ข้อมูลสมมติ PLAN ONLY ไม่ได้seed/สร้างบัญชีหรือคำอนุมัติ [MANUAL_INVENTORY](MANUAL_INVENTORY.md)เป็นคู่มือเตรียม UAT ไม่มีหน้าจอที่เปิดใช้งานแล้ว ใช้ [UAT_SYSTEM_06](UAT_SYSTEM_06.md), [PROCUREMENT_BUDGET_FLOW](PROCUREMENT_BUDGET_FLOW.md), [STOCK_LEDGER](STOCK_LEDGER.md), [ASSET_LIFECYCLE](ASSET_LIFECYCLE.md), [STOCKTAKE_DISPOSAL_POLICY](STOCKTAKE_DISPOSAL_POLICY.md), [INVENTORY_REPORTS](INVENTORY_REPORTS.md) ร่วมกัน

| เส้นทาง/ความเสี่ยง                                                        | Cases                    | สถานะจริง |
| ------------------------------------------------------------------------- | ------------------------ | --------- |
| ขอซื้อ draft-return/revision/currentauthority จองและผูกพัน                | P52-01–03/08/24          | NOT RUN   |
| รับบางส่วน inspection/reject/overreceive/cancellation race/retry          | P52-04–10/13             | NOT RUN   |
| finance certification/payment/correction/closedperiod/unknownpolicy       | P52-11–12/26/30          | NOT RUN   |
| stock issue/transfer/native race/null identity/unit rules/countgate       | P52-13–15/19–20/26       | NOT RUN   |
| asset registration/sourceordinal/loan/return/repair/custody/asof/disposal | P52-04–05/08/16–18/20–22 | NOT RUN   |
| org/warehouse/field/file privacy revoke/worker/maker checker              | P52-23–26/28–30          | NOT RUN   |
| ledger/projection/source manifests/Excel/PDF/Thai accessibility           | P52-27–29                | NOT RUN   |

### ตัวอย่างตัวเลขสำหรับตรวจความต้องการ

เป็นจำนวนสมมติ ใช้ exact decimal strings ไม่เป็นบันทึกธุรกรรมจริง:

- A100000 → reserve20000 → order12000 ทำให้ R8000/U12000/V80000; รับวัสดุ20+30ชิ้นกับasset1+1 ไม่เปลี่ยน R/U/P การตรวจรับยืนยัน acceptedliability2400+2600=5000 ต่างจากการจ่าย
- ปลดR8000และยกเลิกงานที่ยังไม่รับ7000ด้วยคำอนุมัติสมมติ ทำให้ U5000/V95000 คงภาระของที่รับแล้ว การจ่าย2400+1000+1600ทำให้ U0/P5000/V95000 ไม่ตัดงบซ้ำจากการรับ
- วัสดุAรับ50→เบิก12→โอนไปB8→adjustcount−1 จะเหลือA29/B8รวม37ชิ้น การขาด1เป็น approvedmovement ที่มีเหตุผลไม่ overwrite; ไม่ใช้37เป็นยอดเงินบาท
- asset2ชิ้นราคาชิ้นละ2000ยังมีรหัส/แหล่งงบ/source/ประวัติครบ แม้หนึ่งชิ้นผ่านยืมคืนซ่อมและจำหน่าย อีกชิ้นคงavailable ค่าซ่อมประมาณ500/การจำหน่ายไม่โพสต์เงินเอง
- Branch payment correctionสมมติ1600ในplanมีต้นทางและคำอนุมัติเปิดสิทธิ์เบิกใหม่เฉพาะกรณีตรวจแล้ว จาก P5000/U0/C0 เป็น P3400/U1600/C1600; Vยัง95000 การคืนวัสดุหรือเงินจริงไม่ใช้ deltaนี้โดยอัตโนมัติ ไม่ใช่ policyที่ได้รับรับรอง

## 3 Execution และเกณฑ์รับจริง

ทำตาม protocol7ขั้นใน specification เมื่อ prerequisiteพร้อม เริ่มnativePostgreSQL devสะอาดที่ได้รับอนุญาต/migrationครบ/limited writer/currentAuth/CLEANevidenceจริงก่อน อย่าใช้ `db:test` core06เดิมอ้างทดสอบพัสดุ ต้องปรับ harnessตามADRก่อน ไม่มีคำสั่ง E2E ระบบ7ที่แสร้งสร้างในบทนี้

แต่ละ caseบันทึก expected/actual/run_id/commit/databaseและmigrationversions/policies/sourcehash/evidence/decision/receipt/report/nativeobserver/SQLSTATE/issue/เวลา/ผู้ตรวจ และหลักฐานทั้ง UI→API→DB ใช้ barrierสองconnectionsสำหรับrace พร้อมfaultpoints/revokeในenvironmentแยก dev; rollbackต้องตรวจจากconnectionอื่น หลังcommitresponseหายretryยังcurrentauthและหนึ่งbusinessoperation Workerใช้devsink/durableinbox/dedupe/retry/deadletter

เกณฑ์52-01ต้องไม่มีnegative stockจากraceและไม่doublebudgetจากรับ/จ่าย เกณฑ์52-02ต้องdenyข้ามwarehouseและorgทั้งread/mutate/custody/history/export/job เอกสารกับreference arithmeticไม่เป็นหลักฐานเกณฑ์เหล่านี้ ทั้งสอง **BLOCKED / NOT RUN** ไม่มีผู้ตรวจรับเจ้าของงานจริง

## 4 การตรวจโดยเจ้าหน้าที่คลัง ผู้ถือครองและการเงิน

1. O07/O06/C02/C03ที่เจ้าของงานยืนยัน แยกตรวจ policy/scopes/authority/delegation/แหล่งเงิน/หน่วย/วงเงิน/partialreceipt/claims/returns/stocktake/disposal/period/retention/ค่าเสื่อม โดยแนบแหล่งที่มาและช่วงมีผล ไม่มีชื่อหรือคำอนุมัติที่เดา
2. ทดลองเส้นทางตามคู่มือด้วยบัญชีสมมติที่สร้างผ่าน providerกลางจริง ตรวจทั้งคลังA/Bและหน่วยงานนอกscope ใช้เอกสารทดลองที่scan/ACLถูกต้อง ให้ผู้ถือครองตรวจว่าประวัติผู้รับผิดชอบ/ของยืม/การส่งมอบอ่านเข้าใจ ไม่ส่งข้อมูลส่วนตัวลงissue
3. เจ้าหน้าที่คลังเทียบจำนวนทุกbucketกับledger/receipt; การเงินเทียบ A/R/U/P/C/V กับ ledgerและใบรับรองเดียวกัน source linkageต้องตรงแต่จำนวนกับรายจ่ายไม่ใช่ยอดเดียวกัน ตรวจทั้งส่วนที่ยังไม่รับ/ยังไม่จ่าย/กลับรายการและผลกระทบต่อเอกสาร
4. บันทึก UATรับหรือไม่รับแยกจากsoftwarecases พร้อมหลักฐาน policy version/ผู้มีอำนาจ/วันที่/issue/เงื่อนไขค้าง ห้ามกรอกผลรับรองให้แทนเจ้าหน้าที่ ช่องผู้ตรวจ/คำตัดสิน/ลงนามยังว่าง ไม่อ้างว่าทดสอบผ่านรับรองกฎหมาย e-GP NBMS หรือธนาคาร

## 5 คำสั่งและผลรอบนี้

`corepack pnpm test` ผ่าน17/17เฉพาะbootstrap/localguards/dates/structure ไม่executeระบบ7 `corepack pnpm db:test` exit1 ตามข้อ1 ผลตรวจreference/data/links/format/secrets/diffอยู่ใน [PROGRESS](PROGRESS.md) เฉพาะที่รันจริง typecheck/lint/build/browser/nativeAPI/RLS/race/scan/outboxfault/Excel/PDFและP52-01–30 **NOT RUN รอบ52** ไม่มี seed หรือruntimeใหม่

บทถัดไปยัง **ไม่เริ่ม53** ต้องแก้ DB-06/Q027 DOCKER-05/Q026 ส่วนกลางและ47–51/43–46/ADR/runtime แล้วexecuteหลักฐานจริงก่อน ไม่ใช้ผลตรวจเอกสารปลด acceptance gate
