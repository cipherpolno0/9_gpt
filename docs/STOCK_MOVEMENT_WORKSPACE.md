# หน้ารับ เบิกและโอน กับแผนตรวจรับ — บท 49

รุ่น 0.1 | 8 ตุลาคม 2569 (2026-10-08) | source `2a5b70f` | **Proposal / BLOCKED — ไม่มีหน้า/route/services จริง**

ใช้sharedUI09/Auth08/DAL07/files10/workflow-outbox11 และ [STOCK_LEDGER](STOCK_LEDGER.md), [GOODS_RECEIPT_INSPECTION](GOODS_RECEIPT_INSPECTION.md) ไม่มีบัญชี/ทะเบียน/loginหรือหน้าติดต่อแยก

## 1 หน้าและ server-only service ที่เสนอ

| เส้นทางเสนอ                | Flow / service contract                                                                                                                      |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| /app/inventory/receipts    | เลือกOrderและlineที่อ่านได้ กรอกphysicaldelivery/unit/version/lotเฉพาะpolicy/evidence บันทึกdraft/CAS ไม่มีavailableก่อนinspection           |
| /app/inventory/inspections | ผู้ตรวจ/ผู้อนุมัติตรวจqty/source/version/CLEANevidence/reason/ผลกระทบ แสดงreceived/accepted/rejected/pendingแยก; acceptAndPostReceipt txกลาง |
| /app/inventory/issues      | ร่างIssueRequest→submit/review→approve→physicalissue; postIssueตรวจstockปัจจุบันจากserverและfulfilmentremaining คำขอapprovedยังไม่issued     |
| /app/inventory/transfers   | เลือกsource/targetตามscopeสองฝั่ง→draft/approve→confirmedhandover→postTransfer pairedlegs transactionเดียว                                   |
| /app/inventory/stock       | boundedfilteritem/warehouse/location/unit/lot/asofdate/history/currentavailable/freshness/lineagescope; ไม่ใส่0ถ้าแหล่งข้อมูลไม่พร้อม        |
| หน้าคืนของ/แก้รายการ       | คำขอใหม่reason/evidence/originalsource/dependencies→review/approve→postAcceptedReturnหรือcorrectionตามpolicy ไม่ลบpostedmovement             |

Clientส่งIDs/quantitystring/expectedrevision/idempotencykey ไม่ส่งremaining/actor/authority/budgetdeltaที่serverเชื่อ Servicesเสนอในsrc/modules/inventory/serverเมื่อimplementationได้รับอนุมัติและdependencyพร้อม ไม่มีplaceholderfunctionsรับtrafficจริงรอบ49

ฟอร์มมีThai labels/unitsทุกแถว/focus/error summary/revisionconflict/empty state/statusข้อความ keyboardและ375/768/1024/1440 ใช้ได้ ไม่ซ่อนสิทธิ์ด้วยเมนูเพียงอย่างเดียว คงprivateHTML/API/no sharedstaticcache รายงาน/export/print/filedownload/jobใช้currentgrantsและpurposefieldpolicyทุกครั้ง ราคา/Supplier/ผู้เบิก/เหตุปฏิเสธ/หลักฐานไม่ออกpublicจากtrackingID

## 2 Cases ที่ต้องรันบน native PostgreSQL

| Case   | หลักฐานที่ต้องได้จริง                                                                                            | สถานะ   |
| ------ | ---------------------------------------------------------------------------------------------------------------- | ------- |
| P49-01 | partialphysical/accepted/rejected/pending counts sourceFK/CLEAN/inspectionmakerchecker; availableเฉพาะaccepted   | NOT RUN |
| P49-02 | รับหลายreceipt/netaccepted/ordercancelled/overdelivery/replacementversion guards ไม่ปิดOrderก่อนครบเงื่อนไข      | NOT RUN |
| P49-03 | เบิก1พร้อมกันสองconnectionเมื่อเหลือ1 barrierก่อนlock; หนึ่งmovement/receipt A0อีกคำขอdeny                       | NOT RUN |
| P49-04 | transferสองlegsหนึ่งtx/globalorder/two-scope/units/locations/lot/currentgrant/net0 ไม่มีhalftransfer             | NOT RUN |
| P49-05 | samekeyhashretry/newhashconflict/newkeysamebusinessopdeny approvedrevisionamendmentไม่consumeซ้ำ                 | NOT RUN |
| P49-06 | missingbalance concurrentfirstreceipt/upsert/nullablelotidentityไม่duplicate projections/finite DBguards         | NOT RUN |
| P49-07 | issue/transfer/return/cancel/receipt/paymentแข่งsource/order/finance/stockremainingไม่ติดลบ                      | NOT RUN |
| P49-08 | quantitiesexact/scale/conversionpins/mixunits/lot/expiryonlyverifiedsource; nofloat/NaN/roundsilent              | NOT RUN |
| P49-09 | rejectedreturnไม่usableOUT; acceptedreturnapprovedsource/protecteddownstream/replacementnetcount/history         | NOT RUN |
| P49-10 | acceptanceไม่เปลี่ยนU/P/Cเอง partialqty/financialliability/claim/evidence/cancelguardsร่วม48/44                  | NOT RUN |
| P49-11 | failpointsdecision/ledger/projection/orderlink/liabilityref/receipt/audit/outbox/beforecommit rollbackทั้งหมด    | NOT RUN |
| P49-12 | commitresponseหาย+workerrestart/deliveryACK/dedupe/deadletter/currentauthority ไม่มีmovement/notificationซ้ำ     | NOT RUN |
| P49-13 | scopeURL/body/queryorg/source/destination/fileIDs/objectkeys/listcounts/export/cache/currentrevokedjobdeny       | NOT RUN |
| P49-14 | delegation/expiry/suspend/revoke/maker/techdeny serveractions/routes/services/directlimitedSQL                   | NOT RUN |
| P49-15 | readonlyGET/report/UIlinksไม่issue/transfer/รับ/จ่าย/ส่งหนังสือใหม่ มีkeyboardและ4viewports                      | NOT RUN |
| P49-16 | ledger/projection/source manifests/watermarks/oldunit/location/sourceversionsย้อนหลัง/Bangkokdates               | NOT RUN |
| P49-17 | ASSETadapter47/SERVICEacceptance48 ไม่ทำmaterialstockอีกชุด แหล่งadapterไม่พร้อมfailclosed                       | NOT RUN |
| P49-18 | closedperiod/backdate/negative-stock/lot/replacement/tax/authority/officialunknownpolicydeny                     | NOT RUN |
| P49-19 | reversalหลังของเบิก/โอนต่อแล้ว ห้ามinverseเกินremainingหรือrestoremoney/สิทธิ์เอง ไม่ลบaudit                     | NOT RUN |
| P49-20 | partialfinishแยกquantityfulfilled/inspectionremaining/paymentopen/returnresolution ธุรกรรมservice06ถูกต้องตามวัน | NOT RUN |

Setupต้อง48/47/43–46/ส่วนกลาง/nativeDB/schema+migrationsจริง ใช้testDBใหม่แยกproductionตามDATABASE/harnessที่ADRรับรอง `db:test`ปัจจุบันตรวจcore06 migrationเดียว ไม่รันcasesเหล่านี้ P49concurrencyต้องหลายnativeconnections+barrier/fullboundedretryและactualDBproof ห้ามใช้barrierที่รอสองconnectionหลังถือrowlockเดียวกันเพราะอีกconnectionยังเข้าไม่ได้ ไม่ใช้PGlite/in-memory/การloopfixtureแทน

เก็บexecutionmanifestprivate: run_id/commit/DB+migrations/policy/unitversions/source refs/expected/actual/SQLSTATE/event-receipt-evidencehash/ผู้ทดสอบ/ผู้ตรวจ/เวลา/issues ไม่commitsecretหรือข้อมูลจริง; typecheck/lint/build/browser/nativeAPI/worker/scan/directSQL/e2eทั้งหมดNOT RUNรอบ49 ไม่มีownerpolicy/UATsignoff

เกณฑ์49-01ผูกP49-03–08/11–14/19 เกณฑ์49-02ผูกP49-01/02/09/10/16–18/20 ทั้งสองBLOCKED referenceplanไม่เป็นผลnativeacceptance ไม่เริ่ม50
