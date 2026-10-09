# สัญญาคำขอ คำสั่งซื้อและผู้ขาย — บท 48

รุ่น 0.1 | 7 ตุลาคม 2569 (2026-10-07) | source `c6697cb` | **Proposal / BLOCKED — models/schema/migration/UI/services ยังไม่มี**

อ่าน [PROCUREMENT_BUDGET_FLOW](PROCUREMENT_BUDGET_FLOW.md), [INVENTORY_SCHEMA](INVENTORY_SCHEMA.md), [BUDGET_LEDGER_SERVICES](BUDGET_LEDGER_SERVICES.md) และlogical04ใน [DATA_DICTIONARY](DATA_DICTIONARY.md) ใช้UUID/FK/RESTRICT/privateRLS/history/บัญชีกลาง ไม่สร้างOrder/Procurementอีกชุดทับแบบ04 ส่วนdeltaต่อไปนี้ต้องADRก่อนimplementation

## 1 Model mapping และข้อมูลจำเป็น

| Model / tableเสนอ                                           | ข้อมูลและhistoryที่จำเป็น                                                                                                                            | Key/guardเสนอ                                                                                                                    |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| ProcurementRequest / procurement_request เดิม               | org/project/budgetline/FY/currency/requestkind PURCHASEหรือSERVICE/reason/estimatedtotal/policyversion/rowversion/currentworkflow                    | unique(org,request_code); rootidentityถาวร; project/line/FY/source/orgสัมพันธ์จริงและscopeจากserver                              |
| ProcurementRequestVersion / procurement_request_version     | immutableapprovedrevision/line snapshot/amount basis/quantityunit pins/sourceevidence/actor/effective-recorded/replaces/hash                         | unique(request,revision); decisionผู้อื่น/sealedhash/CAS; newrevisionไม่สร้างจองเต็มก้อนซ้ำ                                      |
| ProcurementRequestLine / procurement_request_line เดิม      | line_no, line_kind, item_id? หรือservice_spec_version_id?, qty, unit/version, conversionpin?, estimatedunitprice/lineamount/chargesbasis             | unique(requestrevision,line_no)ต้องalignkey04; XOR ITEM/SERVICE; qty>0 finite/scaleถูกต้อง; itemชนิดที่อนุญาต/serviceไม่stock    |
| ServiceSpecificationVersion / service_specification_version | description/workscope/unit/milestones/acceptance/evidence/ruleversionในคำขอ                                                                          | ไม่เป็นทะเบียนคนหรือคลังสินค้าใหม่ ไม่บังคับขอจ้างใช้item_idปลอม; templateofficialunknownblock                                   |
| Order / purchase_order เดิม                                 | request/rootrevision/reservation/obligation/supplier_version_id/order_code/order_slot/context/currency/total/rule/evidence/ordered_at/status/version | uniqueorder_codeตาม04; stablebusinessslotตามpolicy; singleissueต่อapprovedslot; ไม่มีissueก่อนapproved+reserved                  |
| OrderLine / purchase_order_line เดิม                        | approvedrequestline/compositecontextFK/qty-unit-price-sourcepins, ordered/accepted/rejected/pending/cancelled/remaining projections, liability refs  | unique(orderrevision,line_no); ordered/cancelled/acceptedboundsและsourcebudgetremaining; nochildlineจากrequestอื่น               |
| Supplier / supplier ใหม่                                    | org/entity Personกลางที่ตรวจแล้วเมื่อpolicyอนุญาต หรือverifiedexternalbusinessreference, profile scope, supplier_code/active/version                 | businessidentitynamespace+reference nonnullที่serververifiedก่อนissue; ไม่mergeจากชื่อหรือใช้NULLหลบkey ไม่สร้างUser/loginผู้ขาย |
| SupplierVersion / supplier_version ใหม่                     | legal/displayname snapshot/approvedbusinesscontactrefs/contractaddressversion/effective-recorded/sourceevidence                                      | unique(supplier,version); dataขั้นต่ำprivateตามpurpose ไม่บังคับเลขบัตรไทย/bankaccountในtrial                                    |
| ProcurementBudgetLink / procurement_budget_link             | rootrequest/context/reservation/approvedrevision/consumedorderbindingsและhash                                                                        | active root+context bindingไม่ซ้ำ; multipleordersต้องruleและremainingguard;ใช้Reservation/Obligation43จริง ไม่ledgerใหม่         |
| Amendment/Cancellation version                              | originalrequest/order/reason/impact/cancelablequantities/amounts/decision/evidence/policy/hash/effective-recorded                                    | approvedrevision immutable/receipt; currentstateไม่เปลี่ยนตอนยื่น; คงต้นเรื่องเดิม ไม่deletepostedrows                           |

logical04ยังไม่มีSupplierและservice specification; line04เดิมitem_idnonNULLต้องแก้ผ่านmigrationเมื่อADRรับรอง ไม่ใส่fakeitemให้ขอจ้าง Order04ชื่อpurchase_orderยังใช้mapเดิม ชื่อModelOrderไม่หมายถึงorderengineอีกชุด การกำหนดหลายbudgetlines/FYต่อหนึ่งคำขอเป็นนโยบายเพิ่ม ต้องatomicallocationbinding/แยกเรื่องเมื่อได้รับยืนยัน ไม่ใช้เลขAYเป็นFY

Supplierที่เป็นหน่วย/บุคคลมี centralrefตามsource ไม่สำเนาชื่อ/เบอร์/ที่อยู่ชุดใหม่โดยไร้version/evidence ข้อมูลผู้ขายไม่ทำให้supplierorgมีสิทธิ์ในหน่วยจัดซื้อ และไม่ให้ทุกหน่วยอ่านprivateprofileร่วมโดยอัตโนมัติ Profileunverifiedใช้ได้เพียงdraftproposalไม่issueofficialOrder Serial/รหัสภาษี/เลขทะเบียนธุรกิจจริงต้องpurpose/source/ACLที่เจ้าของยืนยัน ไม่เดาตัวเลข trialทุกชื่อDEMO อีเมลถ้าต้องมีใช้@example.invalid ไม่มีเบอร์หรือที่อยู่จริง

## 2 หน้าคำขอและคำสั่งที่เสนอ

เส้นทางเสนอ /app/inventory/procurement และ /app/inventory/orders ใช้ sharedUI/Form/Table/appshell09 ไม่สร้างหน้าติดต่อหรือบัญชีแยก:

1. เลือกPURCHASE/SERVICE/org/project/FY/lineที่อ่านได้ กรอกรายการ/itemหรือworkspec จำนวน/unit ราคาประมาณ reason/evidence บันทึกdraft/returnedด้วยrevision
2. Serverคำนวณexactline/totalและตรวจpolicy/requirements/scan/permissions แสดงเหตุส่งไม่ได้ ไม่ใช้clientsumหรือclientvalidationแทนserver
3. Reviewแสดงรุ่น/ก่อนหลัง/estimatedbasis/currentavailable/fundingrestrictions/impact/sealedhash ผู้มีอำนาจapproveAndReserveในtransaction ไม่ป้ายapprovedหากจองล้มเหลว
4. ComposeorderจากapprovedremainingและSupplierVersionที่ตรวจแล้วก่อนissue ไม่มีpersistedofficialOrder/เลขคำสั่งเมื่อยังไม่อนุมัติหรือreserveไม่confirmed actualpriceเกินจองให้เสนอamendmentก่อน
5. Orderรายละเอียดแยกordered/accepted/pending/cancelledqtyและreserved/unpaid/certified/paidamount ไม่มีปุ่มยกเลิกที่คืนrequestedtotalทั้งหมด มีreviewimpactและคำอนุมัติใหม่
6. Document/สารบรรณlinksตามcurrentACL ข้อมูลผู้ขาย/ราคา/หลักฐานprivate purposefieldpolicy currentread/export/print/download/jobทุกครั้ง ไม่มีpublictrackingเปิดเอกสารเมื่อรู้ID

Statusloading/empty/validation/conflict/deniedมีข้อความไทย labels/keyboard/focusและ375/768/1024/1440ต้องตรวจเมื่อUIจริงพร้อม ไม่มี actualscreens/exportfilesในบท48

## 3 Constraints/การรับบางส่วน/การกู้คืน

Price/amountใช้NUMERIC20,2/canonicalstringsตาม41–43 quantities20,6/unitprecision47 ตรวจfinite/range/scaleก่อนcast multiplication/rounding/taxpolicyมีรุ่นไม่JSfloat ไม่ใช้estimatedtotalเป็นpaidprice UNKNOWNcharge/policyปิดofficial ไม่แปลง0เพื่อให้ผ่าน

Partialfulfilmentต้องacceptedmanifestจากreceipt/workacceptanceserviceภายหลังและcurrentauthority รวมaccepted+cancelledqty<=orderedqty ไม่เท่ากับpending/rejectedqty; acceptedliability/payablecancelableamountมาจากpolicyและเอกสาร ไม่เดาจากunpaidUทั้งหมด Quarantined/rejectedreceiptไม่เป็นacceptedgoods ไม่poststockหรือpaymentในOrderservice การยกเลิกรับแล้ว/มีinvoiceต้องapprovedresolutionตามนโยบายก่อนfinanceadjustment

Atomicoperationsใช้periodgate/globalorder/rowversion/balance/subresourceguardsร่วม43–45, operationreceiptและbusinessuniques FKผูกchildlines/rootrequest/contextจริง การโพสต์หลังclose/backdate/import/workerไม่ข้ามgate ยกเลิกpartialrelease/commitตรวจremainingจากrowsที่lock ไม่ยืมเงินเรื่องอื่นมาค้ำ

Failureก่อนcommit rollbackrequestdecision/order/reservation/obligation/ledger/projection/receipt/audit/outboxทั้งหมด; commitแล้วresponseหายretryด้วยkey/hashเดิมหลังcurrentgrantcheck Workerแจ้งผลใช้outbox11 durableinbox/devsinkdedupe ไม่ส่งภายนอกหรือe-GPเอง ข้อผิดพลาดไม่ล้างoutboxเพื่อซ่อนแจ้งเตือน ถ้าพบorphanlink/mismatchให้incident/reconcile ไม่replayfullreservationหรือcreateorderใหม่เงียบ ๆ

Proposedindexesเฉพาะquery: requests(org,FY,status,created_at), orders(request_id/status), lines(parentrevision,line_no)unique, Suppliercode/businessreferenceuniques, budgetlinkroot/contextunique และversions(parent,recorded_at) ไม่indexทุกPII/evidence/actor คงlogical04จนADRจริง

## 4 Native acceptance ที่ยังไม่ได้รัน

| Case   | หลักฐานที่ต้องได้เมื่อimplementationพร้อม                                                       | สถานะ   |
| ------ | ----------------------------------------------------------------------------------------------- | ------- |
| P48-01 | purchase/service draft-submit-return-correction/serverrequirements/units/item-spec-XOR          | NOT RUN |
| P48-02 | unapproved/inactiveplan/unknownpolicy/insufficientbudgetไม่มีOrderหรือapprovalreservedหลงเหลือ  | NOT RUN |
| P48-03 | approve+reserveatomicและconcurrentrequestsไม่overspend                                          | NOT RUN |
| P48-04 | issuedOrderย้ายR→U samecontext ไม่มีdoublecount partialremainingถูกต้อง                         | NOT RUN |
| P48-05 | ราคาสูงกว่าจอง/amendment/approvedqty/cumulativeorderguards ไม่เพิ่มงบเอง                        | NOT RUN |
| P48-06 | exactqty×price/range/scale/tax/fees/rounding/unknowncurrencyและserviceacceptancepolicy          | NOT RUN |
| P48-07 | samekeyhashretry/hashconflict/newkeysamebusinessslotdeny/nativeunique/rootrevisionbinding       | NOT RUN |
| P48-08 | canceldraftไม่มีevent cancelreserveคืนRเฉพาะremainingหนึ่งครั้ง                                 | NOT RUN |
| P48-09 | partialOrderปลดRunusedและUcancelable คงacceptedliability/history/cancelledqty                   | NOT RUN |
| P48-10 | paid/certified/claims/receivedgoods/dependencyไม่inverseคืนทั้งก้อน refundต้อง44                | NOT RUN |
| P48-11 | cancellationconcurrentissue/receipt/payment/fullboundedretry ไม่มีoverrelease                   | NOT RUN |
| P48-12 | makerchecker/delegation/time/amount/techdenyและcurrentrevocationAPI/worker                      | NOT RUN |
| P48-13 | targetorg/project/line/supplier/childFK/เอกสารข้ามscope/scanpending/privateHTMLcache/exportdeny | NOT RUN |
| P48-14 | failpointbetweenrequest/ledger/link/order/obligation/receipt/audit/outbox rollback              | NOT RUN |
| P48-15 | commitresponseหาย/workerrestart/dedupe/deadletter/reconcileไม่สูญเหตุการณ์                      | NOT RUN |
| P48-16 | periodclosedและofficialtax/procurement/authorityTO VERIFY/e-GPยังไม่verifieddeny                | NOT RUN |
| P48-17 | actualThaiUI/keyboard/4viewports/SupplierVersion/oldorder snapshot/readonlyletterlinks          | NOT RUN |
| P48-18 | legacyrevision/amendment/cancellationhistoricalsourceและcurrentmoneyinvariants ไม่มีโพสต์จากGET | NOT RUN |

ทั้งสองเกณฑ์48ยังBLOCKED ไม่มีfinance/procurementAPI/worker/nativeDB/UIจริง ทุกcaseNOT RUN ไม่มีmigration/seedหรือexternalintegration package/schemaยัง0.6.0 core19models migrationเดียว20261003130000_core_foundation ไม่เริ่ม49
