# ตรวจนับ ปรับยอด และจำหน่ายครุภัณฑ์ — บท 51

รุ่น 0.1 | 8 ตุลาคม 2569 (2026-10-08) | source `8a70eda` | **Proposal / BLOCKED: ยังไม่มี stocktake/disposal services หรือ migration จริง**

บท50ยังBLOCKED `corepack pnpm db:test` รอบ51จบด้วย exit1 ไม่มีnativePostgreSQL/Dockerที่พร้อมใช้ inventoryมีREADMEเท่านั้น เอกสารนี้กับ [fixture51](fixtures/stocktake-disposal-51-plan.json) เป็นสัญญา/PLAN ONLY ไม่ใช่รายการตรวจนับ คำอนุมัติ หรือการจำหน่ายที่บันทึกจริง ใช้ [STOCK_LEDGER](STOCK_LEDGER.md), [ASSET_LIFECYCLE](ASSET_LIFECYCLE.md), [ASSET_CUSTODY_HISTORY](ASSET_CUSTODY_HISTORY.md) และ [รายงาน](INVENTORY_REPORTS.md) เดิมร่วมกัน

## 1 แนวคิดทีละขั้น

1. ยอดทะเบียนมาจาก ledger49 ณ ขอบเขตและเวลาที่ระบุ ยอดนับจริงเป็นข้อสังเกตอีกชุด ไม่แทนยอดทะเบียนทันที
2. ความต่างต้องมีเหตุผล หลักฐาน และผู้ตรวจ/ผู้อนุมัติคนละคนกับผู้สร้าง การปรับเพิ่ม movement ใหม่ที่อ้างรายการตรวจนับ โดยคงรายการเดิม
3. ครุภัณฑ์รายชิ้นตรวจตัวตน/ที่ตั้ง/สภาพ/ผู้ถือครองจาก47–50 ไม่ใช้จำนวนวัสดุลบทะเบียนชิ้นที่หาไม่พบ
4. การอนุมัติจำหน่ายยังไม่เท่ากับดำเนินการเสร็จ ต้องผลดำเนินการที่ตรวจรับ หลักฐาน และถึงวันมีผล รหัส ราคา แหล่งงบและประวัติเดิมคงอยู่

## 2 Models และจุดต่างจากแบบ04

ทุกตารางเสนอ private/RLS deny by default ใช้ UUID/row_version/current account/typed context FK/RESTRICT/วันมีผล/วันบันทึก/หลักฐานFileVersionกลาง ไม่สร้างคลัง Person Organization หรือทะเบียนassetอีกชุด

| Model / table เสนอ                                           | Fields และข้อบังคับที่ต้อง implement                                                                                                                                                                                     |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| StocktakeSession / stocktake เดิม                            | warehouse/org/code/type(MATERIAL หรือ ASSET)/scope manifest/cutoff/count window/sourcewatermarks/status/policy/version/hash/ผู้ตรวจ/ผู้อนุมัติ/evidence; unique(warehouse,code)เดิม                                      |
| StocktakeLine / stocktake_line เดิม                          | canonical bucket(location,item,unitversion,lot)/expected snapshot/count/time/counter/recount/reason/variance/approved adjustment binding; unique(session,bucket)ต้องnullsafe ไม่ใช้(session,item)เดิมกับหลายlocation/lot |
| StocktakeAssetObservation / stocktake_asset_observation ใหม่ | assetUUID/sourceversion/expectedplace-holder-condition/observed refs/time/mismatch/reason/evidence/review; ไม่สร้างAssetจากserialหรือการscanที่ไม่match                                                                  |
| StocktakePostingGate / stocktake_posting_gate ใหม่           | canonicalbucket/session/lease generation/status/snapshot watermark/closed evidence; ทุกwriter49ต้องใช้ protocolเดียว มีcreate-safe identityและaudit                                                                      |
| DisposalRequest / disposal เดิม                              | asset/version/request revision/reason/proposed/effective dates/policy/review/approval/approvedhash/hold/execution refs/evidence; maker checkerและunique business operation/active disposal claimต่อasset                 |
| DisposalExecution / disposal_execution ใหม่                  | request approvedversion/ผู้ดำเนินการ/actual date/result/methodตามpolicy/ผู้ตรวจรับ/หลักฐาน/source hashes; กรอกเงินรายได้ไม่เป็นpaymentหรือbudgeteventเอง                                                                 |
| AssetLifecycleEvent50 / StockMovement49 / operation receipt  | ใช้ต้นทางเดิมสำหรับasset status หรือmaterial adjustment พร้อมtypedsource/unique(source,approved revision,line)/currentauthority/audit/outbox atomic                                                                      |

logical04มีstocktake/stocktake_line/disposalแล้ว แต่ไม่มีgate/assetobservation/execution/manifestจริง ต้องADRเปลี่ยนmodelและguardsผ่านmigration ไม่สร้างstocktake_sessionหรือdisposalทะเบียนซ้ำกับตารางเดิม และไม่แก้logical04หรือPrismaในรอบ51

## 3 ยอดนับกับยอดทะเบียนต้องอ้างช่วงเดียวกัน

ข้อเสนอDEMOใช้ controlled count window ต่อbucket: serverเปิด durable posting gate และcaptureledger/projection/sourceในtransactionสั้นหลังlock ไม่ถือDB transactionค้างระหว่างเจ้าหน้าที่นับของ ทุกรับ/เบิก/โอน/คืน/adjust/importต้องตรวจgateเดียวกันก่อนpost แม้ใช้workerหรือdirectlimitedSQL

ตรึงexpected_quantity/unit/lot/ledger manifest/watermarks กับcutoffที่ตรวจสอบได้ ผู้ตรวจบันทึกcounted_quantity/count_at/หลักฐาน/reason ใช้exact NUMERIC(20,6)ตามหน่วย47 ห้ามส่งclientbalanceหรือdeltaให้serverเชื่อ ตัวเลขนับต้องfinite>=0/scaleตรงหน่วย ผลต่าง = counted − expected ในbucketเดียวกัน ไม่มีผลรวมชิ้นกับกิโลกรัม

ปิดcount windowด้วยหลักฐานและgenerationที่ตรง ไม่autoapproveหรือpostadjustเพราะleaseหมดอายุ หากต้องเปิดpostingจากtimeout ให้flowrecoveryที่มีอำนาจเปลี่ยนcountเป็นSTALE และบังคับrecount/reviewใหม่ ไม่ให้workerลืมgateหรือทำให้ยอดนับเดิมยังfresh การจัดการgateผิดต้องบันทึกincidentและกระทบยอด

ระหว่างรออนุมัติเปิดpostingได้ แต่ค่าเริ่มต้นDEMOจะpostadjustได้ต่อเมื่อsourcewatermark/row_versionยังตรงsnapshotที่reviewแล้ว หากเปลี่ยนให้conflictและตรวจนับ/ตรวจใหม่ ไม่ใช้ counted − current_balance เป็นdeltaใหม่จากข้อมูลเก่า หากเลือกmovement bridgeแทนrecount ต้องนโยบายหลักฐาน/time coverage/conversionที่ยืนยันและรุ่นตรวจใหม่ก่อนใช้ ไม่มีadapterนี้ใน51

รายการวัสดุ7ชิ้น นับ6 → discrepancy−1 เมื่อapproveversionและยอดยัง7 จึงpostadjust−1→6 ไม่เขียนbalance=6 การretryไม่adjustอีกครั้ง รายการไม่มีความต่างไม่สร้างzero movement สิ่งที่หาไม่พบ/นับเกินต้องreasonที่เจ้าหน้าที่ตรวจได้ ไม่สร้างเหตุผลทางการจากระบบ

Stocktakeของassetเป็นรายUUID แสดง EXPECTED_HERE/EXPECTED_AWAY_ON_LOAN/FOUND_WRONG_LOCATION/MISSING/UNMATCHED ตามsource50และscope ของที่ทราบว่ายืมอยู่ไม่เป็นของหายจากคลังโดยอัตโนมัติ unmatchedเข้าสอบทานไม่auto register หรือเปิดข้อมูลassetนอกscope การหาไม่พบไม่auto dispose/charge-person/ลดmaterial stock; protective holdต้องอำนาจ/หลักฐาน/เหตุการณ์ที่ยืนยัน

## 4 Transaction และการอนุมัติ

adjustment/disposal/currenthistory writersใช้global period/context→financial/source locksเมื่อเกี่ยวข้อง→count gates→order/source/bucket locks49 หรือasset locks50 ตามcanonicalorderเดียวผ่านADR ทุกwriterต้องalign ไม่มีเส้นทางที่ล็อกกลับลำดับ

หลังlock reread currentgrants/delegation/account/source versions/approved hash/gates/evidenceCLEAN+ACL และremaining/nonnegative/dependencies ตรวจmaker checkerทุกAPI/service/job เทคนิคไม่approveเองและไม่เพิ่มgrantจากชื่อผู้ตรวจ

Txเดียวpost stockmovementหรือassetstatus eventที่เกี่ยวข้อง/source state/projection/operationreceipt/audit/outbox ถ้าล้มก่อนcommit rollbackทั้งหมด ถ้าcommitแล้วresponseหาย samekey/hashอ่านreceiptเดิมตามสิทธิ์ปัจจุบัน ต่างhashconflict newkeyไม่apply approvedsource operationซ้ำ Fulltransaction boundedretryตามADR ไม่มีการloopfixtureแทนnativeconcurrency proof

## 5 ขอจำหน่าย ดำเนินการ และวันมีผล

| ขั้นเสนอ                                 | ผลต่อทะเบียนและความพร้อม                                                                                    |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| DRAFT / SUBMITTED / REVIEWING / RETURNED | คำขอยังไม่ทำให้assetเป็นDISPOSED แก้ร่างเดิมผ่านrevisionหรือส่งกลับตรวจ                                     |
| APPROVED_PENDING_EXECUTION               | sealคำขอรุ่นที่อนุมัติและตั้งdisposal holdตามDEMOป้องกันยืมใหม่ แต่ยังไม่เป็นจำหน่ายมีผล                    |
| EXECUTION_VERIFIED_PENDING_EFFECTIVE     | ผู้ดำเนินการบันทึกผลจริง/หลักฐาน และผู้ตรวจรับรับรอง ไม่ใช้approvalแทนผลดำเนินการ                           |
| EFFECTIVE                                | คำอนุมัติ+ผลตรวจรับ+วันที่+sourceversion+เงื่อนไขครบ เพิ่มAssetLifecycleEvent.DISPOSED ไม่ลบasset           |
| REJECTED / CANCELLED ก่อนดำเนินการ       | ไม่มีdisposed event; การปลดholdต้องคำสั่งและrecheckเหตุอื่น ไม่เปิดAVAILABLEโดยปริยาย                       |
| CORRECTION / RECOVERY หลังมีผล           | คำขอใหม่อ้างต้นเรื่อง/reason/evidence/new approval เก็บeventเดิม ไม่genericrestoreหรือเลือกcustodianใหม่เอง |

ก่อนมีผลต้องไม่มีLoan/reservation/returnรอตรวจ/maintenance/custodyhandover/claimหรือเรื่องหายที่ขัดกันตามpolicy ถ้ามีให้จัดแผนและผลแก้ที่รับรองก่อน ไม่ลบLoanหรือปิดงานซ่อมเงียบ ๆ การอนุมัติ/ยืม/ซ่อม/activationแข่งใช้assetlock50เดียวกัน ตรวจเงื่อนไขใหม่ก่อนpostทุกครั้ง ภายใต้lockห้ามมีactive disposal claimของคนละคำขอในชิ้นเดียวกัน ใช้DBuniquenessของoutstanding claimตามADR ไม่ปลดclaimด้วยsoft inactiveหรือแก้clientstatus

วันที่effectiveไม่ก่อนผลดำเนินการที่ตรวจรับ เว้นนโยบายแก้ย้อนหลังที่ยืนยันผ่านคำขอใหม่ Unknownpolicyปิดofficial สำหรับเหตุการณ์อนาคตที่ผลดำเนินการตรวจแล้ว เก็บeffective/recordedแยกและqueryตามวัน ไม่อ้างว่าถูกจำหน่ายวันนี้ก่อนถึงวัน และไม่ขึ้นกับnotification workerที่ล่าช้า

คงasset_code/serial/source_receipt/ordinal/acquisition cost/currency/funding/FY/budget refs/owner/custody/location/loan/repair/evidence/decisionsไว้ตามretention-policy ไม่cascade delete/ลบรหัสให้reuse การรับเงินขาย/ปรับบัญชี/กลับงบผ่านระบบ6ที่ได้รับอนุมัติแยก ไม่เกิดจากการเปิดรายงานหรือDISPOSEDevent

## 6 Gate ทางการและแผนตรวจรับ

authority/method/วงเงิน/ความรับผิด/lease recovery/recount/bridge/retention/การรับรายได้/ค่าเสื่อม/closedperiodยัง **TO VERIFY** O07/O06/C02ต้องรับรองรุ่นและหลักฐาน ไม่มีระเบียบที่แต่งขึ้น ไม่มีbank/NBMS/e-GP integration คำขอทางการที่policyยังไม่verifiedให้deny ส่วนdraft/ตัวอย่างทดลองติดป้ายชัด

package/schema0.6.0 Prisma7.10.0 Next16.3.8 pnpm11.28.2 lockfile9 core19models/213scalarfields/migrationเดียว `20261003130000_core_foundation` SHA256 `04a149fcd349f0ac3f1b5929cfcf571f8b0880541e84a40ad929054b67d72756` คงเดิม ไม่มีruntime/schema/migrations/seedใหม่

P51และเกณฑ์51ทั้งสองอยู่ใน [INVENTORY_REPORTS](INVENTORY_REPORTS.md) ทั้งหมด **NOT RUN / BLOCKED** ต้อง50/49/47/ส่วนกลาง/ADR/nativeDB/servicesจริงก่อนexecute ไม่เริ่มบท52
