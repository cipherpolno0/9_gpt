# Configuration นโยบายงบประมาณและเงิน exact — บท 41

รุ่น 0.1 | 5 ตุลาคม 2569 (2026-10-05) | source `061673a` | **Proposal / BLOCKED — ยังไม่มี money/DAL/config loader จริง**

## 1 ขอบเขตและสถานะนโยบาย

ใช้ [BUDGET_SCHEMA](BUDGET_SCHEMA.md), [BUDGET_DATA_DICTIONARY](BUDGET_DATA_DICTIONARY.md), FiscalYear/AcademicYear/Organization/ReferenceCode/PolicyVersion/Documentกลาง แยกorg/FY/funding/project/costcenter/category/currentrole scope ทุกread/mutation/export/download/approve/worker ผู้สร้างห้ามอนุมัติของตน technicaladmin/ServiceActorไม่เป็นbusinessgrant ไม่มีNBMS/bankconnector/ระบบบัญชีทางการในบท41

Q005/Q006/Q010/Q017/Q019/Q025ยังเปิด ต้องเจ้าของO06และฝ่ายนโยบายยืนยันแหล่งเงิน หมวด วงเงิน อำนาจ การใช้เงิน calendar currency precision/rounding หลักฐานและretention ก่อนงานเงินจริง การทำรายการใหม่ใช้currentpolicy; unknown/expired/revokedให้denyไม่fallbacklatestหรือDEMOpolicy Client `official=true`/policyid/orgidไม่ให้grant

เอกสารconfig/inputตัวอย่าง [budget-41-demo.json](fixtures/budget-41-demo.json) เป็น**PLAN ONLY / DEMO** official_allowed=false approval_status=TO_VERIFY ไม่มีruntimeอ่านไฟล์นี้ ไม่มีseedหรือข้อมูลทางการ ห้ามใช้DEMOcategory/source/approver/dateไปอ้างระเบียบหรือผลิตรายงานบัญชีทางการ

## 2 นโยบายมีรุ่น

| ส่วนconfig | ข้อมูล/validationที่เสนอ |
| --- | --- |
| identity | policycode/version/mode/schema version/issuer/sourcehash/effectivewindow/recorded_atและapprovaldecision |
| context | organization scope, funding sources, budgetcategory ReferenceCodebindings, FYcalendar, CostCenteravailability, Project/AYbindings |
| authority | action/resource/org/FY/source/category/amountbands/delegationwindow/makerchecker; วงเงินและผู้มีอำนาจจริงTO VERIFY |
| evidence | Document/FileVersion/hashชนิดที่requiredต่อdraft/submitted/approved/effective; scan/ACL/downloadpurpose/retention |
| money | currencycode, precision20/scale2storage, canonicalstring ingress, fractional digits, calculation/rounding mode/stage/range/overflowpolicy |
| history | immutableapprovedpayload/newversions/currenthead/revision-CAS/receipt/append audit/outbox/effective-recorded windows |
| official gate | source/rules/calendar/currency/rounding/authority/fieldpurposeทุกส่วนverifiedตรงบริบท; unknown/ขาดproofปิดOFFICIALทุกAPI/job/render/export |

การอ่านประวัติใช้policyที่pinและได้รับรับรอง ณ วันที่รายการ พร้อมcurrentreadgrant/fieldpurpose/ACLปัจจุบัน การหมดช่วงใช้policyไม่ลบประวัติหรือทำให้เปลี่ยนเงินเดิมตามlatest หลักฐานไฟล์ยังต้องตรวจสิทธิ์เวลาขออ่านทุกครั้ง

pinpolicyรุ่นบนแผน/line/allocationversion ไม่ดึงlatestมาเปลี่ยนความหมายของเงินเก่า currency/scaleเปลี่ยนต้องmigration/domainreview ไม่เปลี่ยนconfigเพื่อreinterpretamountเงียบ ๆ Draftและapprovalworkflowไม่เป็นeffectiveallocationทันที อำนาจถอนหรือหมดช่วงมอบหมายมีผลกับAPIและworkerที่รอ

## 3 เงินแบบ exact ตลอดทาง

ข้อเสนอพื้นฐานสอดคล้องlogical04: storage **NUMERIC(20,2)** และDEMOcurrencyTHB/สองหลักสตางค์ ค่า0.10+0.20ต้องได้0.30 จำนวนเงินAPI/JSON/CSV/import/outputเป็นstring canonical เช่น`"1234.50"` มี18หลักจำนวนเต็มสูงสุดและ2หลักทศนิยม ทั้งขอบเขตชนิดและรวมยอดต้องตรวจoverflow วงเงินอนุมัติเป็นpolicyแยกและยังTO VERIFY

| ชั้น | Contractที่ต้องบังคับ |
| --- | --- |
| UI/input | เก็บข้อความ ไม่parseFloat/Number/เครื่องหมาย+ด้วยnumber ตรวจรูปแบบก่อนnormalize; ห้ามcurrency/groupseparator/exponent/NaN/Infinity/negative allocationหรือrawscaleเกิน2 |
| API/DAL | รับcanonicalstring `^(0|[1-9][0-9]{0,17})\.[0-9]{2}$` ตรวจcurrency/context/policyก่อนธุรกรรม rejected JSONnumberไม่ให้coerce; ไม่มีdefaultpolicyเมื่อunknown |
| exact arithmetic | สำหรับบวก/ลบและsumใช้จำนวนสตางค์BigIntจากstringที่validateแล้ว และformatกลับด้วยการหารจำนวนเต็ม/เศษ ไม่castNumber; ถ้าใช้Decimallibraryต้องreviewprecision/roundingของรุ่นให้รองรับintermediateก่อนใช้ ไม่ถือว่ามีDecimalแล้วทุกคำนวณปลอดภัย |
| Prisma/storage | adapterสร้างPrisma.Decimalจากcanonicalstringกับ@db.Decimal(20,2)เมื่อมีmodel ใช้SQLNUMERIC SUM/strings; ไม่newDecimalจากJSfloat/toNumberหรือaggregateเป็นfloat |
| SQL ingress | scale/range/finitevalidationก่อนtypedcast ผ่านwriter/RPCที่จำกัดสิทธิ์และcurrentDAL; directtablewriteต้องdeny runtime roles ไม่ใช้CHECKหลังNUMERIC(20,2)castอย่างเดียวเพื่อจับrawscale |
| JSON/report/export | amountเป็นstringพร้อมcurrency/pinnedpolicy; formatจำนวนเต็มและสตางค์จากexact representation ไม่convertNumberเพื่อจัดcomma Excelมีข้อจำกัดrepresentation ต้องadapter/policyแสดงstringที่ไม่เสียหลักและpreventformula ไม่export numericที่สูญprecision |
| รวมยอด | รวมเฉพาะcurrency/context/versionมีผลเดียวกัน ตรวจcarry/overflowก่อนstore; ไม่รวมต่างcurrency ไม่sumold+newAllocationVersionsหรือเรียกsnapshotรวมกับfutureledgerซ้ำ |

รูปแบบregexในสัญญานี้หมายถึงจุดทศนิยมตามตัวอักษร เมื่อเก็บในJSONให้escapebackslashตามJSONและไม่escapeซ้ำหลังparse ข้อมูลDEMOทุกpositiveinputมี2หลักทศนิยม รูปแบบอื่นไม่ถูกยอมรับโดยอัตโนมัติเมื่อใช้เงินจริง

เอกสารทางการ [PostgreSQL18 Numeric Types](https://www.postgresql.org/docs/18/datatype-numeric.html) ยืนยันNUMERICเป็นexact typeและการcastไปdeclaredscaleสามารถปัดค่าที่ละเอียดเกินได้ เช่น10.001→10.00 จึงตรวจinputก่อนcastและตรวจทุกwriter ส่วน [Prisma Decimal](https://docs.prisma.io/docs/orm/prisma-client/special-fields-and-types) ระบุDecimal.js; ตรวจgeneratedPrisma7.10.0ในrepoมีruntime.Decimalจริง เสนอสตริงconstructorตามclientpathที่ล็อกในADR ไม่copyimportตัวอย่างแพ็กเกจรุ่นอื่นหรือติดตั้งdependencyใหม่ใน41

การหาร/เปอร์เซ็นต์/ภาษี/แจกเศษที่อาจมีเศษไม่สิ้นสุดต้องpolicypinเหตุการณ์ที่roundและกติกาremainderก่อนเปิดใช้ ขณะนี้ไม่สร้างสูตรภาษี/วงเงิน/อัตราเอง DEMOเสนอHALF_EVENเฉพาะexplicitrounding-stageหลังคำนวณ ไม่ปัดinputที่เกินscaleเงียบ ๆ ตัวอย่าง1.005→1.00และ1.015→1.02ต้องติดDEMOและตรวจpolicyจริงก่อนใช้ การเปลี่ยนmodeต้องรุ่นใหม่ ไม่ขึ้นกับlocale/browser/defaultlibrary

## 4 หนึ่งปีการศึกษา หลายปีงบ

ตัวอย่างตามช่วงDEMOในseed-data.ts06ที่มีอยู่ ใช้AcademicYearDEMO_AY_2027ช่วง[2027-02-01,2028-02-01) กับFiscalYearDEMO_FY_2026[2026-04-01,2027-04-01) และDEMO_FY_2027[2027-04-01,2028-04-01) ทั้งวันเริ่มเหล่านี้เป็นสมมติ **ไม่ใช่ปฏิทินการเงินจริงที่รับรอง** ไม่มีseedbudgetเพิ่มใน41

| โครงการเดียว/AY2027 | FYอ้างอิง | ช่วงใช้เงินในlineที่เสนอ | ยอดจัดสรรสมมติ |
| --- | --- | --- | --- |
| DEMO_PROJECT_EXAM_2027 | DEMO_FY_2026 | [2027-02-01,2027-04-01) | 10000.10 THB |
| DEMO_PROJECT_EXAM_2027 | DEMO_FY_2027 | [2027-04-01,2028-02-01) | 20000.20 THB |

รวมตามproject/AY/currency =30000.30 แต่รายงานFY2026=10000.10 FY2027=20000.20 เป็นชุดเดียวที่จัดกลุ่มคนละdimension ไม่ให้แต่ละreportกลายเป็นยอดบวกอีกครั้ง FY2027กับAY2027แม้labelCEตรงกันก็มีID/window/policyคนละชุด ตัดวันที่2027-04-01อยู่lineFY2027เท่านั้น ไม่มีwindowทับซ้อน/นับซ้ำ

## 5 แผนตรวจรับ — P41ทุกกรณี NOT RUN

| Ref | สิ่งที่ต้องทดสอบเมื่อruntimeพร้อม | สถานะ |
| --- | --- | --- |
| P41-01 | APIstring→exactsum→Prismawrite→SQLread→JSON/UI/export 0.10+0.20=0.30 โดยไม่ผ่านfloat | NOT RUN |
| P41-02 | ค่าใหญ่900719925474099.91+0.09=900719925474100.00 ไม่เสียสตางค์ในทุกชั้น | NOT RUN |
| P41-03 | NUMERICmax/ผลรวมเกินmax/zero/carryก่อนstoreและnegative/nonfinite rejectedตามpolicy | NOT RUN |
| P41-04 | rawscaleเกิน2/JSONnumber/exponent/commas/leadingzeros/NaN/Infinityและdirectwriterไม่เลี่ยงguardด้วยcast | NOT RUN |
| P41-05 | currencymismatch/roundingstage/unverifiedcurrency/policychange ไม่reinterpretoldamount; HALF_EVENDEMOไม่เป็นofficialrule | NOT RUN |
| P41-06 | FKcompositeorg/FY/plan/source/project/costcenter/categoryผิดcontextทำwriteไม่ได้ | NOT RUN |
| P41-07 | projectAY2027กับสองFYและสองBudgetPlans/linesตามwindow เก็บ/ค้น/groupแยกได้จริง | NOT RUN |
| P41-08 | FY/AYlabelเท่ากันไม่joinผิดUUID/calendar ไม่ใช้FiscalYearเป็นปีสอบ | NOT RUN |
| P41-09 | date-only/windowsปลายไม่รวม/เที่ยงคืนBangkok/รุ่นอนาคต/ย้อนหลัง/recorded_atแยกeffective date | NOT RUN |
| P41-10 | ProjectAcademicYear/ProjectExamSessionเมื่อพร้อม pinyear/window/evidenceถูก ไม่รับexamcopyหรือclientปีผิด | NOT RUN |
| P41-11 | funding/category/calendar/authority/rounding/evidenceTO VERIFY ปิดofficialAPI/worker/export/render ไม่fallbackDEMO | NOT RUN |
| P41-12 | makerchecker/noauthority/techadmin/delegationหมดอายุ/revokedaccount ไม่approveผ่านAPI/job | NOT RUN |
| P41-13 | เปลี่ยนorg/FY/source/costcenter/line/version/fileIDsข้ามscopeในURL/body/query/export/downloadให้deny | NOT RUN |
| P41-14 | approvedsealedamountimmutable; newversion/reason/evidence/queryอดีตและอนาคตไม่ทับประวัติ | NOT RUN |
| P41-15 | nativeconcurrentrevision/intervaloverlap/idempotencyretry/requesthashconflictมีหนึ่งhead/event/receipt | NOT RUN |
| P41-16 | sumเฉพาะeffectiveversion/currency ไม่sum100.00กับรุ่นแทน120.00เป็น220.00หรือsnapshot+ledgerซ้ำ | NOT RUN |
| P41-17 | audit/decision/เอกสารต้นทาง/เวลา/actor/correlationครบ แต่ไม่มีsecret/privatepayload/logชื่อเต็ม/publicbudgetresponse | NOT RUN |
| P41-18 | moneyserialization/UI/CSV/Excel/print/reload/Thai labelsจริง policy/currentscopeยังตรวจแม้ข้ามหน้า | NOT RUN |

เกณฑ์41-01ผูกP41-01–05/16/18; เกณฑ์41-02ผูกP41-06–10/14/16 ทั้งสองBLOCKED ต้องnativePrisma/model/DAL/applicationexecution ไม่ใช้reference arithmeticหรือSQLWASMชั่วคราวเป็นPASS

## 6 ผลตรวจ ขอบเขต และversions

รอบ41 `corepack pnpm db:test` exit1safeerror DockerCLI/socketไม่มี TCP127.0.0.1:5432/5546refused ไม่เดาsubcauseจากข้อความgeneric ไม่มีdatabaseproductionหรือcredentialsทดลองแทน ทั้ง40และส่วนกลางยังไม่ผ่าน

schema/package0.6.0/Prisma7.10.0/Next16.3.8/pnpm11.28.2/lockfile9/core19models/213scalarfieldsคงเดิม มีmigrationเดียว20261003130000_core_foundation SHA256 `04a149fcd349f0ac3f1b5929cfcf571f8b0880541e84a40ad929054b67d72756` ไม่มีbudgetmigration/seed/configloader/services/packagechange P41ทั้ง18nativecases/typecheck/lint/build/rootunit/browser/businessworker/officialbudgetreports **NOT RUN** รอบ41 ไม่ใช้ผลbaseline40แทน

reference arithmetic/fixture windows/probeWASMชั่วคราว/เอกสาร/links/format/secret/whitespaceที่รันจริงบันทึกใน [PROGRESS](PROGRESS.md) สคริปต์ชั่วคราวไม่เป็นprojectmoneyimplementation ไม่เปลี่ยนฐานแอป ต้องreviewcontract/นโยบายและผ่านdependenciesก่อนmigrationและexecutionจริง ไม่เริ่ม42หรือเดาขอบเขต
