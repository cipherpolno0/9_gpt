# Staging และรายงาน dry run — บท 61

รุ่น 0.1 | 9 ตุลาคม 2569 (2026-10-09) | **Proposal / runtime BLOCKED / acceptance NOT RUN**

ใช้ [BLUEPRINT](../BLUEPRINT.md), [MASTER](../00_MASTER_PROMPT.md), [APPLICATION_SCHEMA](APPLICATION_SCHEMA.md), [ELIGIBILITY_RULES](ELIGIBILITY_RULES.md), [template59](EXCEL_TEMPLATE_CONTRACT.md), [parser60](XLSX_PARSING_LIMITS.md) และ [รหัสข้อผิดพลาด](IMPORT_VALIDATION_CODES.md) กลาง ไม่สร้าง Person/Candidate/Application/login/eligibility engine อีกชุด

ตรวจจาก baseline `fdc5005`: บท60ยังไม่มี parser/upload/staging และบท36ยังไม่มี eligibility/Application/FormTemplateRegistry/ExamSession servicesจริง Coreมี19models/DocumentMETADATA_ONLY workerเป็นreadinesscheck /appทุกmethod403 และ `corepack pnpm db:test` รอบ61exit1 จึงส่งมอบสัญญา/แบบข้อมูลและกรณีทดสอบที่reviewได้ ไม่ใช่ staging/validation services หรือหน้า preview ที่ทำงานแล้ว ไม่มีmigrationใหม่ ไม่เริ่ม62

## 1 แนวคิดทีละขั้น

1. Staging เป็นพื้นที่ตรวจไฟล์ ไม่ใช่ทะเบียนผู้สมัครใช้งานจริง การพบข้อมูลใหม่ยังไม่สร้าง Person หรือ Enrollment
2. Dry run ตรวจแต่ละแถวโดยใช้ทะเบียนและบริการคุณสมบัติกลางที่มีสิทธิ์อ่าน ไม่ใช้ชื่อใกล้เคียงตัดสินว่าเป็นคนเดียวกัน
3. รายงานบอก sheet/แถว/คอลัมน์/code และวิธีแก้ตามสิทธิ์ ไม่เผยข้อมูลของคนหรือbatchอื่นผ่านผลจับซ้ำ
4. ผูกผลกับไฟล์ ข้อมูล normalized และรุ่นกฎ เมื่อไฟล์หรือเงื่อนไขเปลี่ยนผลเก่าใช้ต่อไม่ได้ การตรวจผ่านยังไม่ใช่ approval หรือการจองที่นั่ง

## 2 ต่อแบบ logical เดิม ไม่สร้างทะเบียนอีกชุด

แบบ [DATA_DICTIONARY](DATA_DICTIONARY.md#import_batch) มี import_batch/import_row/validation_issue จากบท04แต่ยังไม่อยู่ในPrisma ข้อเสนอ61ด้านล่างเป็นdeltaสำหรับmigrationเมื่อFK/Auth/ไฟล์/rulesพร้อม ไม่แก้แบบlogical128ตารางย้อนหลังหรือcoremigrationเดิม

ทุกตารางเสนออยู่private schema/RLSdenydefault UUID/RESTRICT FK, account provenance, effective reference timeกับrecorded/check times, revision/CAS, audit transactionและretentionตามpolicy Raw/normalizedเข้าชั้นข้อมูลHและตรวจleaf field policy ไม่รู้classให้deny ไม่เก็บค่าเต็มในaudit/outbox/log

| Model / mapเสนอ                                    | ฟิลด์/ความสัมพันธ์สำคัญ                                                                                                                                                                                                                            | Constraints/การเก็บประวัติ                                                                                                                                                      |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ImportBatch / import_batch                         | owner Organization/currentaccount, AcademicYear, ExamSession/Offering/center context, template version, central source FileVersion/hash/size, parser generation, current dry_run_version_no, status, operation_receipt, pinned policies            | unique(owner account+context, idempotency key) กับpayloadfingerprint; existingoperationreceiptFKใช้ร่วม ไม่writeapplication; fileversionเปลี่ยนเป็นbatchใหม่ตามuploadcontract60 |
| ImportRow / import_row                             | batch, parsing generation, sheet key/index/name, physical row number, source row_id/cell map/type, protected raw+normalized payload, normalized row digest, matched Person/Candidate referencesที่อ่านได้, resolved business key, evaluation state | เปลี่ยนuniqueเดิม(batch, dry_run_version_no,row_number)ให้รวมsheet key ป้องกันผู้สมัครแถว5ชนหมายเหตุแถว5; unique(batch,run,sheet,row); referencesไม่เป็นการสร้างตัวตน           |
| ValidationIssue / validation_issue                 | batch/run, nullable row forbatch-levelissue, field_code/schema-column/cellref, issue_code/severity, message_th/correction hint keys, protected detail refs/relatedrow                                                                              | rowถ้ามีต้องอยู่batch/runเดียวกัน; unique(run,row-or-batch,field,code,occurrencekey) ป้องกันretryซ้ำ; relatedbatch/applicationไม่ส่งลงDTOเมื่อไม่มีสิทธิ์                       |
| DryRunReport / immutable validation-run recordเสนอ | batch/run number, file hash, normalized digest, context/policy/rule/source/fact revision digest, checked_at, expires_at, completion counts, counts byseverity, manifest hash, validation state, error report FileVersionถ้ามี                      | unique(batch,run); ไม่เขียนทับrunเดิม; publishผลผ่านCASเฉพาะgenerationปัจจุบัน; รูปเก็บเป็นtableหรือmanifestต้องADRก่อนmigration ไม่สร้างapproval engine                        |

ImportRowในrunเดิมimmutable เก็บค่าที่ใช้ตรวจพร้อมหลักฐาน คำขออ่านหน้า preview ไม่match-and-upsert Person/Candidate อัตโนมัติ ไม่มีApplication FKใหม่จากการvalidate การสร้างเอกสารรายงานอาจเพิ่มเฉพาะDocument/FileVersionกลางตามสิทธิ์; ไม่เพิ่มcommit_receipt/application/seat/result

Issueที่rowNULLต้องมีscope_target_keyแบบNOT NULL เช่น@batch ส่วนrowissueใช้keyที่ผูกrowของrunนั้น uniqueใช้targetkey/occurrencekeyที่ไม่NULLแทนการหวังว่าnullable row_idจะกันbatchissuesซ้ำเอง ต้องมีconstraintตรวจtargetkeyตรงrow/batchและFKbatch-runเดียวกันก่อนapplymigration

Dry-run principal/DBrole ต้องมีreadของทะเบียนที่จำเป็นและwriteเฉพาะstaging/run/issue/audit/outboxตามscope การไม่มีgrantINSERT/UPDATEของperson/enrollment/applicationเป็นชั้นบังคับเพิ่มจากservice; serviceไม่เรียกmutationcommand05 ไม่ใช้DBuserสิทธิ์กว้างมาอ้างว่าread-only นโยบายexactgrants/RLSต้องmigrationและnativenegative tests

## 3 สัญญา validation service ที่เสนอ

Inputคือ batch_id, expected_batch_revision, parsing_generation, operation key และexpectedcontextdigest บัญชีมาจากsessionฝั่งserver ไม่รับ currenttime/scope/eligible/verified/matchedperson/registration_slotจากclient ไม่รับ normalized payload ที่clientอ้างว่าเป็นผลparserโดยไม่ตรวจกับgeneration/file hash

| ลำดับ                  | ตรวจทุกแถวหรือทั้งbatch                                                                                                                                    | ผลที่ต้องเก็บ                                                                                            |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 1 current access/file  | account/action/area/assignment time, batch owner, exactFileVersion+CLEANhash/ACL, parserREADYไม่partial, OFFICIALregistryverified                          | denyก่อนคืนexistence/PII; parse generationและimmutable inputmanifest                                     |
| 2 schema/context       | exacttemplate/machine/mapping/normalization version, headers/type/requiredfield, ปีการศึกษา/type/level/stage/offering                                      | physicalsheet/row/cellเดิมและissuecodeจากschema ไม่เดาปี/แบบศ.3                                          |
| 3 organization/center  | resolve centralcodeกับปี/วันที่อ้างอิง, selectedorganization binding, hierarchy/current scope, center-sessionเปิด/currentregistry/request-effective status | before-readactorมีสิทธิ์; unknown/outscopeใช้ข้อความทั่วไปตามfieldpolicy ไม่บอกว่าcodeของอีกสำนักมีอยู่  |
| 4 identity             | sharedidentity policy: ไทย/หนังสือเดินทาง/ไม่มีเลขไทย พร้อมissuer/country/verifiedidentity+evidencerefเมื่อpolicyกำหนด                                     | ไม่บังคับThaiIDกับทุกคน ไม่เติมเลขปลอม ไม่รวมคนจากชื่อ/ชื่อเดิม/ฉายาคล้าย                                |
| 5 duplicate            | row_idซ้ำ, verifiedidentity+businessopportunityซ้ำในไฟล์, activependingbatch, Applicationเว็บ/Excelกลาง                                                    | ใช้canonicalkeyระบบ05และidentityserviceเดียว; referencesและmatching factsprotected ไม่reserveapplication |
| 6 eligibility/evidence | sharedservice36ตามruleversion/priorofficialqualification/stage/registrationwindow/serverclock/evidence requirements+scan/binding/content verification      | missing/unknownไม่eligible คะแนนฝึก/notesไม่priorofficialresult evidenceCLEANไม่เท่ากับหลักฐานแท้        |
| 7 complete/report      | ตรวจครบinputrowsทุกsheet รวมremarks; counted/skipped/failedชัด ทุกcheckdecisionมีpins; validate freshnessอีกครั้งก่อนpublish                               | READY onlyเมื่อcompleteและerrors0; warningsackยังไม่เป็นcommitgrant; invariantregistrywrites0            |

ขั้นหนึ่งผิดให้ตรวจขั้นที่ยังทำได้อย่างปลอดภัยต่อทุกแถว ไม่ข้ามแถวหลังerrorแรก แต่ถ้าtarget/scopeไม่ผ่านห้ามlookupข้อมูลส่วนตัวเพื่อสร้างรายงานละเอียดยิ่งขึ้น dependentchecksระบุBLOCKED_BY_INPUT ไม่ถือskipเป็นผ่าน หากtimeout/DB outage/limit/ACLrevokeระหว่างตรวจให้ VALIDATION_INCOMPLETE/CANCELLED ไม่READYแม้ส่วนที่ตรวจแล้วerrors0

ข้อเสนอDEMO defaultไฟล์หนึ่งผูกหน่วยงานที่เลือกหนึ่งแห่งและofferingที่ระบุ roworganizationต้องตรง context หากต้องนำเข้าหลายสำนักใต้จังหวัดต้องมีpinnedaggregate-scope policyและตรวจแต่ละrow ไม่ใช้การเลือกจังหวัดเป็นอำนาจโดยปริยาย ไฟล์59validหมายถึงโครงไฟล์ถูกออฟไลน์ ไม่ได้ยืนยันscope/ตัวตน/คุณสมบัติผ่าน61

อ่านข้อเท็จจริงภายใต้consistent database snapshotหรือrevisionmanifestที่ตรวจrevalidateได้ เมื่อserviceอ่านภายนอกtransactionต้อง pinrevisionsและตรวจcurrentอีกครั้งก่อน publishไม่อ้างtimestampเดียวเป็นconsistencyproof Nativeworker/DBต้องมี boundedlimitsตาม60 และunique/CAS/retry2infracauseเท่านั้นจากqueueกลาง unknownduplicatequery failureไม่แปลว่าไม่ซ้ำ

## 4 คนซ้ำและ business key

Candidateกลางหนึ่งต่อPerson ไม่มีทะเบียนต่อปี/ประเภท/ช่องทาง Application keyเสนอจาก35คือ `(candidate_id, session_offering_id, registration_slot)` slotจากกฎฝั่งserver การเปลี่ยนOrganization/สนาม/channel/idempotencykeyไม่สร้างโอกาสสมัครเพิ่ม คนเดิมสมัครหลายปีหรือหลายชนิดที่กฎยอมรับไม่ใช่duplicatePerson

สำหรับแถวที่ยังไม่resolveCandidateใช้shared verifiedidentity locator+offering+slotpolicyเพื่อคัดคู่ต้องตรวจ ไม่สร้างCandidateเพื่อให้คำนวณkeyได้ ไทยตรวจเลข/ชนิดตามidentitypolicyที่ยืนยันแต่checksumเลขผ่านไม่แปลว่ามีสิทธิ์จับคู่บุคคล Passportเทียบissuer/country/documentrefตามpolicy ไม่ใช้เลขหนังสือเดินทางอย่างเดียวเป็นglobalpersonkey LOCAL_EVIDENCEไม่มีบัตรไทยอ้างverifiedcentralidentity/evidence;ไม่มีหลักฐานพอคืน IDENTITY_REVIEW_REQUIRED ไม่auto-createหรือmerge

Name-similarityใช้เสนอให้ผู้มีสิทธิ์ตรวจเท่านั้น Verifieddistinct identitiesชื่อเหมือนคงสองคนต่างกัน ไม่สร้างduplicateerrorจากชื่ออย่างเดียว ถ้ามีwarning NAME_SIMILAR_NOT_MERGED การackไม่อนุญาตmerge/ยกเว้นidentityerrors Unresolved/ambiguous identityเป็นerrorที่ต้องตรวจตามworkflowกลาง ไม่ลดเป็นwarningเพื่อให้ผ่าน

Pendingbatchที่sameopportunityและidentityconfirmedต้องreported DUPLICATE_PENDING_BATCH ตามpolicyเสนอ; failed/cancelled/superseded batchไม่ถือactive pending แต่auditยังอยู่ Currentduplicateผลนอกscopeแสดงเพียง“รายการนี้ต้องให้เจ้าหน้าที่ตรวจความซ้ำ” ไม่ส่งbatchid/applicationid/ชื่อ/สถานะ/จำนวนของคนอื่น ทั้งสองbatchอาจต้องพักเพื่อให้เจ้าหน้าที่แก้ ไม่มีการเลือกคน/ใบสมัครที่เก่ากว่าอัตโนมัติหรือจองสิทธิ์จากdryrun

## 5 File/normalized/rule checksum และความสด

| Pin / digest           | เนื้อหาที่ผูก                                                                                                                                                                    |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| source_file_sha256     | exactuploadedbytes/objectversion+size จากFileVersionกลาง ไม่ใช้ชื่อไฟล์หรือmodifiedtimeแทน                                                                                       |
| normalized_data_sha256 | orderedrowsทุกinputsheetรวมremarks/sourcephysicalcoordinates, fieldtypedvalues/raw-reference, parser/normalization/machineschema version; ไม่hashDTOที่maskแล้ว                  |
| rules_context_sha256   | selectedcentralcontext+template/eligibility/identity/evidence/mapping/visibility/registrationpolicy versions และreferenceas_of/serverchecked_at                                  |
| fact_revision_manifest | Organization/hierarchy/Person/Candidate/identity/priorqualification/center-session/registrationwindow/evidenceACL+scan/applicationduplicate/pendingbatchset revisions ที่ใช้ตรวจ |
| report_manifest_sha256 | pins+run/completion/counts/severity/issues codes/revision+freshness; detailsส่วนตัวอยู่protected store ไม่publichashcatalog                                                      |

Productioncanonicalizationต้องมีADR: UTF8, keysเรียงตามcodepointไม่locale, arraysรักษาลำดับsheet/physicalrow, stringsnormalizeเฉพาะfieldpolicy, schemaoptionalempty/nullตาม60, markersแยกMISSING/NULL/emptyตามschema, integerexactสำหรับrow/revision, ไม่มีfloating pointหรือJSONcoercionตัวตน hashจากbytesนิยามเดียวกันทุกworker/version ตรวจdomain separationของdigestsไม่นำhashหนึ่งไปแทนอีก Hashไม่signature/approval/identityproof

[fixture61](../tests/fixtures/system09/validation-plan.json) ใช้ `REFERENCE_CANONICAL_JSON_0.1` กับข้อมูลสมมติ inlineเท่านั้น reference_digestไม่ใช่checksumไฟล์XLSXหรือผลdryrunจริง actualsource_file_sha256/report_idเป็นNULLทุกกรณี ไม่ส่งrawidentityหรือunsaltedidentityhashไปbrowser/public log; identitylookup fingerprintsต้องนโยบายprotectedของsharedservice

Expires_atเสนอเป็นค่าต่ำสุดของ checked_at+15นาที, nextregistration/center effectiveboundary และassignmentexpiry ต้องเจ้าของยืนยันTTL เก็บเวลUTC แสดงพ.ศ.Asia/Bangkok วันหน้าต่างสมมติ6–7ตุลาคม2569จาก36เป็นfixture ไม่ใช้เป็นปฏิทินปีปัจจุบันจริง ไม่รับclient clockขยายexpiry

Freshnessต้องตรวจตอนอ่านpreview/export/download และก่อนคำสั่งถัดไปด้วย currentAuth, exactfile/parsernormalizedgeneration, latestrevisions, policywithdrawalและserverclock reportflag/TTL/eventcacheอย่างเดียวไม่พอ เหตุเปลี่ยนไฟล์/context/template/eligibility/identity/evidence/ศูนย์สอบ/หน้าต่าง/duplicatefacts/scope ทำให้ STALEทันทีที่ตรวจพบ แม้15นาทียังไม่ครบ สิทธิ์ถูกถอนให้denyก่อนส่งรายงาน ไม่ใช้STALEresponseเป็นทางเปิดPII

เก็บreportเก่าimmutableสำหรับauditที่มีhistoricalread permission พร้อมป้ายหมดอายุ แก้ไฟล์ต้องFileVersion/batchใหม่และrunใหม่; เปลี่ยนfacts/rulesตรวจใหม่ใต้batchเดิมได้แต่เพิ่มrun ไม่overwriteissuehistory Policyเปลี่ยนแม้digestสิทธิ์เปลี่ยนแต่payloadเหมือนก็ตรวจfreshnessใหม่ Eventoutboxช่วยnotification/cache invalidation แต่eventล่าช้าไม่อนุญาตใช้ผลเก่าผ่านread-timecheck

Historicalreadไม่ให้สิทธิ์ดาวน์โหลดartifactเก่าที่มีfieldsเกินcurrentpolicy gatewayต้องตรวจstoredfieldmanifestด้วย หากpolicyแคบลงให้denyไฟล์เดิมหรือสร้างartifactปกปิดรุ่นใหม่ที่อ้างrunเก่าอย่างชัดเจน ไม่คืนbytesเก่าแล้วค่อยซ่อนในbrowser การเปิดประวัติไม่ทำให้reportกลับเป็นactiveหรือให้commitgrant

## 6 Preview และดาวน์โหลดข้อผิดพลาด

Routeเสนอ `/app/exams/imports/[batchId]/preview` เป็นprivateพื้นที่เดิม ใช้sharedDAL ไม่สร้างloginใหม่ หัวหน้าแสดงDEMO/OFFICIALตามregistry, ปี/type/group/org/สนามที่เลือก, template/run, เวลาเช็ก/หมดอายุ, completion/error/warning countsของไฟล์ตน และปุ่มตรวจใหม่ ยังไม่เปิดปุ่มcommitในบท61

ตารางมีsheet/physicalrow/cell/field/code/severity/ค่าที่ได้รับอนุญาต/วิธีแก้ ค่าต้องมาจากDTOserverที่fieldpolicyผ่านแล้วไม่ส่งrawลงHTML/JSแล้วค่อยซ่อน ช่องที่ไม่มีสิทธิ์ให้“ปกปิดตามสิทธิ์”ทุกค่าและไม่ใส่tooltip/rawในdata attributes Relatedrecordsนอกscopeไม่ถูกjoinลงDTO Errorbatch-levelใช้cellNULLและlinkไปขั้นเลือกcontext/schema ไม่อ้างว่ามีcellในsheetเมื่อไม่มี

ค้น/กรองseverity/code/sheet และcursorpaginationเรียงsheetindex,row,column,issueidผูกbatch/run/revision Currentscopeตรวจทุกpage/count/download ไม่ให้page2อ่านอีกbatchจากtokenปลอม cappedpage50/maximum100เป็นProposal ตรวจloadจริงก่อนเลือกค่า Keyboardlabels/tablecaption/focus/error-summary/statuslive-region/mobile375–1440ใช้components/Sarabunกลาง สถานะไม่สื่อด้วยสีอย่างเดียว ข้อผิดพลาดบอกแก้XLSXแล้วuploadใหม่โดยเก็บsourceเดิมไว้

Exportเสนอ XLSXรายงานissuesที่สร้างจากDTOallowlist ไม่คัดลอกsheet/styles/formula/hyperlinks/embeddedobjectsจากไฟล์ต้นทาง และไม่มีhiddenrawsheet stringทุกค่าที่ผู้ใช้อัปโหลดต้องassignเป็นstringจริง ไม่รับobjectformula/hyperlink ไม่ถือ numFmt=@แทนtype ดู [ExcelJS String/Formula types](https://github.com/exceljs/exceljs#value-types) ทั้งชื่อsheet/comment/filename/errorhintต้องค่าควบคุมหรือescape HTML

ทดสอบpayloadต้น `=`, `+`, `-`, `@`, tab/CR/LF/fullwidthและcomma/quote/newline รวมข้อความลวงformula-object ให้reopen/export XMLไม่มี `<f>`/externalrelationships/macrosและค่าไทย/leading0คงเดิม ค่าอันตรายเป็นTEXTไม่evaluate rawเดิมคงprotected CSVยังไม่เปิดในprotocol0.1 จนมีadapter+native reopen tests เพราะquotingอย่างเดียวไม่รับรองความปลอดภัยหลังExcelsave/reopenตาม [OWASP CSV Injection](https://owasp.org/www-community/attacks/CSV_Injection)

Reportfilecentralprivateเข้ากระบวนการtype/scan/ACL/downloadตามบท10ด้วย manifestrun/hash/visibility version ไม่publicURLหรือใช้fileidเป็นgrant Workersตรวจcurrentexportpermission/revisionก่อนอ่านและpublishgatewayตรวจซ้ำหากสิทธิ์เพิ่งถอน private/no-storeทุกresponse ไม่ส่งค่าในnotification/log/analytics เจ้าหน้าที่เทคนิคไม่มีimplicitPIIaccess

## 7 State, concurrency และgate

Parsedbatchจาก60ส่งเข้า VALIDATING → VALIDATED_WITH_ERRORS / VALIDATED_WITH_WARNINGS / VALIDATED_READY หรือ VALIDATION_FAILED_INCOMPLETE/CANCELLED/STALE/EXPIRED ตามเหตุ runเดิมไม่ถูกลบคำว่าREADYไม่approved Warningackบันทึกactor/time/run+warningdigestไม่ยกเว้นerrorและไม่waivefreshness Batchstatusmapping logical04ต้องversionedไม่สร้างapprovalworkflowอีกชุด

CAS/unique/runleaseกันdryrunแข่ง publicationจากworkerรุ่นเก่าไม่ทับactive run; keyเดิม+payloadเดิมคืนrunเดิมเมื่อcurrentauthorized keyเดิมต่างpayloadคืน409 ระหว่างdryrunอาจมีแอปหรือbatchใหม่แข่งเข้ามา ทำให้ผลstale แม้ครั้งแรกไม่พบซ้ำ ต้องrevalidateก่อนcommitบทถัดไปด้วยservice05/transactionunique ไม่จองbusinesskey/seatจากdryrun

ทุกกรณีต้องตรวจcounts/rowversionsของPerson/Enrollment/Candidate/Application/seat/scoreก่อนหลัง **เท่ากัน** ทั้งsuccess/error/retry/export มีwriteเฉพาะstaging/report/auditตามcontract ไม่ทำDELETEทะเบียนเพราะinvalidrow มีcheckครบทุกแถวเมื่อdependentinputทำได้และprotectedissuesจากrowที่ผิด การแก้request/rulesต้องตรวจใหม่ไม่แก้ผลsnapshotย้อนหลัง

## 8 ผลจริงและขั้นตอนต่อ

เอกสาร/codecatalog/fixture/specifications0.1 เป็นPLAN_ONLY [VALIDATION_CASES](../tests/system09/VALIDATION_CASES.md)ทุกP61 NOT RUN ไม่มีAPI/preview/รายงานXLSX/actualImportBatchหรือnormalizedstagingจริง ตรวจfixture/reference digestsได้ในscratchแต่ไม่ใช้แทนservices/eligibility/Auth/nativeintegration

app/schema0.6.0 Prisma7.10.0 Next16.3.8 pnpm11.28.2 lockfile9 core19/213 migrationเดิม1ไฟล์ ไม่เพิ่มโมเดล/ExcelJSdependency/DDLในบทนี้ ข้อ61-01และ61-02BLOCKEDตาม60/36และส่วนกลาง ต้องแก้DB-06/Auth/FileVersion/registry/eligibilityและparserก่อนลงมือ61ตามแผนruntimeที่อนุมัติ [MASTERข้อ2](../00_MASTER_PROMPT.md)กำหนด “ก่อนเริ่มเขียนโค้ด สรุปแผนเป็นไทยไม่เกิน 10 บรรทัดแล้วรอคำว่า ‘ตกลง’” ไม่เริ่ม62จากผลเอกสาร
