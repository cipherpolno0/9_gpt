# Transaction และการเชื่อม Application กลาง — บท 62

รุ่น 0.1 | 9 ตุลาคม 2569 (2026-10-09) | **Proposal / BLOCKED — contract ไม่ใช่ executable worker**

ใช้ [IMPORT_IDEMPOTENCY](IMPORT_IDEMPOTENCY.md), [IMPORT_STAGING_DRY_RUN](IMPORT_STAGING_DRY_RUN.md), [APPLICATION_SCHEMA](APPLICATION_SCHEMA.md), [ELIGIBILITY_RULES](ELIGIBILITY_RULES.md), [APPLICANT_REVIEW_IMPACT](APPLICANT_REVIEW_IMPACT.md) และ Documentกลาง ห้ามสร้าง importer_application หรือ login อีกชุด

## 1 ขอบเขตที่ต้องพร้อมก่อนเปิดใช้

| Dependency                                | สัญญาที่ต้องผ่าน                                                             | สถานะที่อ่านพบ                      |
| ----------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------- |
| 60/61 staging/parser/dryrun               | source immutability, bounded parser, complete run, immutable manifest        | contractsเท่านั้น                   |
| 35/36/37 Application/identity/eligibility | writerเดียว, unique identity/Candidate/opportunity, current lifecycle/impact | ไม่มี models/services               |
| บัญชี/สิทธิ์/RLS                          | action+scope+assignment time+delegation, worker on behalf of current actor   | bootstrap403 ไม่ใช่บริการนี้        |
| Document/FileVersion                      | CLEAN exact bytes+ACL+reviewed evidence+immutable reference                  | Document metadataเท่านั้น           |
| Queue/outbox/receipts                     | atomic durable intent/result, lease fencing, dedupe                          | worker connection checkerเท่านั้น   |
| PostgreSQL/tested profile                 | two connections/fault injection/rollbacks/resource limits/least privileges   | db:testexit1; ไม่มีnativePGตามprobe |

ไม่มี authenticated technical admin/ServiceActor ที่ได้ grantข้ามหน้าที่โดยปริยาย Permission revoke ต้องประสาน revision/lock protocol กับ current ACLทุก writer ไม่อ้างว่าเรียก authorizeก่อนBEGINครั้งเดียวแก้ raceทั้งหมดได้ ถ้า protocolนี้ยังขาดให้ NOT_READY

## 2 ขั้นยืนยันและ dispatch

Confirmation transactionสั้นตรวจ current authorize/owner/context/expectedrevision, manifest/expiry/errors/warningackและtested profile แล้วสร้าง immutable intent กับ dispatch outbox ใน transactionเดียว ยังไม่สร้าง Person/Candidate/Application เปลี่ยน batchเป็น committing แบบ CAS การenqueueหลังcommitด้วยoutbox: dispatcherอาจส่งซ้ำ consumerจึงต้องอ่านintent/receiptจากDB ไม่ใช้ memory queueเป็นแหล่งจริง

คนละkeyแต่batchเดียวกันไม่สร้างactiveintentอีก ถ้าpayloadเดียวคืนexistingintentreferenceภายใต้ACL ถ้าต่าง409 หากfailedต้องปิดleaseเก่าที่ไม่มีtransactionค้างและCAS generationก่อนretry/newintent batchที่committedแล้วไม่สร้างintentใหม่ ห้ามretireintentโดยdeleteหลักฐาน

## 3 ขั้นของ worker และ transaction ทั้งชุด

1. โหลด intentจากDB ตรวจ generation/current user authority+worker command scope ขนาด/แถวตาม tested profile และ source FileVersion/hash/CLEAN/ACL ผ่านDocument service ถ้าขาดบริการให้NOT_READY ห้ามfetch arbitrary URL หรืออ่านfile pathจากqueue
2. เริ่ม shared transaction context สำหรับ service05+identity service+staging+audit/outbox ใน PostgreSQL เดียว ใช้ isolation/locksที่ centralwritersทั้งหมดตกลงกัน ข้อเสนอ SERIALIZABLE+uniqueconstraints+boundedretry ต้องมี native testsก่อนเปิด ไม่ทำ distributedatomicclaim หากบริการ05commitคนละฐาน
3. ล็อก batch/intent/summary key ตรวจ durable resultก่อนเขียน หาก committedและfingerprintตรงคืนผลเดิมหลังcurrentreadACL; payloadต่างconflict เลขgenerationเก่าต้องหยุด ไม่แก้state
4. โหลดcurrent authorization/assignment/delegation/hierarchy revisions, ปีและtypedoffering, registration windowจากserverclock, org/center effective status, Person lifecycle, identities/priorqualification, policies/template/evidence scan+ACL+review และ Applicationduplicates ใช้ source epoch/protocolป้องกัน concurrentchanges ผลไม่ครบหรือstaleให้rollbackและตรวจใหม่ ไม่unknown=eligible/0errors
5. ตรวจทุกแถวผ่าน eligibility36/identity05 ด้วยpolicy pinnedที่ยังใช้ได้ Errorใด ๆ ไม่มีการสร้างบางแถว หากเวลาปิดใกล้ระหว่างtransaction ตรวจ clockใหม่ก่อน finalize ด้วยเวลาประเมินserverจริง ไม่ใช้ `now()` ที่คงเวลาเริ่มtransactionแทนเวลาขณะตรวจสุดท้าย ห้าม clientเวลา/verified flagเปลี่ยนผล; temporalguardsภายนอกDBต้องมีprotocolร่วมก่อนเปิดใช้
6. Resolve Personผ่าน central verified-identity policy: matchหนึ่งคนจึงใช้เดิม ไม่มีคนและหลักฐานผ่านจึงเรียก centralcreateในtxเดียว ถ้าไม่ชัด/หลายคน/ชื่อคล้ายให้หยุด ชื่อใหม่ไม่แก้ Personเดิมเอง Candidateใช้ unique(person_id) ช่องทางเว็บและExcelใช้writer/identity keyเดียวกัน Lockเฉพาะแถวที่ยังไม่มีไม่ป้องกัน duplicateinsert ต้องใช้ sharedunique locator+conflictresolutionตามpolicyกลาง อาจrollback/retryทั้งtransactionเมื่อมีwriterแข่ง ห้ามmergeจากชื่อหรือยอมรับผล verifiedจากไฟล์
7. เรียก Application05 createDraft กับ tx contextสำหรับทุกrow ส่ง resolvedCandidate/context/slotที่serverpolicyกำหนดและsnapshot/version/evidence refs ไม่ให้ methodเปิดconnection/autocommitเอง ไม่สร้างEnrollmentอัตโนมัติ ไม่ approve/seat/result; keyซ้ำจากคำสั่งอื่นrollbackทั้งชุด ไม่ใช้skipDuplicatesเป็นวิธีทำให้ทั้งไฟล์ดูสำเร็จ
8. สร้าง CommitReceiptรายแถวที่FKชี้ Application.idจริง, summary counts/references/manifest+recordedtime, Application/audit snapshots และ success notification outbox แล้วตั้ง batch/intent committed ใน transactionเดียว ทุกrowต้องมีreceiptหนึ่งอัน ตรวจ before-aftercounts/revisions/lineage
9. COMMITแล้วจึงตอบ/dispatchnotification ไม่มีemail/objectstorage writesภายในSQL locks เก็บsourcefileversionเดิม อัปเดตผล failedแยกtransactionเฉพาะเมื่อยืนยันrollbackและไม่มีcommittedsummary ใช้ CAS/fencingไม่ทับผลใหม่

ลำดับ lockต้องใช้ ADRร่วมกับ web05, identity, fieldpolicy/revokeและworkerอื่น ไม่กำหนดorderเฉพาะimporterแล้วอ้างว่าไม่deadlock Missing/newidentity/application predicatesต้องuniqueconstraint/serialization ไม่ใช้SELECTก่อนINSERTนอกtxเป็นการรับประกันไม่ซ้ำ

## 4 Failpoints และหลักฐาน

| จุดจำลอง                                               | ผลคาดหมายที่ต้องทดสอบจริง                                                         | กู้คืน                                  |
| ------------------------------------------------------ | --------------------------------------------------------------------------------- | --------------------------------------- |
| intentเขียนแล้วแต่dispatchoutboxinsertล้ม              | rollbackทั้งconfirmation ไม่มีintentที่ส่งงานไม่ได้                               | ยืนยันkeyเดิมอีกครั้ง                   |
| หลังสร้างPersonใหม่/หลังApplicationแถวกลาง/ก่อนreceipt | rollbackPerson/Candidate/Application/snapshot/rowlinks/audit/successoutboxทั้งชุด | revalidate currentfactsก่อนretry        |
| successoutboxinsertหรือsummaryล้ม                      | rollbackทุกApplicationและPersonใหม่ของtx                                          | ไม่แสดงcommitted                        |
| หลังDBCOMMITก่อนACK/response                           | durablecounts/receiptsครบ ไม่rollbackผลที่สำเร็จ                                  | replayreceiptเดิมแม้windowปิดภายหลัง    |
| workerตาย/leaseหมดกลางtx                               | DBrollbackเมื่อconnectionปิด; outcomeไม่ชัดต้องตรวจsummary/txก่อน                 | fencedgenerationใหม่ ไม่สองworkerสำเร็จ |
| centerปิด/สิทธิ์หมด/windowปิดก่อนretry                 | failed/NEEDS_REVALIDATION ไม่มีpartialregistry                                    | ไม่reusecachedPASS                      |
| Notificationconsumerตายหลังส่งก่อนACK                  | registry/receiptคงเดิม notificationdedupeevent                                    | ส่งซ้ำไม่createApplicant                |

All-or-nothingครอบคลุม **mutationในbusiness transaction** ไม่รับประกันเลขsequenceไม่มีช่องว่างเมื่อrollback ไม่อ้างว่าfailedmetadata/queue deliveriesหรือfileuploadsถูกSQLrollbackไปด้วย เจ้าหน้าที่เห็น failure reasonแบบmasked พร้อม correlation reference ไม่lognormalized/raw/token/databaseURL

## 5 ตรวจรับก่อนเปลี่ยนสถานะบท

ต้องมี migration/RLSจริงและ shared tx API, profileที่วัดแล้ว, PostgreSQLสองconnection, fault injectionหลายตำแหน่ง, API currentauthority/revoke tests, revalidation stale/expiry, sourceversion/checksumprovenance และ success DTO actualApplicationreferences ดู [COMMIT_CASES](../tests/system09/COMMIT_CASES.md) ผลเอกสารไม่เป็นผลทดสอบ runtime ใช้กฎDEMOติดป้ายชัดในทะเบียนกลางไม่ใช่ทะเบียนอื่น กฎ TO VERIFY ไม่ทำให้ officialenabled
