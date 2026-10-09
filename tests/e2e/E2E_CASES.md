# Playwright E2E ที่ต้องทำ — บท 68

รุ่น0.1 **PLAN_ONLY / ALL_NOT_RUN** โฟลเดอร์นี้เป็นspecifications ไม่ใช่Playwright suiteที่รันได้ ไม่มีconfig/testfiles/runnerใหม่หรือtest.skipแล้วนับPASS อ่าน [UAT_MASTER](../../docs/UAT_MASTER.md), [TEST_MATRIX](../../docs/TEST_MATRIX.md), [actualresults](../results/lesson68-results.json) และ [fixture](../fixtures/e2e/uat-plan.json)

## 1 Preconditions ของ harness เมื่อพร้อม

NativePostgreSQL/owner services/Auth/grants/files/scan/workflow/outboxตาม67จริง + @playwright/test/browser binaries/config/scriptsที่pinและทดสอบในrepository SetupisolatedDB+TESTidentityหลายactor/currentauthority/DEMOpolicyจากบริการกลาง Accounts/contextsแยกmaker/checker/approver/learner/public ไม่sessionผู้ใช้จริง ไม่มีmockAPIตอบPASS ไม่มีclientallowed/stateปลดล็อกserver

ก่อนเขียนruntimeให้ทบทวนแผนเฉพาะงานตาม MASTERข้อ2 Routes/accessiblelabels/testidsต้องมาจากUIที่implementจริง ไม่ตั้งlocatorสมมติแล้วส่งมอบ.spec.tsที่ไม่มีบริการให้เรียก Futurebrowserassertionใช้UI/networkและpersistedreceipts/hashes/countsจากisolatedsource ไม่เพียงtoHaveTextบนตัวเลขclient Playwrightclockbrowserไม่แทนserverclockของeligibility/activation

## 2 Case plans

| case_id | เส้นทาง/เหตุการณ์ที่ทดสอบ                                                         | persisted assertionsเมื่อพร้อม                                                                                   | execution |
| ------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------- |
| E68-01  | คนเสนอแก้→checkerapprove→effective→rights→notice                                  | canonicalPerson/history/currentoldgrantdeny/approvedFileVersion/recordreceiptsตามUATMASTER ไม่newgrantจากชื่อ    | NOT_RUN   |
| E68-02  | เปิดสนาม→appointments→Excel→App05→seat→score→DEMOrelease/search                   | central02/01/05/09refs verifiedidentity seatcapacity/unique certchecker draft/withdrawpublicdeny snapshotoldname | NOT_RUN   |
| E68-03  | budgetplan→procurement→reserve/commit→partialinspect→pay→loan/return/count→record | exact06ledger/07stockseparate available80000 unpaid15000 adjustmentreviewed samecentralfiles no doublepay        | NOT_RUN   |
| R68-01  | networkขาดหลังpersonsubmit/approvalresponseหาย                                    | resume/readreceipt requestเดิมไม่ซ้ำ revisionเก่า409 noseconddecision                                            | NOT_RUN   |
| R68-02  | personactivation/recordconsumerหยุดหลังCOMMITก่อนACK                              | sourceมีผล/rightscurrentไม่รอnotice durableoutboxretry nosecondrecord/receipt                                    | NOT_RUN   |
| R68-03  | upload/dryrun/commitresponseหาย สองbrowserยืนยันExcel                             | sameApp05/receipt atomic replay; changedcontent409 closewindow/scoperevokerevalidate                             | NOT_RUN   |
| R68-04  | score/release/reportworkerล้มแล้วฟื้น                                             | sourcebatch/version/releaseintact pending/stalenotPASS noleakwithdrawn nofakecertscore                           | NOT_RUN   |
| R68-05  | reserve/order/receipt/payresponseหาย                                              | idempotency/domainreceiptเดิม noreserve/commit/stock/paydouble effect countedafterallwriters                     | NOT_RUN   |
| R68-06  | stock/financial/documentworkerล้มช่วงsideeffect/ACK                               | sourceledger/stockintact consumertxrollbackหรือdurablereceipt replay sameeffectfamily ไม่payจากGoodsReceived     | NOT_RUN   |
| L68-01  | pre→lesson→post→reportแยก03ทั้ง9groups                                            | serversequencegate progress/resume actualAttemptItemversion practiceไม่official05                                | NOT_RUN   |
| L68-02  | reload/networkretry/autosave stale revision/serverdeadline                        | latestanswerคงเดิม nosameattemptduplicate clientclockไม่เปลี่ยนคะแนน                                             | NOT_RUN   |
| L68-03  | เรียกpostข้ามlesson ดูkeyก่อนsubmit/ผลเพื่อน/essayรอตรวจ                          | denyserver/DTOไม่มีkey feedbackหลังส่ง ownonly essaypendingrubricchecker ไม่fakeMCQcert                          | NOT_RUN   |
| N68-01  | makerapproveตน/actorหลายrole/สิทธิ์เทคนิคแทนauthority                             | backenddeny nochangedsource/approval/seat/pay from forgedclient                                                  | NOT_RUN   |
| N68-02  | IDOR/crossscope/privatefile/expiredgrantหลังqueue/download                        | positiveA/B+currentdeny count/snippet/network/artifactไม่มีB filelinkไม่grant                                    | NOT_RUN   |
| N68-03  | TO_VERIFYofficialform/eligibility/grading/publication policy                      | officialdisabledแม้DEMOflowผ่าน อนุมัติเงิน/สารบรรณไม่จากชื่อฝ่าย                                                | NOT_RUN   |
| A68-01  | keyboard/screenreader/desktopmobile/slowdevice                                    | focus/labels/errorstatus accessible ไม่สีอย่างเดียว ไม่มีhiddenPIIในa11ytree                                     | NOT_RUN   |
| A68-02  | historical Thai export/filterและmanifest/leadingzeros                             | screen/exportsamefilter/sourceversion ไทยครบ currentACLชื่อปีเก่าไม่renameตามปัจจุบัน                            | NOT_RUN   |
| A68-03  | screenshot/trace/storageState/report privacyreview                                | onlyTESTdata nocredentials/rawauthenticatedtrace ไม่มีfakeภาพPASS protectedevidenceversion/ref                   | NOT_RUN   |

3coreflowsมีnetworkและworkerrecovercaseคนละ2ข้อ ไม่เลือกผ่านแค่happy path Learning9parameterizedrunsแยก12examcombinations ทุกcombinationactualreport/FileVersion/screenshotยังว่าง

## 3 Fault/retryและหลักฐาน

Networkfaultใช้controlledoffline/disconnectเฉพาะtestbrowserเพื่อจำลองเครือข่าย แต่backendจริงไม่mock Workerfaultใช้test-onlybarrier/faultpointก่อน/หลังCOMMIT/ACK ไม่productionkillหรือURLclientเลือกfault Waitdurableconditionsไม่waitForTimeoutแล้วเดาว่าสำเร็จ Retrytestต้องเก็บfirstfailure/retryทุกattempt ไม่ลบflakeแล้วนับผ่านถ้าหาสาเหตุไม่ได้

Snapshotbefore-after actualsource/correlation/decision/FileVersion/receiptกรองตามscope ใช้centralIDsจริงไม่TESTlabels; consumercrashต้องsourcecounts/ledger/stockคงเดิม Screenshot checkpointไม่replaceDBatomicityevidence Manifestระบุattempt/actorrole/browser/version/environment/redactionreview Protectedcapturesไม่uploadtraceviewerออนไลน์หรือsharecookie/session ไม่commitstorageState/HAR/fulltrace

อ้างอิงที่อ่านรอบ68: [Playwright fixtures](https://playwright.dev/docs/test-fixtures), [trace viewer](https://playwright.dev/docs/trace-viewer) ใช้กำหนดisolation/หลักฐาน ไม่ใช่ผลPlaywrightrunของโครงการ ไม่มีdependency install/browserdownload/runtimecodeในรอบนี้
