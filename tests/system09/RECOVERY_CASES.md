# กรณีตรวจรับติดตามและแก้ชุดนำเข้า — บท 63

รุ่น 0.1 | 9 ตุลาคม 2569 (2026-10-09) | **PLAN_ONLY / ALL_NOT_RUN**

ใช้ [IMPORT_RECOVERY](../../docs/IMPORT_RECOVERY.md), [monitoring/retention](../../docs/IMPORT_MONITORING_RETENTION.md), [fixture](../fixtures/system09/recovery-plan.json) ไม่มีrunner/UI/API/workflow/currentAuth/FileVersion/62runtimeจริง `db:test` exit1 ชุดนี้เป็นspecificationไม่ใช่E2Eที่ผ่าน

Harnessต้องPostgreSQLจริง/API/worker/storage/workflow05+37–39+56/62 จากserviceกลาง ใช้TEST_ทุกidentity/unit/file ทดลองscopeสองหน่วยกับassignmentหมดอายุ และbatchมีdraft/approved/seat/rawscore/certified/releasedจริงในtestDB เก็บbaselineIDs/versions/hash/counts/downstreamlinksก่อนและหลัง รวมApplicationSnapshot/CommitReceipt/amendment/decision/audit/outbox/tombstone ไม่seedคนจริงหรือกฎTO_VERIFYเป็นofficial

| case_id | สิ่งที่จำลอง                                             | สิ่งที่ต้องยืนยัน                                                                  | execution |
| ------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------- |
| P63-01  | historyfilter/search/cursorสองหน่วย                      | currentSQLscopeก่อนcount/page ไม่มีforeignmetadata/count leak                      | NOT_RUN   |
| P63-02  | assignmentหมด/revoke/technicaladmin/creatorพ้นหน้าที่    | read/retry/diff/export/download/workerdeny ไม่ใช้oldgrant                          | NOT_RUN   |
| P63-03  | readonlybatchstatus/progress100%/heartbeatขาด            | nofakeApplicationIDs/success ไม่queueACK=committed มีfreshnesstime                 | NOT_RUN   |
| P63-04  | transientfailed/securityfailed/stalereportretry          | เฉพาะunfinishedตามpins securityต้องแก้file revalidateล่าสุด                        | NOT_RUN   |
| P63-05  | retrycommitted/unknownoutcome/twobrowser                 | durableIDsเดิม nosecondcommit oldworkerfenced                                      | NOT_RUN   |
| P63-06  | export/downloadsource/error/diff policyเปลี่ยน           | sameACL+maskedDTO+typedstrings nohiddenraw/cacheleak regenerateหรือdenyoldartifact | NOT_RUN   |
| P63-07  | เปลี่ยนfile/newbatch/branchสองคน                         | immutableparent/file/checksum/run/receipt traceableroot/branchไม่overwrite         | NOT_RUN   |
| P63-08  | parentcycle/self/crossscope/ต่างoffering                 | rejectไม่มีlineagegrant/keyescape                                                  | NOT_RUN   |
| P63-09  | diffadded/modified/removed/unchanged/unresolved          | exactidentity/key match noNameMerge deletedrowไม่autowithdraw                      | NOT_RUN   |
| P63-10  | childทับapprovedหรือmixedcreate/amendment                | noautooverwrite/no skipDuplicates executiondisabledก่อนcontractพร้อม               | NOT_RUN   |
| P63-11  | ขอถอน draft/submitted/returned reject/cancel/selfapprove | ไม่มีmutationก่อนdecision makerchecker/currentdelegation enforce                   | NOT_RUN   |
| P63-12  | withdrawapproved/no seatหรือมีseat                       | routed05/37amendment ไม่ลบApplication/เลขเดิม/history/receipt                      | NOT_RUN   |
| P63-13  | batchมีscorestaging/raw/certified                        | routed38correction lock/checker/ruleversion ไม่delete/replacewithpractice          | NOT_RUN   |
| P63-14  | batchมีpublished/withdrawn/supersededrelease             | routed39version/cacheinvalidation ไม่ลบประกาศ/score/seat                           | NOT_RUN   |
| P63-15  | releaseร่วมมีคนอื่น/batchmixed/impactunknown             | ตรวจทุกtarget history+references unknownไม่0 ไม่withdrawคนอื่นทั้งrelease          | NOT_RUN   |
| P63-16  | approveแล้วเกิดseat/score/releaseก่อนapply               | version/impactconflictเริ่มreviewใหม่ noforceapply                                 | NOT_RUN   |
| P63-17  | compensationretry/failกลางหลายcommands/cancelpartial     | actualper-targetreceipts retryunfinished ไม่claimwholebatchrollback                | NOT_RUN   |
| P63-18  | scopeของlinkedApplication/หนังสือ/evidenceไม่ครบ         | linkไม่grantread noforeigndetails deniedrequest                                    | NOT_RUN   |
| P63-19  | source/staging/errorreportหมดอายุ policyTO_VERIFY        | destructiondisabled ไม่lifetimeguess/expiredreport=purge                           | NOT_RUN   |
| P63-20  | legalhold/sharedfile/pendingamendmentเริ่มหลังapprove    | recheckหยุดpurge holdไม่grantread และretryไม่ลบsharedversion                       | NOT_RUN   |
| P63-21  | destructionapproved/objectstoragefail/retry              | per-targettombstone/auditคงไว้ noCASCADEbusinesshistory                            | NOT_RUN   |
| P63-22  | log/jobpayload/sourcefilename/normalizedPII              | opaque refs+safeerrorcodes nofullidentity/token/rawdiff/driversecrets              | NOT_RUN   |

| เกณฑ์                                                   | casesหลัก             | ผลจริง            |
| ------------------------------------------------------- | --------------------- | ----------------- |
| AC63-01 เห็นเฉพาะbatchในscope exportป้องกันเหมือนต้นทาง | P63-01/02/06/08/18/22 | BLOCKED / NOT_RUN |
| AC63-02 ถอนbatchมีผลสอบไม่ลบseat-score-release          | P63-12–17/20/21       | BLOCKED / NOT_RUN |

Success/failure/cancel/retentionต้องไม่มีPerson/Candidate/Enrollment/seat/score/releaseหายเพราะbatchoperation Countsเดียวไม่พอ ตรวจIDs/contentversions/provenance/retainedaudit+releaseprivatehistoryและpubliccurrentpolicyด้วย ไม่ถือว่าsoftdeleteจนอ่านไม่ได้เท่ากับคงหลักฐานถูกต้อง ต้องเห็นประวัติตามauthorizedhistoricalview การทดสอบsoftwareไม่รับรองนโยบายถอน/เก็บทำลายทางการ บท64ยังไม่เริ่ม
