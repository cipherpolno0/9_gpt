# ตรวจรับระบบ 9 ร่วมระบบ 5 — บท 64

รุ่น 0.1 | 9 ตุลาคม 2569 (2026-10-09) | **PLAN_ONLY / ALL_NOT_RUN**

นี่เป็นtest specifications ไม่มีexecutableE2E runner สคริปต์ `pnpm test`เดิมไม่รันMarkdownหรือJSONนี้ อ่าน [UAT_SYSTEM_09](../../docs/UAT_SYSTEM_09.md), [MANUAL_IMPORT](../../docs/MANUAL_IMPORT.md), [UAT_SYSTEM_05](../../docs/UAT_SYSTEM_05.md), [coverage-plan](../fixtures/system09/coverage-plan.json) และ [offlineverification](../../docs/fixtures/excel-import-64-verification.json) ผลofflineไม่แทนP64

## Harness และ assertionsร่วม

ใช้PostgreSQLจริงสองconnectionอย่างน้อย พร้อมserver/API/browser/worker/FileVersion+scan/currentAuth+RLS/FormTemplateRegistry/identity/eligibility/05+37/62/63จริง ใช้ข้อมูลTEST_และเวลาทดสอบserverที่กำหนดได้โดยharnessเท่านั้น ไม่เปิดclientclockoverride ไม่มีofficialprofile/แบบรับรองให้ใช้DEMOแยกชัด Officialguardต้องrejectTO_VERIFY

ทุกกรณีเก็บbefore-aftercounts+IDs+rowversionsและFK lineage Person/Candidate/Enrollment/Application/Snapshot/seat/score/release/commitreceipt/audit/outbox Dryrunไม่มีregistrywrites Failedcommitไม่มีpartialnewPerson/App Successfulretryactualrefsเดิม Web+Excelopportunityเดียวมีหนึ่งApplication Snapshot/exportใช้registry05เดียวและปีเดิมไม่joinชื่อปัจจุบัน Errorreports/HTTP/HTML/exportcache/joblogsไม่มีforbiddenrawfields ไม่มีdownloadsecret/token ผู้มีสิทธิ์techไม่automaticgrant

| case_id | สิ่งที่ทดสอบ                                                                               | ผลที่ต้องยืนยันเมื่อimplementationพร้อม                                                 | execution |
| ------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- | --------- |
| P64-01  | 12pairs x2academic years flowtemplate→upload→dryrunแก้→commit→บัญชี05→approve-seat→history | 24runsครบทุกcheckpoint actualrefsเดียว noimport=approval                                | NOT_RUN   |
| P64-02  | web/Excel/registrydownload/formexportsnapshot                                              | sharedPerson/Candidate/Application/registry purpose-versionถูก ไม่machine=displaylayout | NOT_RUN   |
| P64-03  | webwriterแข่งimport newidentity/opportunityเดียว                                           | uniquePerson/Candidate/Appร่วม noextraperson/partialbatch                               | NOT_RUN   |
| P64-04  | reload/retry/networkขาดทั้งdryrunและcommit                                                 | immutablepins/CAS/generation/receipt reuse noAppซ้ำ                                     | NOT_RUN   |
| P64-05  | formula/.xls/.xlsm/fakeext/encrypted/macro/external/ZIPbomb                                | rejectก่อนcommit workerเว็บไม่ล่ม noformulaexecution/networkfetch                       | NOT_RUN   |
| P64-06  | multipleinput/remarks sheets/header/unknowncolumn/duplicatephysicallocators                | schemaรับเฉพาะที่ประกาศ errorครบทุกแถว rowcolumnถูก                                     | NOT_RUN   |
| P64-07  | closewindow/centerหลังdryrunก่อนcommitหรือระหว่างretry                                     | serverlatestfactsหยุด ไม่มีpartialwrites/cachedeligible                                 | NOT_RUN   |
| P64-08  | assignment/delegationหมด/revokeก่อนworkerและdownload                                       | denyตามcurrentaction/scope ไม่oldqueuegrant                                             | NOT_RUN   |
| P64-09  | ThaiNFC/leading0/formername/sameName/ปีถัดไปเปลี่ยนชื่อ                                    | exactTEXTไม่stripmarks/noNameMerge oldsnapshotคงเดิม                                    | NOT_RUN   |
| P64-10  | Thai digits/พ.ศ./CEdate/ambiguousyear legacyและnewprofile                                  | legacyตาม59rejectunsupported profileใหม่ตาม60expliciteraเท่านั้น                        | NOT_RUN   |
| P64-11  | passport/local/ไม่มีเลขไทย/ต่างชาติ identityevidence                                       | verifiedpolicyresolveคนจริงในTEST ไม่requireThaiID/autoAIidentity                       | NOT_RUN   |
| P64-12  | หลายหมายเหตุชื่อเดิม/ประโยคเดิม/namechange/evidenceunmapped                                | rowbindings/mapping/evidenceจริงครบ free-textไม่grant                                   | NOT_RUN   |
| P64-13  | duplicatefile/pendingbatch/centralApp คนละkeys/channels                                    | sharedbusinesskey scope-safeissues noopportunityจากchannel                              | NOT_RUN   |
| P64-14  | approve-seatmakerchecker/fullcapacity/two reviewers                                        | no selfapprove unauthorized noseatdup/overcapacity retryเลขเดิม                         | NOT_RUN   |
| P64-15  | failafterPerson/Approw2/receipt/audit/successoutbox                                        | wholebusinessTXrollback nohalfrows retryrevalidate                                      | NOT_RUN   |
| P64-16  | COMMITสำเร็จแต่ACKขาด/leaseหมด/workerเก่ากลับ                                              | durableoutcomeก่อนretry fencing nofailedทับcommitted                                    | NOT_RUN   |
| P64-17  | parserkill/deadline/memory/CPU/queue/outboxfailure                                         | boundedresources noorphanwrites/fakesuccess noPIIlogs                                   | NOT_RUN   |
| P64-18  | INCOMPLETE/errors>0/warningnotack/stalehash/rules/facts                                    | serverrejectcommit แม้clientenableปุ่ม/errors0ปลอม                                      | NOT_RUN   |
| P64-19  | errorHTML/API/exportdownload/CSV/formulaliteral policyตึงขึ้น                              | maskedallowlist currentACL typedXLSX nohiddenraw CSVdisabled                            | NOT_RUN   |
| P64-20  | TO_VERIFYform/rules/ศ.3 unknown officialexport                                             | officialblocked DEMOlabel nofabricatedlayout/approvedpolicy                             | NOT_RUN   |
| P64-21  | batchchilddiff/removedrow/approvedchanged                                                  | noautooverwrite/withdraw lineageimmutable 05amendmentrequired                           | NOT_RUN   |
| P64-22  | retention/hold/sharedfile/pendingamendment                                                 | noautoTTLpurge/currentholdrecheck auditretained                                         | NOT_RUN   |
| P64-23  | ถอนbatchมีseat/score/publishedrelease                                                      | routed37–39versions retainall originalreceipt ไม่DELETE                                 | NOT_RUN   |
| P64-24  | importstate/Enrollment/practicevsOfficial                                                  | Appdraftตาม62Proposal Enrollmentไม่auto nolearningpass→officialresult                   | NOT_RUN   |
| P64-25  | cursor/filter/responsive375–1440/keyboard/announceerrors                                   | currentSQLscope accessibility screenreader/liveprogressไม่guess                         | NOT_RUN   |
| P64-26  | limitboundaries/time-memory/loadcapacity onrealdeployment                                  | measuredprofileจริงไม่มีค่าปลอม below/equal/above มีevidence hardware+versions          | NOT_RUN   |

P64-01ต้อง24runsแยกinput/context ห้ามmixed12groupsfile59เป็นsinglehappycommit Runidsในmanifestเป็นlabelsไม่batchIDs ActualIDs/receipts/benchmarkresultsยังว่างทั้งหมด Evidenceenrollmentสมัครเรียนเป็น05processแยก ไม่สร้างจากimporthappyflowโดยอัตโนมัติ

P64-26ใช้ทุกthresholdของ60/62รวม strictertemplate59 limit20/21 และnewversion2000/2001เมื่อapprovedprofileพร้อม ไม่benchsources3ไฟล์เล็กแล้วตั้งlimit10MiB RSS/timeout/resourceisolationต้องharnessจริง ไม่nativeExcelเปิดไฟล์หรือmockPASSแทนloadproof

เกณฑ์64-01/02 BLOCKED_NOT_RUN ดู [PARSING_CASES](PARSING_CASES.md), [VALIDATION_CASES](VALIDATION_CASES.md), [COMMIT_CASES](COMMIT_CASES.md), [RECOVERY_CASES](RECOVERY_CASES.md) ทุกruntimecaseยังNOT_RUN ไม่ใช้offlineauditหรือbootstrapunitแทน การรับรองกฎรับสมัครและแบบทางการแยกจากsoftwareUAT
