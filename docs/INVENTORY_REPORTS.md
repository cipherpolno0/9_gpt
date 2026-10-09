# รายงานวัสดุ ครุภัณฑ์ ตรวจนับ และจำหน่าย — บท 51

รุ่น 0.1 | 8 ตุลาคม 2569 (2026-10-08) | source `8a70eda` | **Proposal / BLOCKED: ยังไม่มีรายงานหน้าจอ Excel หรือ print-PDF จริง**

อ่าน [STOCKTAKE_DISPOSAL_POLICY](STOCKTAKE_DISPOSAL_POLICY.md), [STOCK_LEDGER](STOCK_LEDGER.md), [ASSET_CUSTODY_HISTORY](ASSET_CUSTODY_HISTORY.md), [BUDGET_RECONCILIATION](BUDGET_RECONCILIATION.md) และ [fixture51](fixtures/stocktake-disposal-51-plan.json) ไม่มีการติดตั้งExcelJSหรือสร้างPDFสมมติให้ดูเหมือนexportที่ทดสอบแล้ว

## 1 Report contracts และหน้าที่เสนอ

| หน้า/รายงาน                      | Source และการแสดง                                                                                                                                      |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| /app/inventory/stocktakes        | session/snapshot/count/difference/reason/ผู้ตรวจ/decision/approvedadjustment refs/cutoff/fresh-stale; draft→review→postApprovedStocktakeAdjustment     |
| /app/inventory/disposals         | request/review/approval hold/execution verification/effective/correction แยก; applyVerifiedDisposalและsource history                                   |
| /app/inventory/reports/materials | opening + receipts + transfer-in + positive adjustments − issues − returns − transfer-out − negative adjustments = closing ตามbucket/unit/lot/context  |
| /app/inventory/reports/assets    | asset47/50/51ตามownerOrg/custodianOrg/person/place/statusแยก ราคา/แหล่งงบ/snapshotเฉพาะfieldที่มีสิทธิ์                                                |
| รายงานยืมค้างและซ่อม             | Loan50 due/server time/physical holder/returnpending กับMaintenance estimated/accepted/paid refs/วันที่/condition/hold ไม่สรุปค้างคืนเมื่อreceivedแล้ว |
| รายงานตรวจนับและจำหน่าย          | source snapshot/count/reason/review/adjustment lineage หรือdisposed event→execution→request→approval→CLEANevidence มีvalid_at/known_at                 |

ทุกหน้าเป็นข้อเสนอ ไม่มีroutes/serveractionsจริง ใช้app shell09 บัญชี08/DAL07/documents10/workflow11 Person/Organization/placesกลางเดียว keyboard/Thai labels/empty-error-conflict states/375/768/1024/1440 GET/reportไม่postledger/asset/payment/notificationใหม่

## 2 Snapshot ความสด และการกระทบยอด

capture source/ledger/projection/asset status/custody/locationในconsistent read snapshotเดียว ระบุvalid_at/known_at/generated_at/filters/orgscope/units/currencies/policy/source/name versions/committed eventset manifest และprojectionwatermarks ไม่ใช้MAX(global sequence)เป็นหลักฐานว่าeventก่อนหน้านั้นcommitหมดแล้ว

per-bucket sequenceต้องincrementภายใต้postinglockและcommitพร้อมledgerตาม49; eventsetต้องseal canonicalorder/hashและตรวจmissing source/projectionlag/mismatch ไม่ใส่0หรือป้ายfreshเมื่อsourceไม่พร้อม Reconcileที่watermarkเดียวกันก่อนใช้ยอดรายงาน การอ่านรายงานไม่ซ่อมprojectionหรือแก้ledgerเอง

เสนอ REPEATABLE READ READ ONLY captureข้อมูลและmanifestในread transaction; persist reportversionในwrite transactionแยกที่ตรวจcurrentgrants/hash/contextซ้ำ ไม่INSERTในREAD ONLY ไม่requerylatestระหว่างเก็บผล หน้าจอ pagination/grandtotal/Excel/printใช้reportversionและfieldpolicyชุดเดียวกัน

assetreportย้อนหลังใช้source versions/old labelsตาม50 ชื่อคนหรือหน่วยงานปัจจุบันไม่เปลี่ยนเอกสารเดิม การดูประวัติยังต้องcurrentauthority ไม่ให้scopeเก่าหรือsnapshotชื่อคนเป็นgrantปัจจุบัน ข้อมูลคน ราคา serial/claim/หลักฐานภายในไม่ออกpublic response/HTML/cache/static assets

## 3 Excel และ PDF ที่ต้อง implementและตรวจจริง

ExcelJSรุ่นที่เข้ากับโครงการต้องผ่านADRก่อนติดตั้ง ปัจจุบันpackageไม่มีExcelJS การexportต้องboundedrow/workload/privatejob และใช้manifestเดิมกับหน้าจอ รหัส/ชื่อไทย/quantity/amount exactใช้text cellเมื่อจำเป็นต่อprecision/ศูนย์นำหน้า ไม่parseFloatหรือส่งชื่อที่เริ่มสูตรเป็นformula ไม่ติดmacros/external links

PDFตามMASTERใช้หน้าHTML printฟอนต์Sarabun/A4แล้วbrowserบันทึกPDF เมื่อข้อมูลและสิทธิ์ครบ สร้างจากreportversionเดียวกับExcel/หน้าจอ รวมจำนวน/เวลา/หน่วย/paginationและป้ายข้อมูลทดลอง ไม่มีไฟล์PDFที่ผลิตจริงรอบ51

ตรวจexportตอนenqueue/start/generate/download รวมcurrent account/delegation/scope/fields/Document FileVersion CLEAN+ACL/retentionตาม10 ถ้าสิทธิ์ลดให้denyรายงานเดิมหรือสร้างรุ่นใหม่เฉพาะscopeที่ยังมี ไม่ใส่ไฟล์privateลงpublicหรือsharedcache ไม่อ้างเพิกถอนไฟล์ที่ดาวน์โหลดแล้วจากเครื่องผู้รับได้ Auditเก็บreport ID/hash/scope summary ไม่logรายชื่อทั้งชุดหรือsecret

## 4 ค่าเสื่อมปิดการคำนวณทางการ

DepreciationPolicyVersionเป็นข้อเสนอconfigurationที่มีowner/source evidence/method/useful life/residual value/start-date basis/currency/frequency/rounding/effective window/approvedversion ไม่มีค่าdefaultทางการ ทุกเงื่อนไขต้องฝ่ายการเงินยืนยันพร้อมผู้อนุมัติคนละคนกับผู้สร้าง

ถ้า policyไม่ครบ/ไม่verified/รุ่นไม่ตรง/ค่าได้มายังunknown ให้ `official_depreciation_enabled=false`, depreciation_amount=NULL และnet_book_value=NULL พร้อม “ยังไม่คำนวณ: TO VERIFY” ไม่แสดง0หรือใช้ acquisition_costเป็นมูลค่าตามบัญชีโดยเดา ไม่เลือกวิธีเส้นตรงหรืออายุจากหมวดเอง

เมื่อมีpolicyที่รับรองภายหลัง ต้องคำนวณexactตามรุ่น ตรึงผล/วันที่/source/hash และแก้ย้อนหลังเป็นรุ่นใหม่ การมีผลคำนวณไม่postledgerเงินเอง ไม่ใช้softwaretestเป็นการรับรองนโยบายบัญชี

## 5 Cases ที่ต้องรันจริง

| Case   | หลักฐานที่ต้องได้จริง                                                                                                                                  | สถานะ   |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| P51-01 | capturestocktake/count window/gate/sourcewatermarks; expected/count/reason/unit/lot/finiteqtyแยก ไม่overwritebalance                                   | NOT RUN |
| P51-02 | gateแข่งรับ/เบิก/โอน/return/import/adjust; writerทุกช่องทาง รวมmissingnullablebucketไม่หลุดgate                                                        | NOT RUN |
| P51-03 | countversion/sourceเปลี่ยนหลังreleaseหรือleaseผิด rejectstale/recount ไม่ใช้count-currentdeltaจากsnapshotเก่า                                          | NOT RUN |
| P51-04 | makerchecker/currentauthority/CLEANevidence/approvehash/CAS/uniqueoperation/retry/newkey/zero-varianceไม่duplicateadjust                               | NOT RUN |
| P51-05 | materialdifferenceapprovedใหม่→movement→projection; nonnegative/exactscale/units และต้นทางเดิมไม่แก้ทับ                                                | NOT RUN |
| P51-06 | assetpresence/away-on-loan/wronglocation/missing/unmatched ไม่autodispose/register/charge/ลดmaterial stock; scope-safe scan                            | NOT RUN |
| P51-07 | disposaldraft/returned/rejected/cancelledไม่DISPOSED approvedholdไม่เท่ากับexecution/effective                                                         | NOT RUN |
| P51-08 | activeLoan/repair/return/claim/custodydependencies กับdispose-vs-loanแข่งassetlockเดียว ไม่ลบงานค้าง                                                   | NOT RUN |
| P51-09 | approval+verifiedexecution+CLEAN/date/sourceversionครบจึงdisposed future/asof/lateworkerถูกต้อง                                                        | NOT RUN |
| P51-10 | disposal/recovery/correction/retry/สองคำขอจำหน่ายแข่งคงassetcode/cost/funding/receipt/loan/repair/custody/evidence หนึ่งactiveclaim ไม่reuseหรือdelete | NOT RUN |
| P51-11 | stock/asset/source/projection/watermarks/reportmanifestreconcile screen/page/grandtotal/Excel/PDFตรงทุกunit/context                                    | NOT RUN |
| P51-12 | oldnames/place/cost/source/policyvalid-knownhistoryไม่latestjoin; reportอ่านอย่างเดียวไม่postเงินหรือstock                                             | NOT RUN |
| P51-13 | report/export/download/file/job/URL/QRข้ามscope/fields deny privateHTML/API/cache ไม่มีPII/price/evidencepublic                                        | NOT RUN |
| P51-14 | revoke/suspend/delegation/maker/techdenyทุกservice/API/directlimitedSQL/worker/fileversionACL                                                          | NOT RUN |
| P51-15 | failpoints gate/adjust/disposal/event/projection/receipt/audit/outboxก่อนcommit rollback; หลังcommitresponseหาย/workerACK dedupe                       | NOT RUN |
| P51-16 | ThaiExceltext/formulainjection/exactqty-money/leadingzero/SarabunA4/keyboard4viewports/privateexport workload                                          | NOT RUN |
| P51-17 | unknowndepreciation/method/life/residual/rounding/cost/state/authority/closedperioddeny ไม่มีofficialamount/NBVหรือfinancialpostปลอม                   | NOT RUN |
| P51-18 | nativeinventoryhistory/export/faultmanifestและownerUATแยกsoftwarePASSจากพัสดุ/บัญชีpolicyที่verifiedจริง                                               | NOT RUN |

เกณฑ์51-01ผูกP51-01–06/11/14–16/18 เกณฑ์51-02ผูกP51-07–14/17–18 ทุกกรณี **NOT RUN** ทั้งสองเกณฑ์ **BLOCKED** `db:test`เป็นcore06ไม่ใช่P51runner ไม่มีExcel/PDF/API/concurrency/RLS/UI/scan/worker/nativebusinessหรือownerUATรอบ51 ไม่ใช้fixture/PGlite/เอกสารแทนผลจริง ไม่เริ่ม52

หลักฐานnativeต้องมีcommit/DB+migrations/manifest/policy/expected-actual/source/receipt/audit/evidence hashes/SQLSTATE/ผู้ทดสอบ/เวลา/ปัญหา ไม่มีsecretหรือข้อมูลจริง แหล่งออกแบบ: [PostgreSQL18 isolation](https://www.postgresql.org/docs/18/transaction-iso.html) และ [sequences](https://www.postgresql.org/docs/18/functions-sequence.html) ไม่ใช่ผลตรวจรับแอป
