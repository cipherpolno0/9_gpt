# กรณีตรวจรับยืนยันนำเข้า — บท 62

รุ่น 0.1 | 9 ตุลาคม 2569 (2026-10-09) | **PLAN_ONLY / ALL_NOT_RUN**

Prerequisite61/37ไม่มีservices และdb:testexit1 ยังไม่มีrunner/API/browserหรือnativePGtransaction ชุดนี้เป็นtest specifications ไม่ใช่testsที่รันผ่าน Fixture [commit-plan.json](../fixtures/system09/commit-plan.json) ไม่สร้างPerson/Application ใช้ [IMPORT_IDEMPOTENCY](../../docs/IMPORT_IDEMPOTENCY.md) และ [IMPORT_COMMIT_TRANSACTION](../../docs/IMPORT_COMMIT_TRANSACTION.md)

## Harness และหลักฐานที่ต้องเตรียม

ใช้PostgreSQLจริงอย่างน้อยสองconnection กับAPI/server/workerจริง ไม่sqlite/WASM/mocktransactionแทน acceptance ใช้เฉพาะTEST identities/evidence/mockorganizations ห้ามนำคนจริงหรือกฎทางการที่ยังไม่ยืนยันมาทดลอง เก็บbaselinePerson/Candidate/Application/ApplicationSnapshot/CommitReceipt/audit/outboxและrowversions/hash รายงานscan/ACL/scope/serverclock/ruleversions ตรวจFK row→Application จริงไม่รับtestlabelsเป็นเลขApplication

Concurrencyใช้barrierก่อนsharedwritesไม่ใช้เวลาsleepเป็นหลักฐาน ตรวจcountsหลังทุกconnectionจบและหลังworkerretry Successต้องnApplication/nrowreceipt/หนึ่งsummary/ไม่มีseat-score-approval; rollbackต้องไม่มีPersonใหม่/Candidate/Application/snapshot/rowlink/successauditหรือsuccessoutboxของtx ไม่มีdatawritesจากdryrun พบfailedmetadata/outboxdispatchได้เมื่อconfirmationสำเร็จไม่ตีความเป็นpartialApplicationcommit

| case_id | สิ่งที่จำลอง                                          | สิ่งที่ต้องยืนยัน                                                          | execution |
| ------- | ----------------------------------------------------- | -------------------------------------------------------------------------- | --------- |
| P62-01  | batchถูกต้องexistingPerson+verifiednewPerson          | actualApplicationrefs/counts/snapshotครบ state draft ไม่มีseat/result      | NOT_RUN   |
| P62-02  | doubleclick/keyเดิม                                   | intent/receipt/resultเดียว ไม่Person/Applicationเพิ่ม                      | NOT_RUN   |
| P62-03  | สองbrowserkeyเดิมพร้อมกัน                             | onecommitsummary+rowreceiptsชุดเดียว                                       | NOT_RUN   |
| P62-04  | สองbrowserคนละkeybatchเดียว                           | resolveintentเดียวหรือ409 ไม่มีsecondcommit                                | NOT_RUN   |
| P62-05  | keyเดิมแก้name/remarks/source/context                 | 409fingerprintconflict ไม่เปลี่ยนpins/registry                             | NOT_RUN   |
| P62-06  | worker retryหลายครั้ง                                 | actualApplicationIDs/PersonIDsเดิม ไม่มีsuccessoutboxซ้ำ                   | NOT_RUN   |
| P62-07  | failหลังnewPersonก่อนCandidate/Application            | rollbacknewPersonและbusinesswritesทั้งชุด                                  | NOT_RUN   |
| P62-08  | failหลังApplicationแถว2ใน3แถว                         | ไม่มีApplication/Person/receiptบางแถว                                      | NOT_RUN   |
| P62-09  | failreceipt/summary/successoutboxinsert               | ทั้งชุดrollback auditไม่อ้างsuccess                                        | NOT_RUN   |
| P62-10  | faildispatchoutboxในconfirmationtx                    | ไม่มีorphanintent/registrywrites                                           | NOT_RUN   |
| P62-11  | connectionขาดหลังCOMMITก่อนresponse                   | replaydurableresultเดิม หลังwindowปิดก็ไม่createซ้ำ                        | NOT_RUN   |
| P62-12  | leaseหมด/workerเก่ากลับมา                             | stalegenerationไม่ทับcommitted/failedของworkerใหม่                         | NOT_RUN   |
| P62-13  | rollbackแล้วcenterปิดก่อนretry                        | currentrevalidateหยุด ไม่มีcachedPASS/partialrows                          | NOT_RUN   |
| P62-14  | scope/revoke/delegationหมดก่อนworker/replay           | commit/readresultdeny ปิดข้อมูลไม่อ้างgrantจากqueue                        | NOT_RUN   |
| P62-15  | ปี/offering/windowเปลี่ยนหรือปิดระหว่างทำงาน          | latesttypedcontext/serverclock guard ไม่clientเวลา                         | NOT_RUN   |
| P62-16  | policy/file/hash/report/evidenceACLscanเปลี่ยน        | NEEDS_REVALIDATION/deny ไม่แทนfingerprintเดิม                              | NOT_RUN   |
| P62-17  | errorหนึ่งแถว/INCOMPLETE/warningไม่ackหรือackรุ่นเก่า | rejectก่อนregistrymutations ปุ่มclientenableไม่ช่วย                        | NOT_RUN   |
| P62-18  | web05แข่งExcel09 opportunityเดียว                     | shareduniqueApplicationkey มีหนึ่งใบ conflictbatchอีกชุดrollback           | NOT_RUN   |
| P62-19  | คนใหม่identityเดียวสองbatchหรือwebwriterพร้อมกัน      | uniqueverifiedidentity resolvePersonเดียวตามcentralpolicy ไม่nameupsert    | NOT_RUN   |
| P62-20  | sameNameคนละverifiedidentity/foreign/noThaiID/หลายปี  | ไม่รวมชื่อ Candidateเดิมเมื่อเป็นPersonเดิม rulesอนุญาตเท่านั้น            | NOT_RUN   |
| P62-21  | serialization/deadlock/exhaustretry                   | wholetransaction bounded ทุกretrycurrentrevalidate no partialcommit        | NOT_RUN   |
| P62-22  | successnotificationส่งซ้ำ/permissionเปลี่ยน           | dedupe currentACL ไม่rawPII ไม่createAppจากconsumer                        | NOT_RUN   |
| P62-23  | profileไม่วัด/เกินlimits/chunkmode/TO_VERIFYofficial  | commitdisabledหรือreject ไม่wholefileatomicclaim/officialresult            | NOT_RUN   |
| P62-24  | APIreceipt/preview/exportdownloadต่างscope            | noforeignIDs/raw/cacheleak จำนวนและApplicationrefsตรง05 ไม่approved/passed | NOT_RUN   |

## เกณฑ์และ exit gate

| เกณฑ์                                                             | casesหลัก                | สถานะจริง         |
| ----------------------------------------------------------------- | ------------------------ | ----------------- |
| AC62-01 กดซ้ำสองbrowser/workerretryไม่มีPerson/Applicationซ้ำ     | P62-02–06/11/12/18/19/21 | BLOCKED / NOT_RUN |
| AC62-02 failureกลางtransactionไม่มีpartialcommit retrylatestfacts | P62-07–10/13–17/21       | BLOCKED / NOT_RUN |

ทดสอบ profileแบบboundary20/2000แถวไม่ได้หมายความว่ารองรับทั้งสองเพดาน มีแต่จำนวนที่measureจริงซึ่งบันทึกduration/lockwait/memory/rollback/retry/DBsettingsเท่านั้นที่เปิดใช้ได้ การรับรองidentity/eligibility/แบบทางการต้องผู้รับผิดชอบยืนยันแยกจากผลsoftware ไม่เริ่มบท63จนแก้blockersและผ่านเกณฑ์62จริง
