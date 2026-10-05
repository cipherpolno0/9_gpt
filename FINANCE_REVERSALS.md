# คืนเงิน ยกเลิก และแก้หลักฐานจ่าย — บท 44

รุ่น 0.1 | รับบท 5 ตุลาคม 2569 (2026-10-05) | source `0905a84` | **Proposal / BLOCKED — ไม่มี reversal/refund UI หรือบริการจริง**

## 1 แยกเหตุและผลก่อนกลับรายการ

ใช้ [DISBURSEMENT_WORKFLOW](DISBURSEMENT_WORKFLOW.md), ledger43/สูตร [BUDGET_BALANCE_FORMULA](BUDGET_BALANCE_FORMULA.md), คำขอและdecisionกลาง11 เอกสารกลาง10 และDocumentLinkไปสารบรรณ08เมื่อระบบนั้นพร้อม ไม่สร้างหนังสือหรือเลขสารบรรณปลอมเพื่อถือว่ามีหลักฐานแล้ว

| ประเภทเหตุ                                | เงินและภาระที่ต้องตรวจ                                                         | สิ่งที่ทำได้หลังคำอนุมัติตามpolicy                                                              |
| ----------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| ยกเลิกคำขอที่ยังไม่รับรอง/ไม่จ่าย         | unpaidinvoiceclaim/workflow/version                                            | cancel+releaseเฉพาะclaimที่ยังไม่จ่าย ไม่เปลี่ยนR/U/Pเดิม ไม่มีpaymentreversal                  |
| ยกเลิกส่วนรับรองที่ยังไม่จ่าย             | certifiedremaining/voucher/claim/U                                             | cancel-certificationลดCตามอนุมัติ Uยังอยู่จนยกเลิกภาระแยกต่างหาก; claimreleaseขึ้นกับpolicy     |
| แก้recordจ่ายที่บันทึกผิดแต่ไม่มีจ่ายจริง | originalevent/evidence/P/U/C/invoiceclaim/dependencies                         | correctionrecordใหม่กลับsigneddeltaส่วนที่approved ไม่อ้างว่าโอนเงินคืนแล้ว                     |
| คืนเงินจริงที่มีหลักฐานรับคืน             | originalpayment/returnedamount/receipt/source/invoicecreditnote/period/purpose | append refundrecordตามpolicyที่ยืนยัน แยกเงินคืนจริงจากcorrection ไม่เปิดจ่ายซ้ำ/เพิ่มU/Cโดยเดา |
| ยกเลิกภาระหลังจ่ายบางส่วน                 | unpaidU/C/remainingclaims/paidP/สัญญาและผลกระทบ                                | แก้เฉพาะส่วนที่นโยบายอนุญาต คงPที่จ่ายจริงและaudit ไม่reverseภาระเต็มก้อนเพื่อล้างประวัติ       |
| ปรับงบเพิ่มลดโอนเพื่อแก้ผลกระทบ           | allocation/available/source/FY/obligations                                     | คำขอadjustment42ใหม่ที่มีผู้มีอำนาจ ไม่เปลี่ยนวงเงินเองจากหน้ากลับรายการ                        |

Policyเรื่องrefund/cancellation/creditnote/periodclosed/ภาษี/FX/partialreversal/รายได้คืน/คืนสิทธิ์เบิกยังTO VERIFY ใน44 ไม่เปิดofficialหรือจัดประเภทเงินคืนเป็นรายได้เอง ไม่มีธนาคารAPIหรือการคืนเงินจริงจากเว็บ แม้บันทึกว่าเจ้าหน้าที่ตรวจหลักฐานรับคืนแล้ว

## 2 ไม่กลับรายการด้วยinverseทุกกรณี

สูตร43 V=A-R-U-Pต้องยังตรงบริบท signedledger/projection แต่ประเภทrefundอาจมีวิธีจัดหมวดตามนโยบายที่ต่างจากcorrectionpayment ไม่กำหนดΔU/ΔCจากคำว่า“คืนเงิน”อย่างเดียว ผู้มีอำนาจต้องระบุว่าเหลือภาระเท่าใด มีเงินคืนยืนยันเท่าใด สิทธิ์เบิกเปิดคืนหรือไม่ และต้องแก้invoiceclaim/creditnoteใด

ตัวอย่างสมมติ correctionของpayment5000ที่ลงผิดจากA100000/U15000/P5000/V80000 กลับΔU+5000/ΔP-5000แล้วU20000/P0/V80000 Cจะเพิ่ม5000เฉพาะคำอนุมัติreopenvoucherที่43กำหนด ถ้าไม่ยืนยันให้หยุดเสนอimpactก่อน ไม่ทำrestoreCเงียบ ๆ และไม่อนุญาตrecordpaymentซ้ำด้วยkeyใหม่ Originalevent5000และdecision/evidenceคงอยู่

DEMO44ยังใช้FULL_ONCE_WITH_APPROVED_DEPENDENCY_CHECKของ43 Partialrefund/reversalต้องpolicyและmigration guardsรองรับยอดสะสมreturned/reversed<=eligibleoriginalamountแล้วจึงเปิด ไม่สร้างpositivecreditซ้ำจากหลายคำขอ อนุมัติrefundเงินจริงกับcorrectionledgerเงินก้อนเดียวต้องตรวจdedupe/causeไม่เพิ่มavailableสองครั้ง

## 3 ข้อมูลคำขอกลับและเอกสาร

Fieldsเสนอ: correction_request_id/version/type, original_event_id/decision/voucher/installment/invoiceclaim refs, cause, reason, claimed_amount/currency, confirmed_return_amountเมื่อมีหลักฐาน, effective_on, recorded_at, policy/evidence hashes, maker/reviewer/approver, impact snapshotและsealed hash, approved_delta_strategy, voucher_reopen_allowed, remaining_obligation_after, claim disposition, correspondence_document_id/file_version_id, correlation/receipt

ทั้งหมดอ้างUUID/ทรัพยากรกลาง Paymentoriginal immutable reason/evidenceใหม่ไม่แก้auditเก่า Correspondence refเป็นprivateDocumentLink/centralbusinessresource ไม่เปิดletterbodyหรือobjectkeyผ่านtracking/publicresponse ยังไม่มีระบบ8จริงให้สร้างเลขทะเบียนใน44 Document/FileVersionต้องCLEAN/currentACLหากขาดrequiredให้submitไม่ได้

Impactreportก่อนยืนยันต้องแสดงเรื่องที่เกี่ยวกับขอบเขตผู้ตรวจ: จ่ายเดิม/งวด/ยอดคืนหรือแก้/ภาระยังค้าง/Cและclaimที่เปิดคืนหรือปิด/ผลต่อavailable/รายการค้างการเงินและผู้รับเอกสาร/source/FY/period/version ทั้งก่อนหลัง แสดงincomplete/TO VERIFYแล้วหยุดเมื่อคำนวณeffectไม่ได้ ไม่ใช้0แทนunknownหรือเปิดเผยปลายทางนอกscope

## 4 Flow และการกู้คืน

1. ผู้ร้องสร้างคำขอใหม่อ้างต้นเรื่องพร้อมreason/หลักฐาน ประเภทเหตุชัด distinct maker/reviewer/approverตาม44และcurrentauthority/delegation
2. ผู้ตรวจโหลดsealedรุ่นที่ยืนยันและimpact snapshot ตรวจdownstream/paymentreferences/confirmedreturn/ภาระคงค้าง/invoice policy/evidence; ข้อมูลเปลี่ยนให้conflictกลับตรวจใหม่
3. ผู้อนุมัติapproveเฉพาะstrategy/deltas/reopenflags/claimdispositionที่pinและpolicyverified ไม่รับclientinversevectorหรือapproved=true
4. serverpostingในboundary43 lockทุกbalance/obligation/voucher/invoiceclaim/originalreversalmarker/authorityที่เกี่ยว globalorderเดียว ตรวจcurrentgrants/hash/revision/period/dependencies/ownremaining แล้วappendcorrectioneventและปรับprojections/audit/outbox/receipt atomic
5. retrysamekey/hashคืนผลเดิมต่อเมื่ออ่านได้ differentkeyของoriginalfullreversalเดิมโดนunique/businessguard deny หากพักก่อนcommitไม่มีผล หลังcommitก่อนackอ่านreceipt/eventเดิม ไม่ส่งแจ้งก่อนcommit
6. จ่ายหรือrefundหลักฐานภายนอกที่ตรวจไม่ได้ให้คงpending verification ไม่reverseledgerไปก่อนและไม่ถือว่าnetworkretryเว็บทำเงินคืนจริง ต้องตรวจเจ้าหน้าที่ตามpolicy

No-cascade-delete/no-updateposted/uniqueoriginalfullreversal/typedstrategy/context/nativeguardsเป็นProposalต้องmigration/RLS/restrictedroutineจริง Backendread/write/export/download/approve/jobตรวจcurrentaccount/scopeและfieldsเหมือนUI ผู้เสนอ/technicaladmin/reviewerไม่ข้ามวงเงินได้

## 5 ตรวจรับและสิ่งที่ยังขาด

P44-13–14ใน [budget-44-plan.json](fixtures/budget-44-plan.json) ต้องพิสูจน์เหตุแยก/ต้นทางคงเดิม/retryไม่reverseสองครั้ง/approvedeffectและเอกสารสารบรรณอ้างกลับได้ รวมP44-01–12สำหรับส่ง/confirm/payment/businessduplicate/วงเงิน/delegation/currentACL ทั้ง14กรณี **NOT RUN** ไม่มีrefundsignoffหรือactualfinancialevidenceในfixture

ต้อง43/ส่วนกลาง/DB-06พร้อม models/services/approval/UI/nativeDB/routine constraints และยืนยันpolicyก่อนเปิดใช้งานอย่างเกี่ยวข้อง ไม่อ้างว่าผลreferencechecksหรือเอกสารผ่านคือบริการคืนเงินทำงานได้ ไม่เริ่ม45
