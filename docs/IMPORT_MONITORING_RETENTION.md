# ติดตามงานและเก็บหลักฐานนำเข้า — บท 63

รุ่น 0.1 | 9 ตุลาคม 2569 (2026-10-09) | **Proposal / BLOCKED — ไม่มี history UI หรือ retention worker จริง**

อ้าง [IMPORT_RECOVERY](IMPORT_RECOVERY.md), [IMPORT_IDEMPOTENCY](IMPORT_IDEMPOTENCY.md), [IMPORT_STAGING_DRY_RUN](IMPORT_STAGING_DRY_RUN.md), [RECORDS_RETENTION](RECORDS_RETENTION.md) และ [IMPORT_VALIDATION_CODES](IMPORT_VALIDATION_CODES.md) ใช้บัญชี/Document/PolicyVersion/workflowกลางร่วม ไม่เปิดexportpublicหรือjobconsoleให้ทุกคน

## 1 หน้าประวัติและข้อมูลที่แสดง

เส้นทางเสนอ `/app/exams/imports` กับ `/app/exams/imports/[batchId]` **ยังไม่มีUIนี้** Serverเลือกbatchจากcurrentaction+organization/พื้นที่/assignmenttimeก่อนcount/search/filter/pagination ใช้filterปีการศึกษา/typedประเภทระดับช่วงชั้น/สถานะ/recorded_at ผู้ทำแสดงdisplayreferenceตามfieldpolicyไม่identityเต็ม ไม่มีglobalcount/foreignชื่อในautocomplete การเป็นผู้สร้างbatchไม่คงสิทธิ์อ่านตลอดไปหลังพ้นหน้าที่

| ข้อมูลเสนอ                         | แหล่งจริงที่ต้องใช้                               | ข้อบังคับ                                                                    |
| ---------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------- |
| batch/root/parent/revision/context | ImportBatch+lineage+AcademicYear/Offeringกลาง     | snapshotlabelที่อ้างรุ่น มีcurrentauthorization ไม่joinชื่อปัจจุบันทับปีเก่า |
| stage/status/progress              | persistedstage/run/generation, total/checked rows | parsing/scanningยังไม่ทราบtotalให้แสดง“กำลังประมวลผล” ไม่คิด100%จากqueueACK  |
| ผู้ทำ/เวลา                         | authenticatedactor/scope snapshot+audit/timeUTC   | UIแสดงเวลาไทย/พ.ศ.; queueไม่รับclientผู้ทำ/เวลา                              |
| checksum/fileversion/reportversion | exactsourcebytes/normalizedmanifest/rulepins62    | privateviewตามpolicy ไม่ใช้hashเป็นสิทธิ์หรือเผยsourcefilelocator            |
| Applicationเลขอ้างอิง/counts       | durablecommitsummary+rowreceipt→Application05จริง | pending/failedไม่มีเลขสมมติ; committedต้องครบreceiptsไม่clientcalculated     |
| failure/retry/recovery history     | command receipts/attempt/generation/decisions     | maskedcode/hint/correlationไม่rawnormalizeddata/stackcredentials             |

Checked rowsอาจ100%แต่ยังfailed/stale/committingได้ Progressแยกจากcommit atomicity ไม่แสดงจำนวนApplicationที่INSERTกลางtransactionเป็นยอดสำเร็จ ถ้าworkerheartbeatขาดให้แสดง“ยังยืนยันสถานะไม่ได้”และเวลาที่ข้อมูลอัปเดตล่าสุด ไม่guessfailed/successจากเวลาที่ผ่าน

Proposal page50/max100 bounded cursorผูกfilter+scope+sort(recorded_at,batch_id) currentgrant/revisionตรวจทุกpage Historicaldataใช้valid_at/known_atหรือpinnedรุ่นเพื่ออธิบายlabels ไม่restoregrantเก่า Response/HTML/preview/errorreport/download/exportตั้งprivate no-storeก่อนมีprotocolcacheที่ทดสอบแล้ว Fulltext/CSV/XLSX/ไฟล์ต้นฉบับ/เลขอ้างอิงและnotificationทุกทางผ่านDALเดียวกัน ไม่clienthide Permissionexpired/revokeddenyก่อนmetadata lookup; no link-basedgrant

Exportrequestpin selection/time/sourceversionsแต่ reauthorizeworker+downloadอีกครั้ง DTOallowlistก่อนserialize ข้อความไม่trustedเป็นXLSXtypedstringsไม่formula/hyperlink/hiddenraw CSVยังdisabledตาม61 หากfieldpolicyตึงขึ้นไฟล์เก่าต้องdenyหรือregenmaskedversion ไม่ให้downloadเดิมแล้วmaskหน้าbrowser

## 2 Retry เฉพาะงานยังไม่สำเร็จ

| สถานะที่อ่านจากDB                       | ปุ่ม/commandเสนอ                       | การตรวจserver                                                                                 |
| --------------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------- |
| parsing/validationfailed แบบtransient   | retryrunเดิมหรือnewgenerationตามpins   | currentACL/sourceCLEAN/limits/lease/fingerprint; failedsecurityformatต้องแก้fileไม่blindretry |
| commitfailed หลังพิสูจน์rollback        | retryintent62ตามเดิม                   | testedprofile+latestyear/window/center/identity/eligibility/ACL; reportstaleต้องdryrunใหม่    |
| committing / outcomeunknown             | ตรวจreceipt/สถานะ ไม่เริ่มsecondcommit | currentreadACL durableoutcome+leasefencing ไม่jobmessageเพียงอย่างเดียว                       |
| committed                               | ดูreceipt/เสนอamendment ไม่retryimport | clientส่งretryเองก็ไม่create คืนผลเดิมเฉพาะkey/pinsตรงตาม62                                   |
| cancelled/invalid/expired/filedestroyed | แก้source/newbatchหรือnewreviewตามเหตุ | ไม่restartdeletedfile/คืนrawจากlog ไม่มีnewwriteจากbuttonสีเขียว                              |
| recoveryบางtargetสำเร็จ                 | retryเฉพาะunfinished approvedcommands  | currentauthority+impact/currentversionต่อtarget สำเร็จแล้วreplayreceiptเดิม                   |

Jobpayloadเสนอ `{command_reference, generation, correlation_reference}` เท่านั้น ค่าบัญชี/scope/identity/file storage path/reasonเต็มดึงจากprotectedDBหลังauthorize ไม่มีrawrows/passport/เลขบัตร/ชื่อในqueueหรือjoblogs Structuredlogsใช้opaquejob/batchreference/stage/safeerrorcode/duration ไม่logsourcefilenameที่มีชื่อคน ไม่logdiff/beforeafterPII Errorข้อความจากparser/driverต้องmapก่อนlog ไม่มีcredential/token/DBURL

## 3 Retention และ legal hold

ใช้PolicyVersionกลาง namespaceเสนอ `EXAM_IMPORT_RETENTION` versionedbindingต้องownerรับรอง ระยะเก็บจริงทุกประเภท **NULL / TO_VERIFY**, destruction_enabled=false ยังไม่เดาว่าเก็บกี่ปี ห้ามใช้กำหนดอายุสิทธิ์แทนretentionหรือexpiredreportเป็นสิทธิ์ลบหลักฐาน

| ประเภทข้อมูล                             | policy triggerที่ต้องยืนยัน                       | สิ่งที่ต้องรักษา/ลด                                                                                                |
| ---------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| sourceDocument/FileVersionและderivatives | batchterminal/recoverycompletedตามนโยบายที่ได้รับ | scan/hash/version/provenance/linkedworkflow; sharedfileต้องตรวจทุกreferenceไม่ลบทั้งDocumentเพราะbatchเดียวหมดอายุ |
| stagingraw/normalized/identitymatches    | dryrun/commit/recoveryterminalตามownerpolicy      | ลดPIIที่หมดความจำเป็น ไม่คัดลอกrawเข้าถาวรaudit/receipts/logเพื่อหลบretention                                      |
| error/diff/exportreport                  | reportgenerated/expiredตามpolicy                  | maskedartifact/manifest/fieldpolicy+hold แยกอายุartifactจากธุรกรรม                                                 |
| operation/commit/amendmentreceipt+audit  | transactionalrecordpolicyแยก                      | minimalIDs/versions/checksum/actorref/time/decision ไม่fullidentityในreceipt                                       |

Legalholdผูกversion/family/referenceclosureรวมsource/staging/derivativesที่เกี่ยวข้อง Holdไม่เพิ่มสิทธิ์อ่าน เริ่มholdหลังapproveทำลายก่อนworkerต้องหยุด destructiveaction Currenthold/reference/ACL/approvedmanifest/versionตรวจอีกในworkerใช้protocolกลางที่ป้องกันrace ห้ามลบจากscheduledTTLเพียงอย่างเดียว

ทำลายตามworkflow56 maker-checkerไม่ให้ผู้สร้างapproveเอง ตรึงรายการที่อนุมัติ Auditการทำลายและtombstoneคงอยู่ ไม่CASCADEลบApplication/seat/score/release/commitreceipt Partialobjectdeletionต้องมีper-targetreceipt/retryและบอกผลจริง SQLmetadataกับobjectstorageไม่อ้างdistributedatomic ถ้าfileหายหรือhashไม่ตรงให้incident ไม่ลบauditปิดปัญหา ไม่กู้PIIจากjoblogs

Sourcefileที่ถูกถือครองหลายระบบหรือมีpendingamendmentต้องตรวจobligationsทุกระบบก่อนpurge ไม่snapshotPIIเพิ่มเพียงเพราะexport/historyview ยังไม่มีretentionjob/holdservice/ObjectStorageในรอบนี้จึงไม่มีการทำลายจริง
