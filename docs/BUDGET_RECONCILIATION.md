# รายงานงบ ณ วันที่และการกระทบยอด — บท 45

รุ่น 0.1 | 7 ตุลาคม 2569 (2026-10-07) | source `6d56b87` | **Proposal / BLOCKED — ไม่มี budget reports/export/reconciliation service จริง**

## 1 สถานะและความหมายของการกระทบยอด

บท44ยังไม่ผ่าน ไม่มี budget models/ledger/DAL/approval/file/outbox runtime มีเพียง [DISBURSEMENT_WORKFLOW](DISBURSEMENT_WORKFLOW.md)44 และสัญญา41–43 รอบ45ไม่พบDockerCLI/socketและTCPทดลอง5432/5546refused คำสั่งฐานทดลองผ่านentrypointเดียวกับdb:testล้มเหลว รายงานในเอกสารและ [budget-45-plan.json](fixtures/budget-45-plan.json) เป็นPLAN ONLY ไม่ใช่รายงานเงินที่เปิดใช้งานได้

Ledgerที่โพสต์แล้วเป็นแหล่งข้อมูลจริง Projectionเป็นยอดที่คำนวณจากเหตุการณ์เพื่ออ่านเร็ว การกระทบยอดคือคำนวณ ledger ใหม่แล้วเทียบ projection/ต้นเรื่อง/report/exportsที่ใช้ข้อมูลชุดเดียวกัน หากไม่ตรงต้องแจ้งความต่างและหยุดการรับรองหรือปิดงวด ไม่แก้ledgerให้ตรงprojection ไม่แปลงข้อมูลที่ขาดเป็น0

ใช้ Organization/FiscalYear/Project/source/line/currencyกลาง FYเป็นdimensionการเงิน AcademicYearเป็นdimensionโครงการจัดสอบที่อ้างผ่านmapping41 ปีเลขเดียวกันไม่เป็นIDเดียวกัน โครงการหนึ่งอาจคร่อมหลายFY การgroupตามAYต้องแสดงFYแยกและไม่joinmany-to-manyแล้วนับเงินซ้ำ

## 2 ยอดและสถานะที่รายงาน

| คอลัมน์            | วิธีคำนวณ ณ ชุดเหตุการณ์ที่ระบุ                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------- |
| จัดสรรสุทธิ A      | sum allocation signed deltasมีผล ไม่sumAllocationVersion targetsทุกรุ่น                                       |
| จองคงค้าง R        | reserve - release - converted +/- approved reversals                                                          |
| ภาระยังไม่จ่าย U   | committed - paid - approved cancellations +/- authorized corrections                                          |
| รับรองเบิกคงค้าง C | certified - paid - cancelled certification +/- approved reopen; CsubsetU ไม่หักอีกครั้ง                       |
| จ่ายแล้วสุทธิ P    | payment recordsและcorrection/refundstrategyที่policyยืนยัน ไม่ใช้statusคำขอเป็นยอดจ่าย                        |
| คงเหลือ V          | A-R-U-P ตาม [BUDGET_BALANCE_FORMULA](BUDGET_BALANCE_FORMULA.md)43                                             |
| รายการค้าง         | pending requests/uncertifiedclaims/Cunpaid/remainingR/U แสดงจำนวน/อายุ/เหตุขัดข้องแยก ไม่เพิ่มยอดหักจากR/Uซ้ำ |

Draft/submitted/returned/rejected/cancelled requestsเป็นข้อมูลติดตามไม่เป็นledger spend ดูความต่างrequested/certified/paidต่อinvoice/voucherตาม44 paid+activeunpaidclaims<=approvedinvoicepayableamount และremainingของreservation/obligation/voucherต้องตรงbucket aggregatesด้วย ไม่อ้างว่าCเป็นยอด“เบิกเพิ่ม”หรือถือว่าrecordpaymentเป็นการโอนธนาคาร

## 3 Report version และวันอ้างอิง

Report envelopeเสนอ: report_id/version, organization/FY/source/project/currency/filter hashesที่serverresolve, effective_as_of_on, knowledge_mode, generated_at, policy_version, ledger_manifest_id/hash, event_count, per_line_watermarks, projection_processed_watermarks, last_processed_at, freshness/mismatch status, row_count/page totals และorganization_name_version refs/labelsnapshot แต่ละreport version immutable

| Mode                | สิ่งที่ใช้                                                     | การแสดงผล                                                                          |
| ------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| current/recomputed  | committed eventsที่มองเห็นในsnapshotเดียวและeffective_on<=asof | รายงานคำนวณใหม่ อาจรวมcorrectionที่บันทึกภายหลัง ต้องเป็นreportรุ่นใหม่            |
| sealed historical   | exact event manifest/policy/name versionsของreportเดิม         | ทำซ้ำreportเดิมได้ ไม่ดึงชื่อหรือpolicyล่าสุดมาเปลี่ยน                             |
| restated historical | correction/evidenceที่ได้รับอนุมัติและmanifestใหม่แทนรุ่นเดิม  | แสดงsupersedes/reason/known-at/version พร้อมลิงก์เดิมตามACL ไม่overwriteรายงานเก่า |

effective_on DATE กับrecorded_at TIMESTAMPTZคนละความหมาย Date cut Asia/BangkokและUIพ.ศ. ห้ามรวมfuture eventsก่อนมีผล recorded_at cutoffอย่างเดียวไม่รับประกันชุดcommitted eventsเดิมเพราะtransactionอาจcommitทีหลัง timestampที่ตั้งไว้ก่อน จึงsealmanifest event IDs/hashesเมื่อสร้างreportในconsistent snapshot ไม่ใช้MAX(sequence)เป็นcommit watermarkโดยไม่พิสูจน์

Report queryเสนอREPEATABLE READ READ ONLY consistent snapshotอ่านledger/projection/sourceversionsในtransactionเดียวและcaptureชุดผล+manifest เมื่อผู้ใช้สั่งสร้างreport versionให้persistmetadataที่captureแล้วในwrite transactionแยกพร้อมตรวจcurrentgrants/hash/contextซ้ำ ไม่INSERTในREAD ONLY transaction ไม่คำนวณใหม่จากlatestระหว่างpersist การอ่านรายงานไม่เรียกbudgetposting สำหรับปิดงวดใช้write protocolใน [BUDGET_PERIOD_CLOSE](BUDGET_PERIOD_CLOSE.md) ไม่ถือว่าreadsnapshotหรือqueueว่างทำให้ปิดงวดได้อย่างถูกต้อง

Per-line ledger_sequenceต้องเพิ่มภายใต้posting lockและcommitatomicตาม43 ไม่ใช้global nextvalลำดับเดียวแทนcommit order Seal eventset hashจากcanonical serialization/orderคงที่ ไม่SUMหรือJOINแล้วhash outputตามorderสุ่ม สิทธิ์ปัจจุบันและname disclosure policyยังตรวจทุกread/export/downloadแม้reportsealedไว้ในอดีต

ชื่อ/รหัสหน่วยงานและsource/projectlabelsที่ปรากฏต้องpin version/snapshotอ้างhistoryกลางพร้อมหลักฐาน หากชื่อปัจจุบันเปลี่ยน รายงานเดิมยังชื่อเดิม การแก้ชื่อในรายงานเก่าต้องapprovedrestatement/nameversionใหม่พร้อมเหตุผล ไม่ใช้joins Organization.nameปัจจุบันโดยไม่มีversionref ถ้าขาดhistoryให้ระบุincompleteและปิดการรับรอง ไม่เดาชื่อย้อนหลัง

## 4 Reconciliation และงบทดลองระบบ

| Ref    | การตรวจที่เสนอ                                                                                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| R45-01 | Replay manifest eventแต่ละline/context/currencyตามtypedvector43/strategy44; finite/nonnegativeและV=A-R-U-P; CsubsetU                  |
| R45-02 | ledger bucketsเท่ากับprojectionทุกbucket ณ watermarkเดียวกัน; ถ้าprojectionlagแสดงlastprocessed/missingevents ห้ามป้ายfreshหรือclosed |
| R45-03 | per-source remaining/obligation/voucher/claims/paymentref sumsและdecision/evidence/hash lineageตรงกัน ไม่sumjoinone-to-manyซ้ำ        |
| R45-04 | transferconservationสองlegs/contextและreversalอ้างต้นทาง; ไม่ใช้double-entryclaimกับeventที่ไม่มีคู่บัญชีจริง                         |
| R45-05 | report row/page/grand totals/screen/Excel/print-PDF canonicalstringsตรงกัน ใช้manifest/policy/name versions/filterเดียวกัน            |
| R45-06 | groupFY/source/project/org/currencyไม่รวมAYจากlabelเดียวหรือallocationtargetsซ้ำ; totalsเฉพาะscopeที่อ่านได้                          |
| R45-07 | immutablemanifest/report snapshots/restate refs/hash และfreshness stampsครบ ไม่มีrepairsilentหรือlatestnameoverwrite                  |
| R45-08 | unknownpolicy/closedperiod/evidence/currentACL/retention/makerchecker/exportworkerrevoke failclosed ตามboundary                       |

งบทดลองระบบใน45หมายถึงตารางยอดเปิดงวด+movement=ยอดปลายงวดต่อbucket A/R/U/P/C และVตามสูตร พร้อมdiffรายline/event ไม่อ้างเป็นงบทดลองทางบัญชีคู่หรืองบการเงินทางการ เมื่อยังไม่มีchartofaccounts/กฎบัญชีที่ยืนยัน ไม่มีการเชื่อมNBMSหรือระบบบัญชีธนาคาร

Projectionlagกับmismatchแยกกัน Lagจับจากcommittedmanifest/processedperline watermark ต้องwait/replayแล้วreconcileใหม่ Mismatchที่watermarkเท่ากันเป็นเหตุขัดข้องต้องเสนอfreezepostingตามimpact/authorityและตรวจโดยเจ้าหน้าที่ การเปิดรายงานไม่สั่งfreezeหรือแก้projectionโดยอัตโนมัติ Rebuildต้องจากledgerเดิมในพื้นที่ควบคุม มีaudit/reportdiffและcurrentgrants ไม่เปลี่ยนรายการที่postedแล้ว

## 5 หน้ารายงานและexportsเสนอ — ยังไม่มีUI/adapters

หน้าหลักเสนอ `/app/budget/reports` เลือกFY/asof/source/project/org/currency/mode มีfilters/pagination/loading/empty/error/permission/freshness/mismatch พร้อมลิงก์event/voucher/request/documentเมื่อมีACL วงเงิน/เลขinvoice/หลักฐานส่วนตัวไม่มีpublicDTO ข้ามURL/body/query/report_idต้องcurrentreadscope ไม่ใช้snapshotscopeเก่าเป็นgrant

ExportExcelตามExcelJSที่ADRอนุมัติเมื่อพร้อม จำนวนเงินและรหัสอ้างอิงเป็นtextที่ไม่เสียprecisionตาม41 ป้องกันformula injection ไม่parseFloatเพื่อformat Excel/PDF หน้าHTMLprintprivateฟอนต์Sarabun/A4ตามMASTERให้browserบันทึกPDFเมื่อpolicyอนุญาต ไม่สร้างPDFที่ไม่มีรายงานจริงมาปลอมเป็นexportที่ทดสอบแล้ว

Exportจากmanifest/reportรุ่นเดียวกับหน้าจอทั้งpagination/grandtotal สร้างในprivateDoc/FileVersionกลาง10ตามscan/ACL/retention ต้องcheckexportตอนenqueue/start/generateและdownloadใหม่ ไม่แปะไฟล์publicหรือcacheshared ถ้าขอบเขตสิทธิ์เปลี่ยนให้denyexportเดิมหรือสร้างreportใหม่ที่scopeลด ไม่อ้างไฟล์ที่ออกไปแล้วลบคืนจากผู้รับได้

ลิงก์ไปคำขอพัสดุ07/หนังสือ08ใช้resource refsของevent/request/documentกลางเมื่อmodulesพร้อม เปิดลิงก์เป็นauthorizedreadเท่านั้น ห้ามสร้างreservation/payment/stocktransaction/letterdispatchหรือacknowledgementอัตโนมัติ รายงานยังเปิดดูได้เมื่อmodule linkไม่พร้อม แสดง“ยังไม่มีข้อมูลเชื่อมโยง”ตามfieldpolicy

[budget-45-plan.json](fixtures/budget-45-plan.json)0.1มีP45-01–16ทั้งหมดNOT RUN เกณฑ์45-01ผูกP45-01–07/11/15 เกณฑ์45-02ผูกP45-08/09/14/16 ทั้งสองBLOCKED ต้อง44/ส่วนกลาง/nativeDB/models/DAL/reportUI/export/close guardพร้อมก่อนพิสูจน์ ไม่เริ่ม46

ฐานออกแบบเชิงเทคนิค: [PostgreSQL18 Transaction Isolation](https://www.postgresql.org/docs/18/transaction-iso.html) อธิบายsnapshotและข้อจำกัดREPEATABLE READ/serialization และ [Sequence Functions](https://www.postgresql.org/docs/18/functions-sequence.html) อธิบายsequence/rollback จึงเสนอsealcommittedeventmanifestกับprotocolปิดงวดแยก ไม่ถือว่าอ่านเอกสารนี้แล้วnativeDB/รายงานผ่าน
