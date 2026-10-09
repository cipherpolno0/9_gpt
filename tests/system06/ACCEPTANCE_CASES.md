# Specification ตรวจรับระบบ 6 — บท 46

รุ่น 0.1 | 7 ตุลาคม 2569 (2026-10-07) | source `eed9af6` | **PLAN ONLY / P46-01–28 ทุกกรณี NOT RUN**

ไฟล์นี้เป็น test specification ไม่ใช่ executable tests ไม่รันจาก `pnpm test` และไม่มี skipped PASS ใช้ [coverage-plan](../fixtures/system06/coverage-plan.json), [UAT_SYSTEM_06](../../docs/UAT_SYSTEM_06.md), [MANUAL_BUDGET](../../docs/MANUAL_BUDGET.md) กับ services/config/schema ของบท41–45เมื่อพร้อม ไม่มี mock ALLOW หรือ PostgreSQL ชุดเล็กทดแทน ledger ของโครงการ

## 1 Setup และหลักฐาน

ต้องผ่าน41–45/ส่วนกลาง06–12ก่อน มี shared Person/Organization/FiscalYear/AcademicYear/Document/บัญชี/Auth/DAL/RLS/workflow/outboxจริง ใช้ native PostgreSQL แยกdevจากproductionตาม DATABASE/ADR และ migrations ของโครงการทั้งหมด ไม่ใช้ PGlite/WASM/in-memory แทน concurrency acceptance `db:test` เดิมตรวจ migration core06เดียว ต้องปรับ harness ที่จำเป็นตาม ADR ก่อนรับ budget schema ไม่ปิด safety guard หรือใช้ฐาน production

DEMO actors: maker, reviewer, approver, second approver, auditor, technical admin และผู้ใช้หน่วยงาน B; เป็น references ยังไม่สร้างบัญชี/grantsจริง Policy ตัวอย่างยัง TO VERIFY ทั้ง delegation/วงเงิน/แหล่งเงิน/calendar/refund/close/carry ไม่มีชื่อผู้อนุมัติจริงหรือ secret ใน fixture

Concurrency ใช้อย่างน้อยสอง connection พร้อม barrier หลังอ่าน/ก่อน lock หรือ commitตาม protocolของบริการ ไม่ใช้ sleep หรือ promise สำเร็จสองครั้งเป็นหลักฐาน เก็บ transaction outcome และ ledger/receipt/projection countsหลังcommit รายการที่แพ้ต้อง conflict/insufficient budget แบบอ่านเข้าใจและไม่มีเงินติดลบ ระบุ lock order/isolation/SQLSTATE/full transaction bounded retry ที่ใช้จริง ทุก writer รวม import/reversal/workerต้องผ่าน gateเดียวกัน

Fault injection ต้องอยู่ใน test harness แยกจาก production เก็บ failpoint ก่อน ledger, หลัง ledger ก่อน projection, หลัง projection ก่อน outbox, ก่อน commit, หลัง commit ก่อน HTTP response และระหว่าง worker claim/delivery/ACK ทุก failure ต้องตรวจฐานจาก connectionอื่น ไม่ตรวจแต่ exception ที่ clientเห็น

Execution manifestเก็บ private: run_id/commit/environment/DBversion/migration hashes/policy versions/dataset, expected/actual/status/SQLSTATE, event/decision/evidence/receipt/report refsและhash, ผู้ตรวจ/เวลา/issue refs ไม่มี secret/ข้อมูลคนจริงใน log หรือตัว fixture

## 2 Cases ที่ต้อง execute

| Case   | ขั้นทำซ้ำเมื่อพร้อม                                                               | Assertions และหลักฐาน                                                                                                                         | สถานะ   |
| ------ | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| P46-01 | ร่างแผน→ส่ง→ส่งกลับ→แก้→ตรวจ→อนุมัติ→โพสต์จัดสรร                                  | revision/historyเดิมครบ แผนไม่อนุมัติจองไม่ได้ รายได้คาดการณ์ไม่เป็น A; maker/reviewer/approverแยก                                            | NOT RUN |
| P46-02 | จัดสรร100000→จอง20000→ผูกพัน→รับรอง5000→จ่าย5000                                  | R→U และ U→P/C atomic; U15000/P5000/V80000 ledger/ต้นเรื่อง/projectionตรง                                                                      | NOT RUN |
| P46-03 | จอง3000→ปลด1000→ปลด2000 แล้วretry/ปลดเกิน                                         | remainingและVถูกต้อง replayครั้งเดียว เกินremainingdeny ไม่ปลดเงินที่convertแล้ว                                                              | NOT RUN |
| P46-04 | จ่ายบางส่วนแล้วปลดภาระที่เหลือบางส่วน                                             | ปลดเฉพาะ unpaid ที่อนุมัติ C/claimsไม่ขัดกัน Pคงเดิม ไม่reverseทั้งก้อน                                                                       | NOT RUN |
| P46-05 | โอน10000สองlines→กลับโอน→ลองโอนข้ามsourceที่ไม่อนุญาต                             | deltaสองlegs/receipt/audit/outboxatomic ผลรวมAคงเดิม lineageต้นทางครบ unknownrestrictionsdeny                                                 | NOT RUN |
| P46-06 | 0.30จอง0.10+0.20; scale/range/currency/negative/NaN                               | V0.00 canonicalstrings/NUMERICexact ปฏิเสธscaleก่อนcast ไม่sumcurrencyผสม                                                                     | NOT RUN |
| P46-07 | connectionsสองชุดจอง80000กับ60000จาก100000พร้อมกัน                                | สำเร็จเพียงหนึ่ง ไม่กำหนดผู้ชนะ V20000หรือ40000; event/receipt/outboxของผู้แพ้ไม่มี                                                           | NOT RUN |
| P46-08 | โอนสวนทางพร้อมกันและโอนรวมเกินavailable                                           | global lockorder/full boundedretry ไม่มีpartiallegs/ติดลบ/duplicateหรือretryไม่จบ                                                             | NOT RUN |
| P46-09 | convertจองเดียวซ้ำพร้อมกัน และpayจากvoucherเดียวเกินremaining                     | sourceremaining/cumulativeinvoice/C/Uguards ไม่มีdouble counting ยอดรวมไม่เกินต้นเรื่อง                                                       | NOT RUN |
| P46-10 | key/hashเดิมretry; keyเดิมhashใหม่; keyใหม่paymentrefเดิม                         | คืนผลเดิมเฉพาะcurrentreadได้ hashconflictและbusinessduplicateปฏิเสธ uniqueพิสูจน์จริง                                                         | NOT RUN |
| P46-11 | maker/techadmin/reviewerพยายามอนุมัติ; วงเงินขอบเขตและหลายงวด                     | สามคนแยก currentamountbasis/cumulative/officialverifiedsource; ไม่splitเพื่อหลบวงเงิน                                                         | NOT RUN |
| P46-12 | ก่อน/หลังช่วงdelegation หมดsession ระงับบัญชี ถอนสิทธิ์ระหว่างAPI/job/retry       | currentDAL/worker denyทันทีตามprotocol ไม่ใช้grant snapshotจากenqueueหรือซ่อนเมนูอย่างเดียว                                                   | NOT RUN |
| P46-13 | เปลี่ยนURL/body/queryเป็นorgB; list/count/export/objectkey                        | scope/fieldpolicyทุกboundary ไม่เผยยอด/invoice/หลักฐาน/จำนวนรายการนอกscope                                                                    | NOT RUN |
| P46-14 | ปลอมextension/MIME เกินขนาด quarantine/scanpending/infected; dirtyfileversionใหม่ | ไม่preview/download/approve/closeด้วยหลักฐานไม่ผ่าน currentfileACL ตรวจซ้ำตามaction                                                           | NOT RUN |
| P46-15 | failpointก่อน/หลังledger/projection/outboxและก่อนcommit                           | rollbackต้นเรื่อง/event/projection/receipt/audit/outboxทั้งหมด ไม่มี eventที่ขาดoutboxหรือphantomnotification                                 | NOT RUN |
| P46-16 | commitสำเร็จแต่responseหาย แล้วretryและrevokeก่อนretry                            | มีevent/receipt/audit/outboxชุดเดียว คืนเดิมเมื่อcurrentgrantยังมี ไม่โพสต์ใหม่                                                               | NOT RUN |
| P46-17 | workerหยุดก่อนclaim/หลังdeliveryก่อนACK แล้วresume/retry/deadletter               | committedoutboxไม่หาย durable inbox/sink dedupe; poison boundedretry/deadletterไม่rollbackเงิน; ไม่อ้างexactly-onceปลายทางที่ไม่มีidempotency | NOT RUN |
| P46-18 | projectionlagและmismatch แล้วcontrolledrebuild                                    | ledger replayเทียบmanifest/watermarkเดียว lagไม่เป็นfresh mismatchไม่closeหรือsilentrepair oldeventsคงเดิม                                    | NOT RUN |
| P46-19 | หน้ารายงาน/Excel/privateHTMLprintPDFทุกbucketและรายการค้าง                        | reportversion/manifest/filter/namepolicyเดียว totals/decimal/Thai/A4ตรง downloadตรวจcurrentACL                                                | NOT RUN |
| P46-20 | FYสองปี/AYเดียว oldname→rename futureevent/latecorrection                         | FYไม่รวมจากAYlabel sealedmanifestคงเดิม restatementใหม่มีเหตุผล วันไทยถูกต้อง                                                                 | NOT RUN |
| P46-21 | close-vs-postingสองconnection; closedbackdate/import/reversal/job                 | writerก่อนcloseถูกรวมหรือconflict writerหลังclosedenyทุกทาง ไม่มีhalfcloseหรือmanifestไม่ตรง                                                  | NOT RUN |
| P46-22 | close/reopen/adjustmentretryและแก้รุ่นที่reviewแล้ว                               | คำอนุมัติใหม่/sealedhash/currentauthority oldclose/report/eventไม่แก้ carryunknowndeny                                                        | NOT RUN |
| P46-23 | paymentcorrectionมี/ไม่มีapprovedreopen; actualrefund/dependencyunknown           | originalhistory/evidenceอยู่ครบ ไม่restoreU/Cหรือคืนสิทธิ์เอง ไม่genericinverse/downstreamล้าง                                                | NOT RUN |
| P46-24 | restrictedruntime/directSQLลองข้ามRPC/RLS/FK/unique/closedguard                   | databaseและDALdenyจริง rollback; migrationroleไม่อ้างเป็นสิทธิ์ธุรกิจ limitedactorตรวจด้วยcontextจริง                                         | NOT RUN |
| P46-25 | keyboard/form/table/status 375/768/1024/1440 และprivateHTML/cache/static          | labels/focus/revisionerrors/empty statesเข้าใจได้ privateเงิน/หลักฐานไม่ออกpublic/search/preview/assets/cache                                 | NOT RUN |
| P46-26 | officialpolicyTO VERIFY/unknownauthority/carry/แบบ และไม่มีexternalAPI            | officialdenyแม้DEMOมีตัวอย่าง QAไม่certifyระเบียบ; NBMS/bank/e-GPไม่มีclaim/integration                                                       | NOT RUN |
| P46-27 | เปิดreportและauthorizedprocurement/letterlinksเมื่อพร้อม                          | ไม่มีreserve/payment/stock/dispatchtransactionจากread; targetscopedeny โมดูลไม่พร้อมแสดงสถานะ                                                 | NOT RUN |
| P46-28 | ย้อนยอดทุกstepและreportถึงsourceevidence+decision+receipt/hash                    | approvedimmutableversions/effective-recorded/provenance/compositeFKครบ เจ้าหน้าที่นอกscopeไม่อ่านlineage; missingevidencefailclosed           | NOT RUN |

## 3 วิธีตัดสิน

เกณฑ์46-01ผูก P46-02–10/15/16/18–24/28 เกณฑ์46-02ผูก P46-11/26 และ financialowner UAT ในเอกสารหลัก ทุกcaseยังNOT RUN ไม่มีAPI/UI/SQL runnerของระบบ6 ไม่อ้าง rootunit17 หรือการตรวจเลขfixtureเป็นผลcaseผ่าน ต้องหลักฐาน native PostgreSQL/บริการของrepositoryจริงก่อนเลื่อนไป47
