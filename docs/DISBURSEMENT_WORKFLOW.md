# คำขอเบิกจ่าย หน้าจอ และอำนาจอนุมัติ — บท 44

รุ่น 0.1 | รับบท 5 ตุลาคม 2569 (2026-10-05) | source `0905a84` | **Proposal / BLOCKED — ไม่มี UI/approvals/services จริง**

## 1 Dependency และลำดับ

บท43ยังไม่ผ่าน มี [BUDGET_LEDGER_SERVICES](BUDGET_LEDGER_SERVICES.md) และ [BUDGET_BALANCE_FORMULA](BUDGET_BALANCE_FORMULA.md) เป็นสัญญา ไม่มี budget models/ledger/currentAuthDAL/WorkflowInstance/files/outbox runtime รอบ44 `corepack pnpm db:test` exit1 Docker CLI/socketไม่มี TCPทดลอง5432/5546refused เอกสารนี้ไม่แทน UI/approval implementation หรือ native acceptance

การส่งคำขอไม่เท่ากับรับรองเบิก และการรับรองไม่เท่ากับบันทึกจ่าย ใช้คำขอ/decision กลาง11และDisbursement/voucherเดียวจาก43 ไม่สร้างlogin/engineใหม่ ภาระเดิมยังอยู่ในUหลังรับรอง Cเป็นsubsetU บันทึกจ่ายค่อยย้ายU→PและลดCแบบatomic ไม่โอนเงินธนาคารจริง

| ขั้น                              | งาน                                 | Server guards และผล                                                                                                                                       |
| --------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| draft / returned                  | ร่าง แก้และแนบหลักฐาน               | actor/currenteditor scope, expected_revision, privateCLEANไฟล์ผ่านบริการ10; ไม่โพสต์เงิน                                                                  |
| submitted                         | ตรวจครบ ส่งรุ่นsealed               | approved-effectiveplan/obligation, invoiceidentity, amount/installment/evidence/policyครบ; hash/revision/workflow/receipt/invoiceclaim/audit/outboxatomic |
| reviewing                         | ผู้ตรวจตรวจข้อเท็จจริงและหลักฐาน    | currentreviewgrant/วันมอบหมาย; คนละคนกับผู้สร้างหรือผู้แก้สาระสำคัญ; ส่งกลับหรือเสนอความเห็นพร้อมเหตุผล                                                   |
| approved / certified              | ผู้อนุมัติยืนยันรับรองรุ่นที่ตรวจ   | คนที่สามต่างจากmaker/editor/reviewer currentauthority/วงเงิน/hash/decision; CERTIFY C+ตาม43ไม่เพิ่มP                                                      |
| payment recorded / partially paid | ผู้มีสิทธิ์บันทึกหลักฐานจ่ายเป็นงวด | certified_remaining/obligation_unpaid/invoiceclaim/referenceไม่ซ้ำ/currentrecordgrant/period/evidence; U-/P+/C-atomic                                     |
| rejected / cancelled              | ปฏิเสธหรือยกเลิกก่อนมีผล            | reason/authority; releaseเฉพาะunpaidclaimเมื่อpolicyอนุญาต ไม่ลบคำขอหรือยกเลิกledgerเงินที่โพสต์แล้ว                                                      |

approvalสถานะworkflowกับCERTIFYpostingแยกกัน ถ้าpostingไม่สำเร็จแสดงรอ/ข้อขัดข้อง ไม่แสดงcertified_availableที่ยังไม่มีจริง workerตรวจcurrentauthority/วันที่/หลักฐาน/decisionใหม่ Returned correctionเปลี่ยนrevision/sealedhashและเริ่มตรวจใหม่ คงคำตัดสินเดิม เกณฑ์แก้คำขอที่มีจ่ายแล้วต้องใช้ [FINANCE_REVERSALS](FINANCE_REVERSALS.md)

## 2 UI เสนอ — routes ยังไม่มี

| หน้าเสนอ                                  | ข้อมูลและสถานะที่ต้องแสดง                                                                                                                     |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `/app/budget/disbursements`               | รายการหน่วยงาน/FY/source/project/status/reviewer queue ตามscopeพร้อมpagination ไม่คืนยอดหรือชื่อภายนอกscope                                   |
| `/app/budget/disbursements/new`           | เลือกภาระต้นเรื่อง ยอดยังไม่จ่าย invoiceที่มีหลักฐาน งวด/จำนวนเงิน/currency/เหตุผล/ไฟล์/ตรวจทาน; optiondirectexpenseปิดเมื่อpolicyไม่verified |
| `/app/budget/disbursements/{id}`          | ร่าง/resume/returned corrections/request revision/สถานะรับรองแยกสถานะจ่าย/ยอดclaimและCคงค้าง/reportimpact                                     |
| `/app/budget/disbursements/{id}/review`   | ข้อมูลก่อนหลัง sourcepolicy/hash/evidenceACL/ความเห็นผู้ตรวจ/วงเงินและdelegation; ผู้ไม่มีอำนาจเห็นเหตุผลที่ทำactionไม่ได้ตามfieldpolicy      |
| `/app/budget/disbursements/{id}/payments` | งวดจ่าย หลักฐาน/reference/canonicalamount/revision/key และผลเดิมเมื่อretry; ไม่รับclientpaid=trueเป็นหลักฐาน                                  |

ใช้sharedUI/layout/tokens/Thai font09เมื่อพร้อม จำนวนเงินstringตาม41; วันที่ UIพ.ศ./วันตัดรอบAsia/Bangkok Labels/error summary/focus/aria/keyboard/375/768/1024/1440ต้องตรวจเว็บจริง ไม่พึ่งซ่อนปุ่มหรือclientvalidation Publicไม่มีfinanceDTO; private/no-store/read/export/print/filegatewayตรวจสิทธิ์ใหม่ทุกboundary

## 3 Configuration อำนาจที่ต้องยืนยัน

| หมวด                 | Fields และการตรวจ                                                                                                                                              |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| provenance           | policycode/version/issuer/source evidence hash/approved decision/validfrom-to/verification_status; unknownหรือTO VERIFY denyofficial                           |
| actions              | create/review/certify/record_payment/adjust_allocation/reverse/refund_record แยก grant ไม่ให้ชื่อฝ่ายเพิ่มสิทธิ์                                               |
| scope                | Organization/FiscalYear/source/category/project/currency ที่สัมพันธ์กับlineและต้นเรื่อง Resolveจากฐาน ไม่เชื่อorg_id/clientpolicyid                            |
| bands                | exactcanonical lower/upper amount/inclusive flags/required approval stepsและbasisของวงเงินที่ownerยืนยัน; ไม่ตั้งเลขวงเงินจริงเอง                              |
| delegation           | principal/delegate/currentbasegrant/action/scope/currency/amount ceiling/starts_at/ends_at/evidence/revoked_at; starts<=servernow<ends, revokeทันทีที่ตรวจใหม่ |
| separation           | maker/materialeditors/reviewer/approverเป็นคนละคนตามบท44; delegatedapproverที่เป็นmaker/reviewerห้ามcertifyเช่นเดิม                                            |
| direct expense       | allow_direct_expense=false default; verifiedallowedtypes/evidence/approval/source/window/budget guard ก่อนสร้างภาระ ไม่ทำskipUแล้วเพิ่มPเอง                    |
| duplicate/instalment | verifiedinvoiceissueridentity/key/normalization/period/currency/amount basis/installment limits/confirmedpaymentbusinesskey/claimrelease/credit-note policy    |

วงเงินตรวจจากbasisที่ownerอนุมัติ เช่นยอดเรื่อง/ยอดสะสมตามinvoiceหรือภาระ ไม่ใช้ยอดงวดเล็กลงเพื่อเลี่ยงผู้อนุมัติขั้นสูง Splitrequestsต้องตรวจaggregate basisที่pinและlockตามpolicy วงเงินdelegeeต้องไม่เกินทั้งcurrentbaseauthorityและdelegationเฉพาะscope ห้ามตกทอดต่อเองหรือเลือกpolicyเก่าที่วงเงินสูงกว่า Unknownbasis/issuer/delegationproofให้deny

FixturesDEMOมีวงเงินตัวอย่างเพื่อreferencechecksเท่านั้น `official_allowed=false`/`runtime_loaded=false`/authorityจริงว่าง ไม่เป็นบัญชีหรือgrant และไม่ใช้ตัวเลขนี้อ้างระเบียบการเงิน

## 4 Invoice identity และงวด

Invoice identityต้องมี issuerที่ยืนยัน/rawreference/canonicalreference/issueperiodถ้าissuerreusesเลข/currency/recipientและverification evidenceตามkeypolicy ไม่เดาว่าเลขinvoiceไม่ซ้ำทั้งประเทศหรือแยกFYเสมอ issuerเดียวกันinvoiceเดิมเปลี่ยนปีงบต้องไม่เลี่ยงdedupe บท44DEMOเสนอkey(recipient_org,verified_issuer,reference_namespace,canonical_reference) ไม่เปิดofficialจนยืนยันทุกdimension issuerต้องอ้างรหัสคู่กรณีจากข้อมูลกลางและFK/ชนิดที่ADRยืนยัน ไม่สร้างชื่อผู้ขาย/ข้อมูลPersonหรือOrganizationสำเนาใหม่เพื่อทำkey ถ้ายังresolveissuerที่ตรวจแล้วไม่ได้ให้หยุดsubmit

Proposal canonicalizationDEMO trimขอบ+UnicodeNFC case-sensitive คง0นำหน้า/เครื่องหมาย/เลขไทยและเลขอารบิกตามต้นฉบับ ไม่strip punctuation/casefold/digitconvertเพื่อmergeคนละinvoiceอย่างเงียบ ๆ Filehashตรวจbytesซ้ำเป็นสัญญาณช่วย ไม่พิสูจน์issueridentityหรือinvoiceเดียวกันทั้งหมด ข้อมูลที่ดูคล้ายต้องreviewพร้อมหลักฐาน ไม่รวมอัตโนมัติ

| Data contract delta ผ่านADR/migrationเมื่อพร้อม | Key/constraintและหน้าที่                                                                                                                                                                               |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| InvoiceReference identity/version               | UUID/context/verifiedissuer/rawcanonicalrefs/keypolicyversion/evidence/approvedpayableamount NUMERIC(20,2)/currency/recorded_at; nonnullbusinesskey+UNIQUEเมื่อaccepted; incomplete draftแยกก่อนsubmit |
| InvoiceClaim                                    | invoice_id/request_version_id/obligation_id/amount_unpaid_claim/paid_net/context/state/row_version; unique(request_version_id)ตั้งแต่submitและcompositecontext; lockinvoice+claimทุกwriter             |
| Disbursement request version/installment        | existing43voucher/request refs sealedhash/revision/invoiceclaim/evidence/reviewer/approver/basis pins; unique(request,version,installment_code)ตามpolicy ไม่uniquefullinvoiceจนห้ามงวดที่ถูกต้อง       |
| Payment reference                               | existingbudget_posting/event/confirmedbusinesskeyจาก43 ผูกinvoice/voucher/installment/context/amount/evidence; uniqueverifiedkey ไม่สร้างledgerจ่ายอีกชุด                                              |

invoiceหนึ่งใบอาจจ่ายหลายงวดที่policyอนุญาต ใช้identityเดียวและclaimsที่ตรวจไม่เกินยอด: **paid_net + active_unpaid_claims <= approved_invoice_payable_amount** เมื่อจ่ายลดunpaidclaimและเพิ่มpaidnetจำนวนเดียวกัน ไม่รวมoriginalclaimเต็มก้อนกับpaidnetซ้ำ Returned/heldclaimยังถือcapacityจนมีreleaseeventตามpolicyไม่resetจากUI; rejected/cancelledปล่อยได้เฉพาะยังไม่จ่ายและตรวจeffectแล้ว

คำขอเบิกใหม่ต้องamount<=U - ผลรวมactive_unpaid_claimsที่ผูกobligationนี้ และinvoicecapacityคงเหลือ ตรวจทั้งสองภายใต้lock Cเป็นส่วนหนึ่งของclaimsเหล่านี้แล้วไม่หักCอีกครั้ง ผู้ตรวจรับรองเฉพาะownclaimที่ยังไม่รับรองและ<=U-C ไม่สร้างclaimทั้งก้อนซ้ำตอนcertify การจ่ายต้องamount<=owncertifiedremaining, obligationunpaid, ownunpaidclaim และinstallmentpolicy Unknowntax/gross/net/creditnote/FXไม่คำนวณเอง exactstringsทุกชั้น

## 5 Transaction และเกณฑ์

Service/DAL/serveractions/routes/workerใช้currentaccount/action/resource/scope/delegation/field/evidence/policy denydefaultทุกครั้ง ถ้า43เลือกrowlock ให้เพิ่มinvoice/claim/basis rowsในglobal lockorderที่ทุกpathรวมrevoke/periodclosure/reversalใช้เดียวกัน หากเลือกserializableให้fullboundedretryตาม43 ห้ามreadSUMก่อนtxnแล้วเชื่อว่ายอดไม่เปลี่ยน

Atomicboundary: receipt/hash+requestrevision+workflow/decision+invoiceclaims+43ledger/C/U/P/voucher/installmentprojections+audit/outbox unique decision/submissionและevent/request/version การส่งซ้ำคืนเรื่องเดิมและconfirmซ้ำคืนpaymentเดิมเฉพาะactorยังอ่านได้ keyเดิมpayloadต่างconflict differentkeyสำหรับfinancialreferenceเดิมต้องbusinessduplicate deny ไม่ใช้แค่ปุ่มdisabled

K44-01: nonnullverifiedinvoicekey+UNIQUE; K44-02: receipt/requesthash/paymentbusinesskey; K44-03: compositecontext/invoice/claim/obligation/voucher; K44-04: ownunpaidclaim/paidnet/basisamount guardsในcontrolledDBposting; K44-05: three-person separation/currentdelegation; K44-06: immutablesealedversions/decisionCAS; K44-07: atomicledger/audit/outbox/RLS/restrictedwriter; K44-08: evidenceCLEAN/ACL/currentpolicyและreversaldependencies ต้องลงmigrationและnativeproofทั้งหมด ไม่มีDDLจริงรอบนี้

[PostgreSQL18 Constraints](https://www.postgresql.org/docs/18/ddl-constraints.html) ระบุUNIQUEปกติยอมNULLซ้ำ และCHECKไม่รับประกันข้อมูลหลายแถว จึงต้องnonnullacceptedkeyและcontrolled cross-row posting/lockingตาม43 ข้อเสนอในเอกสารไม่เป็นหลักฐานconstraintsทำงานแล้ว

รายจ่ายตรงถ้าpolicyverifiedต้องผ่านคำขอและสร้างobligationที่อนุมัติพร้อมU+amount/availableguardในposting boundary43ก่อนcertify eventkind/ADR/nativeproofเพิ่มเมื่อจำเป็น ไม่ถือว่าpermissioncreateexpenseทำให้skipreview/certifyได้ ในรอบนี้ไม่มีpolicyหรือdirectexpensehandlerจริงและoptionปิด

[budget-44-plan.json](fixtures/budget-44-plan.json)0.1มี P44-01–14ทั้งหมดNOT RUN เกณฑ์44-01ผูกP44-01/02/03/04/05/09 เกณฑ์44-02ผูกP44-06/07/08/10/11/12 ทั้งสองBLOCKED ไม่มีUI/DAL/API/nativeDB Commandsที่มีจริง `corepack pnpm db:test` exit1; typecheck/lint/build/rootunit/smoke/financeUI/worker/nativeconcurrency/P44 **NOT RUN รอบ44** ต้อง43และส่วนกลางพร้อมก่อนimplementation/รับรอง ไม่เริ่ม45
