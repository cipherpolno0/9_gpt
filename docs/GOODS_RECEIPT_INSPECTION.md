# การรับ ตรวจ ปฏิเสธ คืน และเชื่อมการเงิน — บท 49

รุ่น 0.1 | 8 ตุลาคม 2569 (2026-10-08) | source `2a5b70f` | **Proposal / BLOCKED — receipt/inspection/services ยังไม่มี**

ใช้ [STOCK_LEDGER](STOCK_LEDGER.md), [PROCUREMENT_ORDERS](PROCUREMENT_ORDERS.md), [PROCUREMENT_BUDGET_FLOW](PROCUREMENT_BUDGET_FLOW.md) และ47/43/44/45พร้อมworkflow/files/authกลาง ไม่สร้างsupplier/order/person/organizationหรือengineอนุมัติใหม่

## 1 Mapping และ fields ที่ต้องผ่าน ADR

ทุกidentityUUID/privateRLS/RESTRICT sourcecompositeFK currentaccountactor/rowversion/evidencehash/effective DATE/recorded TIMESTAMPTZ ข้อมูลมีผลที่postedไม่updatepayloadเดิม เอกสารใช้Document+FileVersionกลางCLEAN/currentACL ทั้งใบส่งของผลตรวจและreturn/cancellation

| Model/tableเสนอ                                               | Fields/keysสำคัญ                                                                                                                                                                                                    |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GoodsReceipt / goods_receipt เดิม                             | order/version/warehouse/location/received_on/receipt_code/supplierdeliverybusinessref/evidence/receipt/currentinspection; receipt_codeuniqueและsourcebusinesskeyverified ไม่ใช้newidหนีduplicate                    |
| GoodsReceiptLine / goods_receipt_line เดิม                    | receipt/order/orderline/compositecontextFK/item-kind/qty-unitversion/conversion/lot?/physicalreceived/accepted/rejected/pending/returned snapshots; unique(receiptrevision,line_no)ต้องalign04                      |
| Inspection / inspection ใหม่                                  | receipt/line revision/inspectedqty/outcome/reason/source/evidence/currentauthority/decision/reviewed_at/approved_at/replaces/sealedhash; uniqueapprovedacceptancebinding ข้อสรุปห้ามแก้หลังpost                     |
| StockMovement / stock_movement เดิม                           | typedsource/operationreceipt/movement_code/reverses/effective/posted/evidence/correlation; originalpostedimmutable uniquebusinessoperation/receipt; fullreversalตาม04ครั้งเดียวต้องvalidatepartial/dependencies     |
| StockMovementLine / stock_movement_line เดิม                  | warehouse/location/item/unitversion/lot/context, quantity_delta, source_receipt_line/issue_line/transferline, recordedactor; unique(parent,line_no); typedsourceFKไม่clientgenericJSON                              |
| StockBalance / stock_balance projectionใหม่                   | canonicalbucketidentity/qty/rowversion/ledgerwatermark; DBuniquenullidentity/finite/nonnegative/reconcile ไม่manualstockmasterอีกชุด                                                                                |
| IssueRequest / issue_request ใหม่                             | org/sourcewarehouse/requestpurpose/destinationperson-or-orgref/lineqty-unitversions/workflow/expectedrevision/approvedhash/issuedremaining; contextscope/fulfilmentslotbusinessunique ไม่createPersonจากชื่อผู้เบิก |
| Transfer / stock_transfer ใหม่                                | source/destinationwarehouse-location/lineitem-unit-lot/qty/approvedrevision/handoverevidence/pairedmovement/status; source!=destinationbucket; uniqueapprovedpostingbinding                                         |
| StockLot / stock_lot optional                                 | item/supplier-source-batchnamespace/verifiedlotcode/source/evidence/expiryถ้ามีหลักฐาน ; ไม่มีlotถ้าpolicyไม่ต้องใช้ ไม่เดาexpiryหรือออกlotcodeที่ดูเป็นของจริง                                                     |
| AcceptedLiabilityRef / sharedprocurementacceptance projection | orderline/inspection/acceptednet/sourcehash/policy/liabilitybasis/replaces ; ต้องalign48/44 currentprotectedclaims/paid/acceptedliability; ไม่สร้างledgerเงินชุดใหม่                                                |

Request/statusกำลังขอแยกจากmovementที่มีผล Issueapprovalไม่postหรือล็อกเงินจองแทนstock ถ้าต้องstockreservationให้ADR/policyเพิ่มเติมก่อน ไม่สมมติว่าอนุมัติแล้วของถูกกันไว้ ทั้งqtyและmoneyใช้exactตามunit/pricepolicy ไม่ใช้clientยอดคงเหลือ

## 2 ตรวจรับก่อน available

1. รับdescriptorจากOrderissuedที่มีobligationconfirmed48 ตรวจscope/orderline/item/unit/warehouse/contextและsupplierdeliveryref ใบส่งของ/รูปภาพผ่านfilequarantine/scan/ACL ไม่รับclientระบุaccepted/paidเอง
2. physicalreceivedยังpendinginspection เก็บcustody/รอตรวจในreceipt ไม่เพิ่มavailableและไม่preview/downloadไฟล์ที่ยังไม่CLEAN ไม่มีmovementของusable stockจากdraft/pending/rejected
3. ผู้ตรวจบันทึกaccepted/rejected/pending/reason/quantityและหลักฐาน; ผลรวมตามdeliverylineไม่เกินphysicalreceived ผู้มีอำนาจคนอื่นapproveversionตามpolicy/makerchecker currentdelegation/account/grants
4. acceptAndPostในtxเดียวlockorder/source/balance ตรวจnetaccepted<=ordered-cancelled รวมทุกreceipts/returnsตามreplacementpolicy แล้วpostเฉพาะaccepted material qty/orderfulfilment/acceptanceref/receipt/audit/outbox เงื่อนไขinspection/evidenceขาดrollback ไม่markacceptedก่อนstockสำเร็จ
5. MATERIALตาม47ใช้stockquantity ledger; ASSET_SERIALIZEDส่ง47ทะเบียนรายชิ้น/sourceordinaladapterที่พร้อมตามpolicy ไม่สร้างmaterialstockอีกสำเนา; SERVICEใช้workacceptancecontract48ไม่มีphysicalstock ปลายทางadapterไม่พร้อมคงBLOCKEDไม่fakeaccepted
6. ทุกactionread/edit/approve/post/return/export/download/jobตรวจcurrentAuthDAL/RLSและfileversionACL แม้userอ่านOrderได้ก็ไม่ถือว่าอ่านหลักฐานทุกใบได้ ยกเลิก/receiveแข่งต้องsourceguardร่วม48 ไม่รับเมื่อapprovedcancelledquantityเต็มแล้ว

Inspectionapprovedที่ยังไม่postต้องแสดงapproved-pending-post ไม่เพิ่มusablecount ถ้าใช้asyncต้องreceiptack/failed/compensationprotocolและADRก่อนเลือก ไม่postแล้วcopystateที่อีกtransactionทำให้receiptacceptedแต่stockหาย

## 3 Counts และ replacement

แยกphysicaldeliveries, pendinginspection, acceptedgross, rejectedsupplierreturn, acceptedreturn, acceptednet, cancelledและremaining Quantityacceptednet = acceptedgross − approvedacceptedreturnsที่policyคืนfulfilmentcapacityได้; acceptednet+cancelled<=ordered ส่วนที่rejectยังไม่acceptedจึงไม่หักacceptednetอีกครั้ง

ส่งทดแทนอาจทำให้physicalreceivedหรือacceptedgrossสะสมเกินorderedได้ แต่netfulfilmentที่มีผลยังไม่เกินapprovedorderedquantity ไม่ใช้grossreceiptcountเป็นguardเดียว และไม่เปิดreplacementcapacityจากการกดreturnโดยไม่มีคำอนุมัติ/หลักฐาน ข้อกำหนดถ้าpolicyปิดreplacementต้องapplyapprovedamendment48ก่อน

คืนrejectedก่อนacceptไม่หักusable stock คืนacceptedหลังpostต้องoriginalreceipt/lot/remaining/currentwarehouseและdependency check คำขอใหม่อนุมัติแล้วpostnegative stockจากของที่ยังมีอยู่ ไม่สร้างของคืนจากที่เบิกหรือโอนไปแล้วหรือส่งgenericinverseล้างhistory ถ้าของถูกใช้ต่อให้reportedimpact/approvedresolutionก่อน

## 4 การเงินยังคนละเส้นทาง

Orderissued48ย้ายจองR→Uแล้ว การตรวจรับไม่ย้ายU→P ไม่releaseUทั้งOrder และไม่markpaid/certifiedอัตโนมัติ AcceptedLiabilityRefใช้คุมcancelable/claim/paymentproofตามนโยบาย44/48 มีsourceversions/inspectionhash/evidence/qty/amountbasisที่คำนวณexactและscope

ตัวอย่างOrder6ชิ้น/6000: accept3/reject1 → netaccepted3/remaining3/stock3 Uยัง6000/P0; acceptเพิ่ม3 → quantityfulfilledแต่financeยังU6000/P0 Receiptไม่ได้ปิดหนี้หรือคืนวงเงิน Event/outboxแจ้งผู้มีหน้าที่เตรียมเบิกผ่าน44ตามauthority/invoice/CLEANevidence/periodguard ไม่สร้างpaymentเอง บางนโยบายadvancepaymentต้องownerยืนยัน ไม่สรุปว่าreceiptเป็นเงื่อนไขเดียวของทุกการจ่าย

คืนของ/rejected/cancel/creditnoteอาจกระทบliability/ภาษี/invoice/C/P ต้องflow44/48ที่อนุมัติ ไม่คืนเงินหรือคืนสิทธิ์เบิกจากreturnstockเอง หากqtyfulfilledแต่pendinginspection/claim/returnresolution/เอกสาร/เงินยังค้าง แสดงแยกไม่ปิดOrderทั้งหมดเพียงcountครบ

same sharedtxใน49รักษาstock/orderacceptance/financialsource-ref/audit/outbox และlocksสอดคล้องcancellation/payment ไม่HTTPcommitแยก ข้อมูลเงินที่มีการโพสต์จริงยังผ่านserviceระบบ6และงวด45เท่านั้น Unknownpolicy/currency/rounding/lot/authority/crossperiod/e-GPปิดofficial ไม่มีbank/NBMS/e-GP integration

ทั้งหมดเป็นcontracts ไม่มีreceipt/inspection/stockmovement/acceptedliabilityที่สร้างจริง ไม่มีschema/migration/seedใหม่ ทุกP49NOT RUN ไม่เริ่ม50
