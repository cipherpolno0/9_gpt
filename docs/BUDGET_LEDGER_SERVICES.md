# สัญญาบริการจอง ผูกพัน เบิก และบันทึกจ่าย — บท 43

รุ่น 0.1 | 5 ตุลาคม 2569 (2026-10-05) | source `cffecc4` | **Proposal / BLOCKED — services/models/RPC/migrations ยังไม่มี**

## 1 จุดต่อและข้อมูล

ใช้ event/receipt/balance/approval boundary ของ [ALLOCATION_LEDGER](ALLOCATION_LEDGER.md)42 สูตรและ bucket deltasจาก [BUDGET_BALANCE_FORMULA](BUDGET_BALANCE_FORMULA.md)43 ใช้workflow11/เอกสาร10/currentAuthDAL07–08จริงเมื่อdependencyพร้อม ไม่ใช้ServiceActorเป็นbusinessgrant และไม่เขียนpassword/approvalengineใหม่

| Data delta เสนอผ่านADR/migration      | Fields/relationsและข้อบังคับ                                                                                                                                                                                                               |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Reservation / reservation             | UUID, line/context/currency, approved source request/version, original amount, remaining_reserved projection, originating event, row_version, effective/recorded/actors/policy/evidence; unique approved source request version            |
| Obligation / obligation               | UUID, line/context/currency, originating reservation/event, committed amount, unpaid_remaining, certified_unpaid subset, row_version/policy/actors/evidence; partial conversionหลายeventอ้างreservationเดียวได้แต่ห้ามconsumeเกินremaining |
| Disbursement / disbursement           | voucher UUID, obligation/context, request/version/hash, certified amount/remaining, maker/checker, policy/evidence, effective/recorded; unique approved request version; certificationไม่สร้างP                                            |
| Payment record / budget_posting delta | UUID, voucher/obligation/event/context, canonicalamount, confirmed referenceตามpolicy, evidence/hash/decision, effective_on/recorded_at; unique confirmed business payment keyเมื่อเจ้าของยืนยัน ไม่ใช้keyเดาสุ่มให้clientเลี่ยงduplicate  |
| Reversal request/event refs           | original_event_id, approved reversal request/version, reason/evidence/policy/hash, dependent impacts; ProposalDEMO full reversalหนึ่งครั้งต่อoriginal event ไม่รองรับpartialโดยเดากฎ                                                       |

logical04มี reservation/obligation/disbursement/budget_postingอยู่แล้ว ต้องปรับสัญญาให้ตรง provenance/ส่วนกลางและ42 ไม่สร้าง payment tableอีกชุดที่นับเงินซ้ำ Original posted amounts/evidence pins immutable ส่วน remaining projectionsเปลี่ยนได้เฉพาะcontrolled postingและตรวจคืนกับledger ไม่มีmanual SQLoverwrite

## 2 Service boundaries เสนอ — ยังไม่มี functions เหล่านี้

ตำแหน่ง implementation เสนอ `src/modules/budget/server/ledger.ts` เมื่อ dependency และแผนเขียนโค้ดพร้อมเท่านั้น ต้อง server-only และเรียกDAL/transactionกลาง ไม่สร้างไฟล์ placeholder ที่รับคำขอจริงหรือใช้memory stateเป็นยอดเงินรอบนี้

| Service contract                       | Inputจากclient                                                                          | server resolve/validate/posting                                                                                                 |
| -------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| reserveBudget                          | line_id, amount string, source_request_id/version, expected_revision, idempotency_key   | trusted actor/currentaccount/grant, approved-effectiveplan/allocation, source policy/period, remaining V; สร้างRESERVE/R+amount |
| releaseReservation                     | reservation_id, amount string, reason/evidence refs, expected_revision/key              | remainingของreservationนี้และcurrentapprovalตามpolicy; RELEASE_RESERVATION/R-amount                                             |
| commitReservation                      | reservation_id, amount string, approved obligation request/version, revision/key        | own remaining/context/evidence/decision; R-amount/U+amountในtransactionเดียว                                                    |
| certifyDisbursement                    | obligation_id, amount string, approved voucher/version, revision/key                    | makerchecker, U-Cเฉพาะobligation, evidenceCLEAN/currentACL, policy; C+amount ไม่เปลี่ยนA/R/U/P                                  |
| recordPayment                          | certified_voucher_id, amount string, confirmed payment reference/evidence, revision/key | certified_remaining+unpaid, authority/bizkey/policy; U-amount/P+amount/C-amount ไม่มีbankAPI                                    |
| reverseBudgetEvent                     | original_event_id, approved correction/version, reason/evidence, revision/key           | load originalvector/context/hash, downstreameffects/policy/makerchecker; append authorizedinverseและreconcileต้นเรื่อง          |
| readBudgetBalance / exportBudgetLedger | line/context/date/page filters                                                          | currentread/exportscopeและfieldpolicy; auditตามpolicy; pinned effective/recorded history ไม่ให้clientorgเพิ่มgrant              |

ไม่รับactor/org/remaining/vector/grantจากclientเป็นข้อมูลเชื่อถือ amountไม่ใช่JSONnumber/float Signeddeltasจากชนิดeventที่serverตรวจ ทุกwriteต้องrequest/decision/financialevidenceตามrequirementsมีรุ่น keyเดิมhashต่าง409ไม่reuseผลเดิม อ่านreceiptต้องสิทธิ์ปัจจุบันห้ามreceiptหลบrevoke

## 3 Native transaction protocol ที่เสนอ

เลือก row lockingเป็นbaselineProposal หรือ SERIALIZABLEตามADRพร้อมnativeproof ไม่ใช่แค่transactionธรรมดาหรือmemorymutex ทุกwriterของallocation/transfer/reserve/commit/certify/payment/reversalและการrevoke/closeที่เกี่ยวข้องใช้protocolเดียวกัน

1. validateรูปแบบstring/UUID/key/schemaและresolve trusted actor ก่อนtxn ไม่logsecret/clientpayloadเต็ม
2. begintransaction claimunique receipt/hash ถ้าซ้ำรอผลtransactionเดิมแล้วre-authorizeก่อนคืน ถ้าpayloadต่างให้conflict ไม่มีexternalnotificationในtxn
3. lock authority/approval/period stateตามglobalorderเดียวกับ42 แล้ว BudgetBalanceของทุกlineเรียงUUID และ reservation/obligation/voucherต้นเรื่องตามorderคงที่ ทุกpathใช้ลำดับเดียวกัน balanceแถวต้องมีจากallocationposting ถ้าไม่มีdeny ไม่lazycreate0เพื่อสมมติgrant
4. recheckcurrentaccount/grants/delegation/makerchecker/sealedhash/plan/sourcepolicy/period/evidenceACL หลังรอlock ตรวจexpected_revisionและamountต่อทั้งlineและต้นเรื่อง Unknown/TO VERIFYปิดofficial; DEMOต้องแยกmodeชัด
5. derive typed delta vector ตรวจavailable/remaining/certified limits nonnegative/finite/currency และpolicy; updateทุกbucketที่เกี่ยวพร้อม subresource projections/CAS appendevent/pins/receipt/audit/outboxในtransactionเดียว
6. DBguardconstraintsตรวจvectorชนิดevent/cross-rowcontext/receipt/reversal/lineและsubresource reconciliation commitสำเร็จค่อยตอบ; error rollbackทุกbucket ไม่เหลือRลดแต่Uไม่เพิ่ม หรือUลดแต่Pไม่เพิ่ม
7. transient40001/40P01ให้bounded retryทั้งtransactionพร้อมsamekey/hashและre-authorizeแต่ละรอบ ไม่retrybusinessdenial/scale/scope/insufficient/revisionconflict อาจรอแบบbackoffตามconfig; หมดretryแจ้งให้ลองใหม่ด้วยkeyเดิม ไม่สร้างkeyใหม่หรือผลจ่ายซ้ำ

DEMOretryเสนอ max_attempts=3 (รวมครั้งแรก) เท่านั้น ยังไม่มีconfigloaderหรือtimer จริง ต้องทบทวนlatency/locktimeoutกับเจ้าของ ไม่ถือเป็นมาตรฐานทางการ [PostgreSQL18 Transaction Isolation](https://www.postgresql.org/docs/18/transaction-iso.html) ระบุ serialization failureต้องเริ่มtransactionใหม่ และ [Explicit Locking](https://www.postgresql.org/docs/18/explicit-locking.html) อธิบาย row lockรอtransactionที่ชน ข้อมูลสองแหล่งเป็นฐานออกแบบ ไม่ใช่ผลตรวจservices

## 4 ข้อบังคับฐานข้อมูลที่ต้องทำจริง

| Ref    | Constraint / guard เสนอ                                                                                                                            |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| K43-01 | NUMERIC(20,2)finite/scale ingressก่อนcast/currency context; nonnegativeA/R/U/P/Vและsubresource remaining; 0<=C<=U                                  |
| K43-02 | FK/UNIQUEcomposite line/org/FY/source/currency/obligation/voucher; wrongsourceห้ามใช้ยอดlineอื่นมาค้ำ                                              |
| K43-03 | eventkind→delta pattern: RESERVE R+; RELEASE R-; COMMIT R-/U+; CERTIFY C+; PAYMENT U-/P+/C-; authorization hashตรงsealedversion                    |
| K43-04 | restrictedroutine/cross-rowguardตรวจ per-source remaining/certified/payment totals และlineprojectionตรงevent ใหม่; ไม่มีplainCHECKข้ามแถวอ้างว่าพอ |
| K43-05 | unique(actor,action,idempotency_key), approvedsourceversion/event link, confirmedpaymentbusinesskeyจากpolicy; samekeydifferenthashconflict         |
| K43-06 | originalposted eventupdate/delete denied ไม่มีcascadeลบหลักฐาน; reversaloriginalFKและunique full reversalต่อoriginalในDEMO                         |
| K43-07 | RLSทุกตาราง/restrictedwriter/currentbusinessACL/RPCcontextที่ปลอมไม่ได้; techadmin/workercredentialไม่grantเอง                                     |
| K43-08 | receipt/ledger/allbucketprojections/audit/outbox atomic; lockorderหรือserializableครอบคลุมwriter/revoke/periodclosureและnativeproof                |

SECURITYDEFINERถ้าใช้ต้องowner/runtimeแยก safe search_path/schemaqualified refs/revoke PUBLICEXECUTE contexttrustedและcurrentDAL/RLSตาม42 ไม่ใช้DBbypassเป็นการอนุมัติ ไม่มีmigration/RPC/SQLconstraintsเหล่านี้จริงรอบ43

## 5 Reversal และการกู้คืน

Fullreversalของpayment5000เสนอΔU+5000/ΔP-5000; ΔC+5000เฉพาะเมื่อคำอนุมัติเปิดคืนvoucherตามpolicyและมีหลักฐาน correction **ไม่แปลว่าคืนเงินธนาคารแล้ว** หากvoucherถูกยกเลิก/สิทธิ์เบิกไม่ยืนยันหยุดเสนอผลกระทบก่อน ไม่เปิดจ่ายใหม่ด้วยinverseอัตโนมัติ

ถ้าreservationถูกconvertแล้ว reverseRESERVEไม่ได้ แม้line Rรวมจากเรื่องอื่นมากพอ; obligationที่มีcertification/payment downstreamไม่กลับCOMMITทันที ต้องคำขอแก้downstreamตามdependencyและpolicy หรือให้denial ไม่แก้eventเดิม RulefullreversalในDEMOเป็นProposal partialreversal/refund/tax/FXต้องTO VERIFYก่อนเปิด

Workerหยุดก่อนcommitไม่มีeventที่สำเร็จ หลังcommitก่อนackกลับมาreceipt/hashเดิม currentgrantsยังตรวจ Notificationผ่านoutbox/dedupe/sinkdev ระหว่างrevoke/periodclosedไม่ใช้enqueuepermissionเดิมเป็นgrant Reconciliationmismatchหยุดpostingและรายงานเหตุการณ์ที่ต่าง ให้เจ้าหน้าที่ตรวจ correction/evidence ไม่resetprojectionเงียบ ๆ

## 6 แผนตรวจและcommandsที่มีจริง

[budget-43-plan.json](fixtures/budget-43-plan.json)0.1เป็นPLAN ONLY/DEMO ไม่seed/config/runtime ไม่มีexecutablebudgettest runner P43-01–16ทั้งหมดNOT RUN

| กลุ่ม cases | สิ่งที่ต้องพิสูจน์จริง                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------------------------ |
| P43-01–05   | end-to-endexample/partial conversions/releases/certification subset/partial payments/per-source limits             |
| P43-06–09   | nativeสองconnectionbarrier/overspendonewinner/commit-vs-release/certify-vs-pay/key retry/hashconflict/rollback     |
| P43-10–13   | nativeboundedtransientretry/currentACLscope/revokequeuedjob/makerchecker/period/evidence/officialunknowndeny       |
| P43-14–16   | approvedreversal/dependencies/nohistoryloss/reconciliation/effective-recordedhistory/exactmoney/export/publicleaks |

เกณฑ์43-01ผูกP43-01–05/14–16 เกณฑ์43-02ผูกP43-06–10/15 ทั้งสองBLOCKED referencearithmeticไม่เป็นPASS Commandsปัจจุบัน `corepack pnpm db:test` รันexit1; `corepack pnpm typecheck`, `corepack pnpm lint`, `corepack pnpm build`, rootunit/smoke/nativeledger/API/worker/browser **NOT RUN รอบ43** ไม่มีคำสั่งbudgettestsให้เรียก ต้องimplementหลัง42/ส่วนกลาง/nativeDBผ่านและapprovalแผนเขียนโค้ดเฉพาะบท ไม่เริ่ม44
