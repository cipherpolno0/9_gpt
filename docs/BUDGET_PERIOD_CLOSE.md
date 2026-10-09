# การปิดงวด เปิดงวด และปรับปรุงหลังปิด — บท 45

รุ่น 0.1 | 7 ตุลาคม 2569 (2026-10-07) | source `6d56b87` | **Proposal / BLOCKED — period close models/services/UI/migration ยังไม่มี**

## 1 ขอบเขตนโยบาย

ใช้FiscalYear/Organization/source/currency/ledgerกลาง41–44, workflow11/currentAuthDAL07–08/files10 และ [BUDGET_RECONCILIATION](BUDGET_RECONCILIATION.md)45 กฎperiodcalendar/closeconditions/สิทธิ์close-reopen-adjust/ปีใหม่/carryforward/รายการค้าง/retentionยังQ006/Q010/Q017/Q019/TO VERIFY ไม่มีงวดการเงินทางการที่ปิดได้ในruntime45

| Configuration ที่ต้องownerยืนยัน | Guard                                                                                                                            |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| context/calendar                 | org/FY/source/currency/window [starts_on,ends_on), Asia/Bangkok datecut; periodsซ้อนกันในcontextเดียวไม่ได้                      |
| completeness                     | ledger/projection/subresource/invoice/evidence reconcile ณชุดข้อมูลที่sealed; missing/lag/mismatch/unknown deny                  |
| outstanding items                | policyว่าR/U/C/claims/pendingrequestsใดขวางcloseหรืออนุญาตcarry ต้องexplicitapproveddisposition ไม่autozeroหรือsumเป็นค่าใช้จ่าย |
| authority                        | currentclose/reopen/adjust scope+amountbasis+delegation+maker/reviewer/approverseparationตาม44 ผู้ดูแลเทคนิคไม่grantเอง          |
| after-close                      | defaultdenyclosedperiodposting รวมbackdate/reversal/import/worker; reopenหรือadjustingperiodใหม่ตามนโยบายมีรุ่นเท่านั้น          |
| carry/official reports           | verifiedchart/calendar/form/report/purposeก่อนofficial; DEMOcarryไม่กลายเป็นallocationปีใหม่อัตโนมัติ                            |

## 2 Models/keys เสนอผ่านADR/migration

logical04มีperiod_closeแล้วต้องreconcileก่อนimplementationไม่สร้างcloseengineอีกชุด ModeldeltaเสนอBudgetPeriod(id,org,FY/source/currency/window,state,row_version,policy/evidence refs), PeriodCloseVersion(id,period_id,version_no,approvedrequest/decision,sealedreport/ledger manifest/nameversion refs,opening/movement/closingbucketstrings/checksum/eventcount/correlation,effective_at/recorded_at/actors), PeriodStateEvent(close/reopen/supersede/adjustment links/reason/evidence/decision)

UUID/FK/compositecontext/historyimmutable+unique(period,close_version), unique(approvedrequestversion), receiptactor/action/key/hash และnonoverlapperiodsตามcontextต้องmigration/RLS/DBconstraintsจริง แถวperiodstateเป็นprojectionของstateevents updateผ่านcontrolledtxnเท่านั้น Closedversion/report/eventsเก่าไม่update/deleteหรือcascadeลบ

## 3 Transition และการแข่งกับposting

| จาก           | Action / ไป                                            | ผลและข้อห้าม                                                                                                                            |
| ------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| OPEN          | propose close / CLOSE_REVIEW                           | ร่าง/ส่ง/ตรวจconditionsและimpact ไม่ได้closedทันที ทุกpostingยังต้องperiodgateและversion                                                |
| CLOSE_REVIEW  | approve and finalize / CLOSED                          | transactionตรวจapprovedsealedhash/currentauthority, lock/recheck/reconcile+manifest+closeversion+stateevent/receipt/audit/outbox atomic |
| CLOSE_REVIEW  | return/reject/cancel / OPEN                            | decision/historyยังอยู่ ไม่ลบรายการใช้เงิน                                                                                              |
| CLOSED        | request reopen / REOPEN_REVIEW                         | ยังคงdenyclosedposting การยื่นไม่ทำให้เปิดแล้ว                                                                                          |
| REOPEN_REVIEW | approve reopen / OPEN                                  | appendstateevent/decision/reason/evidence, stateversionใหม่ closeversionเดิมคงอยู่ ยังห้ามแก้postedevent                                |
| CLOSED        | approved adjustment / new adjustment period or version | เฉพาะpolicyverified สร้างnew correction event/referencesในช่องทางอนุมัติ ไม่แอบโพสต์effectiveในperiodเดิม                               |

Proposalbaselineทุกwriter42–44/worker/import/reversalใช้period row lockก่อนbalance/subresourceตามglobal lockorderเดียวกัน และcurrentauth/approvalgateร่วมกับprotocol43–44 Closefinalizerlockperiod exclusive รอwriterเดิมcommit/rollbackแล้วอ่าน/lock affectedbalancesตามorder ตรวจperiod rowversion/approvedhash/currentgrants/policy/evidence/reconcileใหม่ก่อนseal หน้าตรวจที่เปิดไว้ก่อนมีnewpostingต้องconflictหรือกลับตรวจชุดใหม่ ไม่approveข้อมูลล่าสุดโดยอัตโนมัติ

เมื่อclosecommitแล้ว writerที่รอlockต้องอ่านstate/versionใหม่และdeny ไม่ใช้OPENที่อ่านก่อนรอ ส่วนwritercommitก่อนcloseต้องอยู่ในmanifestที่closeรับรอง หรือทำให้sealedreviewhashconflict ไม่มีทั้งสองฝ่ายคิดว่าตนทำก่อนอีกฝ่าย Close/reopenjobidempotency/key/hashเหมือน43พร้อมboundedretryทั้งtxnเฉพาะtransient ถ้าเลือกSERIALIZABLEแทนต้องทั้งwriters/close/reopenใช้ร่วมกันและnativeproof ไม่ใช้reportREPEATABLE READอย่างเดียวตัดสินclose

Sealcloseopening/movement/closing totalsจากsnapshotเดียว checksum+eventmanifest+nameversions+policy+decision+unresolveditemdisposition Auditและoutboxtransactionเดียว Devnotificationtosink workerอ่านสิทธิ์ปัจจุบันอีกครั้ง แม้enqueueก่อนrevoke Queueว่างไม่พิสูจน์ว่าไม่มีAPItransactionที่ยังไม่commit

## 4 Closed period และการกู้คืน

postedhistoryimmutableทั้งOPEN/CLOSED Reopenอนุญาตnewcorrectionตามpolicy ไม่อนุญาตUPDATEpostedamount/name snapshot/audit หลังreopenและcloseใหม่ใช้closeversionใหม่ที่supersedesเดิมพร้อมผลกระทบ ไม่overwriteรายงานclosedversionเก่า

Correctionที่ต้องย้อนหลังต้องapprovedreopen/adjustmentrouteตรงcontext/policy เหตุการณ์มีeffective_date/recorded_atแยกและต้นทางref ไม่รับclientbackdateเพื่อหลบclosedgate ไม่carryR/U/P/Cเข้าFYใหม่โดยไม่มีอนุมัติ ไม่ลบpendingrequestsหรือinvoiceclaimเพื่อให้closeผ่าน

รอบนี้ไม่มีชุดบัญชีคู่/งบการเงินทางการ/แบบปิดงวด/ผู้มีอำนาจยืนยัน “งบทดลองระบบ”เป็นbucket roll-forward/diffsที่นิยามในreconciliationเท่านั้น Unknownrule/permissionsต้องfailclosed TrialfixtureDEMOperiodstart/endไม่เป็นปฏิทินจริง

Closefailedก่อนcommitไม่มีcloseversionที่สำเร็จ หลังcommitก่อนackretryคืนversionเดิมเมื่อcurrentreadได้ Mismatchต้องรายงานdiff+event/source IDsตามACLไม่resetledger/projection ข้อมูลปิดผิดใช้newapprovedreopen/adjustment/stateeventไม่ลบaudit ปิดmodulelinksไม่พร้อมยังไม่สร้างtransactionใดจากGETreport

## 5 การตรวจและdependency

P45-10–13ทดสอบclose-vs-posting/reopen/retry/closedbackdate/reversal/import/worker/delegation/P45-14/16sealedreport/lineage/history ต้องnativeหลายconnectionsและauthenticatedAPIจริง ทั้ง16P45และทั้งสองเกณฑ์ผู้ใช้ **NOT RUN/BLOCKED** ไม่มีservice/UI/export/periodrunner

คำสั่งที่มีจริง `corepack pnpm db:test` ใช้scripts/database.mts test เช่นเดียวกับ `node --import tsx scripts/database.mts test`; บันทึกผลแยกentrypointกับwrapperในPROGRESS ไม่อ้างผลtestอื่นเป็นbudgetacceptance typecheck/lint/build/rootunit/smoke/nativeclose/API/businessworker/browser/exportExcel/print-PDF **NOT RUN รอบ45** ต้อง44/ส่วนกลาง/DB-06ผ่านและลงADR/migrations/services/UI/นโยบายจริงก่อน ไม่เริ่ม46
